import { seedLocationData } from './locationSeeder.js';
import { connectDb } from '../config/db.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Main seeder function
const runSeeder = async () => {
    try {
        await connectDb();
        console.log(' Starting location data seeding...\n');
        
        const result = await seedLocationData();
        
        console.log('\n Seeding completed successfully!');
        console.log('You can now use the province, district, and city collections in your application.');
        
        process.exit(0);
    } catch (error) {
        console.error(' Seeding failed:', error);
        process.exit(1);
    }
};

// Run the seeder
runSeeder();