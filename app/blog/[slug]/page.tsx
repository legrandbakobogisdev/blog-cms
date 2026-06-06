"use client";

import { trpc } from "@/lib/trpc/client";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { CommentItem } from "@/components/blog/CommentItem";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { RelatedPosts } from "@/components/blog/RelatedPosts";

type Lang = "fr" | "en";

export default function PostPage() {
    const { slug } = useParams<{ slug: string }>();
    const { data: session } = useSession();
    const [lang, setLang] = useState<Lang>("fr");
    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    const { data: post, isLoading } = trpc.posts.bySlug.useQuery({ slug });
    const { data: commentsData, refetch } = trpc.comments.list.useQuery(
        { postId: post?.id ?? "" },
        { enabled: !!post?.id }
    );

    const addComment = trpc.comments.create.useMutation({ onSuccess: () => { setNewComment(""); refetch(); } });
    const editComment = trpc.comments.update.useMutation({ onSuccess: () => { setEditingId(null); refetch(); } });
    const deleteComment = trpc.comments.delete.useMutation({ onSuccess: () => refetch() });

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">Chargement…</div>;
    if (!post) return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">Article introuvable.</div>;

    const comments = commentsData ?? [];
    const readingMin = Math.ceil((post.content?.split(" ").length ?? 0) / 200);

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <header className="sticky top-0 z-10 bg-white border-b border-neutral-100">
                <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-neutral-900 rounded-md flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            </div>
                            <span className="text-sm font-medium">Inkbase</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-5">
                            <Link href="/blog" className="text-xs text-neutral-500 hover:text-neutral-900 transition">Blog</Link>
                            <Link href="/categories" className="text-xs text-neutral-500 hover:text-neutral-900 transition">Catégories</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Sélecteur de langue */}
                        <div className="flex items-center border border-neutral-200 rounded-full overflow-hidden">
                            {(["fr", "en"] as Lang[]).map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLang(l)}
                                    className={`text-xs px-3 py-1 transition ${lang === l
                                            ? "bg-neutral-900 text-white"
                                            : "text-neutral-500 hover:text-neutral-900"
                                        }`}
                                >
                                    {l.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        {session ? (
                            <Link href="/dashboard" className="text-xs px-3 py-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition">
                                Dashboard
                            </Link>
                        ) : (
                            <Link href="/auth/signin" className="text-xs px-3 py-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition">
                                Connexion
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Layout deux colonnes */}
            <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">

                {/* Colonne principale */}
                <main className="min-w-0">
                    {/* En-tête article */}
                    <div className="mb-8">
                        {post.categories?.[0] && (
                            <span className="text-xs font-medium tracking-widest uppercase text-neutral-400 border border-neutral-200 rounded-full px-3 py-1">
                                {post.categories[0].name}
                            </span>
                        )}
                        <h1 className="text-3xl font-medium leading-tight text-neutral-900 mt-4 mb-4">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                            <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[10px] font-medium">
                                {post.author.name?.[0] ?? "?"}
                            </div>
                            <span>{post.author.name}</span>
                            <span className="text-neutral-300">·</span>
                            <span>
                                {post.publishedAt
                                    ? new Date(post.publishedAt).toLocaleDateString(
                                        lang === "fr" ? "fr-FR" : "en-US",
                                        { day: "numeric", month: "long", year: "numeric" }
                                    )
                                    : ""}
                            </span>
                            <span className="text-neutral-300">·</span>
                            <span>{readingMin} {lang === "fr" ? "min de lecture" : "min read"}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pb-6 border-b border-neutral-100 mb-8">
                        {[
                            { icon: "ti-heart", label: "0" }, { icon: "ti-bookmark", label: lang === "fr" ? "Sauvegarder" : "Save" },
                            { icon: "ti-share", label: lang === "fr" ? "Partager" : "Share" },
                        ].map(({ icon, label }) => (
                            <button
                                key={label}
                                className="flex items-center gap-1.5 text-xs text-neutral-500 border border-neutral-200 rounded-lg px-3 py-1.5 hover:bg-neutral-50 transition"
                            >
                                <i className={`ti ${icon} text-sm`} aria-hidden="true" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Corps de l'article */}
                    <div
                        className="prose prose-neutral prose-sm max-w-none text-neutral-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
                    />

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-neutral-100">
                            {post.tags.map((t: { name: string }) => (
                                <span key={t.name} className="text-xs px-3 py-1 border border-neutral-200 rounded-full text-neutral-500">
                                    {t.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Section commentaires */}
                    <section className="mt-12 pt-8 border-t border-neutral-100">
                        <h2 className="text-base font-medium text-neutral-900 mb-6">
                            {comments.length} {lang === "fr" ? "commentaires" : "comments"}
                        </h2>

                        {/* Zone de saisie */}
                        {session ? (
                            <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50 mb-8">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={lang === "fr" ? "Ajouter un commentaire…" : "Add a comment…"}
                                    rows={3}
                                    className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 resize-none focus:outline-none"
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        onClick={() => addComment.mutate({ postId: post.id, content: newComment })}
                                        disabled={!newComment.trim()}
                                        className="text-xs px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-30 transition"
                                    >
                                        {lang === "fr" ? "Publier" : "Post"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-neutral-200 rounded-xl p-4 mb-8 text-center">
                                <p className="text-sm text-neutral-500 mb-3">
                                    {lang === "fr" ? "Connectez-vous pour commenter" : "Sign in to comment"}
                                </p>
                                <Link href="/auth/signin" className="text-xs px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition">
                                    {lang === "fr" ? "Se connecter" : "Sign in"}
                                </Link>
                            </div>
                        )}

                        {/* Liste des commentaires */}
                        <div className="flex flex-col gap-6">
                            {comments.map((c: any) => (
                                <CommentItem
                                    key={c.id}
                                    comment={c}
                                    session={session}
                                    lang={lang}
                                    editingId={editingId}
                                    editContent={editContent}
                                    onEditStart={() => { setEditingId(c.id); setEditContent(c.content); }}
                                    onEditCancel={() => setEditingId(null)}
                                    onEditChange={setEditContent}
                                    onEditSave={() => editComment.mutate({ id: c.id, content: editContent })}
                                    onDelete={() => deleteComment.mutate({ id: c.id })}
                                />
                            ))}
                        </div>
                    </section>
                </main>

                {/* Sidebar */}
                <aside className="hidden lg:block">
                    <div className="sticky top-20 flex flex-col gap-8">

                        {/* Progression */}
                        <div>
                            <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 mb-3">
                                {lang === "fr" ? "Progression" : "Progress"}
                            </p>
                            <ReadingProgress />
                        </div>

                        {/* Table des matières */}
                        <div>
                            <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 mb-3">
                                {lang === "fr" ? "Table des matières" : "Contents"}
                            </p>
                            <TableOfContents content={post.content ?? ""} />
                        </div>

                        {/* Tags */}
                        {post.tags?.length > 0 && (
                            <div>
                                <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 mb-3">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((t: { name: string }) => (
                                        <span key={t.name} className="text-xs px-2.5 py-1 border border-neutral-200 rounded-full text-neutral-500 hover:bg-neutral-50 cursor-pointer transition">
                                            {t.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Articles liés */}
                        <div>
                            <p className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 mb-3">
                                {lang === "fr" ? "À lire aussi" : "Related"}
                            </p>
                            <RelatedPosts currentSlug={slug} lang={lang} />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}