/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure static files in public/games are served with the correct MIME type
  webpack: (config) => {
    // This helps with loading .prg files
    config.module.rules.push({
      test: /\.prg$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash][ext][query]'
      }
    });
    return config;
  },
  // Enable static exports for the standalone output
  output: 'export',
  // Add custom headers for PRG files
  async headers() {
    return [
      {
        source: '/games/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
