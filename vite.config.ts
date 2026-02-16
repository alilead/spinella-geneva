import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
const require = createRequire(import.meta.url);
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    // Keep newest lines (from end) that fit within 60% of maxSize
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    /* ignore trim errors */
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (entries.length === 0) return;

  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);

  // Format entries with timestamps
  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  // Append to log file
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");

  // Trim if exceeds max size
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

/**
 * Vite plugin to collect browser debug logs
 * - POST /__manus__/logs: Browser sends logs, written directly to files
 * - Files: browserConsole.log, networkRequests.log, sessionReplay.log
 * - Auto-trimmed when exceeding 1MB (keeps newest entries)
 */
function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      // POST /__manus__/logs: Browser sends logs (written directly to files)
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }

        const handlePayload = (payload: any) => {
          // Write logs directly to files
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };

        const reqBody = (req as { body?: unknown }).body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    },
  };
}

/**
 * Inline critical CSS so above-the-fold content has styles without waiting for the full stylesheet.
 * Runs first in closeBundle (before defer-stylesheet). Uses critters; path = outDir so /assets/*.css resolve.
 */
function vitePluginCriticalCSS(): Plugin {
  let resolvedOutDir: string | undefined;
  return {
    name: "critical-css",
    enforce: "post",
    configResolved(config) {
      resolvedOutDir = config.build?.outDir;
    },
    async closeBundle() {
      const outDir = resolvedOutDir;
      if (!outDir || typeof outDir !== "string") return;
      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) return;
      let Critters: (opts: { path: string; preload: string; pruneSource: boolean; compress: boolean; logLevel: string }) => { process: (html: string) => Promise<string> };
      try {
        Critters = require("critters");
      } catch {
        return; // critters optional: run "pnpm add -D critters" to enable
      }
      const html = fs.readFileSync(indexPath, "utf-8");
      const critters = new Critters({
        path: outDir,
        preload: "swap",
        pruneSource: true,
        compress: true,
        logLevel: "warn",
      });
      const result = await critters.process(html);
      if (result) fs.writeFileSync(indexPath, result, "utf-8");
    },
  };
}

/**
 * Make main app stylesheet non-render-blocking to improve LCP/FCP on mobile.
 * Runs after build: rewrites the emitted index.html so the CSS link uses
 * media="print" onload="this.media='all'" and adds a noscript fallback.
 */
function vitePluginDeferStylesheet(): Plugin {
  let resolvedOutDir: string | undefined;
  return {
    name: "defer-stylesheet",
    enforce: "post",
    configResolved(config) {
      resolvedOutDir = config.build?.outDir;
    },
    closeBundle() {
      const outDir = resolvedOutDir;
      if (!outDir || typeof outDir !== "string") return;
      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) return;
      let html = fs.readFileSync(indexPath, "utf-8");
      // Match Vite-injected stylesheet: <link rel="stylesheet" ... href="/assets/...">
      const linkRegex = /<link rel="stylesheet"([^>]*?)href="(\/assets\/[^"]+\.css)"([^>]*)>/g;
      const newHtml = html.replace(linkRegex, (_match, before, href, after) => {
        return `<link rel="stylesheet"${before}href="${href}"${after} media="print" onload="this.media='all'">` +
          `<noscript><link rel="stylesheet" href="${href}"></noscript>`;
      });
      if (newHtml !== html) {
        fs.writeFileSync(indexPath, newHtml, "utf-8");
      }
    },
  };
}

const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime(),
  vitePluginManusDebugCollector(),
  vitePluginCriticalCSS(),
  // Defer-stylesheet removed: blocking CSS gives faster styled LCP on mobile (score was regressing)
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
