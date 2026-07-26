import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { OVERSEAS_ARTICLES } from "@/lib/overseasBlog";
import { getInspireItemsServer } from "@/lib/content/getInspireItemsServer";
import type { OverseasBlogItemsContent } from "@/lib/content/inspireItems";

export function generateStaticParams() {
  return OVERSEAS_ARTICLES.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = true;

export default async function OverseasBlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { items } =
    await getInspireItemsServer<OverseasBlogItemsContent>("overseas-blog");
  const article = items.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = items.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Link
            href="/inspire/overseas-blog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 mb-6 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Overseas blog
          </Link>

          <div className="flex items-center gap-2 text-[13px] mb-3">
            <span className="w-[2px] h-3.5 bg-green-600 shrink-0" aria-hidden />
            <span className="font-semibold text-green-700">{article.country}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">{article.date}</span>
          </div>

          <h1 className="text-[28px] sm:text-[34px] font-bold text-[#1a1a2e] leading-tight">
            {article.title}
          </h1>
          <p className="mt-3 text-lg text-slate-600">{article.excerpt}</p>

          <div className="mt-8 relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
            <img
              src={article.image}
              alt={article.imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="mt-8 space-y-4 text-slate-700 leading-relaxed text-[1.05rem]">
            {article.body.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/inspire/country-guides"
              className="inline-flex h-11 items-center px-5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold cursor-pointer"
            >
              Explore country guides
            </Link>
            <Link
              href="/inspire/overseas-blog"
              className="inline-flex h-11 items-center px-5 rounded-lg border border-gray-300 text-slate-800 font-bold hover:border-green-500 cursor-pointer"
            >
              More overseas articles
            </Link>
          </div>
        </article>

        {related.length > 0 ? (
          <section className="border-t border-gray-100 bg-[#fafafa]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 md:py-12">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-6">
                More from the overseas blog
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {related.map((a) => (
                  <Link
                    key={a.id}
                    href={`/inspire/overseas-blog/${a.slug}`}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-slate-200">
                      <img
                        src={a.image}
                        alt={a.imageAlt}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <h3 className="mt-3 text-[15px] font-bold text-green-700 group-hover:text-green-800 leading-snug">
                      {a.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
