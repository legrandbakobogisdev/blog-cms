"use client";

import { trpc } from "@/lib/trpc/client";
import { useTheme } from "@/components/ThemeProvider";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { Theme } from "@/lib/theme";

type Lang = "fr" | "en";
type Mood = "all" | "tech" | "ideas" | "short" | "long";

const MOODS = [
  { id: "tech",  icon: "ti-rocket",        fr: "Technique",    en: "Technical" },
  { id: "ideas", icon: "ti-bulb",          fr: "Idées",        en: "Ideas"     },
  { id: "short", icon: "ti-clock",         fr: "Court (<5min)",en: "Quick read" },
  { id: "long",  icon: "ti-book",          fr: "Long read",    en: "Deep dive" },
] as const;

const THEMES: { id: Theme; icon: string; fr: string }[] = [
  { id: "light",  icon: "ti-sun",            fr: "Clair"   },
  { id: "system", icon: "ti-device-desktop", fr: "Système" },
  { id: "dark",   icon: "ti-moon",           fr: "Sombre"  },
];

export default function BlogPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [lang, setLang]   = useState<Lang>("fr");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [mood, setMood]   = useState<Mood>("all");
  const [notifs, setNotifs] = useState(true);
  const [summaries, setSummaries] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.posts.list.useInfiniteQuery(
      { limit: 10 },
      { getNextPageParam: (p) => p.nextCursor }
    );

  const allPosts = data?.pages.flatMap((p) => p.posts) ?? [];

  const filtered = allPosts.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    const words = p.content?.split(" ").length ?? 300;
    const mins  = Math.ceil(words / 200);
    if (mood === "short" && mins >= 5) return false;
    if (mood === "long"  && mins <  8) return false;
    return true;
  });

  const featured = filtered.slice(0, 1)[0];
  const secondary = filtered.slice(1, 3);
  const rest = filtered.slice(3);

  const allTags = Array.from(
    new Set(allPosts.flatMap((p) => p.tags?.map((t: any) => t.name) ?? []))
  ).slice(0, 5);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function readMin(post: any) {
    return Math.ceil((post.content?.split(" ").length ?? 300) / 200);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 bg-neutral-900 dark:bg-white rounded-md flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white dark:bg-neutral-900 rounded-full" />
              </div>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">Inkbase</span>
            </Link>
            <nav className="hidden md:flex items-center gap-5">
              {[
                { href: "/blog",       fr: "Blog",        en: "Blog",       active: true  },
                { href: "/categories", fr: "Catégories",  en: "Categories", active: false },
                { href: "/about",      fr: "À propos",    en: "About",      active: false },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-xs transition ${
                    l.active
                      ? "text-neutral-900 dark:text-white font-medium"
                      : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {lang === "fr" ? l.fr : l.en}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {/* Lang toggle */}
            <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-full overflow-hidden">
              {(["fr", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-[11px] px-3 py-1 transition ${
                    lang === l
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                      : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-xs px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-xs px-3 py-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
                >
                  <i className="ti ti-logout text-sm" aria-label="Déconnexion" />
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-xs px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
              >
                {lang === "fr" ? "Connexion" : "Sign in"}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6">

        {/* ── Hero ── */}
        <div className="py-10 border-b border-neutral-100 dark:border-neutral-800">
          <p className="text-[11px] tracking-[0.12em] uppercase text-neutral-400 dark:text-neutral-500 mb-3">
            Inkbase — {lang === "fr" ? "journal de bord" : "devlog"}
          </p>
          <h1 className="text-4xl font-medium leading-[1.1] text-neutral-900 dark:text-white mb-3">
            {lang === "fr" ? (
              <>Ce qu'on construit,<br />ce qu'on apprend.</>
            ) : (
              <>What we build,<br />what we learn.</>
            )}
          </h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            {lang === "fr"
              ? "Architecture, craft et réflexions de développeur."
              : "Architecture, craft and developer thoughts."}
          </p>
        </div>

        {/* ── Search + tag chips ── */}
        <div className="py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "fr" ? "Rechercher… ( / )" : "Search… ( / )"}
              className="w-full h-8 pl-8 pr-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTag("all")}
              className={`text-[11px] px-3 py-1 rounded-full border transition ${
                activeTag === "all"
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent"
                  : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400"
              }`}
            >
              {lang === "fr" ? "Tout" : "All"}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? "all" : tag)}
                className={`text-[11px] px-3 py-1 rounded-full border transition ${
                  activeTag === tag
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* ── Layout deux colonnes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-0 py-8">

          {/* ── Colonne articles ── */}
          <div className="lg:pr-10 lg:border-r border-neutral-100 dark:border-neutral-800">

            {isLoading ? (
              <div className="flex flex-col gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-800 rounded mb-3" />
                    <div className="h-5 w-3/4 bg-neutral-100 dark:bg-neutral-800 rounded mb-2" />
                    <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-neutral-400 dark:text-neutral-500 py-16 text-center">
                {lang === "fr" ? "Aucun article trouvé." : "No articles found."}
              </p>
            ) : (
              <>
                {/* Featured 1 + 2 secondaires */}
                {featured && (
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] mb-8 border border-neutral-100 dark:border-neutral-800 rounded-xl overflow-hidden">
                    {/* Featured principal */}
                    <Link href={`/blog/${featured.slug}`} className="block p-6 group hover:bg-neutral-50 dark:hover:bg-neutral-900 transition">
                      <div className="flex items-center gap-2 mb-4">
                        {featured.categories?.[0] && (
                          <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-700 rounded-full px-2.5 py-0.5">
                            {featured.categories[0].name}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {featured.publishedAt
                            ? new Date(featured.publishedAt).toLocaleDateString(
                                lang === "fr" ? "fr-FR" : "en-US",
                                { day: "numeric", month: "short" }
                              )
                            : ""}
                        </span>
                      </div>
                      <h2 className="text-lg font-medium text-neutral-900 dark:text-white leading-snug mb-3 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-3">
                          {featured.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
                        <div className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-neutral-200 flex items-center justify-center">
                          <span className="text-[9px] font-medium text-white dark:text-neutral-900">
                            {featured.author.name?.[0] ?? "?"}
                          </span>
                        </div>
                        <span>{featured.author.name}</span>
                        <span className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span>{readMin(featured)} min</span>
                        <span className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span className="flex items-center gap-1">
                          <i className="ti ti-message-2 text-sm" aria-hidden="true" />
                          {featured._count?.comments ?? 0}
                        </span>
                      </div>
                    </Link>

                    {/* Séparateur */}
                    <div className="hidden md:block bg-neutral-100 dark:bg-neutral-800" />

                    {/* 2 secondaires */}
                    <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
                      {secondary.map((p, i) => (
                        <Link
                          key={p.id}
                          href={`/blog/${p.slug}`}
                          className="flex items-start gap-4 p-5 group hover:bg-neutral-50 dark:hover:bg-neutral-900 transition flex-1"
                        >
                          <span className="text-2xl font-medium text-neutral-200 dark:text-neutral-700 group-hover:text-neutral-300 transition select-none pt-0.5">
                            {String(i + 2).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mb-1.5">
                              {p.categories?.[0]?.name ?? ""} · {readMin(p)} min
                            </p>
                            <h3 className="text-sm font-medium text-neutral-900 dark:text-white leading-snug group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition">
                              {p.title}
                            </h3>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Liste dense */}
                {rest.length > 0 && (
                  <>
                    <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-neutral-400 dark:text-neutral-500 mb-4">
                      {lang === "fr" ? "Tous les articles" : "All articles"}
                    </p>
                    <div className="flex flex-col">
                      {rest.map((post, i) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="grid grid-cols-[28px_minmax(0,1fr)_auto] gap-3 items-start py-4 border-b border-neutral-100 dark:border-neutral-800 group hover:bg-neutral-50 dark:hover:bg-neutral-900 -mx-2 px-2 rounded-lg transition"
                        >
                          <span className="text-sm font-medium text-neutral-300 dark:text-neutral-600 pt-0.5 select-none">
                            {String(i + (secondary.length || 0) + 2).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mb-1 tracking-wide uppercase">
                              {post.categories?.[0]?.name ?? ""}
                            </p>
                            <h3 className="text-sm font-medium text-neutral-900 dark:text-white leading-snug mb-1.5 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
                              <span>{post.author.name}</span>
                              <span className="text-neutral-300 dark:text-neutral-700">·</span>
                              <span>{readMin(post)} min</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 pt-0.5">
                            {i === 0 && (
                              <span className="text-[9px] font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full px-2 py-0.5 tracking-wide">
                                {lang === "fr" ? "Nouveau" : "New"}
                              </span>
                            )}
                            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                              <i className="ti ti-message-2 text-xs" aria-hidden="true" />
                              {post._count?.comments ?? 0}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {hasNextPage && (
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="mt-8 w-full py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-40 transition"
                  >
                    {isFetchingNextPage
                      ? (lang === "fr" ? "Chargement…" : "Loading…")
                      : (lang === "fr" ? "Voir plus" : "Load more")}
                  </button>
                )}
              </>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex flex-col gap-8 pl-10 pt-0">

            {/* Tendances */}
            <div>
              <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-neutral-400 dark:text-neutral-500 mb-4">
                {lang === "fr" ? "Tendances" : "Trending"}
              </p>
              <div className="flex flex-col">
                {allPosts.slice(0, 3).map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    className="flex items-center gap-3 py-3 border-b border-neutral-100 dark:border-neutral-800 group"
                  >
                    <span className="text-xl font-medium text-neutral-200 dark:text-neutral-700 min-w-[24px] group-hover:text-neutral-400 transition">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition leading-snug line-clamp-2">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 flex items-center gap-1">
                        <i className="ti ti-eye text-xs" aria-hidden="true" />
                        {(Math.floor(Math.random() * 900) + 100)} {lang === "fr" ? "vues" : "views"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Lire selon l'humeur */}
            <div>
              <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-neutral-400 dark:text-neutral-500 mb-4">
                {lang === "fr" ? "Lire selon l'humeur" : "Read by mood"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMood(mood === m.id ? "all" : m.id as Mood)}
                    className={`border rounded-lg p-3 text-left transition ${
                      mood === m.id
                        ? "bg-neutral-900 dark:bg-white border-transparent"
                        : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <i className={`ti ${m.icon} text-base block mb-1 ${
                      mood === m.id ? "text-white dark:text-neutral-900" : "text-neutral-400 dark:text-neutral-500"
                    }`} aria-hidden="true" />
                    <p className={`text-[11px] font-medium ${
                      mood === m.id ? "text-white dark:text-neutral-900" : "text-neutral-700 dark:text-neutral-300"
                    }`}>
                      {lang === "fr" ? m.fr : m.en}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Heatmap activité */}
            <div>
              <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-neutral-400 dark:text-neutral-500 mb-4">
                {lang === "fr" ? "Activité — 12 sem." : "Activity — 12 wks"}
              </p>
              <ActivityHeatmap />
            </div>

            {/* Panel settings */}
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                <i className="ti ti-settings text-sm text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {lang === "fr" ? "Préférences" : "Settings"}
                </span>
              </div>

              {/* Theme switcher */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {lang === "fr" ? "Thème" : "Theme"}
                </span>
                <div className="flex border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      title={t.fr}
                      className={`flex items-center gap-1 px-2 py-1.5 text-[11px] transition ${
                        theme === t.id
                          ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                          : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      }`}
                    >
                      <i className={`ti ${t.icon} text-xs`} aria-hidden="true" />
                      <span className="hidden xl:inline">{t.fr}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              {[
                { label: lang === "fr" ? "Notifications" : "Notifications", val: notifs,    set: setNotifs    },
                { label: lang === "fr" ? "Résumés auto"  : "Auto summaries", val: summaries, set: setSummaries },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
                  <button
                    onClick={() => set(!val)}
                    className={`w-8 h-4 rounded-full relative transition-colors ${
                      val ? "bg-neutral-900 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  >
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
                      val
                        ? "right-0.5 bg-white dark:bg-neutral-900"
                        : "left-0.5 bg-white dark:bg-neutral-400"
                    }`} />
                  </button>
                </div>
              ))}
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}

function ActivityHeatmap() {
  const seed = [0,1,0,2,1,3,0,2,4,1,3,2,0,1,2,3,1,0,2,4,1,2,0,3,1,2,3,0,4,2,1,0,3,2,1,4,0,2,1,3,2,0,1,4,2,3,1,0];
  const cols = 12;
  const rows = 4;
  const intensities = ["bg-neutral-100 dark:bg-neutral-800", "bg-neutral-300 dark:bg-neutral-600", "bg-neutral-400 dark:bg-neutral-500", "bg-neutral-600 dark:bg-neutral-400", "bg-neutral-900 dark:bg-white"];

  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="flex flex-col gap-1">
            {Array.from({ length: rows }).map((_, r) => {
              const level = seed[(c * rows + r) % seed.length] ?? 0;
              return (
                <div
                  key={r}
                  className={`h-2.5 rounded-sm ${intensities[level]}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 text-right mt-2">aujourd'hui →</p>
    </div>
  );
}