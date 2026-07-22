import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  OVERSEAS_ARTICLES,
  OVERSEAS_HERO_IMAGE,
  type OverseasArticle,
} from "@/lib/overseasBlog";

function ArticleCard({ article }: { article: OverseasArticle }) {
  return (
    <article className="group">
      <Link
        href={`/inspire/overseas-blog/${article.slug}`}
        className="block cursor-pointer"
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-slate-100">
          <img
            src={article.image}
            alt={article.imageAlt}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <h2 className="mt-4 text-[17px] sm:text-lg font-bold text-green-700 leading-snug group-hover:text-green-800 transition-colors">
          {article.title}
        </h2>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>
      </Link>
    </article>
  );
}

export default function OverseasBlogPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        {/* Hero */}
        <section className="relative w-full aspect-[2.6/1] min-h-[200px] max-h-[380px] overflow-hidden bg-slate-800">
          <img
            src={OVERSEAS_HERO_IMAGE}
            alt="Coastal Mediterranean landscape at sunset"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="bg-black/55 px-6 py-4 sm:px-10 sm:py-5 rounded-sm">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight text-center">
                Overseas Property Blog
              </h1>
            </div>
          </div>
        </section>

        {/* Latest Articles */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 md:py-14">
          <h2 className="text-2xl sm:text-[1.75rem] font-bold text-[#1a1a2e]">
            Latest Articles
          </h2>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {OVERSEAS_ARTICLES.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
