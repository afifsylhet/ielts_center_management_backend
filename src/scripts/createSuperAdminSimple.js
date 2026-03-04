require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/env');

/**
 * Simple script to create Super Admin user with command line arguments
 * Run: node src/scripts/createSuperAdminSimple.js "Name" "email@example.com" "password"
 */

const createSuperAdmin = async () => {
    try {
        // Get arguments from command line
        const args = process.argv.slice(2);

        // Default values if no arguments provided
        const name = args[0] || 'Super Admin';
        const email = args[1] || 'admin@ielts.com';
        const password = args[2] || 'admin123';

        console.log('\n========================================');
        console.log('   Create Super Admin Account');
        console.log('========================================\n');

        // Connect to database
        await mongoose.connect(config.mongoUri);
        console.log('✅ Connected to MongoDB');

        // Validate input
        if (!name || !email || !password) {
            console.error('❌ All fields are required!');
            process.exit(1);
        }

        if (password.length < 6) {
            console.error('❌ Password must be at least 6 characters!');
            process.exit(1);
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            console.error('❌ Invalid email format!');
            process.exit(1);
        }

        // Check if super admin already exists
        const existingUser = await User.findOne({
            $or: [
                { email },
                { role: 'super_admin' }
            ]
        });

        if (existingUser) {
            console.log('\n⚠️  Super Admin already exists!');
            console.log('========================================');
            console.log(`Name: ${existingUser.name}`);
            console.log(`Email: ${existingUser.email}`);
            console.log(`Role: ${existingUser.role}`);
            console.log(`Status: ${existingUser.status}`);
            console.log(`ID: ${existingUser._id}`);
            console.log('========================================\n');
            console.log('🔐 Use these credentials to login:');
            console.log(`   Email: ${existingUser.email}`);
            console.log(`   Password: (use your existing password)`);
            console.log('\n💡 If you forgot the password, delete the user and run this script again.\n');
            process.exit(0);
        }

        // Create super admin
        const superAdmin = await User.create({
            name,
            email,
            password,
            role: 'super_admin',
            centerId: null,
            status: 'approved'
        });

        console.log('\n✅ Super Admin created successfully!');
        console.log('========================================');
        console.log(`Name: ${superAdmin.name}`);
        console.log(`Email: ${superAdmin.email}`);
        console.log(`Role: ${superAdmin.role}`);
        console.log(`Status: ${superAdmin.status}`);
        console.log(`ID: ${superAdmin._id}`);
        console.log('========================================\n');
        console.log('🔐 You can now login with these credentials.');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log('\n');

    } catch (error) {
        console.error('❌ Error creating super admin:', error.message);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

// Run the script
createSuperAdmin();
