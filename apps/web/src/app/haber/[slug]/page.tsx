import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string };
}

async function getPost(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const res = await fetch(`${apiUrl}/posts/${slug}`, { next: { revalidate: 600 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Haber bulunamadı' };
  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
    openGraph: {
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : [],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function HaberDetailPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const jsonLd = post.schemaMarkup ?? {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.coverImageUrl ?? undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold leading-tight mb-4">{post.title}</h1>
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-4">{post.excerpt}</p>
          )}
          <time className="text-sm text-gray-400" dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('tr-TR', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </time>
        </header>
        {post.coverImageUrl && (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full rounded-xl mb-8 object-cover max-h-96"
          />
        )}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
        />
      </main>
    </>
  );
}
