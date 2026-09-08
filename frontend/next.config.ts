import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ["allauddin", "localhost"],
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  output: "standalone",
};

export default nextConfig;