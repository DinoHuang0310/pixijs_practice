import { defineConfig } from 'vite'

export default defineConfig(({ command, mode, ssrBuild }) => {
  const isDev = command === 'serve';

  return {
    base: isDev ? '/' : './',
  }
})