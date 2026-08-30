import path from "path";
import type { NextConfig } from "next";

import bundleAnalyzer from "@next/bundle-analyzer";
import dotenv from "dotenv";
import type { RuleSetRule } from "webpack";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  htmlLimitedBots: /.*/,
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: { typescript: true, icon: true, titleProp: true, svgo: true, prettier: false }
          }
        ],
        as: "*.js"
      }
    }
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const apiOrigin = apiUrl.replace(/\/api\/v1\/?$/, "");
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiOrigin}/uploads/:path*`
      }
    ];
  },
  webpack(config) {
    const rules = config.module.rules as RuleSetRule[];
    const fileLoaderRule = rules.find(
      (rule): rule is RuleSetRule =>
        !!rule && typeof rule === "object" && rule.test instanceof RegExp && rule.test.test(".svg")
    );
    if (fileLoaderRule) fileLoaderRule.exclude = /\.svg$/i;
    config.module.rules.push({ test: /\.svg$/i, issuer: /\.[jt]sx?$/, use: ["@svgr/webpack"] });
    return config;
  }
};

export default withBundleAnalyzer(nextConfig);
