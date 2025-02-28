import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'

// Plugin to handle feature files
function featureFiles() {
  return {
    name: 'feature-files',
    async buildStart() {
      const featureDir = path.join(process.cwd(), 'test', 'features')
      const files = fs.readdirSync(featureDir)
      
      for (const file of files) {
        if (file.endsWith('.feature')) {
          const filePath = path.join(featureDir, file)
          const source = fs.readFileSync(filePath, 'utf-8')
          this.emitFile({
            type: 'asset',
            fileName: `features/${file}`,
            source
          })
        }
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    featureFiles()
  ],
  resolve: {
    alias: {
      '@cucumber/cucumber': '@gherkin-web/core/cucumber',
      '@playwright/test': '@gherkin-web/core/playwright'
     /*
      '@cucumber/cucumber': '/src/services/cucumber',
      '@playwright/test': '/src/services/playwright'
      */
    }
  },
  /*
  optimizeDeps: {
    include: ['@gherkin-web/core']
  },
  */
  publicDir: 'test',
})
