/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	experimental: {
		serverComponentsExternalPackages: ['socket.io']
	},
	compiler: {
		swcMinify: false
	}
};

module.exports = nextConfig;
