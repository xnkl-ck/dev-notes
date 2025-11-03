const regenerator = require('regenerator');
const fs = require('fs');
const path = require('path');

const sourcePath = path.resolve(__dirname, './source.js');
const source = fs.readFileSync(sourcePath, 'utf-8');

const result = regenerator.compile(source, {
  includeRuntime: true,
});

const targetPath = path.resolve(__dirname, './target.js');
fs.writeFileSync(targetPath, result.code, 'utf-8');
console.log('compile success!');
