"use client";

import CollectionEditor from "../CollectionEditor";
import { useStore } from "../store";

export default function GalleryPage() {
  const { data, reload } = useStore();
  return (
    <CollectionEditor
      collection="gallery"
      title="Projects Gallery"
      subtitle="Installations shown on the Gallery page. The built-in examples are shown only while this list is empty."
      items={data.gallery}
      titleKey="title"
      imageKey="image"
      meta={(i) => [i.location, i.year, i.category].filter(Boolean).join(" · ")}
      reload={reload}
      fields={[
        { key: "title", label: "Project name", required: true, wide: true },
        { key: "location", label: "Location", hint: "e.g. Mumbai, India" },
        { key: "year", label: "Year" },
        { key: "category", label: "Type", hint: "e.g. Facade & Exterior, Hospitality" },
        { key: "product", label: "Products used" },
        { key: "image", label: "Photo", type: "image" },
        { key: "desc", label: "Description", type: "textarea" },
        { key: "specs", label: "Key specs", hint: "Short line, e.g. IP68 • 4000K • DMX control", wide: true },
      ]}
    />
  );
}
