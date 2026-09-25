// sync-mzalendo.ts
import { execSync } from 'child_process';
import { parseArgs } from 'util';

interface MPResponse {
  id: string;
  name: string;
  constituency: string;
  party: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      'episode-id': {
        type: 'string',
      },
    },
  });

  if (!values['episode-id']) {
    console.error('Error: --episode-id is required');
    process.exit(1);
  }

  const episodeId = values['episode-id'];
  console.log(`Syncing MPs for episode: ${episodeId}`);

  try {
    // Mock fetch from Mzalendo API
    const response = await fetch('https://api.mock-mzalendo.com/v1/mps');
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const mps: MPResponse[] = await response.json();
    
    // Process in batches of 10
    const batchSize = 10;
    for (let i = 0; i < mps.length; i += batchSize) {
      const batch = mps.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(mps.length / batchSize)}`);
      
      for (const mp of batch) {
        const sql = `INSERT INTO MemberOfParliament (id, name, constituency, party) VALUES ('${mp.id}', '${mp.name}', '${mp.constituency}', '${mp.party}') ON CONFLICT(id) DO UPDATE SET name=excluded.name, constituency=excluded.constituency, party=excluded.party;`;
        
        // Upsert to D1
        execSync(`pnpm wrangler d1 execute vetting-loop-db --local --command="${sql}"`, { stdio: 'inherit' });
      }
      
      // Rate limiting: 100ms delay between batches
      await delay(100);
    }
    
    console.log('Sync complete.');
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

main();
