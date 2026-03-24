/**
 * Spawn `tauri build` with extra args. Normalizes CI=1 → CI=true because the
 * Tauri CLI only accepts --ci true|false (some tools set CI=1).
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const env = { ...process.env }
if (env.CI === '1') {
  env.CI = 'true'
}

const extra = process.argv.slice(2)
const result = spawnSync('npx', ['tauri', 'build', ...extra], {
  cwd: root,
  stdio: 'inherit',
  env,
  shell: true,
})
process.exit(result.status ?? 1)
