import type { UserConfig } from 'vite';

/** Dev proxy so partner apps call `/api/...` without CORS issues (flex-api on :3847). */
export function flexApiDevProxy(): UserConfig['server'] {
  return {
    proxy: {
      '/api': {
        target: 'http://localhost:3847',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3847',
        changeOrigin: true,
      },
    },
  };
}
