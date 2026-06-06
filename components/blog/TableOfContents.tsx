"use client";

import { useEffect, useState } from "react";

export function TableOfContents({ content }: { content: string }) {
  const [active, setActive] = useState("");

  const headings = Array.from(
    new DOMParser().parseFromString(content, "text/html")
      .querySelectorAll("h2, h3")
  ).map((el, i) => ({
    id: el.id || `heading-${i}`,
    text: el.textContent ?? "",
    level: el.tagName,
  }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-20% 0px -70% 0px" }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav className="flex flex-col">
      {headings.map(({ id, text, level }, i) => (
        <a
          key={id}
          href={`#${id}`}
          className={`flex items-baseline gap-2 py-1.5 border-b border-neutral-100 text-xs transition ${
            active === id ? "text-neutral-900 font-medium" : "text-neutral-400 hover:text-neutral-700"
          } ${level === "H3" ? "pl-3" : ""}`}
        >
          <span className="text-neutral-300 text-[10px] min-w-[18px]">
            {String(i + 1).padStart(2, "0")}
          </span>
          {text}
        </a>
      ))}
    </nav>
  );
}