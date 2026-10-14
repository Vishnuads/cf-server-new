
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Admin = require('../models/admin');

dotenv.config();

async function createAdmin() {
  await mongoose.connect(process.env.DATABASE);

  const existing = await Admin.findOne({ username: 'admin' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const admin = new Admin({
    username: 'admin@gmail.com',       
    password: 'admin123', 
  });

  await admin.save();
  console.log('Admin created successfully');
  process.exit(0);
}

createAdmin();  