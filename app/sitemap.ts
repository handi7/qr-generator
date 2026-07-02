import { MetadataRoute } from "next";

const baseUrl = "https://gaweqr.my.id";

export default function sitemap(): MetadataRoute.Sitemap {
  // Bump this when page content meaningfully changes; a build timestamp
  // makes lastmod meaningless to crawlers.
  const now = new Date("2026-07-03");

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/studio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
