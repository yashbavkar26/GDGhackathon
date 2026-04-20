require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const DiseaseReport = require('../models/DiseaseReport');
const { users, diseaseReports } = require('./dummyData');

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await DiseaseReport.deleteMany({});

    const insertedUsers = await User.insertMany(users);

    const reportsWithUsers = diseaseReports.map((report, idx) => ({
      ...report,
      reportedBy: insertedUsers[idx % insertedUsers.length]._id
    }));

    await DiseaseReport.insertMany(reportsWithUsers);

    console.log('Dummy data seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

seed();
