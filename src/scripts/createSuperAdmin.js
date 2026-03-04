require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');
const config = require('../config/env');

/**
 * Script to create Super Admin user
 * Run: node src/scripts/createSuperAdmin.js
 */

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

const createSuperAdmin = async () => {
    try {
        // Connect to database
        await mongoose.connect(config.mongoUri);
        console.log('✅ Connected to MongoDB');

        console.log('\n========================================');
        console.log('   Create Super Admin Account');
        console.log('========================================\n');

        // Get input from user
        const name = await question('Enter Super Admin Name: ');
        const email = await question('Enter Super Admin Email: ');
        const password = await question('Enter Password (min 6 characters): ');

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
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error('❌ User with this email already exists!');
            process.exit(1);
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
        console.log(`ID: ${superAdmin._id}`);
        console.log('========================================\n');
        console.log('🔐 You can now login with these credentials.');

    } catch (error) {
        console.error('❌ Error creating super admin:', error.message);
    } finally {
        rl.close();
        mongoose.connection.close();
        process.exit(0);
    }
};

// Run the script
createSuperAdmin();
