import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedData1782277885212 implements MigrationInterface {
  name = 'SeedData1782277885212';

  async up(queryRunner: QueryRunner): Promise<void> {
    // ── Membership plans ────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO membership_plans
        (name, display_name, price_monthly, price_yearly,
         max_products, max_services, max_images, max_campaigns,
         can_upload_video, can_add_files, can_use_whatsapp, can_appear_featured,
         analytics_days, sort_order)
      VALUES
        ('free',       'Ücretsiz', 0,    0,     5,   3,   10,  0, false, false, false, false, 7,   1),
        ('standard',   'Standart', 199,  1990,  25,  10,  50,  1, false, false, true,  false, 30,  2),
        ('premium',    'Premium',  499,  4990,  100, 30,  200, 3, true,  true,  true,  true,  90,  3),
        ('enterprise', 'Kurumsal', 999,  9990,  999, 999, 999, 9, true,  true,  true,  true,  365, 4)
      ON CONFLICT (name) DO NOTHING
    `);

    // ── Category closure table ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS category_closure (
        ancestor_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        descendant_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        depth         INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (ancestor_id, descendant_id)
      )
    `);

    // ── Root categories (koli/ambalaj odaklı) ───────────────────────────────
    await queryRunner.query(`
      INSERT INTO categories (parent_id, name, slug, depth, path, sort_order, is_active)
      VALUES
        (NULL, 'Ambalaj & Koli',          'ambalaj-koli',          0, 'ambalaj-koli',                   1,  true),
        (NULL, 'Yeme & İçme',             'yeme-icme',             0, 'yeme-icme',                      2,  true),
        (NULL, 'Alışveriş',               'alisveris',             0, 'alisveris',                      3,  true),
        (NULL, 'Sağlık',                  'saglik',                0, 'saglik',                         4,  true),
        (NULL, 'Güzellik & Bakım',        'guzellik-bakim',        0, 'guzellik-bakim',                 5,  true),
        (NULL, 'Eğitim',                  'egitim',                0, 'egitim',                         6,  true),
        (NULL, 'Otomotiv',                'otomotiv',              0, 'otomotiv',                       7,  true),
        (NULL, 'Konaklama',               'konaklama',             0, 'konaklama',                      8,  true),
        (NULL, 'Eğlence & Spor',          'eglence-spor',          0, 'eglence-spor',                   9,  true),
        (NULL, 'Hizmetler',               'hizmetler',             0, 'hizmetler',                      10, true),
        (NULL, 'Teknoloji',               'teknoloji',             0, 'teknoloji',                      11, true),
        (NULL, 'İnşaat & Dekorasyon',     'insaat-dekorasyon',     0, 'insaat-dekorasyon',              12, true),
        (NULL, 'Finans & Hukuk',          'finans-hukuk',          0, 'finans-hukuk',                   13, true),
        (NULL, 'Lojistik & Taşımacılık',  'lojistik-tasima',       0, 'lojistik-tasima',                14, true),
        (NULL, 'Tarım & Gıda',            'tarim-gida',            0, 'tarim-gida',                     15, true)
      ON CONFLICT (slug) DO NOTHING
    `);

    // ── Ambalaj alt kategorileri ─────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO categories (parent_id, name, slug, depth, path, sort_order, is_active)
      SELECT
        c.id,
        sub.name,
        sub.slug,
        1,
        'ambalaj-koli.' || sub.slug,
        sub.sort_order,
        true
      FROM (VALUES
        ('Oluklu Mukavva Kutu',     'oluklu-mukavva-kutu',     1),
        ('Ambalaj Malzemeleri',     'ambalaj-malzemeleri',     2),
        ('Plastik Ambalaj',         'plastik-ambalaj',         3),
        ('Poşet & Torba',           'poset-torba',             4),
        ('Streç Film & Bant',       'strec-film-bant',         5),
        ('Ahşap Kasa & Palet',      'ahsap-kasa-palet',        6),
        ('Köpük & Dolgu Malzemesi', 'kopuk-dolgu-malzemesi',   7),
        ('Etiket & Baskı',          'etiket-baski',            8),
        ('Endüstriyel Ambalaj',     'endustriyel-ambalaj',     9)
      ) AS sub(name, slug, sort_order)
      CROSS JOIN categories c
      WHERE c.slug = 'ambalaj-koli'
      ON CONFLICT (slug) DO NOTHING
    `);

    // ── Self-referencing closure (her kategori kendisinin atası) ────────────
    await queryRunner.query(`
      INSERT INTO category_closure (ancestor_id, descendant_id, depth)
      SELECT id, id, 0 FROM categories
      ON CONFLICT DO NOTHING
    `);

    // ── Alt → Üst closure (1 seviye derinlik) ───────────────────────────────
    await queryRunner.query(`
      INSERT INTO category_closure (ancestor_id, descendant_id, depth)
      SELECT parent_id, id, 1 FROM categories WHERE parent_id IS NOT NULL
      ON CONFLICT DO NOTHING
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM membership_plans`);
    await queryRunner.query(`DROP TABLE IF EXISTS category_closure`);
    await queryRunner.query(`
      DELETE FROM categories
      WHERE slug IN (
        'ambalaj-koli','yeme-icme','alisveris','saglik','guzellik-bakim',
        'egitim','otomotiv','konaklama','eglence-spor','hizmetler',
        'teknoloji','insaat-dekorasyon','finans-hukuk','lojistik-tasima','tarim-gida',
        'oluklu-mukavva-kutu','ambalaj-malzemeleri','plastik-ambalaj',
        'poset-torba','strec-film-bant','ahsap-kasa-palet',
        'kopuk-dolgu-malzemesi','etiket-baski','endustriyel-ambalaj'
      )
    `);
  }
}
