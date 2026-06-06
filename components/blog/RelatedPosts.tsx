"use client";

import { trpc } from "@/lib/trpc/client";
import Link from "next/link";

export function RelatedPosts({ currentSlug, lang }: { currentSlug: string; lang: "fr" | "en" }) {
  const { data } = trpc.posts.list.useInfiniteQuery(
    { limit: 4 },
    { getNextPageParam: (p) => p.nextCursor }
  );

  const posts = (data?.pages.flatMap((p) => p.posts) ?? [])
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 3);

  if (!posts.length) return null;

  return (
    <div className="flex flex-col">
      {posts.map((p, i) => (
        <Link
          key={p.id}
          href={`/blog/${p.slug}`}
          className="flex items-baseline gap-3 py-2.5 border-b border-neutral-100 group"
        >
          <span className="text-base font-medium text-neutral-200 min-w-[20px] group-hover:text-neutral-400 transition">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="text-xs font-medium text-neutral-700 group-hover:text-neutral-900 transition leading-snug">
              {p.title}
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {p.publishedAt
                ? new Date(p.publishedAt).toLocaleDateString(
                    lang === "fr" ? "fr-FR" : "en-US",
                    { day: "numeric", month: "short" }
                  )
                : ""}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}