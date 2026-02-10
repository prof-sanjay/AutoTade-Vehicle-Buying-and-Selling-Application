const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function runMigrations() {
    // Create a connection to the database
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost', 
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'sanjay',
        database: process.env.DB_NAME || 'vehicledb',
        multipleStatements: false
    });

    try {
        console.log('Starting database migrations...');
        
        // Get all migration files in order
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = (await fs.readdir(migrationsDir))
            .filter(file => file.endsWith('.sql'))
            .sort();
        
        console.log(`Found ${files.length} migration files`);
        
        // Run each migration file
        for (const file of files) {
            console.log(`\nRunning migration: ${file}`);
            const filePath = path.join(migrationsDir, file);
            const sql = await fs.readFile(filePath, 'utf8');
            
            const statements = sql.split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);
            
            for (const statement of statements) {
                try {
                    console.log(`  Executing: ${statement.substring(0, 60)}...`);
                    await connection.query(statement);
                } catch (error) {
                    // If the column already exists, it's fine to continue
                    if (error.code === 'ER_DUP_FIELDNAME') {
                        console.log('  Column already exists, skipping...');
                        continue;
                    }
                    throw error;
                }
            }
            
            console.log(`✅ ${file} completed successfully`);
        }
        
        console.log('\n✅ All migrations completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

runMigrations();
