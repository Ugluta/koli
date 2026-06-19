export default function PanelDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Toplam Görüntülenme', value: '—', icon: '👁️' },
          { label: 'Toplam Tıklanma', value: '—', icon: '🖱️' },
          { label: 'Ürün Sayısı', value: '—', icon: '📦' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border p-5">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
