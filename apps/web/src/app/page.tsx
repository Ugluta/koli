export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">Koli Şehir Rehberi</h1>
        <p className="text-xl text-gray-600 mb-8">
          Şehirinizdeki firma, ürün ve hizmetleri keşfedin.
        </p>
        <p className="text-sm text-gray-400 bg-white rounded-lg px-4 py-2 inline-block border">
          Phase 1 geliştirme devam ediyor...
        </p>
      </div>
    </main>
  );
}
