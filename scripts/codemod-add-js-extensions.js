#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function walk(dir) {
  const files = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === 'node_modules' || name === '.git') continue;
      files.push(...walk(full));
    } else if (/\.tsx?$/.test(name) || /\.mts?$/.test(name)) {
      files.push(full);
    }
  }
  return files;
}

function transformFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/\b(import|export)\b|\brequire\(/.test(line)) continue;

    // process import/export ... from '...'
    lines[i] = lines[i].replace(/(from\s+|require\()(['"])(\.{1,2}\/[^'"\)]+)(['"\)])/g, (m, p1, quote1, relPath, quote2) => {
      // skip URLs or package imports
      if (/^\//.test(relPath)) return m;
      // already has a JS/CJS/MJS/JSON/NODE extension
      if (/\.(?:js|mjs|cjs|json|node)$/.test(relPath)) return m;
      // if ends with .ts/.tsx, strip and add .js
      if (/\.(?:ts|tsx)$/.test(relPath)) {
        const newPath = relPath.replace(/\.(?:ts|tsx)$/, '') + '.js';
        changed = true;
        return p1 + quote1 + newPath + quote2;
      }
      // if has any other extension, leave
      if (/\.[a-zA-Z0-9]+$/.test(relPath)) return m;
      changed = true;
      return p1 + quote1 + relPath + '.js' + quote2;
    });
  }

  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('Updated', path.relative(ROOT, filePath));
  }
}

function main() {
  const src = path.join(ROOT, 'src');
  if (!fs.existsSync(src)) {
    console.error('src directory not found at', src);
    process.exit(1);
  }
  const files = walk(src);
  for (const f of files) transformFile(f);
}

main();
