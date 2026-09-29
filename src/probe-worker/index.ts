import { runCheck } from '../lib/checker';
import { BlockSignatures } from '../lib/checker/types';

const API_URL = process.env.API_URL;
const PROBE_TOKEN = process.env.PROBE_TOKEN;
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS || '60000', 10);

if (!API_URL || !PROBE_TOKEN) {
  console.error('Missing API_URL or PROBE_TOKEN environment variables.');
  process.exit(1);
}

async function fetchJobs() {
  const res = await fetch(`${API_URL}/api/probe/jobs`, {
    headers: { 'Authorization': `Bearer ${PROBE_TOKEN}` }
  });
  if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);
  return res.json();
}

async function postResults(results: any[]) {
  const res = await fetch(`${API_URL}/api/probe/results`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PROBE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ results })
  });
  if (!res.ok) throw new Error(`Failed to post results: ${res.status}`);
  return res.json();
}

async function run() {
  console.log(`[${new Date().toISOString()}] Fetching jobs from ${API_URL}...`);
  try {
    const { probe, websites, signatures } = await fetchJobs();
    console.log(`[${new Date().toISOString()}] Found ${websites.length} websites to check.`);

    const results = [];
    for (const site of websites) {
      console.log(`Checking ${site.url}...`);
      const checkResult = await runCheck(site.url, signatures);
      results.push({
        websiteId: site.id,
        ...checkResult,
        checkedAt: new Date().toISOString()
      });
    }

    if (results.length > 0) {
      console.log(`[${new Date().toISOString()}] Posting ${results.length} results...`);
      await postResults(results);
      console.log(`[${new Date().toISOString()}] Results posted successfully.`);
    }
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
  }
}

async function loop() {
  await run();
  setTimeout(loop, INTERVAL_MS);
}

console.log('Starting PHS Probe Worker...');
loop();
