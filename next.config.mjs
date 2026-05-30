/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["192.168.18.142", "10.160.212.57", "10.236.237.57"],
}

export default nextConfig
