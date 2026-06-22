import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Haberler',
  description: 'En güncel haberler ve duyurular',
};

async function getPosts(page = 1) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const res = await fetch(`${apiUrl}/posts?type=news&limit=20`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return { data: [], meta: { cursor: null } };
  return res.json();
}

export default async function HaberlerPage() {
  const { data: posts } = await getPosts();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Haberler</h1>
      <div className="space-y-6">
        {posts.map((post: any) => (
          <article key={post.id} className="border-b pb-6">
            <Link href={`/haber/${post.slug}`} className="group">
              <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors mb-2">
                {post.title}
              </h2>
            </Link>
            {post.excerpt && (
              <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
            )}
            <div className="text-sm text-gray-400">
              {new Date(post.publishedAt).toLocaleDateString('tr-TR', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </div>
          </article>
        ))}
        {posts.length === 0 && (
          <p className="text-gray-500 text-center py-12">Henüz haber bulunmuyor.</p>
        )}
      </div>
    </main>
  );
}
