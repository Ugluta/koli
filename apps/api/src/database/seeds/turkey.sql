-- Turkey Geography Seed Data
-- Generated for PostgreSQL
-- Run with: psql -d your_database -f turkey_seed.sql

BEGIN;

-- ============================================================
-- COUNTRY: Turkey
-- ============================================================
INSERT INTO countries (name, iso_code, slug, default_locale, currency_code, timezone, phone_prefix, date_format, is_active)
VALUES ('Türkiye', 'TR', 'turkiye', 'tr', 'TRY', 'Europe/Istanbul', '+90', 'DD.MM.YYYY', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- CITIES (81 Turkish Provinces)
-- ============================================================
-- We use a CTE to get the Turkey country_id dynamically
WITH turkey AS (
    SELECT id AS country_id FROM countries WHERE iso_code = 'TR' LIMIT 1
)
INSERT INTO cities (country_id, name, slug, plate_code, latitude, longitude, is_active)
SELECT
    turkey.country_id,
    v.name,
    v.slug,
    v.plate_code,
    v.latitude,
    v.longitude,
    true
FROM turkey, (VALUES
    ('Adana',           'adana',           '01',  37.0000,  35.3213),
    ('Adıyaman',        'adiyaman',        '02',  37.7648,  38.2786),
    ('Afyonkarahisar',  'afyonkarahisar',  '03',  38.7507,  30.5567),
    ('Ağrı',            'agri',            '04',  39.7191,  43.0503),
    ('Amasya',          'amasya',          '05',  40.6499,  35.8353),
    ('Ankara',          'ankara',          '06',  39.9334,  32.8597),
    ('Antalya',         'antalya',         '07',  36.8969,  30.7133),
    ('Artvin',          'artvin',          '08',  41.1828,  41.8183),
    ('Aydın',           'aydin',           '09',  37.8444,  27.8458),
    ('Balıkesir',       'balikesir',       '10',  39.6484,  27.8826),
    ('Bilecik',         'bilecik',         '11',  40.1506,  29.9792),
    ('Bingöl',          'bingol',          '12',  38.8854,  40.4983),
    ('Bitlis',          'bitlis',          '13',  38.4006,  42.1232),
    ('Bolu',            'bolu',            '14',  40.7359,  31.6061),
    ('Burdur',          'burdur',          '15',  37.7203,  30.2906),
    ('Bursa',           'bursa',           '16',  40.1826,  29.0665),
    ('Çanakkale',       'canakkale',       '17',  40.1553,  26.4142),
    ('Çankırı',         'cankiri',         '18',  40.6013,  33.6134),
    ('Çorum',           'corum',           '19',  40.5506,  34.9556),
    ('Denizli',         'denizli',         '20',  37.7765,  29.0864),
    ('Diyarbakır',      'diyarbakir',      '21',  37.9144,  40.2306),
    ('Edirne',          'edirne',          '22',  41.6818,  26.5623),
    ('Elazığ',          'elazig',          '23',  38.6810,  39.2264),
    ('Erzincan',        'erzincan',        '24',  39.7500,  39.5000),
    ('Erzurum',         'erzurum',         '25',  39.9055,  41.2658),
    ('Eskişehir',       'eskisehir',       '26',  39.7767,  30.5206),
    ('Gaziantep',       'gaziantep',       '27',  37.0662,  37.3833),
    ('Giresun',         'giresun',         '28',  40.9128,  38.3895),
    ('Gümüşhane',       'gumushane',       '29',  40.4386,  39.4814),
    ('Hakkari',         'hakkari',         '30',  37.5744,  43.7408),
    ('Hatay',           'hatay',           '31',  36.4018,  36.3498),
    ('Isparta',         'isparta',         '32',  37.7648,  30.5566),
    ('Mersin',          'mersin',          '33',  36.8000,  34.6333),
    ('İstanbul',        'istanbul',        '34',  41.0082,  28.9784),
    ('İzmir',           'izmir',           '35',  38.4192,  27.1287),
    ('Kars',            'kars',            '36',  40.6013,  43.0975),
    ('Kastamonu',       'kastamonu',       '37',  41.3887,  33.7827),
    ('Kayseri',         'kayseri',         '38',  38.7312,  35.4787),
    ('Kırklareli',      'kirklareli',      '39',  41.7333,  27.2167),
    ('Kırşehir',        'kirsehir',        '40',  39.1425,  34.1709),
    ('Kocaeli',         'kocaeli',         '41',  40.8533,  29.8815),
    ('Konya',           'konya',           '42',  37.8667,  32.4833),
    ('Kütahya',         'kutahya',         '43',  39.4167,  29.9833),
    ('Malatya',         'malatya',         '44',  38.3552,  38.3095),
    ('Manisa',          'manisa',          '45',  38.6191,  27.4289),
    ('Kahramanmaraş',   'kahramanmaras',   '46',  37.5858,  36.9371),
    ('Mardin',          'mardin',          '47',  37.3212,  40.7245),
    ('Muğla',           'mugla',           '48',  37.2153,  28.3636),
    ('Muş',             'mus',             '49',  38.7462,  41.4932),
    ('Nevşehir',        'nevsehir',        '50',  38.6939,  34.6857),
    ('Niğde',           'nigde',           '51',  37.9667,  34.6833),
    ('Ordu',            'ordu',            '52',  40.9862,  37.8797),
    ('Rize',            'rize',            '53',  41.0201,  40.5234),
    ('Sakarya',         'sakarya',         '54',  40.6940,  30.4358),
    ('Samsun',          'samsun',          '55',  41.2867,  36.3300),
    ('Siirt',           'siirt',           '56',  37.9333,  41.9500),
    ('Sinop',           'sinop',           '57',  42.0231,  35.1531),
    ('Sivas',           'sivas',           '58',  39.7477,  37.0179),
    ('Tekirdağ',        'tekirdag',        '59',  40.9781,  27.5115),
    ('Tokat',           'tokat',           '60',  40.3167,  36.5500),
    ('Trabzon',         'trabzon',         '61',  41.0015,  39.7178),
    ('Tunceli',         'tunceli',         '62',  39.1079,  39.5478),
    ('Şanlıurfa',       'sanliurfa',       '63',  37.1591,  38.7969),
    ('Uşak',            'usak',            '64',  38.6823,  29.4082),
    ('Van',             'van',             '65',  38.4891,  43.4089),
    ('Yozgat',          'yozgat',          '66',  39.8181,  34.8147),
    ('Zonguldak',       'zonguldak',       '67',  41.4564,  31.7987),
    ('Aksaray',         'aksaray',         '68',  38.3687,  34.0370),
    ('Bayburt',         'bayburt',         '69',  40.2552,  40.2249),
    ('Karaman',         'karaman',         '70',  37.1759,  33.2287),
    ('Kırıkkale',       'kirikkale',       '71',  39.8468,  33.5153),
    ('Batman',          'batman',          '72',  37.8812,  41.1351),
    ('Şırnak',          'sirnak',          '73',  37.5164,  42.4611),
    ('Bartın',          'bartin',          '74',  41.6344,  32.3375),
    ('Ardahan',         'ardahan',         '75',  41.1105,  42.7022),
    ('Iğdır',           'igdir',           '76',  39.9167,  44.0333),
    ('Yalova',          'yalova',          '77',  40.6500,  29.2667),
    ('Karabük',         'karabuk',         '78',  41.2061,  32.6204),
    ('Kilis',           'kilis',           '79',  36.7184,  37.1212),
    ('Osmaniye',        'osmaniye',        '80',  37.0742,  36.2464),
    ('Düzce',           'duzce',           '81',  40.8438,  31.1565)
) AS v(name, slug, plate_code, latitude, longitude)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DISTRICTS
-- ============================================================

-- Helper: insert districts for a given city by plate_code
-- We use CTEs per batch for clarity

-- ---- ISTANBUL (plate 34) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '34' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Adalar',          'adalar'),
    ('Arnavutköy',      'arnavutkoy'),
    ('Ataşehir',        'atasehir'),
    ('Avcılar',         'avcilar'),
    ('Bağcılar',        'bagcilar'),
    ('Bahçelievler',    'bahcelievler'),
    ('Bakırköy',        'bakirkoy'),
    ('Başakşehir',      'basaksehir'),
    ('Bayrampaşa',      'bayrampasa'),
    ('Beşiktaş',        'besiktas'),
    ('Beykoz',          'beykoz'),
    ('Beylikdüzü',      'beylikduzu'),
    ('Beyoğlu',         'beyoglu'),
    ('Büyükçekmece',    'buyukcekmeceili'),
    ('Çatalca',         'catalca'),
    ('Çekmeköy',        'cekmekoy'),
    ('Esenler',         'esenler'),
    ('Esenyurt',        'esenyurt'),
    ('Eyüpsultan',      'eyupsultan'),
    ('Fatih',           'fatih'),
    ('Gaziosmanpaşa',   'gaziosmanpasa'),
    ('Güngören',        'gungoren'),
    ('Kadıköy',         'kadikoy'),
    ('Kağıthane',       'kagithane'),
    ('Kartal',          'kartal'),
    ('Küçükçekmece',    'kucukcekmeceili'),
    ('Maltepe',         'maltepe'),
    ('Pendik',          'pendik'),
    ('Sancaktepe',      'sancaktepe'),
    ('Sarıyer',         'sariyer'),
    ('Silivri',         'silivri'),
    ('Sultanbeyli',     'sultanbeyli'),
    ('Sultangazi',      'sultangazi'),
    ('Şile',            'sile'),
    ('Şişli',           'sisli'),
    ('Tuzla',           'tuzla'),
    ('Ümraniye',        'umraniye'),
    ('Üsküdar',         'uskudar'),
    ('Zeytinburnu',     'zeytinburnu')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ANKARA (plate 06) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '06' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Altındağ',        'altindag'),
    ('Ayaş',            'ayas'),
    ('Bala',            'bala'),
    ('Beypazarı',       'beypazari'),
    ('Çamlıdere',       'camlidere'),
    ('Çankaya',         'cankaya'),
    ('Çubuk',           'cubuk'),
    ('Elmadağ',         'elmadag'),
    ('Etimesgut',       'etimesgut'),
    ('Evren',           'evren'),
    ('Gölbaşı',         'golbasi'),
    ('Güdül',           'gudul'),
    ('Haymana',         'haymana'),
    ('Kahramankazan',   'kahramankazan'),
    ('Kalecik',         'kalecik'),
    ('Keçiören',        'kecioren'),
    ('Kızılcahamam',    'kizilcahamam'),
    ('Mamak',           'mamak'),
    ('Nallıhan',        'nallihan'),
    ('Polatlı',         'polatli'),
    ('Pursaklar',       'pursaklar'),
    ('Sincan',          'sincan'),
    ('Şereflikoçhisar', 'sereflikochisar'),
    ('Yenimahalle',     'yenimahalle')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- İZMİR (plate 35) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '35' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Aliağa',          'aliaga'),
    ('Balçova',         'balcova'),
    ('Bayındır',        'bayindir'),
    ('Bayraklı',        'bayrakli'),
    ('Bergama',         'bergama'),
    ('Beydağ',          'beydag'),
    ('Bornova',         'bornova'),
    ('Buca',            'buca'),
    ('Çeşme',           'cesme'),
    ('Çiğli',           'cigli'),
    ('Dikili',          'dikili'),
    ('Foça',            'foca'),
    ('Gaziemir',        'gaziemir'),
    ('Güzelbahçe',      'guzelbahce'),
    ('Karabağlar',      'karabaglar'),
    ('Karaburun',       'karaburun'),
    ('Karşıyaka',       'karsiyaka'),
    ('Kemalpaşa',       'kemalpasa'),
    ('Kınık',           'kinik'),
    ('Kiraz',           'kiraz'),
    ('Konak',           'konak'),
    ('Menderes',        'menderes'),
    ('Menemen',         'menemen'),
    ('Narlıdere',       'narlidere'),
    ('Ödemiş',          'odemis'),
    ('Seferihisar',     'seferihisar'),
    ('Selçuk',          'selcuk'),
    ('Tire',            'tire'),
    ('Torbalı',         'torbali'),
    ('Urla',            'urla')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ADANA (plate 01) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '01' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Aladağ',          'aladag'),
    ('Ceyhan',          'ceyhan'),
    ('Çukurova',        'cukurova'),
    ('Feke',            'feke'),
    ('İmamoğlu',        'imamoglu'),
    ('Karaisalı',       'karaisali'),
    ('Karataş',         'karatas'),
    ('Kozan',           'kozan'),
    ('Pozantı',         'pozanti'),
    ('Saimbeyli',       'saimbeyli'),
    ('Sarıçam',         'saricam'),
    ('Seyhan',          'seyhan'),
    ('Tufanbeyli',      'tufanbeyli'),
    ('Yumurtalık',      'yumurtalik'),
    ('Yüreğir',         'yuregir')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ADIYAMAN (plate 02) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '02' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Besni',           'besni'),
    ('Çelikhan',        'celikhan'),
    ('Gerger',          'gerger'),
    ('Gölbaşı',         'golbasi'),
    ('Kahta',           'kahta'),
    ('Samsat',          'samsat'),
    ('Sincik',          'sincik'),
    ('Tut',             'tut')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- AFYONKARAHİSAR (plate 03) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '03' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Başmakçı',        'basmakci'),
    ('Bayat',           'bayat'),
    ('Bolvadin',        'bolvadin'),
    ('Çay',             'cay'),
    ('Çobanlar',        'cobanlar'),
    ('Dazkırı',         'dazkiri'),
    ('Dinar',           'dinar'),
    ('Emirdağ',         'emirdag'),
    ('Evciler',         'evciler'),
    ('Hocalar',         'hocalar'),
    ('İhsaniye',        'ihsaniye'),
    ('İscehisar',       'iscehisar'),
    ('Kızılören',       'kiziloren'),
    ('Sandıklı',        'sandikli'),
    ('Sinanpaşa',       'sinanpasa'),
    ('Sultandağı',      'sultandagi'),
    ('Şuhut',           'suhut')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- AĞRI (plate 04) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '04' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Diyadin',         'diyadin'),
    ('Doğubayazıt',     'dogubayazit'),
    ('Eleşkirt',        'eleskirt'),
    ('Hamur',           'hamur'),
    ('Patnos',          'patnos'),
    ('Taşlıçay',        'taslicay'),
    ('Tutak',           'tutak')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- AMASYA (plate 05) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '05' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Göynücek',        'goynucek'),
    ('Gümüşhacıköy',    'gumushacikoy'),
    ('Hamamözü',        'hamamozu'),
    ('Merzifon',        'merzifon'),
    ('Suluova',         'suluova'),
    ('Taşova',          'tasova')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ANTALYA (plate 07) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '07' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Aksu',            'aksu'),
    ('Alanya',          'alanya'),
    ('Akseki',          'akseki'),
    ('Döşemealtı',      'dosemealti'),
    ('Elmalı',          'elmali'),
    ('Finike',          'finike'),
    ('Gazipaşa',        'gazipasa'),
    ('Gündoğmuş',       'gundogmus'),
    ('İbradı',          'ibradi'),
    ('Kaş',             'kas'),
    ('Kemer',           'kemer'),
    ('Kepez',           'kepez'),
    ('Konyaaltı',       'konyaalti'),
    ('Korkuteli',       'korkuteli'),
    ('Kumluca',         'kumluca'),
    ('Manavgat',        'manavgat'),
    ('Muratpaşa',       'muratpasa'),
    ('Serik',           'serik')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ARTVİN (plate 08) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '08' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Ardanuç',         'ardanuc'),
    ('Arhavi',          'arhavi'),
    ('Borçka',          'borcka'),
    ('Hopa',            'hopa'),
    ('Murgul',          'murgul'),
    ('Şavşat',          'savsat'),
    ('Yusufeli',        'yusufeli')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- AYDIN (plate 09) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '09' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Bozdoğan',        'bozdogan'),
    ('Buharkent',       'buharkent'),
    ('Çine',            'cine'),
    ('Didim',           'didim'),
    ('Efeler',          'efeler'),
    ('Germencik',       'germencik'),
    ('İncirliova',      'incirliova'),
    ('Karacasu',        'karacasu'),
    ('Karpuzlu',        'karpuzlu'),
    ('Koçarlı',         'kocarli'),
    ('Köşk',            'kosk'),
    ('Kuşadası',        'kusadasi'),
    ('Kuyucak',         'kuyucak'),
    ('Nazilli',         'nazilli'),
    ('Söke',            'soke'),
    ('Sultanhisar',     'sultanhisar'),
    ('Yenipazar',       'yenipazar')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- BALIKESİR (plate 10) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '10' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Altıeylül',       'altieylul'),
    ('Ayvalık',         'ayvalik'),
    ('Balya',           'balya'),
    ('Bandırma',        'bandirma'),
    ('Bigadiç',         'bigadic'),
    ('Burhaniye',       'burhaniye'),
    ('Dursunbey',       'dursunbey'),
    ('Edremit',         'edremit'),
    ('Erdek',           'erdek'),
    ('Gömeç',           'gomec'),
    ('Gönen',           'gonen'),
    ('Havran',          'havran'),
    ('İvrindi',         'ivrindi'),
    ('Karesi',          'karesi'),
    ('Kepsut',          'kepsut'),
    ('Manyas',          'manyas'),
    ('Marmara',         'marmara'),
    ('Savaştepe',       'savastepe'),
    ('Sındırgı',        'sindirgi'),
    ('Susurluk',        'susurluk')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- BİLECİK (plate 11) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '11' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Bozüyük',         'bozuyuk'),
    ('Gölpazarı',       'golpazari'),
    ('İnhisar',         'inhisar'),
    ('Osmaneli',        'osmaneli'),
    ('Pazaryeri',       'pazaryeri'),
    ('Söğüt',           'sogut'),
    ('Yenipazar',       'yenipazar')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- BİNGÖL (plate 12) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '12' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Adaklı',          'adakli'),
    ('Genç',            'genc'),
    ('Karlıova',        'karliova'),
    ('Kiğı',            'kigi'),
    ('Solhan',          'solhan'),
    ('Yayladere',       'yayladere'),
    ('Yedisu',          'yedisu')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- BİTLİS (plate 13) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '13' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Adilcevaz',       'adilcevaz'),
    ('Ahlat',           'ahlat'),
    ('Güroymak',        'guroymak'),
    ('Hizan',           'hizan'),
    ('Mutki',           'mutki'),
    ('Tatvan',          'tatvan')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- BOLU (plate 14) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '14' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Dörtdivan',       'dortdivan'),
    ('Gerede',          'gerede'),
    ('Göynük',          'goynuk'),
    ('Kıbrıscık',       'kibriscik'),
    ('Mengen',          'mengen'),
    ('Mudurnu',         'mudurnu'),
    ('Seben',           'seben'),
    ('Yeniçağa',        'yenicaga')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- BURDUR (plate 15) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '15' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Ağlasun',         'aglasun'),
    ('Altınyayla',      'altinyayla'),
    ('Bucak',           'bucak'),
    ('Çavdır',          'cavdir'),
    ('Çeltikçi',        'celtikci'),
    ('Gölhisar',        'golhisar'),
    ('Karamanlı',       'karamanli'),
    ('Kemer',           'kemer'),
    ('Tefenni',         'tefenni'),
    ('Yeşilova',        'yesilova')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- BURSA (plate 16) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '16' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Büyükorhan',      'buyukorhan'),
    ('Gemlik',          'gemlik'),
    ('Gürsu',           'gursu'),
    ('Harmancık',       'harmancik'),
    ('İnegöl',          'inegol'),
    ('İznik',           'iznik'),
    ('Karacabey',       'karacabey'),
    ('Keles',           'keles'),
    ('Kestel',          'kestel'),
    ('Mudanya',         'mudanya'),
    ('Mustafakemalpaşa','mustafakemalpasa'),
    ('Nilüfer',         'nilufer'),
    ('Orhaneli',        'orhaneli'),
    ('Orhangazi',       'orhangazi'),
    ('Osmangazi',       'osmangazi'),
    ('Yenişehir',       'yenisehir'),
    ('Yıldırım',        'yildirim')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ÇANAKKALE (plate 17) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '17' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Ayvacık',         'ayvacik'),
    ('Bayramiç',        'bayramic'),
    ('Biga',            'biga'),
    ('Bozcaada',        'bozcaada'),
    ('Çan',             'can'),
    ('Eceabat',         'eceabat'),
    ('Ezine',           'ezine'),
    ('Gelibolu',        'gelibolu'),
    ('Gökçeada',        'gokceada'),
    ('Lapseki',         'lapseki'),
    ('Yenice',          'yenice')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ÇANKIRI (plate 18) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '18' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Atkaracalar',     'atkaracalar'),
    ('Bayramören',      'bayramoren'),
    ('Cerkeş',          'cerkes'),
    ('Eldivan',         'eldivan'),
    ('Ilgaz',           'ilgaz'),
    ('Kızılırmak',      'kizilirmak'),
    ('Korgun',          'korgun'),
    ('Kurşunlu',        'kursunlu'),
    ('Orta',            'orta'),
    ('Şabanözü',        'sabanozü'),
    ('Yapraklı',        'yaprakli')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ÇORUM (plate 19) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '19' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Alaca',           'alaca'),
    ('Bayat',           'bayat'),
    ('Boğazkale',       'bogazkale'),
    ('Dodurga',         'dodurga'),
    ('İskilip',         'iskilip'),
    ('Kargı',           'kargi'),
    ('Laçin',           'lacin'),
    ('Mecitözü',        'mecitozü'),
    ('Oğuzlar',         'oguzlar'),
    ('Ortaköy',         'ortakoy'),
    ('Osmancık',        'osmancik'),
    ('Sungurlu',        'sungurlu'),
    ('Uğurludağ',       'ugurludag')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- DENİZLİ (plate 20) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '20' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Acıpayam',        'acipayam'),
    ('Babadağ',         'babadag'),
    ('Baklan',          'baklan'),
    ('Bekilli',         'bekilli'),
    ('Beyağaç',         'beyagac'),
    ('Bozkurt',         'bozkurt'),
    ('Buldan',          'buldan'),
    ('Çal',             'cal'),
    ('Çameli',          'cameli'),
    ('Çardak',          'cardak'),
    ('Çivril',          'civril'),
    ('Güney',           'guney'),
    ('Honaz',           'honaz'),
    ('Kale',            'kale'),
    ('Merkezefendi',    'merkezefendi'),
    ('Pamukkale',       'pamukkale'),
    ('Sarayköy',        'saraykoy'),
    ('Serinhisar',      'serinhisar'),
    ('Tavas',           'tavas')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- DİYARBAKIR (plate 21) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '21' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Bağlar',          'baglar'),
    ('Bismil',          'bismil'),
    ('Çermik',          'cermik'),
    ('Çınar',           'cinar'),
    ('Çüngüş',          'cungus'),
    ('Dicle',           'dicle'),
    ('Eğil',            'egil'),
    ('Ergani',          'ergani'),
    ('Hani',            'hani'),
    ('Hazro',           'hazro'),
    ('Kayapınar',       'kayapinar'),
    ('Kocaköy',         'kocakoy'),
    ('Kulp',            'kulp'),
    ('Lice',            'lice'),
    ('Silvan',          'silvan'),
    ('Sur',             'sur'),
    ('Yenişehir',       'yenisehir')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- EDİRNE (plate 22) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '22' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Enez',            'enez'),
    ('Havsa',           'havsa'),
    ('İpsala',          'ipsala'),
    ('Keşan',           'kesan'),
    ('Lalapaşa',        'lalapasa'),
    ('Meriç',           'meric'),
    ('Süloğlu',         'suloglu'),
    ('Uzunköprü',       'uzunkopru')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ELAZIĞ (plate 23) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '23' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Ağın',            'agin'),
    ('Alacakaya',       'alacakaya'),
    ('Arıcak',          'aricak'),
    ('Baskil',          'baskil'),
    ('Karakoçan',       'karakocan'),
    ('Keban',           'keban'),
    ('Kovancılar',      'kovancılar'),
    ('Maden',           'maden'),
    ('Palu',            'palu'),
    ('Sivrice',         'sivrice')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ERZİNCAN (plate 24) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '24' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Çayırlı',         'cayirli'),
    ('İliç',            'ilic'),
    ('Kemah',           'kemah'),
    ('Kemaliye',        'kemaliye'),
    ('Otlukbeli',       'otlukbeli'),
    ('Refahiye',        'refahiye'),
    ('Tercan',          'tercan'),
    ('Üzümlü',          'uzumlu')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ERZURUM (plate 25) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '25' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Aziziye',         'aziziye'),
    ('Aşkale',          'askale'),
    ('Çat',             'cat'),
    ('Hınıs',           'hinis'),
    ('Horasan',         'horasan'),
    ('İspir',           'ispir'),
    ('Karaçoban',       'karacoban'),
    ('Karayazı',        'karayazi'),
    ('Köprüköy',        'koprukoy'),
    ('Narman',          'narman'),
    ('Oltu',            'oltu'),
    ('Olur',            'olur'),
    ('Palandöken',      'palandoken'),
    ('Pasinler',        'pasinler'),
    ('Pazaryolu',       'pazaryolu'),
    ('Şenkaya',         'senkaya'),
    ('Tekman',          'tekman'),
    ('Tortum',          'tortum'),
    ('Uzundere',        'uzundere'),
    ('Yakutiye',        'yakutiye')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ESKİŞEHİR (plate 26) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '26' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Alpu',            'alpu'),
    ('Beylikova',       'beylikova'),
    ('Çifteler',        'cifteler'),
    ('Günyüzü',         'gunyuzu'),
    ('Han',             'han'),
    ('İnönü',           'inonu'),
    ('Mahmudiye',       'mahmudiye'),
    ('Mihalgazi',       'mihalgazi'),
    ('Mihalıççık',      'mihalıccık'),
    ('Odunpazarı',      'odunpazari'),
    ('Sarıcakaya',      'saricakaya'),
    ('Seyitgazi',       'seyitgazi'),
    ('Sivrihisar',      'sivrihisar'),
    ('Tepebaşı',        'tepebasi')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- GAZİANTEP (plate 27) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '27' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Araban',          'araban'),
    ('İslahiye',        'islahiye'),
    ('Karkamış',        'karkamis'),
    ('Nizip',           'nizip'),
    ('Nurdağı',         'nurdagi'),
    ('Oğuzeli',         'oguzeli'),
    ('Şahinbey',        'sahinbey'),
    ('Şehitkamil',      'sehitkamil'),
    ('Yavuzeli',        'yavuzeli')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- GİRESUN (plate 28) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '28' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Alucra',          'alucra'),
    ('Bulancak',        'bulancak'),
    ('Çamoluk',         'camoluk'),
    ('Çanakçı',         'canakci'),
    ('Dereli',          'dereli'),
    ('Doğankent',       'dogankent'),
    ('Espiye',          'espiye'),
    ('Eynesil',         'eynesil'),
    ('Görele',          'gorele'),
    ('Güce',            'guce'),
    ('Keşap',           'kesap'),
    ('Piraziz',         'piraziz'),
    ('Şebinkarahisar',  'sebinkarahisar'),
    ('Tirebolu',        'tirebolu'),
    ('Yağlıdere',       'yaglidere')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- GÜMÜŞHANE (plate 29) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '29' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Kelkit',          'kelkit'),
    ('Köse',            'kose'),
    ('Kürtün',          'kurtun'),
    ('Şiran',           'siran'),
    ('Torul',           'torul')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- HAKKARİ (plate 30) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '30' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Çukurca',         'cukurca'),
    ('Derecik',         'derecik'),
    ('Şemdinli',        'semdinli'),
    ('Yüksekova',       'yuksekova')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- HATAY (plate 31) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '31' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Altınözü',        'altinozu'),
    ('Antakya',         'antakya'),
    ('Arsuz',           'arsuz'),
    ('Belen',           'belen'),
    ('Defne',           'defne'),
    ('Dörtyol',         'dortyol'),
    ('Erzin',           'erzin'),
    ('Hassa',           'hassa'),
    ('İskenderun',      'iskenderun'),
    ('Kırıkhan',        'kirikhan'),
    ('Kumlu',           'kumlu'),
    ('Payas',           'payas'),
    ('Reyhanlı',        'reyhanli'),
    ('Samandağ',        'samandag'),
    ('Yayladağı',       'yayladagi')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ISPARTA (plate 32) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '32' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Aksu',            'aksu'),
    ('Atabey',          'atabey'),
    ('Eğirdir',         'egirdir'),
    ('Gelendost',       'gelendost'),
    ('Gönen',           'gonen'),
    ('Keçiborlu',       'keciborlu'),
    ('Senirkent',       'senirkent'),
    ('Sütçüler',        'sutculer'),
    ('Şarkikaraağaç',   'sarkikaraagac'),
    ('Uluborlu',        'uluborlu'),
    ('Yalvaç',          'yalvac'),
    ('Yenişarbademli',  'yenisarbademli')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- MERSİN (plate 33) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '33' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Akdeniz',         'akdeniz'),
    ('Anamur',          'anamur'),
    ('Aydıncık',        'aydincik'),
    ('Bozyazı',         'bozyazi'),
    ('Çamlıyayla',      'camlıyayla'),
    ('Erdemli',         'erdemli'),
    ('Gülnar',          'gulnar'),
    ('Mezitli',         'mezitli'),
    ('Mut',             'mut'),
    ('Silifke',         'silifke'),
    ('Tarsus',          'tarsus'),
    ('Toroslar',        'toroslar'),
    ('Yenişehir',       'yenisehir')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KARS (plate 36) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '36' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Akyaka',          'akyaka'),
    ('Arpaçay',         'arpacay'),
    ('Digor',           'digor'),
    ('Kağızman',        'kagizman'),
    ('Sarıkamış',       'sarikamis'),
    ('Selim',           'selim'),
    ('Susuz',           'susuz')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KASTAMONU (plate 37) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '37' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Abana',           'abana'),
    ('Ağlı',            'agli'),
    ('Araç',            'arac'),
    ('Azdavay',         'azdavay'),
    ('Bozkurt',         'bozkurt'),
    ('Cide',            'cide'),
    ('Çatalzeytin',     'catalzeytin'),
    ('Daday',           'daday'),
    ('Devrekani',       'devrekani'),
    ('Doğanyurt',       'doganyurt'),
    ('Hanönü',          'hanonü'),
    ('İhsangazi',       'ihsangazi'),
    ('İnebolu',         'inebolu'),
    ('Küre',            'kure'),
    ('Pınarbaşı',       'pinarbasi'),
    ('Seydiler',        'seydiler'),
    ('Şenpazar',        'senpazar'),
    ('Taşköprü',        'taskopru'),
    ('Tosya',           'tosya')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KAYSERİ (plate 38) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '38' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Akkışla',         'akkisla'),
    ('Bünyan',          'bunyan'),
    ('Develi',          'develi'),
    ('Felahiye',        'felahiye'),
    ('Hacılar',         'hacilar'),
    ('İncesu',          'incesu'),
    ('Kocasinan',       'kocasinan'),
    ('Melikgazi',       'melikgazi'),
    ('Özvatan',         'ozvatan'),
    ('Pınarbaşı',       'pinarbasi'),
    ('Sarıoğlan',       'sarioglan'),
    ('Sarız',           'sariz'),
    ('Talas',           'talas'),
    ('Tomarza',         'tomarza'),
    ('Yahyalı',         'yahyali'),
    ('Yeşilhisar',      'yesilhisar')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KIRKLARELİ (plate 39) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '39' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Babaeski',        'babaeski'),
    ('Demirköy',        'demirkoy'),
    ('Kofçaz',          'kofcaz'),
    ('Lüleburgaz',      'luleburgaz'),
    ('Pehlivanköy',     'pehlivankoy'),
    ('Pınarhisar',      'pinarhisar'),
    ('Vize',            'vize')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KIRŞEHİR (plate 40) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '40' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Akçakent',        'akcakent'),
    ('Akpınar',         'akpinar'),
    ('Boztepe',         'boztepe'),
    ('Çiçekdağı',       'cicekdagi'),
    ('Kaman',           'kaman'),
    ('Mucur',           'mucur')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KOCAELİ (plate 41) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '41' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Başiskele',       'basiskele'),
    ('Çayırova',        'cayirova'),
    ('Darıca',          'darica'),
    ('Derince',         'derince'),
    ('Dilovası',        'dilovasi'),
    ('Gebze',           'gebze'),
    ('Gölcük',          'golcuk'),
    ('İzmit',           'izmit'),
    ('Kandıra',         'kandira'),
    ('Karamürsel',      'karamursel'),
    ('Kartepe',         'kartepe'),
    ('Körfez',          'korfez')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KONYA (plate 42) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '42' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Ahırlı',          'ahirli'),
    ('Akören',          'akoren'),
    ('Akşehir',         'aksehir'),
    ('Altınekin',       'altinekin'),
    ('Beyşehir',        'beysehir'),
    ('Bozkır',          'bozkir'),
    ('Cihanbeyli',      'cihanbeyli'),
    ('Çeltik',          'celtik'),
    ('Çumra',           'cumra'),
    ('Derbent',         'derbent'),
    ('Derebucak',       'derebucak'),
    ('Doğanhisar',      'doganhisar'),
    ('Emirgazi',        'emirgazi'),
    ('Ereğli',          'eregli'),
    ('Güneysınır',      'guneysinir'),
    ('Hadim',           'hadim'),
    ('Halkapınar',      'halkapinar'),
    ('Hüyük',           'huyuk'),
    ('Ilgın',           'ilgin'),
    ('Kadınhanı',       'kadinhani'),
    ('Karapınar',       'karapinar'),
    ('Karatay',         'karatay'),
    ('Kulu',            'kulu'),
    ('Meram',           'meram'),
    ('Sarayönü',        'sarayonu'),
    ('Selçuklu',        'selcuklu'),
    ('Seydişehir',      'seydisehir'),
    ('Taşkent',         'taskent'),
    ('Tuzlukçu',        'tuzlukcu'),
    ('Yalıhüyük',       'yalihuyuk'),
    ('Yunak',           'yunak')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KÜTAHYA (plate 43) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '43' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Altıntaş',        'altintas'),
    ('Aslanapa',        'aslanapa'),
    ('Çavdarhisar',     'cavdarhisar'),
    ('Domaniç',         'domanic'),
    ('Dumlupınar',      'dumlupinar'),
    ('Emet',            'emet'),
    ('Gediz',           'gediz'),
    ('Hisarcık',        'hisarcik'),
    ('Pazarlar',        'pazarlar'),
    ('Simav',           'simav'),
    ('Şaphane',         'saphane'),
    ('Tavşanlı',        'tavsanli')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- MALATYA (plate 44) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '44' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Akçadağ',         'akcadag'),
    ('Arapgir',         'arapgir'),
    ('Arguvan',         'arguvan'),
    ('Battalgazi',      'battalgazi'),
    ('Darende',         'darende'),
    ('Doğanşehir',      'dogansehir'),
    ('Doğanyol',        'doganyol'),
    ('Hekimhan',        'hekimhan'),
    ('Kale',            'kale'),
    ('Kuluncak',        'kuluncak'),
    ('Pütürge',         'puturge'),
    ('Yazıhan',         'yazihan'),
    ('Yeşilyurt',       'yesilyurt')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- MANİSA (plate 45) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '45' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Ahmetli',         'ahmetli'),
    ('Akhisar',         'akhisar'),
    ('Alaşehir',        'alasehir'),
    ('Demirci',         'demirci'),
    ('Gölmarmara',      'golmarmara'),
    ('Gördes',          'gordes'),
    ('Kırkağaç',        'kirkagac'),
    ('Köprübaşı',       'koprubasi'),
    ('Kula',            'kula'),
    ('Sarıgöl',         'sarigol'),
    ('Saruhanlı',       'saruhanli'),
    ('Selendi',         'selendi'),
    ('Soma',            'soma'),
    ('Şehzadeler',      'sehzadeler'),
    ('Turgutlu',        'turgutlu'),
    ('Yunusemre',       'yunusemre')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KAHRAMANMARAŞ (plate 46) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '46' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Afşin',           'afsin'),
    ('Andırın',         'andirin'),
    ('Çağlayancerit',   'caglayancerit'),
    ('Dulkadiroğlu',    'dulkadiroglu'),
    ('Ekinözü',         'ekinozu'),
    ('Elbistan',        'elbistan'),
    ('Göksun',          'goksun'),
    ('Nurhak',          'nurhak'),
    ('Onikişubat',      'onikisübat'),
    ('Pazarcık',        'pazarcik'),
    ('Türkoğlu',        'turkoglu')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- MARDİN (plate 47) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '47' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Artuklu',         'artuklu'),
    ('Dargeçit',        'dargecit'),
    ('Derik',           'derik'),
    ('Kızıltepe',       'kiziltepe'),
    ('Mazıdağı',        'mazidag'),
    ('Midyat',          'midyat'),
    ('Nusaybin',        'nusaybin'),
    ('Ömerli',          'omerli'),
    ('Savur',           'savur'),
    ('Yeşilli',         'yesilli')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- MUĞLA (plate 48) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '48' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Bodrum',          'bodrum'),
    ('Dalaman',         'dalaman'),
    ('Datça',           'datca'),
    ('Fethiye',         'fethiye'),
    ('Kavaklıdere',     'kavaklıdere'),
    ('Köyceğiz',        'koycegiz'),
    ('Marmaris',        'marmaris'),
    ('Menteşe',         'mentese'),
    ('Milas',           'milas'),
    ('Ortaca',          'ortaca'),
    ('Seydikemer',      'seydikemer'),
    ('Ula',             'ula'),
    ('Yatağan',         'yatagan')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- MUŞ (plate 49) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '49' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Bulanık',         'bulanik'),
    ('Hasköy',          'haskoy'),
    ('Korkut',          'korkut'),
    ('Malazgirt',       'malazgirt'),
    ('Varto',           'varto')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- NEVŞEHİR (plate 50) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '50' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Acıgöl',          'acigol'),
    ('Avanos',          'avanos'),
    ('Derinkuyu',       'derinkuyu'),
    ('Gülşehir',        'gulsehir'),
    ('Hacıbektaş',      'hacibektaş'),
    ('Kozaklı',         'kozakli'),
    ('Ürgüp',           'urgup')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- NİĞDE (plate 51) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '51' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Altunhisar',      'altunhisar'),
    ('Bor',             'bor'),
    ('Çamardı',         'camardi'),
    ('Çiftlik',         'ciftlik'),
    ('Ulukışla',        'ulukisla')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ORDU (plate 52) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '52' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Altınordu',       'altinordu'),
    ('Akkuş',           'akkus'),
    ('Aybastı',         'aybasti'),
    ('Çamaş',           'camas'),
    ('Çatalpınar',      'catalpinar'),
    ('Çaybaşı',         'caybasi'),
    ('Fatsa',           'fatsa'),
    ('Gölköy',          'golkoy'),
    ('Gülyalı',         'gulyali'),
    ('Gürgentepe',      'gurgentepe'),
    ('İkizce',          'ikizce'),
    ('Kabadüz',         'kabaduz'),
    ('Kabataş',         'kabatas'),
    ('Korgan',          'korgan'),
    ('Kumru',           'kumru'),
    ('Mesudiye',        'mesudiye'),
    ('Perşembe',        'persembe'),
    ('Ulubey',          'ulubey'),
    ('Ünye',            'unye')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- RİZE (plate 53) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '53' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Ardeşen',         'ardesen'),
    ('Çamlıhemşin',     'camlihemsin'),
    ('Çayeli',          'cayeli'),
    ('Derepazarı',      'derepazari'),
    ('Fındıklı',        'findikli'),
    ('Güneysu',         'guneysu'),
    ('Hemşin',          'hemsin'),
    ('İkizdere',        'ikizdere'),
    ('İyidere',         'iyidere'),
    ('Kalkandere',      'kalkandere'),
    ('Pazar',           'pazar')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- SAKARYA (plate 54) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '54' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Adapazarı',       'adapazari'),
    ('Akyazı',          'akyazi'),
    ('Arifiye',         'arifiye'),
    ('Erenler',         'erenler'),
    ('Ferizli',         'ferizli'),
    ('Geyve',           'geyve'),
    ('Hendek',          'hendek'),
    ('Karapürçek',      'karapurcek'),
    ('Karasu',          'karasu'),
    ('Kaynarca',        'kaynarca'),
    ('Kocaali',         'kocaali'),
    ('Mithatpaşa',      'mithatpasa'),
    ('Pamukova',        'pamukova'),
    ('Sapanca',         'sapanca'),
    ('Serdivan',        'serdivan'),
    ('Söğütlü',         'sogutlu'),
    ('Taraklı',         'tarakli')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- SAMSUN (plate 55) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '55' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Alaçam',          'alacam'),
    ('Asarcık',         'asarcik'),
    ('Atakum',          'atakum'),
    ('Ayvacık',         'ayvacik'),
    ('Bafra',           'bafra'),
    ('Canik',           'canik'),
    ('Çarşamba',        'carsamba'),
    ('Havza',           'havza'),
    ('İlkadım',         'ilkadim'),
    ('Kavak',           'kavak'),
    ('Ladik',           'ladik'),
    ('Ondokuzmayıs',    'ondokuzmayis'),
    ('Salıpazarı',      'salipazari'),
    ('Tekkeköy',        'tekkekoy'),
    ('Terme',           'terme'),
    ('Vezirköprü',      'vezirkopru'),
    ('Yakakent',        'yakakent')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- SİİRT (plate 56) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '56' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Baykan',          'baykan'),
    ('Eruh',            'eruh'),
    ('Kurtalan',        'kurtalan'),
    ('Pervari',         'pervari'),
    ('Şirvan',          'sirvan'),
    ('Tillo',           'tillo')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- SİNOP (plate 57) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '57' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Ayancık',         'ayancik'),
    ('Boyabat',         'boyabat'),
    ('Dikmen',          'dikmen'),
    ('Durağan',         'duragan'),
    ('Erfelek',         'erfelek'),
    ('Gerze',           'gerze'),
    ('Saraydüzü',       'saraydüzü'),
    ('Türkeli',         'turkeli')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- SİVAS (plate 58) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '58' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Akıncılar',       'akincilar'),
    ('Altınyayla',      'altinyayla'),
    ('Divriği',         'divrigi'),
    ('Doğanşar',        'dogansar'),
    ('Gemerek',         'gemerek'),
    ('Gölova',          'golova'),
    ('Gömeç',           'gomec'),
    ('Gürün',           'gurun'),
    ('Hafik',           'hafik'),
    ('İmranlı',         'imranli'),
    ('Kangal',          'kangal'),
    ('Koyulhisar',      'koyulhisar'),
    ('Suşehri',         'susehri'),
    ('Şarkışla',        'sarkisla'),
    ('Ulaş',            'ulas'),
    ('Yıldızeli',       'yildizeli'),
    ('Zara',            'zara')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- TEKİRDAĞ (plate 59) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '59' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Çerkezköy',       'cerkezkoy'),
    ('Çorlu',           'corlu'),
    ('Ergene',          'ergene'),
    ('Hayrabolu',       'hayrabolu'),
    ('Kapaklı',         'kapakli'),
    ('Malkara',         'malkara'),
    ('Marmaraereğlisi', 'marmaraereglisi'),
    ('Muratlı',         'muratli'),
    ('Saray',           'saray'),
    ('Süleymanpaşa',    'suleymanpasa'),
    ('Şarköy',          'sarkoy')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- TOKAT (plate 60) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '60' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Almus',           'almus'),
    ('Artova',          'artova'),
    ('Başçiftlik',      'basciftlik'),
    ('Erbaa',           'erbaa'),
    ('Niksar',          'niksar'),
    ('Pazar',           'pazar'),
    ('Reşadiye',        'resadiye'),
    ('Sulusaray',       'sulusaray'),
    ('Turhal',          'turhal'),
    ('Yeşilyurt',       'yesilyurt'),
    ('Zile',            'zile')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- TRABZON (plate 61) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '61' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Akçaabat',        'akcaabat'),
    ('Araklı',          'arakli'),
    ('Arsin',           'arsin'),
    ('Beşikdüzü',       'besikduzu'),
    ('Çarşıbaşı',       'carsibasi'),
    ('Çaykara',         'caykara'),
    ('Dernekpazarı',    'dernekpazari'),
    ('Düzköy',          'duzkoy'),
    ('Hayrat',          'hayrat'),
    ('Köprübaşı',       'koprubasi'),
    ('Maçka',           'macka'),
    ('Of',              'of'),
    ('Ortahisar',       'ortahisar'),
    ('Sürmene',         'surmene'),
    ('Şalpazarı',       'salpazari'),
    ('Tonya',           'tonya'),
    ('Vakfıkebir',      'vakfikebir'),
    ('Yomra',           'yomra')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- TUNCELİ (plate 62) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '62' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Çemişgezek',      'cemisgezek'),
    ('Hozat',           'hozat'),
    ('Mazgirt',         'mazgirt'),
    ('Nazımiye',        'nazimiye'),
    ('Ovacık',          'ovacik'),
    ('Pertek',          'pertek'),
    ('Pülümür',         'pulumur')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ŞANLIURFA (plate 63) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '63' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Akçakale',        'akcakale'),
    ('Birecik',         'birecik'),
    ('Bozova',          'bozova'),
    ('Ceylanpınar',     'ceylanpinar'),
    ('Eyyübiye',        'eyyubiye'),
    ('Halfeti',         'halfeti'),
    ('Haliliye',        'haliliye'),
    ('Harran',          'harran'),
    ('Hilvan',          'hilvan'),
    ('Karaköprü',       'karakopru'),
    ('Siverek',         'siverek'),
    ('Suruç',           'suruc'),
    ('Viranşehir',      'viransehir')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- UŞAK (plate 64) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '64' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Banaz',           'banaz'),
    ('Eşme',            'esme'),
    ('Karahallı',       'karahalli'),
    ('Sivaslı',         'sivasli'),
    ('Ulubey',          'ulubey')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- VAN (plate 65) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '65' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Bahçesaray',      'bahcesaray'),
    ('Başkale',         'baskale'),
    ('Çaldıran',        'caldiran'),
    ('Çatak',           'catak'),
    ('Edremit',         'edremit'),
    ('Erciş',           'ercis'),
    ('Gevaş',           'gevas'),
    ('Gürpınar',        'gurpinar'),
    ('İpekyolu',        'ipekyolu'),
    ('Muradiye',        'muradiye'),
    ('Özalp',           'ozalp'),
    ('Saray',           'saray'),
    ('Tuşba',           'tusba')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- YOZGAT (plate 66) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '66' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Akdağmadeni',     'akdagmadeni'),
    ('Aydıncık',        'aydincik'),
    ('Boğazlıyan',      'bogazliyan'),
    ('Çandır',          'candir'),
    ('Çayıralan',       'cayiralan'),
    ('Çekerek',         'cekerek'),
    ('Kadışehri',       'kadisehri'),
    ('Saraykent',       'saraykent'),
    ('Sarıkaya',        'sarikaya'),
    ('Şefaatli',        'sefaatli'),
    ('Sorgun',          'sorgun'),
    ('Yerköy',          'yerkoy')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ZONGULDAK (plate 67) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '67' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Alaplı',          'alapli'),
    ('Çaycuma',         'caycuma'),
    ('Devrek',          'devrek'),
    ('Gökçebey',        'gokcebey'),
    ('Kilimli',         'kilimli'),
    ('Kozlu',           'kozlu')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- AKSARAY (plate 68) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '68' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Ağaçören',        'agacoren'),
    ('Eskil',           'eskil'),
    ('Gülağaç',         'gulagac'),
    ('Güzelyurt',       'guzelyurt'),
    ('Ortaköy',         'ortakoy'),
    ('Sarıyahşi',       'sariyahsi')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- BAYBURT (plate 69) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '69' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Aydıntepe',       'aydintepe'),
    ('Demirözü',        'demirozu')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KARAMAN (plate 70) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '70' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Ayrancı',         'ayranci'),
    ('Başyayla',        'basyayla'),
    ('Ermenek',         'ermenek'),
    ('Kazımkarabekir',  'kazimkarabekir'),
    ('Sarıveliler',     'sariveliler')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KIRIKKALEi (plate 71) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '71' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Bahşili',         'bahsili'),
    ('Balışeyh',        'baliseyh'),
    ('Çelebi',          'celebi'),
    ('Delice',          'delice'),
    ('Karakeçili',      'karakecili'),
    ('Keskin',          'keskin'),
    ('Sulakyurt',       'sulakyurt'),
    ('Yahşihan',        'yahsihan')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- BATMAN (plate 72) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '72' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Beşiri',          'besiri'),
    ('Gercüş',          'gercus'),
    ('Hasankeyf',       'hasankeyf'),
    ('Kozluk',          'kozluk'),
    ('Sason',           'sason')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ŞIRNAK (plate 73) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '73' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Beytüşşebap',     'beytussebap'),
    ('Cizre',           'cizre'),
    ('Güçlükonak',      'guclukonak'),
    ('İdil',            'idil'),
    ('Silopi',          'silopi'),
    ('Uludere',         'uludere')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- BARTIN (plate 74) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '74' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Amasra',          'amasra'),
    ('Kurucaşile',      'kurucasile'),
    ('Ulus',            'ulus')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- ARDAHAN (plate 75) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '75' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Çıldır',          'cildir'),
    ('Damal',           'damal'),
    ('Göle',            'gole'),
    ('Hanak',           'hanak'),
    ('Posof',           'posof')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- IĞDIR (plate 76) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '76' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Aralık',          'aralik'),
    ('Karakoyunlu',     'karakoyunlu'),
    ('Tuzluca',         'tuzluca')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- YALOVA (plate 77) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '77' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Altınova',        'altinova'),
    ('Armutlu',         'armutlu'),
    ('Çiftlikköy',      'ciftlikkoy'),
    ('Çınarcık',        'cinarcik'),
    ('Termal',          'termal')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KARABÜK (plate 78) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '78' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Eflani',          'eflani'),
    ('Eskipazar',       'eskipazar'),
    ('Ovacık',          'ovacik'),
    ('Safranbolu',      'safranbolu'),
    ('Yenice',          'yenice')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- KİLİS (plate 79) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '79' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Elbeyli',         'elbeyli'),
    ('Musabeyli',       'musabeyli'),
    ('Polateli',        'polateli')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- OSMANİYE (plate 80) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '80' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Bahçe',           'bahce'),
    ('Düziçi',          'duzici'),
    ('Hasanbeyli',      'hasanbeyli'),
    ('Kadirli',         'kadirli'),
    ('Sumbas',          'sumbas'),
    ('Toprakkale',      'toprakkale')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

-- ---- DÜZCE (plate 81) ----
WITH city AS (
    SELECT id AS city_id FROM cities WHERE plate_code = '81' LIMIT 1
)
INSERT INTO districts (city_id, name, slug, is_active)
SELECT city.city_id, v.name, v.slug, true
FROM city, (VALUES
    ('Merkez',          'merkez'),
    ('Akçakoca',        'akcakoca'),
    ('Cumayeri',        'cumayeri'),
    ('Çilimli',         'cilimli'),
    ('Gölyaka',         'golyaka'),
    ('Gümüşova',        'gumusova'),
    ('Kaynaşlı',        'kaynasli'),
    ('Yığılca',         'yigilca')
) AS v(name, slug)
ON CONFLICT DO NOTHING;

COMMIT;
