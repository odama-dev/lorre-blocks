/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@lorre-blocks/registry"],
  async headers() {
    return [
      {
        // Registry JSON is static per deployment; Vercel's edge cache is
        // deployment-scoped, so a long CDN TTL is safe — a new deploy always
        // busts it. Client TTL stays short so browsers pick up new deploys
        // quickly (the CLI is a fresh process and never caches).
        source: "/r/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=31536000, stale-while-revalidate=86400",
          },
          // Public data: let playgrounds and third-party tools fetch
          // themes/tokens cross-origin.
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/:file(llms.txt|llms-full.txt)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=31536000, stale-while-revalidate=86400",
          },
        ],
      },
    ]
  },
}

export default nextConfig
