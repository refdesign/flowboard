import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
  'Meta-ExternalAgent',
  'Amazonbot',
  'cohere-ai',
  'Diffbot',
]

// Injects the production origin into index.html and emits robots.txt / sitemap.xml
// so canonical, og:url and the sitemap always agree. Set VITE_SITE_URL at build time.
function seo(siteUrl: string, supabaseUrl: string): Plugin {
  const origin = siteUrl.replace(/\/+$/, '')
  return {
    name: 'flowboard-seo',
    transformIndexHtml(html) {
      return html
        .replaceAll('%SITE_URL%', origin)
        .replaceAll('%SUPABASE_URL%', supabaseUrl.replace(/\/+$/, ''))
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source:
          AI_CRAWLERS.map((bot) => `User-agent: ${bot}\nDisallow: /\n`).join('\n') +
          `\nUser-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          `  <url>\n    <loc>${origin}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n` +
          '</urlset>\n',
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [
      react(),
      seo(env.VITE_SITE_URL || 'https://flowboard.example.com', env.VITE_SUPABASE_URL || ''),
    ],
    build: {
      rolldownOptions: {
        output: {
          advancedChunks: {
            groups: [
              { name: 'supabase', test: /node_modules[\\/]@supabase/ },
              { name: 'dnd', test: /node_modules[\\/](react-dnd|react-dnd-html5-backend|dnd-core|@react-dnd)/ },
            ],
          },
        },
      },
    },
  }
})
