#!/usr/bin/env node
/**
 * Exports the README architecture diagram in Kawan's colors.
 *
 * Archify (https://github.com/tt-a1i/archify) renders architecture.json into a
 * standalone HTML viewer. This script:
 *
 *   1. copies architecture.json to a temp folder, adding the `meta.output`
 *      field that archify's schema requires (the committed source omits it);
 *   2. runs `archify deliver` (showcase quality) and `archify check` on it;
 *   3. adds Kawan's design tokens (apps/frontend/src/styles/tokens.css) to the
 *      viewer as theme variables;
 *   4. opens the viewer in headless Chrome and runs its own "Download SVG"
 *      export, which resolves both the light and the dark variable sets;
 *   5. writes that SVG twice, pinned to one theme each through the root
 *      `data-theme` attribute that archify's export supports.
 *
 * Inputs: architecture.json beside this file; the archify CLI (v2.17), given
 * as the first argument or the ARCHIFY environment variable; Google Chrome
 * (override its path with CHROME). Needs Node 22 or later.
 *
 * Re-run from the repository root:
 *   node docs/readme/export-architecture.mjs <archify>/bin/archify.mjs
 *
 * Writes: architecture-light.svg and architecture-dark.svg beside this file.
 */

import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const README_DIR = path.dirname(fileURLToPath(import.meta.url))
const ARCHIFY = process.argv[2] ?? process.env.ARCHIFY
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if (!ARCHIFY) {
  console.error('usage: node docs/readme/export-architecture.mjs <archify>/bin/archify.mjs')
  process.exit(2)
}

// tokens.css (light and [data-theme="dark"]) mapped onto archify's theme variables.
const THEMES = {
  light: {
    '--bg': '#f3e9d9', // --bg
    '--grid': '#e0d0bb', // --line
    '--canvas-dot': '#e0d0bb', // --line
    '--text': '#3a2a1e', // --ink
    '--text-muted': '#6e5849', // --ink-soft
    '--text-dim': '#9c8a7a', // --ink-faint
    '--text-faint': '#6e5849', // --ink-soft
    '--panel': '#fbf4e8', // --surface
    '--panel-border': '#e0d0bb', // --line
    '--lane-fill': '#eadcca', // --surface-sunk
    '--lane-stroke': '#cebfa9', // --line-strong
    '--arrow': '#9c8a7a', // --ink-faint
    '--arrow-emphasis': '#dd6236', // --accent
    '--mask': '#f3e9d9', // --bg
    '--frontend-fill': '#f8e1d2', // --accent-tint
    '--frontend-stroke': '#dd6236', // --accent
    '--backend-fill': '#e7ecda', // --sage-tint
    '--backend-stroke': '#7c8a5a', // --sage-deep
    '--database-fill': '#fffbf4', // --surface-2
    '--database-stroke': '#b18973', // --clay
    '--cloud-fill': '#fbf4e8', // --surface
    '--cloud-stroke': '#c98a3c', // --warning
    '--security-fill': '#f8e1d2', // --accent-tint
    '--security-stroke': '#b8502c', // --danger
    '--messagebus-fill': '#fbf4e8', // --surface
    '--messagebus-stroke': '#c98a3c', // --warning
    '--external-fill': '#eadcca', // --surface-sunk
    '--external-stroke': '#6e5849' // --ink-soft
  },
  dark: {
    '--bg': '#1a140f',
    '--grid': '#3a2c20',
    '--canvas-dot': '#3a2c20',
    '--text': '#f4ece1',
    '--text-muted': '#c9b6a4',
    '--text-dim': '#8c7867',
    '--text-faint': '#c9b6a4',
    '--panel': '#241b14',
    '--panel-border': '#3a2c20',
    '--lane-fill': '#140f0b',
    '--lane-stroke': '#4a3829',
    '--arrow': '#8c7867',
    '--arrow-emphasis': '#e4733d',
    '--mask': '#1a140f',
    '--frontend-fill': '#3a2218',
    '--frontend-stroke': '#e4733d',
    '--backend-fill': '#28281c',
    '--backend-stroke': '#9ca977',
    '--database-fill': '#2e231a',
    '--database-stroke': '#c49a82',
    '--cloud-fill': '#241b14',
    '--cloud-stroke': '#d4954a',
    '--security-fill': '#3a2218',
    '--security-stroke': '#f0875a',
    '--messagebus-fill': '#241b14',
    '--messagebus-stroke': '#d4954a',
    '--external-fill': '#140f0b',
    '--external-stroke': '#c9b6a4'
  }
}

const declarations = (vars) =>
  Object.entries(vars)
    .map(([name, value]) => `${name}: ${value};`)
    .join(' ')

const tokenCss = [
  `:root, [data-theme="dark"] { ${declarations(THEMES.dark)} }`,
  `[data-theme="light"] { ${declarations(THEMES.light)} }`
].join('\n')

function run(args) {
  const r = spawnSync(process.execPath, [ARCHIFY, ...args], { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`archify ${args[0]} failed:\n${r.stdout}${r.stderr}`)
}

// Minimal Chrome DevTools Protocol client over the browser's WebSocket.
async function withChrome(fn) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'kawan-chrome-'))
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank'
  ])
  try {
    const wsUrl = await new Promise((resolve, reject) => {
      let err = ''
      chrome.stderr.on('data', (chunk) => {
        err += chunk
        const m = err.match(/DevTools listening on (ws:\/\/\S+)/)
        if (m) resolve(m[1])
      })
      chrome.on('exit', (code) => reject(new Error(`Chrome exited (${code}): ${err}`)))
    })
    const ws = new WebSocket(wsUrl)
    await new Promise((resolve, reject) => {
      ws.onopen = resolve
      ws.onerror = reject
    })
    let id = 0
    const pending = new Map()
    const listeners = []
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id)
        pending.delete(msg.id)
        if (msg.error) reject(new Error(msg.error.message))
        else resolve(msg.result)
      } else if (msg.method) {
        for (const l of listeners) l(msg)
      }
    }
    const send = (method, params = {}, sessionId) =>
      new Promise((resolve, reject) => {
        id += 1
        pending.set(id, { resolve, reject })
        ws.send(JSON.stringify({ id, method, params, sessionId }))
      })
    const once = (method, sessionId) =>
      new Promise((resolve) => {
        const l = (msg) => {
          if (msg.method === method && msg.sessionId === sessionId) {
            listeners.splice(listeners.indexOf(l), 1)
            resolve(msg.params)
          }
        }
        listeners.push(l)
      })
    try {
      return await fn({ send, once })
    } finally {
      ws.close()
    }
  } finally {
    if (chrome.exitCode === null) {
      const exited = new Promise((resolve) => chrome.once('exit', resolve))
      chrome.kill()
      await exited
    }
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  }
}

async function exportSvg(htmlFile) {
  return withChrome(async ({ send, once }) => {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
    await send('Browser.setDownloadBehavior', { behavior: 'deny' })
    await send('Page.enable', {}, sessionId)
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId)
    const loaded = once('Page.loadEventFired', sessionId)
    await send('Page.navigate', { url: pathToFileURL(htmlFile).href }, sessionId)
    await loaded
    // Capture the blob the viewer's own SVG export hands to its download helper.
    const expression = `(async () => {
      await document.fonts.ready;
      const captured = new Promise((resolve) => {
        const original = URL.createObjectURL.bind(URL);
        URL.createObjectURL = (blob) => { resolve(blob); return original(blob); };
      });
      document.getElementById('btn-export').click();
      document.querySelector('#export-menu [data-format="svg"]').click();
      return (await captured).text();
    })()`
    const { result, exceptionDetails } = await send(
      'Runtime.evaluate',
      { expression, awaitPromise: true, returnByValue: true },
      sessionId
    )
    if (exceptionDetails) throw new Error(`export failed: ${exceptionDetails.exception?.description ?? exceptionDetails.text}`)
    return result.value
  })
}

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'kawan-architecture-'))
try {
  const source = JSON.parse(fs.readFileSync(path.join(README_DIR, 'architecture.json'), 'utf8'))
  source.meta = { ...source.meta, output: 'architecture.html' }
  const json = path.join(work, 'architecture.json')
  const html = path.join(work, 'architecture.html')
  fs.writeFileSync(json, `${JSON.stringify(source, null, 2)}\n`)
  run(['deliver', 'architecture', json, html, '--quality', 'showcase', '--json'])
  run(['check', html, '--require-provenance'])

  const viewer = fs.readFileSync(html, 'utf8')
  if (!viewer.includes('</head>')) throw new Error('no </head> in the archify viewer')
  const tinted = path.join(work, 'architecture-kawan.html')
  fs.writeFileSync(tinted, viewer.replace('</head>', `<style id="kawan-tokens">\n${tokenCss}\n</style>\n</head>`))

  const svg = await exportSvg(tinted)
  if (!svg.startsWith('<?xml') && !svg.startsWith('<svg')) throw new Error('the export is not an SVG')
  for (const theme of ['light', 'dark']) {
    const pinned = svg.replace(/<svg\b/, `<svg data-theme="${theme}"`)
    const out = path.join(README_DIR, `architecture-${theme}.svg`)
    fs.writeFileSync(out, pinned)
    console.log(`wrote ${path.relative(process.cwd(), out)} (${Math.round(pinned.length / 1024)} KB)`)
  }
} finally {
  fs.rmSync(work, { recursive: true, force: true })
}
