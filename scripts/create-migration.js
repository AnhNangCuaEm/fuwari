import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const name = process.argv[2];
if (!name) {
  console.error('❌ Please provide migration name');
  console.log('\nUsage: npm run migrate:create add_categories_table');
  console.log('Example: npm run migrate:create add_user_avatar_column\n');
  process.exit(1);
}

const migrationsDir = path.join(process.cwd(), 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir);
}

const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
const fileName = `${timestamp}_${name}.sql`;
const filePath = path.join(migrationsDir, fileName);

const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Add your SQL statements here
-- Example:
-- ALTER TABLE users ADD COLUMN avatar VARCHAR(255);
-- CREATE TABLE categories (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(255) NOT NULL
-- );

`;

fs.writeFileSync(filePath, template);
console.log(`\n✅ Created migration file: migrations/${fileName}\n`);
console.log('Next steps:');
console.log('  1. Edit the migration file and add your SQL');
console.log('  2. Run: npm run migrate');
console.log('  3. Test your changes');
console.log('  4. Commit: git add migrations/ && git push\n');
