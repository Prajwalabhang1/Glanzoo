import pg from 'pg';
import mysql from 'mysql2/promise';

console.log('🚀 Starting Database Migration: PostgreSQL -> Local MySQL');

const pgClient = new pg.Client({
  connectionString: 'postgresql://glanzoo:glanzoo_dev_password_2024@127.0.0.1:5432/glanzoo'
});
await pgClient.connect();

const mysqlPool = mysql.createPool('mysql://root:root@127.0.0.1:3308/glanzoo_local');

// Dependency Order mapping
const tables = [
  'User', 
  'Category', 
  'Session', 
  'Address',
  'Collection', 
  'SizeChart',
  'Vendor', 
  'Product', 
  'ProductVariant', 
  'WishlistItem', 
  'Review', 
  'Order', 
  'OrderItem', 
  'VendorSale', 
  'Coupon', 
  'Inquiry', 
  'HeroBanner', 
  'PasswordResetToken', 
  'EmailVerificationToken', 
  'NewsletterSubscriber', 
  'announcement_bars', 
  'ReturnRequest'
];

for (const table of tables) {
    try {
        const { rows } = await pgClient.query(`SELECT * FROM public."${table}"`);
        if (rows.length === 0) continue;

        await mysqlPool.query('SET FOREIGN_KEY_CHECKS=0;');

        const keys = Object.keys(rows[0]);
        const values = [];
        const placeholders = [];

        for (const row of rows) {
            const rowPlaces = [];
            for (const key of keys) {
                rowPlaces.push('?');
                let val = row[key];
                
                // Format booleans to 1/0 since MySQL driver might not always catch them perfectly for TINYINT
                if (typeof val === 'boolean') {
                    val = val ? 1 : 0;
                }
                // Format objects/arrays to JSON strings
                else if (Array.isArray(val) || (typeof val === 'object' && val !== null && !(val instanceof Date))) {
                    val = JSON.stringify(val);
                }

                values.push(val);
            }
            placeholders.push(`(${rowPlaces.join(',')})`);
        }

        const query = `INSERT IGNORE INTO \`${table}\` (${keys.map(k => `\`${k}\``).join(',')}) VALUES ${placeholders.join(',')}`;
        await mysqlPool.query(query, values);
        
        await mysqlPool.query('SET FOREIGN_KEY_CHECKS=1;');
        console.log(`✅ Migrated ${rows.length} rows for ${table}`);
    } catch(err) {
        console.error(`❌ Error migrating ${table}:`, err.message);
    }
}

await pgClient.end();
await mysqlPool.end();
console.log('🎉 Migration Complete!');
