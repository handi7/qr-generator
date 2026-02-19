import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "qr.handiani.my.id" }],
        destination: "https://gaweqr.my.id/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
