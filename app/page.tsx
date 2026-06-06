import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">BlogCMS</h1>
      <p className="text-muted-foreground">Headless blog fullstack</p>
      <div className="flex gap-4">
        <Link
          href="/blog"
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Voir le blog
        </Link>
        <Link
          href="/dashboard"
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}