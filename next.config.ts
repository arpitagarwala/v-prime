import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['5paisajs'],
  // 5paisajs uses Node.js-only packages (node-pandas, tough-cookie, request, axios)
  // that cannot be bundled by Turbopack. Tell Next.js to require() them at runtime.
  serverExternalPackages: [
    '5paisajs',
    'node-pandas',
    'tough-cookie',
    'axios-cookiejar-support',
    'request',
    'axios',
  ],
};

export default nextConfig;
