import { dirname } from "path";
import { fileURLToPath } from "url";

const root = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  turbopack: {
    root
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
