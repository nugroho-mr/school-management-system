import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/', // The incoming path pattern
        destination: '/dashboard', // The path you want to route to
        permanent: false, // Use 308 for permanent, 307 for temporary
      },
      // You can add more redirect objects here
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
