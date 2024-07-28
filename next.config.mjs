// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    trailingSlash: true,
    output: 'export',
    images: {
        unoptimized: true,
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });

        return config;
    },
}

export default nextConfig
