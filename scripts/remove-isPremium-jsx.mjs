import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "build", "out", ".git"])

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue
      walk(path.join(dir, e.name), out)
    } else if (e.isFile()) {
      if (e.name.endsWith(".tsx") || e.name.endsWith(".jsx")) out.push(path.join(dir, e.name))
    }
  }
  return out
}

function isInsideJsxTag(src, idx) {
  const prevLt = src.lastIndexOf("<", idx)
  if (prevLt === -1) return false
  const prevGt = src.lastIndexOf(">", idx)
  return prevLt > prevGt
}

function skipSpaces(src, i) {
  while (i < src.length && /\s/.test(src[i])) i++
  return i
}

function scanQuoted(src, i) {
  const quote = src[i]
  i++
  while (i < src.length) {
    const ch = src[i]
    if (ch === "\\") {
      i += 2
      continue
    }
    if (ch === quote) return i + 1
    i++
  }
  return i
}

function scanBraces(src, i) {
  let depth = 0
  let mode = "code"
  i--
  while (++i < src.length) {
    const ch = src[i]

    if (mode === "single") {
      if (ch === "\\") { i++; continue }
      if (ch === "'") mode = "code"
      continue
    }
    if (mode === "double") {
      if (ch === "\\") { i++; continue }
      if (ch === '"') mode = "code"
      continue
    }
    if (mode === "template") {
      if (ch === "\\") { i++; continue }
      if (ch === "`") mode = "code"
      continue
    }

    if (ch === "'") { mode = "single"; continue }
    if (ch === '"') { mode = "double"; continue }
    if (ch === "`") { mode = "template"; continue }

    if (ch === "{") depth++
    if (ch === "}") {
      depth--
      if (depth === 0) return i + 1
    }
  }
  return i
}

function removeIsPremiumJsxAttrs(src) {
  let i = 0
  let removed = 0
  const name = "isPremium"

  while (i < src.length) {
    const idx = src.indexOf(name, i)
    if (idx === -1) break

    if (!isInsideJsxTag(src, idx)) {
      i = idx + name.length
      continue
    }

    const before = src[idx - 1]
    const after = src[idx + name.length]
    const beforeOk = before === undefined || /\s|<|\/|"/.test(before)
    const afterOk = after === undefined || /\s|=|\/|>/.test(after)
    if (!beforeOk || !afterOk) {
      i = idx + name.length
      continue
    }

    let start = idx
    while (start > 0 && /\s/.test(src[start - 1])) start--

    let j = idx + name.length
    j = skipSpaces(src, j)

    if (src[j] === "=") {
      j++
      j = skipSpaces(src, j)

      if (src[j] === "{") {
        const end = scanBraces(src, j)
        src = src.slice(0, start) + src.slice(end)
        removed++
        i = start
        continue
      }

      if (src[j] === '"' || src[j] === "'") {
        const end = scanQuoted(src, j)
        src = src.slice(0, start) + src.slice(end)
        removed++
        i = start
        continue
      }

      i = idx + name.length
      continue
    } else {
      const end = idx + name.length
      src = src.slice(0, start) + src.slice(end)
      removed++
      i = start
      continue
    }
  }

  return { src, removed }
}

const files = walk(ROOT)
let totalRemoved = 0
const changed = []

for (const file of files) {
  const before = fs.readFileSync(file, "utf8")
  const { src: after, removed } = removeIsPremiumJsxAttrs(before)
  if (removed > 0) {
    fs.writeFileSync(file, after, "utf8")
    totalRemoved += removed
    changed.push({ file: path.relative(ROOT, file), removed })
  }
}

if (changed.length === 0) {
  console.log("✅ No JSX isPremium props found to remove.")
} else {
  console.log("✅ Removed isPremium JSX props:")
  for (const c of changed) console.log(`- ${c.file} (removed: ${c.removed})`)
  console.log(`\nTotal removed: ${totalRemoved}`)
}
