/**
 * Resolves the path to constants/utils regardless of whether
 * files are in a subfolder (commands/, interactions/) or flat root.
 */
const path = require('path');
const fs   = require('fs');

function resolveShared(name) {
  // Try sibling (flat layout)
  const flat = path.join(__dirname, `${name}.js`);
  if (fs.existsSync(flat)) return flat;
  // Try parent (subfolder layout)
  const parent = path.join(__dirname, '..', `${name}.js`);
  if (fs.existsSync(parent)) return parent;
  // Try src/ sibling
  const src = path.join(__dirname, '..', 'src', `${name}.js`);
  if (fs.existsSync(src)) return src;
  throw new Error(`Cannot resolve shared module: ${name}`);
}

module.exports = { resolveShared };
