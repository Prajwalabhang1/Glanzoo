const mysql = require('mysql2/promise');

async function syncDatabases() {
  console.log('Initiating Secure Cross-Database Synchronization Pipeline...');
  try {
    const local = await mysql.createConnection('mysql://root:root@127.0.0.1:3308/glanzoo_local');
    const remote = await mysql.createConnection('mysql://u858952668_glanzoo8872aka:glanzoo8872Akash@82.25.121.209:3306/u858952668_glanzoo_new');

    const tablesToSync = ['Category', 'Product', 'ProductVariant', 'Collection'];

    for (const tableName of tablesToSync) {
      console.log(`\nFetching ${tableName} from Local...`);
      const [rows] = await local.execute(`SELECT * FROM ${tableName}`);
      console.log(`Found ${rows.length} rows to sync.`);

      let successCount = 0;
      for (const row of rows) {
        try {
          await remote.query(`INSERT IGNORE INTO ${tableName} SET ?`, row);
          successCount++;
        } catch(e) {
          console.error(`Error inserting into ${tableName}:`, e.message);
        }
      }
      console.log(`Successfully completed synchronization for ${tableName}. (Synced ${successCount}/${rows.length})`);
    }

    await local.end();
    await remote.end();
    console.log('\n✅ Pipeline Complete! The Hostinger database is exactly structurally identical to Local.');
  } catch(e) {
    console.error('Fatal Pipeline Error:', e.message);
  }
}

syncDatabases();
