#!/usr/bin/env node
/**
 * Generate Tauri updater latest.json from a GitHub release.
 * Usage: GITHUB_TOKEN=xxx node scripts/generate-update-manifest.js <tag> <repo>
 * Example: GITHUB_TOKEN=xxx node scripts/generate-update-manifest.js v1.0.0 chiku524/bountyhub
 * Writes latest.json to stdout or to file specified by --out=path.
 */
const tag = process.argv[2]
const repo = process.argv[3]
const outFile = process.argv.find((a) => a.startsWith('--out='))?.slice(6)
const token = process.env.GITHUB_TOKEN

if (!tag || !repo || !token) {
  console.error('Usage: GITHUB_TOKEN=xxx node scripts/generate-update-manifest.js <tag> <repo> [--out=path]')
  process.exit(1)
}

const version = tag.startsWith('v') ? tag.slice(1) : tag
const base = `https://api.github.com/repos/${repo}/releases`

async function main() {
  const res = await fetch(`${base}/tags/${tag}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  })
  if (!res.ok) {
    console.error('Failed to fetch release:', res.status, await res.text())
    process.exit(1)
  }
  const release = await res.json()
  const assets = release.assets || []
  const downloadBase = `https://github.com/${repo}/releases/download/${tag}`

  const findAsset = (pred) => assets.find((a) => pred(a.name))
  const getSigContent = async (name) => {
    const a = findAsset((n) => n === name || n === `${name}.sig`)
    if (!a) return null
    const r = await fetch(a.url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/octet-stream' },
    })
    if (!r.ok) return null
    return (await r.text()).trim()
  }

  const platforms = {}

  // Windows x86_64: .nsis.zip and .nsis.zip.sig
  const winZip = findAsset((n) => n.endsWith('.nsis.zip') && !n.endsWith('.sig'))
  const winSig = findAsset((n) => n.endsWith('.nsis.zip.sig'))
  if (winZip && winSig) {
    const sig = await getSigContent(winSig.name)
    if (sig) {
      platforms['windows-x86_64'] = {
        signature: sig,
        url: `${downloadBase}/${winZip.name}`,
      }
    }
  }

  // macOS: .app.tar.gz and .app.tar.gz.sig (or .dmg.app.tar.gz on some setups)
  const macTgz = findAsset((n) => n.includes('.app.tar.gz') && !n.endsWith('.sig'))
  const macSig = findAsset((n) => n.includes('.app.tar.gz.sig'))
  if (macTgz && macSig) {
    const sig = await getSigContent(macSig.name)
    if (sig) {
      // Prefer aarch64 if we have it; otherwise use darwin-x86_64
      const key = macTgz.name.includes('aarch64') ? 'darwin-aarch64' : 'darwin-x86_64'
      platforms[key] = { signature: sig, url: `${downloadBase}/${macTgz.name}` }
    }
  }
  // If we have a second macOS asset (e.g. both archs), add it
  const macTgz2 = findAsset((n) => n.includes('.app.tar.gz') && !n.endsWith('.sig') && n !== macTgz?.name)
  const macSig2 = findAsset((n) => n.includes('.app.tar.gz.sig') && n !== macSig?.name)
  if (macTgz2 && macSig2) {
    const sig = await getSigContent(macSig2.name)
    if (sig) {
      const key = macTgz2.name.includes('aarch64') ? 'darwin-aarch64' : 'darwin-x86_64'
      if (!platforms[key]) platforms[key] = { signature: sig, url: `${downloadBase}/${macTgz2.name}` }
    }
  }

  // Linux x86_64: .AppImage.tar.gz and .AppImage.tar.gz.sig
  const linuxTgz = findAsset((n) => n.includes('AppImage.tar.gz') && !n.endsWith('.sig'))
  const linuxSig = findAsset((n) => n.includes('AppImage.tar.gz.sig'))
  if (linuxTgz && linuxSig) {
    const sig = await getSigContent(linuxSig.name)
    if (sig) {
      platforms['linux-x86_64'] = { signature: sig, url: `${downloadBase}/${linuxTgz.name}` }
    }
  }

  if (Object.keys(platforms).length === 0) {
    console.error('No signed update bundles found. Ensure TAURI_PRIVATE_KEY is set in CI so build produces .sig files.')
    process.exit(1)
  }

  const manifest = {
    version: version,
    notes: release.body || `Release ${version}`,
    pub_date: release.published_at || new Date().toISOString(),
    platforms,
  }

  const json = JSON.stringify(manifest, null, 2)
  if (outFile) {
    const fs = await import('fs')
    fs.writeFileSync(outFile, json)
    console.error('Wrote', outFile)
  } else {
    console.log(json)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
