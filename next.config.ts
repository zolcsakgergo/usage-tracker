import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Inline CSS into the HTML instead of serving a separate stylesheet.
    // Workaround for client-side AV / HTTPS-scanning proxies that strip the
    // text/css Content-Type header on hashed bundle files, which makes the
    // browser refuse the stylesheet under strict MIME checking.
    inlineCss: true,
  },
};

export default nextConfig;
