import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGeography1000000000006 implements MigrationInterface {
  name = 'SeedGeography1000000000006';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Countries
    await queryRunner.query(`
      INSERT INTO countries (name, iso_code, slug, default_locale, currency_code, timezone, phone_prefix, date_format) VALUES
      ('Türkiye', 'TR', 'turkiye', 'tr', 'TRY', 'Europe/Istanbul', '+90', 'DD.MM.YYYY'),
      ('Deutschland', 'DE', 'deutschland', 'de', 'EUR', 'Europe/Berlin', '+49', 'DD.MM.YYYY'),
      ('France', 'FR', 'france', 'fr', 'EUR', 'Europe/Paris', '+33', 'DD/MM/YYYY'),
      ('United Kingdom', 'GB', 'united-kingdom', 'en', 'GBP', 'Europe/London', '+44', 'DD/MM/YYYY'),
      ('Italia', 'IT', 'italia', 'it', 'EUR', 'Europe/Rome', '+39', 'DD/MM/YYYY'),
      ('España', 'ES', 'espana', 'es', 'EUR', 'Europe/Madrid', '+34', 'DD/MM/YYYY'),
      ('Nederland', 'NL', 'nederland', 'nl', 'EUR', 'Europe/Amsterdam', '+31', 'DD-MM-YYYY'),
      ('Österreich', 'AT', 'osterreich', 'de', 'EUR', 'Europe/Vienna', '+43', 'DD.MM.YYYY'),
      ('Polska', 'PL', 'polska', 'pl', 'PLN', 'Europe/Warsaw', '+48', 'DD.MM.YYYY'),
      ('Česká republika', 'CZ', 'ceska-republika', 'cs', 'CZK', 'Europe/Prague', '+420', 'DD.MM.YYYY'),
      ('România', 'RO', 'romania', 'ro', 'RON', 'Europe/Bucharest', '+40', 'DD.MM.YYYY'),
      ('Belgique', 'BE', 'belgique', 'fr', 'EUR', 'Europe/Brussels', '+32', 'DD/MM/YYYY'),
      ('Sverige', 'SE', 'sverige', 'sv', 'SEK', 'Europe/Stockholm', '+46', 'YYYY-MM-DD'),
      ('Schweiz', 'CH', 'schweiz', 'de', 'CHF', 'Europe/Zurich', '+41', 'DD.MM.YYYY'),
      ('Portugal', 'PT', 'portugal', 'pt', 'EUR', 'Europe/Lisbon', '+351', 'DD/MM/YYYY'),
      ('Ελλάδα', 'GR', 'ellada', 'el', 'EUR', 'Europe/Athens', '+30', 'DD/MM/YYYY'),
      ('Magyarország', 'HU', 'magyarorszag', 'hu', 'HUF', 'Europe/Budapest', '+36', 'YYYY.MM.DD'),
      ('България', 'BG', 'balgariya', 'bg', 'BGN', 'Europe/Sofia', '+359', 'DD.MM.YYYY'),
      ('Danmark', 'DK', 'danmark', 'da', 'DKK', 'Europe/Copenhagen', '+45', 'DD-MM-YYYY'),
      ('Suomi', 'FI', 'suomi', 'fi', 'EUR', 'Europe/Helsinki', '+358', 'DD.MM.YYYY')
    `);

    // Turkey cities (81 provinces)
    await queryRunner.query(`
      INSERT INTO cities (country_id, name, slug, plate_code, latitude, longitude) VALUES
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Adana', 'adana', '01', 37.0000, 35.3213),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Adıyaman', 'adiyaman', '02', 37.7648, 38.2786),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Afyonkarahisar', 'afyonkarahisar', '03', 38.7507, 30.5567),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Ağrı', 'agri', '04', 39.7191, 43.0503),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Amasya', 'amasya', '05', 40.6499, 35.8353),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Ankara', 'ankara', '06', 39.9334, 32.8597),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Antalya', 'antalya', '07', 36.8969, 30.7133),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Artvin', 'artvin', '08', 41.1828, 41.8183),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Aydın', 'aydin', '09', 37.8560, 27.8416),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Balıkesir', 'balikesir', '10', 39.6484, 27.8826),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Bilecik', 'bilecik', '11', 40.1506, 29.9792),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Bingöl', 'bingol', '12', 38.8854, 40.4983),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Bitlis', 'bitlis', '13', 38.3938, 42.1232),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Bolu', 'bolu', '14', 40.7359, 31.6079),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Burdur', 'burdur', '15', 37.7205, 30.2908),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Bursa', 'bursa', '16', 40.1885, 29.0610),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Çanakkale', 'canakkale', '17', 40.1553, 26.4142),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Çankırı', 'cankiri', '18', 40.6013, 33.6134),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Çorum', 'corum', '19', 40.5506, 34.9556),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Denizli', 'denizli', '20', 37.7765, 29.0864),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Diyarbakır', 'diyarbakir', '21', 37.9144, 40.2306),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Edirne', 'edirne', '22', 41.6818, 26.5623),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Elazığ', 'elazig', '23', 38.6810, 39.2264),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Erzincan', 'erzincan', '24', 39.7500, 39.5000),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Erzurum', 'erzurum', '25', 39.9000, 41.2700),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Eskişehir', 'eskisehir', '26', 39.7767, 30.5206),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Gaziantep', 'gaziantep', '27', 37.0662, 37.3833),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Giresun', 'giresun', '28', 40.9128, 38.3895),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Gümüşhane', 'gumushane', '29', 40.4386, 39.5086),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Hakkari', 'hakkari', '30', 37.5744, 43.7408),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Hatay', 'hatay', '31', 36.4018, 36.3498),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Isparta', 'isparta', '32', 37.7648, 30.5566),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Mersin', 'mersin', '33', 36.8000, 34.6333),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'İstanbul', 'istanbul', '34', 41.0082, 28.9784),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'İzmir', 'izmir', '35', 38.4237, 27.1428),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Kars', 'kars', '36', 40.6167, 43.1000),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Kastamonu', 'kastamonu', '37', 41.3887, 33.7827),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Kayseri', 'kayseri', '38', 38.7312, 35.4787),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Kırklareli', 'kirklareli', '39', 41.7333, 27.2167),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Kırşehir', 'kirsehir', '40', 39.1425, 34.1709),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Kocaeli', 'kocaeli', '41', 40.7654, 29.9408),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Konya', 'konya', '42', 37.8667, 32.4833),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Kütahya', 'kutahya', '43', 39.4167, 29.9833),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Malatya', 'malatya', '44', 38.3552, 38.3095),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Manisa', 'manisa', '45', 38.6191, 27.4289),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Kahramanmaraş', 'kahramanmaras', '46', 37.5858, 36.9371),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Mardin', 'mardin', '47', 37.3212, 40.7245),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Muğla', 'mugla', '48', 37.2153, 28.3636),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Muş', 'mus', '49', 38.7333, 41.5000),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Nevşehir', 'nevsehir', '50', 38.6939, 34.6857),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Niğde', 'nigde', '51', 37.9667, 34.6833),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Ordu', 'ordu', '52', 40.9862, 37.8797),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Rize', 'rize', '53', 41.0201, 40.5234),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Sakarya', 'sakarya', '54', 40.6940, 30.4358),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Samsun', 'samsun', '55', 41.2867, 36.3300),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Siirt', 'siirt', '56', 37.9333, 41.9500),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Sinop', 'sinop', '57', 42.0231, 35.1531),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Sivas', 'sivas', '58', 39.7477, 37.0179),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Tekirdağ', 'tekirdag', '59', 40.9781, 27.5115),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Tokat', 'tokat', '60', 40.3167, 36.5500),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Trabzon', 'trabzon', '61', 41.0015, 39.7178),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Tunceli', 'tunceli', '62', 39.1079, 39.5479),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Şanlıurfa', 'sanliurfa', '63', 37.1591, 38.7969),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Uşak', 'usak', '64', 38.6823, 29.4082),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Van', 'van', '65', 38.4891, 43.4089),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Yozgat', 'yozgat', '66', 39.8181, 34.8147),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Zonguldak', 'zonguldak', '67', 41.4564, 31.7987),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Aksaray', 'aksaray', '68', 38.3687, 34.0370),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Bayburt', 'bayburt', '69', 40.2552, 40.2249),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Karaman', 'karaman', '70', 37.1759, 33.2287),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Kırıkkale', 'kirikkale', '71', 39.8468, 33.5153),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Batman', 'batman', '72', 37.8812, 41.1351),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Şırnak', 'sirnak', '73', 37.5164, 42.4611),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Bartın', 'bartin', '74', 41.6344, 32.3375),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Ardahan', 'ardahan', '75', 41.1105, 42.7022),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Iğdır', 'igdir', '76', 39.9167, 44.0453),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Yalova', 'yalova', '77', 40.6500, 29.2667),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Karabük', 'karabuk', '78', 41.2061, 32.6204),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Kilis', 'kilis', '79', 36.7184, 37.1212),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Osmaniye', 'osmaniye', '80', 37.0742, 36.2463),
      ((SELECT id FROM countries WHERE iso_code='TR'), 'Düzce', 'duzce', '81', 40.8438, 31.1565)
    `);

    // EU cities
    await queryRunner.query(`
      INSERT INTO cities (country_id, name, slug, latitude, longitude) VALUES
      ((SELECT id FROM countries WHERE iso_code='DE'), 'Berlin', 'berlin', 52.5200, 13.4050),
      ((SELECT id FROM countries WHERE iso_code='DE'), 'Hamburg', 'hamburg', 53.5753, 10.0153),
      ((SELECT id FROM countries WHERE iso_code='DE'), 'München', 'munchen', 48.1351, 11.5820),
      ((SELECT id FROM countries WHERE iso_code='DE'), 'Köln', 'koln', 50.9333, 6.9500),
      ((SELECT id FROM countries WHERE iso_code='DE'), 'Frankfurt am Main', 'frankfurt-am-main', 50.1109, 8.6821),
      ((SELECT id FROM countries WHERE iso_code='DE'), 'Stuttgart', 'stuttgart', 48.7758, 9.1829),
      ((SELECT id FROM countries WHERE iso_code='DE'), 'Düsseldorf', 'dusseldorf', 51.2217, 6.7762),
      ((SELECT id FROM countries WHERE iso_code='FR'), 'Paris', 'paris', 48.8566, 2.3522),
      ((SELECT id FROM countries WHERE iso_code='FR'), 'Marseille', 'marseille', 43.2965, 5.3698),
      ((SELECT id FROM countries WHERE iso_code='FR'), 'Lyon', 'lyon', 45.7640, 4.8357),
      ((SELECT id FROM countries WHERE iso_code='GB'), 'London', 'london', 51.5074, -0.1278),
      ((SELECT id FROM countries WHERE iso_code='GB'), 'Manchester', 'manchester', 53.4808, -2.2426),
      ((SELECT id FROM countries WHERE iso_code='GB'), 'Birmingham', 'birmingham', 52.4862, -1.8904),
      ((SELECT id FROM countries WHERE iso_code='IT'), 'Roma', 'roma', 41.9028, 12.4964),
      ((SELECT id FROM countries WHERE iso_code='IT'), 'Milano', 'milano', 45.4654, 9.1859),
      ((SELECT id FROM countries WHERE iso_code='IT'), 'Napoli', 'napoli', 40.8518, 14.2681),
      ((SELECT id FROM countries WHERE iso_code='ES'), 'Madrid', 'madrid', 40.4168, -3.7038),
      ((SELECT id FROM countries WHERE iso_code='ES'), 'Barcelona', 'barcelona', 41.3851, 2.1734),
      ((SELECT id FROM countries WHERE iso_code='ES'), 'Valencia', 'valencia', 39.4699, -0.3763),
      ((SELECT id FROM countries WHERE iso_code='NL'), 'Amsterdam', 'amsterdam', 52.3676, 4.9041),
      ((SELECT id FROM countries WHERE iso_code='NL'), 'Rotterdam', 'rotterdam', 51.9244, 4.4777),
      ((SELECT id FROM countries WHERE iso_code='AT'), 'Wien', 'wien', 48.2082, 16.3738),
      ((SELECT id FROM countries WHERE iso_code='PL'), 'Warszawa', 'warszawa', 52.2297, 21.0122),
      ((SELECT id FROM countries WHERE iso_code='PL'), 'Kraków', 'krakow', 50.0647, 19.9450),
      ((SELECT id FROM countries WHERE iso_code='CZ'), 'Praha', 'praha', 50.0755, 14.4378),
      ((SELECT id FROM countries WHERE iso_code='RO'), 'București', 'bucuresti', 44.4268, 26.1025),
      ((SELECT id FROM countries WHERE iso_code='BE'), 'Bruxelles', 'bruxelles', 50.8503, 4.3517),
      ((SELECT id FROM countries WHERE iso_code='SE'), 'Stockholm', 'stockholm', 59.3293, 18.0686),
      ((SELECT id FROM countries WHERE iso_code='CH'), 'Zürich', 'zurich', 47.3769, 8.5417),
      ((SELECT id FROM countries WHERE iso_code='PT'), 'Lisboa', 'lisboa', 38.7223, -9.1393),
      ((SELECT id FROM countries WHERE iso_code='GR'), 'Αθήνα', 'athina', 37.9838, 23.7275),
      ((SELECT id FROM countries WHERE iso_code='HU'), 'Budapest', 'budapest', 47.4979, 19.0402),
      ((SELECT id FROM countries WHERE iso_code='BG'), 'Sofia', 'sofia', 42.6977, 23.3219),
      ((SELECT id FROM countries WHERE iso_code='DK'), 'København', 'kobenhavn', 55.6761, 12.5683),
      ((SELECT id FROM countries WHERE iso_code='FI'), 'Helsinki', 'helsinki', 60.1699, 24.9384)
    `);

    // Seed initial category tree (universal, language-agnostic slugs with Turkish names as default)
    await queryRunner.query(`
      INSERT INTO categories (name, slug, sort_order, depth, path) VALUES
      ('Yeme & İçme', 'yeme-icme', 1, 0, 'yeme_icme'),
      ('Alışveriş', 'alisveris', 2, 0, 'alisveris'),
      ('Sağlık', 'saglik', 3, 0, 'saglik'),
      ('Güzellik & Bakım', 'guzellik-bakim', 4, 0, 'guzellik_bakim'),
      ('Eğitim', 'egitim', 5, 0, 'egitim'),
      ('Otomotiv', 'otomotiv', 6, 0, 'otomotiv'),
      ('Konaklama', 'konaklama', 7, 0, 'konaklama'),
      ('Eğlence & Spor', 'eglence-spor', 8, 0, 'eglence_spor'),
      ('Hizmetler', 'hizmetler', 9, 0, 'hizmetler'),
      ('Teknoloji', 'teknoloji', 10, 0, 'teknoloji'),
      ('İnşaat & Dekorasyon', 'insaat-dekorasyon', 11, 0, 'insaat_dekorasyon'),
      ('Finans & Hukuk', 'finans-hukuk', 12, 0, 'finans_hukuk')
    `);

    // Sub-categories for Yeme & İçme
    await queryRunner.query(`
      INSERT INTO categories (parent_id, name, slug, sort_order, depth, path) VALUES
      ((SELECT id FROM categories WHERE slug='yeme-icme'), 'Restoranlar', 'restoranlar', 1, 1, 'yeme_icme.restoranlar'),
      ((SELECT id FROM categories WHERE slug='yeme-icme'), 'Kafeler', 'kafeler', 2, 1, 'yeme_icme.kafeler'),
      ((SELECT id FROM categories WHERE slug='yeme-icme'), 'Pastaneler', 'pastaneler', 3, 1, 'yeme_icme.pastaneler'),
      ((SELECT id FROM categories WHERE slug='yeme-icme'), 'Fast Food', 'fast-food', 4, 1, 'yeme_icme.fast_food'),
      ((SELECT id FROM categories WHERE slug='yeme-icme'), 'Fırınlar', 'firinlar', 5, 1, 'yeme_icme.firinlar'),
      ((SELECT id FROM categories WHERE slug='yeme-icme'), 'Barlar & Publar', 'barlar-publar', 6, 1, 'yeme_icme.barlar_publar')
    `);

    // Sub-categories for Restoranlar
    await queryRunner.query(`
      INSERT INTO categories (parent_id, name, slug, sort_order, depth, path) VALUES
      ((SELECT id FROM categories WHERE slug='restoranlar'), 'Kebapçılar', 'kebapcilar', 1, 2, 'yeme_icme.restoranlar.kebapcilar'),
      ((SELECT id FROM categories WHERE slug='restoranlar'), 'Dönerciler', 'donerciler', 2, 2, 'yeme_icme.restoranlar.donerciler'),
      ((SELECT id FROM categories WHERE slug='restoranlar'), 'Lahmacuncular', 'lahmacuncular', 3, 2, 'yeme_icme.restoranlar.lahmacuncular'),
      ((SELECT id FROM categories WHERE slug='restoranlar'), 'Pizzacılar', 'pizzacilar', 4, 2, 'yeme_icme.restoranlar.pizzacilar'),
      ((SELECT id FROM categories WHERE slug='restoranlar'), 'Balık Restoranları', 'balik-restoranlari', 5, 2, 'yeme_icme.restoranlar.balik_restoranlari'),
      ((SELECT id FROM categories WHERE slug='restoranlar'), 'Çin Mutfağı', 'cin-mutfagi', 6, 2, 'yeme_icme.restoranlar.cin_mutfagi'),
      ((SELECT id FROM categories WHERE slug='restoranlar'), 'İtalyan Mutfağı', 'italyan-mutfagi', 7, 2, 'yeme_icme.restoranlar.italyan_mutfagi')
    `);

    // Populate closure table for all categories
    await queryRunner.query(`
      INSERT INTO category_closure (ancestor_id, descendant_id, depth)
      WITH RECURSIVE closure AS (
        SELECT id AS ancestor_id, id AS descendant_id, 0 AS depth FROM categories
        UNION ALL
        SELECT c.ancestor_id, cat.id, c.depth + 1
        FROM closure c
        JOIN categories cat ON cat.parent_id = c.descendant_id
      )
      SELECT ancestor_id, descendant_id, depth FROM closure
      ON CONFLICT DO NOTHING
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM category_closure`);
    await queryRunner.query(`DELETE FROM categories`);
    await queryRunner.query(`DELETE FROM cities`);
    await queryRunner.query(`DELETE FROM countries`);
  }
}
