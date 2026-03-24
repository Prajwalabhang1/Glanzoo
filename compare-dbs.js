const mysql = require('mysql2/promise');

async function compare() {
  try {
    const local = await mysql.createConnection('mysql://root:root@127.0.0.1:3308/glanzoo_local');
    
    const tables = ['Product', 'Category', 'Collection', 'HeroBanner'];
    console.log('--- LOCAL DOCKER DB STATUS ---');
    for (const table of tables) {
      try {
        const [rows] = await local.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${rows[0].count} rows`);
      } catch (e) {
        console.log(`${table}: ERROR - ${e.message}`);
      }
    }

    console.log('\n--- HOSTINGER REMOTE DB STATUS ---');
    const remote = await mysql.createConnection('mysql://u858952668_glanzoo8872aka:glanzoo8872Akash@82.25.121.209:3306/u858952668_glanzoo_new');
    for (const table of tables) {
      try {
        const [rows] = await remote.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`${table}: ${rows[0].count} rows`);
      } catch (e) {
        console.log(`${table}: ERROR - ${e.message}`);
      }
    }

    await local.end();
    await remote.end();
  } catch(e) {
    console.error('Fatal Error:', e.message);
  }
}
compare();
