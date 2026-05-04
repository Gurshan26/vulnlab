/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/vuln/:path*',
        headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }]
      },
      {
        source: '/api/safe/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "default-src 'self'" }
        ]
      }
    ];
  }
};

export default nextConfig;
