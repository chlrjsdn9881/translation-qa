import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { translate } from './api/translate.js'

// 배포 환경에서는 Vercel이 api/translate.js를 서버리스 함수로 실행합니다.
// npm run dev / npm run preview 에서도 같은 함수가 /api/translate 에서 동작하도록 연결합니다.
function localApi(mode) {
  const env = loadEnv(mode, process.cwd(), '')
  const handle = async (req, res) => {
    let raw = ''
    for await (const chunk of req) raw += chunk
    let body = null
    try {
      body = JSON.parse(raw || '{}')
    } catch {
      // 잘못된 JSON은 translate()에서 거부됨
    }
    const result =
      req.method === 'POST'
        ? await translate(body, env.GEMINI_API_KEY)
        : { status: 405, body: { error: 'POST만 지원합니다.' } }
    res.statusCode = result.status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(result.body))
  }
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/translate', handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/translate', handle)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(mode)],
}))
