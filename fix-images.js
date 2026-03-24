const mysql = require('mysql2/promise');

async function fixBrokenImages() {
  console.log('Fixing broken Unsplash image URLs in the Hostinger Database...');
  try {
    const remote = await mysql.createConnection('mysql://u858952668_glanzoo8872aka:glanzoo8872Akash@82.25.121.209:3306/u858952668_glanzoo_new');

    const newUrl = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop"; // Beautiful fashion model
    
    await remote.execute(
      `UPDATE HeroBanner SET image = ? WHERE id = 'banner-2'`,
      [newUrl]
    );

    console.log('✅ Broken Image URL surgically replaced.');
    await remote.end();
  } catch(e) {
    console.error('Error:', e.message);
  }
}
fixBrokenImages();
