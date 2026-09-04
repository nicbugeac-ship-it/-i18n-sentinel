#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const flags = args.filter(arg => arg.startsWith('--'));
const fileArgs = args.filter(arg => !arg.startsWith('--'));

if (fileArgs.length < 2) {
  console.error("❌ Error: Missing file arguments.");
  console.log("Usage: i18n-sentinel <base-file> <target-file> [--quiet]");
  process.exit(1);
}

const sourceFile = path.resolve(fileArgs[0]);
const targetFile = path.resolve(fileArgs[1]);
const isQuiet = flags.includes('--quiet');

const parseCSV = (content) => {
  const lines = content.split(/\r?\n/);
  const map = {};
  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.match(/^("([^"]*)"|([^,]*)),("([^"]*)"|([^,]*))$/);
    if (match) {
      const key = match[2] || match[3];
      const val = match[5] || match[6];
      if (key) map[key.trim()] = val ? val.trim() : "";
    }
  }
  return map;
};

const loadFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf8');
  if (ext === '.json') {
    return JSON.parse(content);
  } else if (ext === '.csv') {
    return parseCSV(content);
  } else {
    throw new Error(`Unsupported file extension: ${ext}. Use .json or .csv`);
  }
};

try {
  if (!fs.existsSync(sourceFile) || !fs.existsSync(targetFile)) {
    console.error("❌ Error: Source or target file does not exist.");
    process.exit(1);
  }

  const source = loadFile(sourceFile);
  const target = loadFile(targetFile);

  let errors = 0;

  const getPlaceholders = (str) => {
    if (typeof str !== 'string') return [];
    return str.match(/\{[^}]+\}|%[sd]/g) || [];
  };

  if (!isQuiet) {
    console.log(`🛡️ [i18n-sentinel] Analyzing ${path.basename(targetFile)} against ${path.basename(sourceFile)}...\n`);
  }

  for (const key of Object.keys(source)) {
    if (!(key in target)) {
      console.error(`  ❌ [Missing Key] "${key}" is missing in target.`);
      errors++;
      continue;
    }

    const srcVars = getPlaceholders(source[key]).sort();
    const tgtVars = getPlaceholders(target[key]).sort();

    if (JSON.stringify(srcVars) !== JSON.stringify(tgtVars)) {
      console.error(`  ⚠️  [Placeholder Mismatch] Key: "${key}"`);
      console.error(`      Expected: ${srcVars.join(', ') || 'none'}`);
      console.error(`      Found:    ${tgtVars.join(', ') || 'none'}`);
      errors++;
    }
  }

  if (errors === 0) {
    if (!isQuiet) {
      console.log("✨ Success! Localization assets are clean and production-ready.");
    }
    process.exit(0);
  } else {
    console.error(`\n💥 Build failed: Found ${errors} localization error(s).`);
    process.exit(1);
  }

} catch (err) {
  console.error("❌ Fatal Error:", err.message);
  process.exit(1);
}
