import fs from 'fs';
import path from 'path';

// Load environment variables from the root .env file
const rootEnvPath = path.resolve(process.cwd(), '../.env');
let envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

if (fs.existsSync(rootEnvPath)) {
  const envContent = fs.readFileSync(rootEnvPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const parsedKey = key.trim();
        const parsedValue = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (parsedKey === 'NEXT_PUBLIC_API_URL') {
          envApiUrl = parsedValue;
          break;
        }
      }
    }
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: envApiUrl,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${envApiUrl}/:path*`, // Proxy to Backend
      },
    ]
  },
}

export default nextConfig

