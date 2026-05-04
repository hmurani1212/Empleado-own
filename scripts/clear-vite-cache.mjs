import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
for (const name of ['.vite', '.cache']) {
  const p = path.join(root, 'node_modules', name)
  try {
    fs.rmSync(p, { recursive: true, force: true })
    console.log('Removed', p)
  } catch {
    // ignore
  }
}
