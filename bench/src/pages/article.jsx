import { escapeEntities, html } from "jsx-async-runtime";
import { Layout } from "../layout.js";

// A blog article from a CMS: the body is trusted markup (about 15 KB) rendered with html(),
// the metadata uses URL and Date objects, and the head carries JSON-LD and Open Graph tags.

const paragraph =
  '<p>Lorem ipsum <strong>dolor</strong> sit amet, <a href="https://example.com/docs?a=1&amp;b=2">consectetur</a> ' +
  "adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, " +
  "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>";

const article = {
  title: 'Why "async" templates & streaming matter',
  summary: "How rendering <html> while loading data keeps pages fast.",
  url: new URL("https://example.com/blog/async-templates"),
  image: new URL("https://example.com/images/async-templates.jpg"),
  published: new Date("2026-01-15T09:30:00Z"),
  author: { name: "Jane <Doe>", url: new URL("https://example.com/authors/jane") },
  tags: new Set(["jsx", "ssr", "performance", "streaming"]),
  body: Array.from({ length: 48 }, (_, i) =>
    i % 8 === 0 ? `<h2>Section ${i / 8 + 1}</h2>${paragraph}` : paragraph,
  ).join("\n"),
  related: Array.from({ length: 5 }, (_, i) => ({
    title: `Related post #${i} <with markup>`,
    url: new URL(`https://example.com/blog/related-${i}`),
  })),
};

function ArticleHead({ article }) {
  // Like in the README: JSON with `<` escaped, so a value can't end the script early.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    datePublished: article.published.toISOString(),
    author: { "@type": "Person", name: article.author.name },
  }).replaceAll("<", "\\u003c");
  return (
    <>
      <meta name="description" content={article.summary} />
      <link rel="canonical" href={article.url} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={article.title} />
      <meta property="og:description" content={article.summary} />
      <meta property="og:url" content={article.url} />
      <meta property="og:image" content={article.image} />
      <script type="application/ld+json">{html(jsonLd)}</script>
    </>
  );
}

export function Article() {
  return (
    <Layout title={article.title} head={<ArticleHead article={article} />}>
      <article class="post">
        <header>
          <h1>{article.title}</h1>
          {html(
            `<p class="byline">By <a href="${escapeEntities(article.author.url.href)}">${escapeEntities(article.author.name)}</a></p>`,
          )}
          <time datetime={article.published.toISOString()}>
            {article.published.toISOString().slice(0, 10)}
          </time>
          <ul class="tags">
            {article.tags.values().map((tag) => (
              <li>
                <a href={`/tags/${tag}`}>#{tag}</a>
              </li>
            ))}
          </ul>
        </header>
        <img src={article.image.href} alt="" width={1200} height={630} />
        <div class="content">{html(article.body)}</div>
      </article>
      <aside>
        <h2>Related posts</h2>
        <ul>
          {article.related.map(({ title, url }) => (
            <li>
              <a href={url.href}>{title}</a>
            </li>
          ))}
        </ul>
      </aside>
    </Layout>
  );
}
