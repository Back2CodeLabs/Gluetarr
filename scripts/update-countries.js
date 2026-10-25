#!/usr/bin/env node
// Refreshes src/countries.json from Gluetun's server catalogue (Surfshark, WireGuard).
// Usage: node scripts/update-countries.js [path/to/surfshark.json]
// Without an argument the catalogue is downloaded from GitHub (qdm12/gluetun-servers).
// New countries need an ISO 3166-1 alpha-2 code: add it to EXTRA_CODES below.
const fs = require('fs');
const path = require('path');

const URL = 'https://raw.githubusercontent.com/qdm12/gluetun-servers/main/pkg/servers/surfshark.json';
const FILE = path.join(__dirname, '..', 'src', 'countries.json');
const EXTRA_CODES = {}; // e.g. { 'Kenya': 'KE' }

(async () => {
  const arg = process.argv[2];
  const catalogue = arg ? JSON.parse(fs.readFileSync(arg, 'utf8')) : await (await fetch(URL)).json();
  const current = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const known = new Map(current.countries.map(c => [c.name, c.code]));
  const labels = new Map(current.countries.filter(c => c.label).map(c => [c.name, c.label]));
  for (const [n, c] of Object.entries(EXTRA_CODES)) known.set(n, c);

  const names = [...new Set(catalogue.servers.filter(s => s.vpn === 'wireguard').map(s => s.country))].sort();
  const unknown = names.filter(n => !known.has(n));
  if (unknown.length) {
    console.error('No ISO code for: ' + unknown.join(', ') + '\nAdd them to EXTRA_CODES and rerun.');
    process.exit(1);
  }
  current.catalogTimestamp = catalogue.timestamp;
  current.countries = names.map(name => ({ name, code: known.get(name), ...(labels.has(name) ? { label: labels.get(name) } : {}) }));
  fs.writeFileSync(FILE, JSON.stringify(current, null, 1) + '\n');
  console.log(`${names.length} countries written to src/countries.json`);
})().catch(e => { console.error(e.message); process.exit(1); });
