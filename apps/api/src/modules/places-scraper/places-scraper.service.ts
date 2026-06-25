import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ScrapeJobOptions {
  /** e.g. ["koli üreticisi", "ambalaj üreticisi", "oluklu mukavva"] */
  keywords: string[];
  /** Turkish city names to iterate over, e.g. ["İstanbul","Ankara","İzmir"] */
  cities: string[];
  /** Category IDs to attach to each imported business */
  categoryIds?: number[];
  /** Max results per keyword×city combination (max 60 via pagination) */
  maxPerQuery?: number;
}

export interface ScrapeJobResult {
  queried: number;
  imported: number;
  skipped: number;
  errors: string[];
}

interface PlaceSearchResult {
  place_id: string;
  name: string;
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  address_components: AddressComponent[];
  international_phone_number?: string;
  website?: string;
  geometry: { location: { lat: number; lng: number } };
  plus_code?: { compound_code: string; global_code: string };
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface ParsedAddress {
  addressLine1: string | null;
  postalCode: string | null;
  districtName: string | null;
  cityName: string | null;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class PlacesScraperService {
  private readonly logger = new Logger(PlacesScraperService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(
    private readonly config: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.apiKey = this.config.getOrThrow<string>('GOOGLE_PLACES_API_KEY');
  }

  // ── Public entry point ────────────────────────────────────────────────────

  async run(opts: ScrapeJobOptions): Promise<ScrapeJobResult> {
    const { keywords, cities, categoryIds = [], maxPerQuery = 60 } = opts;
    const result: ScrapeJobResult = { queried: 0, imported: 0, skipped: 0, errors: [] };

    for (const city of cities) {
      for (const keyword of keywords) {
        const query = `${keyword} ${city} Türkiye`;
        this.logger.log(`Searching: "${query}"`);

        try {
          const placeIds = await this.textSearch(query, maxPerQuery);
          result.queried += placeIds.length;

          for (const placeId of placeIds) {
            try {
              const details = await this.placeDetails(placeId);
              const outcome = await this.importBusiness(details, categoryIds);
              if (outcome === 'imported') result.imported++;
              else result.skipped++;
            } catch (err) {
              const msg = `place ${placeId}: ${(err as Error).message}`;
              this.logger.warn(msg);
              result.errors.push(msg);
            }
            // Respect Places API rate limit (10 rps)
            await this.sleep(110);
          }
        } catch (err) {
          const msg = `query "${query}": ${(err as Error).message}`;
          this.logger.error(msg);
          result.errors.push(msg);
        }
      }
    }

    this.logger.log(`Done — imported: ${result.imported}, skipped: ${result.skipped}`);
    return result;
  }

  // ── Google Places API calls ───────────────────────────────────────────────

  private async textSearch(query: string, max: number): Promise<string[]> {
    const placeIds: string[] = [];
    let pageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        query,
        language: 'tr',
        region: 'tr',
        key: this.apiKey,
        ...(pageToken ? { pagetoken: pageToken } : {}),
      });

      const url = `${this.baseUrl}/place/textsearch/json?${params}`;
      const res = await fetch(url);
      const data = (await res.json()) as {
        status: string;
        results: PlaceSearchResult[];
        next_page_token?: string;
        error_message?: string;
      };

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API: ${data.status} — ${data.error_message ?? ''}`);
      }

      for (const r of data.results ?? []) {
        if (!placeIds.includes(r.place_id)) placeIds.push(r.place_id);
        if (placeIds.length >= max) break;
      }

      pageToken = placeIds.length < max ? data.next_page_token : undefined;

      // next_page_token needs ~2s before it's valid
      if (pageToken) await this.sleep(2000);
    } while (pageToken);

    return placeIds;
  }

  private async placeDetails(placeId: string): Promise<PlaceDetails> {
    const fields = [
      'place_id', 'name', 'formatted_address', 'address_components',
      'international_phone_number', 'website', 'geometry', 'plus_code',
    ].join(',');

    const params = new URLSearchParams({ place_id: placeId, fields, language: 'tr', key: this.apiKey });
    const url = `${this.baseUrl}/place/details/json?${params}`;
    const res = await fetch(url);
    const data = (await res.json()) as { status: string; result: PlaceDetails; error_message?: string };

    if (data.status !== 'OK') {
      throw new Error(`Place Details: ${data.status} — ${data.error_message ?? ''}`);
    }
    return data.result;
  }

  // ── Address parsing ───────────────────────────────────────────────────────

  private parseAddress(details: PlaceDetails): ParsedAddress {
    const get = (type: string) =>
      details.address_components?.find((c) => c.types.includes(type))?.long_name ?? null;

    const streetNumber = get('street_number');
    const route = get('route');          // sokak / bulvar / caddesi
    const sublocality = get('sublocality_level_1') ?? get('sublocality'); // mahalle

    const parts = [sublocality, route, streetNumber].filter(Boolean);
    const addressLine1 = parts.length ? parts.join(' ') : (details.formatted_address ?? null);

    return {
      addressLine1,
      postalCode: get('postal_code'),
      districtName: get('administrative_area_level_2') ?? get('locality'),
      cityName: get('administrative_area_level_1'),
    };
  }

  // ── DB import ─────────────────────────────────────────────────────────────

  private async importBusiness(
    details: PlaceDetails,
    categoryIds: number[],
  ): Promise<'imported' | 'skipped'> {
    const { name, international_phone_number, website, geometry, plus_code } = details;
    const addr = this.parseAddress(details);

    // De-duplicate by phone or website
    const existing = await this.dataSource.query<{ id: string }[]>(
      `SELECT id FROM businesses
       WHERE (phone IS NOT NULL AND phone = $1)
          OR (website IS NOT NULL AND website = $2)
       LIMIT 1`,
      [international_phone_number ?? null, website ?? null],
    );
    if (existing.length) return 'skipped';

    // Resolve city_id
    const cityRow = await this.resolveCity(addr.cityName);
    if (!cityRow) {
      this.logger.warn(`City not found: "${addr.cityName}" for "${name}" — skipping`);
      return 'skipped';
    }

    // Resolve district_id (best-effort)
    const districtId = await this.resolveDistrict(addr.districtName, cityRow.id);

    const slug = await this.uniqueSlug(name);

    await this.dataSource.transaction(async (manager) => {
      // Insert business
      const [biz] = await manager.query<{ id: string }[]>(
        `INSERT INTO businesses
           (owner_id, name, slug, phone, website, status, is_verified, is_featured,
            view_count, click_count, rating_avg, rating_count, created_at, updated_at)
         VALUES
           ((SELECT id FROM users WHERE role = 'admin' LIMIT 1),
            $1, $2, $3, $4, 'pending', false, false, 0, 0, 0, 0, NOW(), NOW())
         RETURNING id`,
        [name, slug, international_phone_number ?? null, website ?? null],
      );

      // Insert location
      await manager.query(
        `INSERT INTO business_locations
           (business_id, address_line1, city_id, district_id, postal_code,
            latitude, longitude, plus_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          biz.id,
          addr.addressLine1,
          cityRow.id,
          districtId,
          addr.postalCode,
          geometry?.location?.lat ?? null,
          geometry?.location?.lng ?? null,
          plus_code?.global_code ?? null,
        ],
      );

      // Attach categories
      for (let i = 0; i < categoryIds.length; i++) {
        await manager.query(
          `INSERT INTO business_categories (business_id, category_id, is_primary)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [biz.id, categoryIds[i], i === 0],
        );
      }
    });

    this.logger.debug(`Imported: ${name}`);
    return 'imported';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async resolveCity(cityName: string | null): Promise<{ id: number } | null> {
    if (!cityName) return null;
    // Normalize: "İstanbul İli" → "İstanbul"
    const normalized = cityName.replace(/\s+(ili|province)$/i, '').trim();
    const rows = await this.dataSource.query<{ id: number }[]>(
      `SELECT id FROM cities WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [normalized],
    );
    return rows[0] ?? null;
  }

  private async resolveDistrict(districtName: string | null, cityId: number): Promise<number | null> {
    if (!districtName) return null;
    const rows = await this.dataSource.query<{ id: number }[]>(
      `SELECT id FROM districts WHERE city_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1`,
      [cityId, districtName],
    );
    return rows[0]?.id ?? null;
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = base;
    let attempt = 0;
    while (true) {
      const rows = await this.dataSource.query<{ id: string }[]>(
        `SELECT id FROM businesses WHERE slug = $1 LIMIT 1`,
        [slug],
      );
      if (!rows.length) return slug;
      slug = `${base}-${++attempt}`;
    }
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
}
