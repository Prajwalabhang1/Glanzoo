const b = require('bcryptjs');
const fs = require('fs');
Promise.all([b.hash('Admin@123', 10), b.hash('Customer@123', 10)]).then(([admin, customer]) => {
    const sql = `UPDATE "User" SET password = '${admin}', "updatedAt" = NOW() WHERE email = 'admin@glanzoo.com';\nUPDATE "User" SET password = '${customer}', "updatedAt" = NOW() WHERE email = 'customer@test.com';\nSELECT email, role, LEFT(password, 25) as pwd_preview FROM "User";\n`;
    fs.writeFileSync('C:/Temp/fix-passwords.sql', sql);
    console.log('Done');
});
