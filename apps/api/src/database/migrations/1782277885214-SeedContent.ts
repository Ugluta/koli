import { MigrationInterface, QueryRunner } from 'typeorm';

const AUTHOR_ID = '00000000-0000-4000-8000-000000000001';
// Random bcrypt hash of a throwaway secret — this account cannot be logged into.
const DISABLED_HASH = '$2b$10$s1ZOBdAkksSetEZm5N3hqeEgSCij61S8qi2cVmDe.WYaOS.xqN2oW';

interface SeedPost {
  type: 'blog' | 'news';
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  daysAgo: number;
}

const POSTS: SeedPost[] = [
  {
    type: 'blog',
    title: 'Koli Seçiminde Dikkat Edilmesi Gereken 7 Kriter',
    slug: 'koli-seciminde-dikkat-edilmesi-gereken-7-kriter',
    excerpt:
      'Doğru koli seçimi, ürününüzü hasarsız ulaştırmanın ve kargo maliyetlerini düşürmenin ilk adımıdır. İşte göz önünde bulundurmanız gereken 7 temel kriter.',
    featured: true,
    seoTitle: 'Koli Seçiminde 7 Kriter | Koli Rehberi',
    seoDescription:
      'Ürününüze uygun koli seçimi için ebat, dayanıklılık, oluk tipi ve maliyet kriterleri. Kargoda hasarı azaltan pratik öneriler.',
    seoKeywords: 'koli seçimi, oluklu mukavva koli, ambalaj, kargo kolisi',
    daysAgo: 2,
    content: `
<p>Bir ürünü güvenle ulaştırmanın en kritik adımı, ona uygun koliyi seçmektir. Yanlış seçilen bir koli hem hasara hem de gereksiz kargo masrafına yol açar. Aşağıdaki yedi kriter, işletmenizin ihtiyacına en uygun koliyi belirlemenize yardımcı olur.</p>
<h2>1. Doğru Ebat</h2>
<p>Ürünle koli arasındaki boşluk ne çok fazla ne de çok az olmalıdır. Fazla boşluk darbe sırasında ürünün hareket etmesine, dar koli ise sıkışmaya neden olur.</p>
<h2>2. Oluk Tipi</h2>
<p>Tek oluklu koliler hafif ürünler için yeterliyken, çift oluklu koliler ağır ve kırılgan ürünlerde tercih edilmelidir.</p>
<h2>3. Dayanıklılık (Ezme Direnci)</h2>
<p>Üst üste istiflenecek ürünlerde kolinin dikey ezme direnci (ECT/BCT değerleri) belirleyicidir.</p>
<h2>4. Nem ve Sıcaklık Koşulları</h2>
<p>Soğuk zincir veya nemli ortamda taşınacak ürünlerde laminasyonlu veya kaplamalı koliler kullanılmalıdır.</p>
<h2>5. Ürün Ağırlığı</h2>
<p>Kolinin taşıyabileceği maksimum ağırlık, üretici tarafından belirtilen sınırın altında tutulmalıdır.</p>
<h2>6. Maliyet Dengesi</h2>
<p>En kalın koli her zaman en doğru seçim değildir. İhtiyacınızdan fazla dayanıklılık, gereksiz maliyet demektir.</p>
<h2>7. Sürdürülebilirlik</h2>
<p>Geri dönüştürülmüş oluklu mukavva, hem çevreye duyarlı hem de uygun maliyetli bir tercihtir.</p>
<p>Bu kriterleri değerlendirerek ürününüze en uygun koliyi seçebilir, kargo süreçlerinizdeki hasar oranını ve maliyeti gözle görülür şekilde azaltabilirsiniz.</p>
`.trim(),
  },
  {
    type: 'blog',
    title: 'E-ticaret İçin Doğru Ambalaj Nasıl Seçilir?',
    slug: 'eticaret-icin-dogru-ambalaj-nasil-secilir',
    excerpt:
      'Müşteri deneyimi paketi açtığı anda başlar. E-ticaret işletmeleri için marka değerini yükselten ambalaj seçiminin püf noktaları.',
    featured: false,
    seoTitle: 'E-ticaret Ambalaj Seçimi Rehberi | Koli Rehberi',
    seoDescription:
      'E-ticarette ürün koruma, marka deneyimi ve kargo maliyeti dengesini kuran ambalaj seçimi ipuçları.',
    seoKeywords: 'e-ticaret ambalaj, kargo paketleme, marka ambalajı',
    daysAgo: 5,
    content: `
<p>E-ticarette ambalaj yalnızca bir koruma aracı değil, aynı zamanda markanızın müşteriyle ilk fiziksel temasıdır. Doğru ambalaj, iade oranını düşürürken müşteri memnuniyetini artırır.</p>
<h2>Korumayı Önceliklendirin</h2>
<p>Kırılgan ürünlerde streç film, baloncuklu naylon ve köşe koruyucular kullanılmalıdır. Ürünün koli içinde hareket etmemesi esastır.</p>
<h2>Marka Deneyimini Düşünün</h2>
<p>Özel baskılı koliler, içeride kullanılan pelur kâğıt ve teşekkür kartı gibi dokunuşlar, müşteride güçlü bir marka algısı oluşturur.</p>
<h2>Maliyeti Optimize Edin</h2>
<p>Standartlaştırılmış birkaç koli ebadı kullanmak, hem stok yönetimini kolaylaştırır hem de desi bazlı kargo maliyetini düşürür.</p>
<p>Koruma, deneyim ve maliyet üçgenini dengeleyen işletmeler, e-ticarette uzun vadede öne çıkar.</p>
`.trim(),
  },
  {
    type: 'blog',
    title: 'Streç Film mi, Baloncuklu Naylon mu? Ürün Koruma Rehberi',
    slug: 'strec-film-mi-baloncuklu-naylon-mu-urun-koruma-rehberi',
    excerpt:
      'İki popüler koruyucu malzemeyi karşılaştırdık. Hangi ürün için hangisini kullanmalısınız?',
    featured: false,
    seoTitle: 'Streç Film vs Baloncuklu Naylon | Koli Rehberi',
    seoDescription:
      'Streç film ve baloncuklu naylon arasındaki farklar, kullanım alanları ve doğru tercih için pratik öneriler.',
    seoKeywords: 'streç film, baloncuklu naylon, ürün koruma, ambalaj malzemesi',
    daysAgo: 9,
    content: `
<p>Ürün koruma malzemeleri arasında en sık tercih edilen ikisi streç film ve baloncuklu naylondur. Her ikisinin de güçlü olduğu farklı alanlar vardır.</p>
<h2>Streç Film Ne Zaman Kullanılır?</h2>
<ul>
<li>Palet üzerindeki ürünleri sabitlemek için</li>
<li>Toz ve nemden korumak için</li>
<li>Çoklu ürünleri bir arada tutmak için</li>
</ul>
<h2>Baloncuklu Naylon Ne Zaman Kullanılır?</h2>
<ul>
<li>Kırılgan ve darbeye hassas ürünlerde</li>
<li>Elektronik cihazların sarımında</li>
<li>Koli içi boşlukların doldurulmasında</li>
</ul>
<p>Özetle, sabitleme ve gruplama için streç film; darbe emilimi için baloncuklu naylon doğru tercihtir. Çoğu işletme ikisini birlikte kullanarak en yüksek korumayı sağlar.</p>
`.trim(),
  },
  {
    type: 'blog',
    title: 'İşletmenizi Koli Rehberi’nde Öne Çıkarmanın Yolları',
    slug: 'isletmenizi-koli-rehberinde-one-cikarmanin-yollari',
    excerpt:
      'Rehberde daha fazla görünürlük ve müşteri için profilinizi güçlendirmenin somut yöntemleri.',
    featured: true,
    seoTitle: 'Rehberde Öne Çıkma Rehberi | Koli Rehberi',
    seoDescription:
      'İşletme profilinizi tamamlayın, ürün ve hizmetlerinizi ekleyin, premium üyelikle aramalarda öne çıkın.',
    seoKeywords: 'firma rehberi, işletme tanıtımı, premium üyelik, SEO',
    daysAgo: 13,
    content: `
<p>Koli Rehberi’nde binlerce işletme arasından sıyrılmak, doğru adımları atan firmalar için oldukça mümkündür. İşte profilinizi güçlendirecek yöntemler.</p>
<h2>Profilinizi Eksiksiz Doldurun</h2>
<p>İletişim bilgileri, çalışma saatleri, konum ve açıklama alanlarının tamamlanması, hem kullanıcı güvenini hem de arama sıralamanızı yükseltir.</p>
<h2>Ürün ve Hizmetlerinizi Ekleyin</h2>
<p>Vitrininize eklediğiniz her ürün ve hizmet, yeni bir anahtar kelimeyle bulunabilmeniz anlamına gelir.</p>
<h2>Görsellerle Güven Verin</h2>
<p>Kaliteli galeri görselleri, ziyaretçilerin sizinle iletişime geçme olasılığını belirgin şekilde artırır.</p>
<h2>Premium Üyeliği Değerlendirin</h2>
<p>Öne çıkarma, daha yüksek ürün/görsel limitleri ve gelişmiş istatistiklerle premium üyelik, görünürlüğünüzü bir üst seviyeye taşır.</p>
<p>Bu adımları uygulayan işletmeler, rehber üzerinden gelen ziyaretçi ve müşteri sayısında kayda değer artış elde eder.</p>
`.trim(),
  },
  {
    type: 'news',
    title: '2026’da Ambalaj Sektöründe Sürdürülebilirlik Trendi',
    slug: '2026-ambalaj-sektorunde-surdurulebilirlik-trendi',
    excerpt:
      'Geri dönüştürülebilir malzemeler ve azaltılmış plastik kullanımı, 2026 yılında ambalaj sektörünün ana gündemi olmaya devam ediyor.',
    featured: false,
    seoTitle: '2026 Ambalajda Sürdürülebilirlik Trendi | Koli Rehberi',
    seoDescription:
      '2026’da ambalaj sektöründe öne çıkan sürdürülebilirlik uygulamaları, geri dönüşüm ve plastik azaltma trendleri.',
    seoKeywords: 'sürdürülebilir ambalaj, geri dönüşüm, ambalaj trendleri 2026',
    daysAgo: 4,
    content: `
<p>Ambalaj sektörü, 2026 yılına sürdürülebilirlik odağıyla giriyor. Marka sahipleri ve tüketiciler, çevreye duyarlı çözümleri giderek daha fazla talep ediyor.</p>
<h2>Geri Dönüştürülmüş Malzemeler</h2>
<p>Geri dönüştürülmüş oluklu mukavva kullanımı, hem maliyet hem de karbon ayak izi avantajı sayesinde yaygınlaşıyor.</p>
<h2>Plastik Azaltımı</h2>
<p>Tek kullanımlık plastiğin yerini kâğıt bantlar, mantar dolgu malzemeleri ve nişasta bazlı çözümler alıyor.</p>
<p>Sürdürülebilir ambalaja yatırım yapan işletmeler, hem yasal düzenlemelere uyum sağlıyor hem de marka değerini güçlendiriyor.</p>
`.trim(),
  },
  {
    type: 'news',
    title: 'Oluklu Mukavva Fiyatlarında Piyasa Görünümü',
    slug: 'oluklu-mukavva-fiyatlarinda-piyasa-gorunumu',
    excerpt:
      'Hammadde maliyetleri ve talep dengesi, oluklu mukavva fiyatlarını nasıl etkiliyor? Güncel piyasa değerlendirmesi.',
    featured: false,
    seoTitle: 'Oluklu Mukavva Fiyatları Piyasa Görünümü | Koli Rehberi',
    seoDescription:
      'Oluklu mukavva fiyatlarını belirleyen hammadde, enerji ve talep faktörleri üzerine güncel piyasa analizi.',
    seoKeywords: 'oluklu mukavva fiyatları, koli fiyatları, ambalaj piyasası',
    daysAgo: 7,
    content: `
<p>Oluklu mukavva fiyatları; hammadde, enerji ve lojistik maliyetlerinin yanı sıra mevsimsel talep dalgalanmalarından etkileniyor.</p>
<h2>Hammadde ve Enerji</h2>
<p>Selüloz ve geri dönüşüm kâğıdı fiyatlarındaki değişimler, üretim maliyetine doğrudan yansıyor.</p>
<h2>Talep Dengesi</h2>
<p>E-ticaretin büyümesiyle birlikte koli talebi artarken, dönemsel kampanyalar fiyatlar üzerinde baskı oluşturabiliyor.</p>
<p>İşletmelerin, tedarik planlamasını erken yaparak ve birden fazla tedarikçiyle çalışarak fiyat dalgalanmalarına karşı kendilerini koruması öneriliyor.</p>
`.trim(),
  },
];

export class SeedContent1782277885214 implements MigrationInterface {
  name = 'SeedContent1782277885214';

  async up(queryRunner: QueryRunner): Promise<void> {
    // System content author (login disabled — random bcrypt hash)
    await queryRunner.query(
      `INSERT INTO users (id, email, password_hash, role, is_active, is_verified, email_verified)
       VALUES ($1, $2, $3, 'editor', true, true, true)
       ON CONFLICT (email) DO NOTHING`,
      [AUTHOR_ID, 'editor@koli.local', DISABLED_HASH],
    );

    for (const p of POSTS) {
      await queryRunner.query(
        `INSERT INTO posts
           (author_id, post_type, title, slug, excerpt, content, status, is_featured,
            published_at, seo_title, seo_description, seo_keywords)
         VALUES ($1, $2, $3, $4, $5, $6, 'published', $7,
            NOW() - ($8 || ' days')::interval, $9, $10, $11)
         ON CONFLICT (slug) DO NOTHING`,
        [
          AUTHOR_ID, p.type, p.title, p.slug, p.excerpt, p.content, p.featured,
          String(p.daysAgo), p.seoTitle, p.seoDescription, p.seoKeywords,
        ],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const slugs = POSTS.map((p) => p.slug);
    await queryRunner.query(`DELETE FROM posts WHERE slug = ANY($1)`, [slugs]);
    await queryRunner.query(`DELETE FROM users WHERE id = $1`, [AUTHOR_ID]);
  }
}
