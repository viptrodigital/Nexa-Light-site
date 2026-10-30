"use client";

import CollectionEditor from "../CollectionEditor";
import { useStore } from "../store";

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Plain text is turned into simple HTML: blank lines separate paragraphs,
// lines starting with "## " become headings. Text that already contains HTML is kept as is.
function toHtml(text: string) {
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => (block.startsWith("## ") ? `<h2>${escape(block.slice(3))}</h2>` : `<p>${escape(block).replace(/\n/g, "<br>")}</p>`))
    .join("\n");
}

export default function BlogPage() {
  const { data, reload } = useStore();
  return (
    <CollectionEditor
      collection="blogs"
      title="Blog"
      subtitle="Articles you add here appear first on the Blog page, before the built-in essays."
      items={data.blogs}
      titleKey="title"
      imageKey="image"
      meta={(i) => [i.category, i.date, i.author].filter(Boolean).join(" · ")}
      viewUrl={(id) => `/blog/${id}`}
      reload={reload}
      beforeSave={(d) => ({ ...d, content: toHtml(String(d.content ?? "")) })}
      fields={[
        { key: "title", label: "Title", required: true, wide: true },
        { key: "category", label: "Category", hint: "e.g. Studio News, Facade Design" },
        { key: "date", label: "Date", hint: "e.g. Oct 30, 2026" },
        { key: "author", label: "Author" },
        { key: "readTime", label: "Read time", hint: "e.g. 5 min read" },
        { key: "image", label: "Cover image", type: "image" },
        { key: "excerpt", label: "Short summary", type: "textarea" },
        { key: "content", label: "Article", type: "longtext", hint: "Write normally: leave a blank line between paragraphs, start a line with ## for a heading. HTML also works." },
      ]}
    />
  );
}
