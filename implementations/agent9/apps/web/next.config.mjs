/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static export: the site is a folder of files that any host, mirror
  // or USB stick can serve. Cloudflare Pages Functions add the tip endpoint.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  transpilePackages: ["@vetting-loop/integrity", "@vetting-loop/ledger", "@vetting-loop/sealed", "@vetting-loop/types", "@vetting-loop/ui"],
};

export default nextConfig;
