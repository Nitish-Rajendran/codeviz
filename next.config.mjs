let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double rendering
  // This helps prevent hydration errors with dynamic IDs
  experimental: {
    // Disable automatic static optimization for pages
    // This helps with hydration issues
    optimizeCss: false,
    esmExternals: false, // Force CommonJS for all dependencies
    appDocumentPreloading: false, // Disable document preloading
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  compiler: {
    // Disable React server components features that can cause hydration issues
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    unoptimized: true,
  },
  // Add a custom webpack configuration to handle hydration issues
  webpack: (config, { dev, isServer }) => {
    // Add any custom webpack configurations here
    return config;
  },
}

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return nextConfig;
  }
  
  const result = { ...nextConfig };
  
  // Merge top-level properties
  for (const key in userConfig) {
    if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
      result[key] = {
        ...(result[key] || {}),
        ...userConfig[key],
      };
    } else {
      result[key] = userConfig[key];
    }
  }
  
  return result;
}

mergeConfig(nextConfig, userConfig)

export default nextConfig
