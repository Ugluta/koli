'use client';

import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api/client';

interface GalleryItem {
  id: string;
  url: string;
  altText: string | null;
  mimeType: string | null;
  createdAt: string;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_SIZE_MB = 10;

export default function GaleriPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchGallery = async (bId: string) => {
    const res = await apiClient.get(`/panel/businesses/${bId}/gallery`);
    setItems(res.data ?? []);
  };

  useEffect(() => {
    apiClient.get('/panel/businesses')
      .then(async (res) => {
        const id = res.data?.data?.[0]?.id;
        if (id) { setBusinessId(id); await fetchGallery(id); }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !businessId) return;
    setUploadError('');

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setUploadError(`${file.name} boyutu ${MAX_SIZE_MB}MB'ı aşıyor.`);
        continue;
      }
      setUploading(true);
      setProgress(0);
      try {
        // 1. Get presigned URL
        const presignRes = await apiClient.post(`/panel/businesses/${businessId}/media/presign`, {
          folder: 'gallery',
          filename: file.name,
          mimeType: file.type,
        });
        const { uploadUrl, publicUrl } = presignRes.data;

        // 2. Upload directly to S3/MinIO
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
          xhr.onerror = () => reject(new Error('Upload network error'));
          xhr.send(file);
        });

        // 3. Register in gallery
        await apiClient.post(`/panel/businesses/${businessId}/gallery`, {
          url: publicUrl,
          mimeType: file.type,
          fileSize: file.size,
        });

        await fetchGallery(businessId);
      } catch (err: any) {
        setUploadError(err?.response?.data?.error?.message ?? err?.message ?? 'Yükleme başarısız');
      } finally {
        setUploading(false);
        setProgress(0);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!businessId || !confirm('Bu görseli silmek istediğinizden emin misiniz?')) return;
    setDeleting(id);
    try {
      await apiClient.delete(`/panel/businesses/${businessId}/gallery/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <p className="text-gray-400">Yükleniyor...</p>;
  if (!businessId) return (
    <div className="text-center py-16">
      <p className="text-gray-500 mb-4">Henüz bir firma kaydınız yok.</p>
      <a href="/panel/firma" className="text-blue-600 text-sm underline">Firma oluştur</a>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Galeri</h1>
        <span className="text-sm text-gray-400">{items.length} görsel</span>
      </div>

      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-gray-500">Yükleniyor... {progress}%</p>
          </div>
        ) : (
          <>
            <div className="text-3xl mb-2">🖼️</div>
            <p className="text-sm font-medium text-gray-700">Görselleri buraya sürükleyin veya tıklayın</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, GIF — maks. {MAX_SIZE_MB}MB</p>
          </>
        )}
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {uploadError}
        </div>
      )}

      {/* Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.altText ?? ''}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="opacity-0 group-hover:opacity-100 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-40"
                >
                  {deleting === item.id ? '...' : 'Sil'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm text-center py-8">Henüz galeri görseli eklenmemiş.</p>
      )}
    </div>
  );
}
