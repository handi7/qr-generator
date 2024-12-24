import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    sitemap: "https://handiani.my.id/sitemap.xml",
    rules: [
      {
        userAgent: ["Googlebot", "Applebot", "Bingbot"],
        allow: ["/"],
      },
    ],
  };
}
