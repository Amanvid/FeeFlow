import * as dotenv from 'dotenv';
dotenv.config();

import { v4 as uuidv4 } from 'uuid';

const USERS = [
  ['u1', 'John Doe', 'john@example.com', '0240000001', 'hashed_pass', 'admin', 'active', new Date().toISOString()],
  ['u2', 'Jane Smith', 'jane@example.com', '0240000002', 'hashed_pass', 'finance', 'active', new Date().toISOString()],
  ['u3', 'Kwame Osei', 'kwame@example.com', '0240000003', 'hashed_pass', 'member', 'active', new Date().toISOString()],
  ['u4', 'Ama Mensah', 'ama@example.com', '0240000004', 'hashed_pass', 'member', 'active', new Date().toISOString()],
  ['u5', 'Kofi Boateng', 'kofi@example.com', '0240000005', 'hashed_pass', 'member', 'active', new Date().toISOString()],
];

const DEPARTMENTS = [
  ['d1', 'Music Department', 'u3', 'Choir and instrumentalists'],
  ['d2', 'Ushering', 'u4', 'Protocol and hospitality'],
  ['d3', 'Media', 'u5', 'Audio, video and projection'],
];

const MEMBERS = [
  ['m1', 'u3', 'active', '2023-01-15', 'd1', 'baptized'],
  ['m2', 'u4', 'active', '2023-02-20', 'd2', 'baptized'],
  ['m3', 'u5', 'active', '2023-03-10', 'd3', 'not_baptized'],
];

const EVENTS = [
  ['e1', 'Sunday Service', new Date(Date.now() + 86400000).toISOString(), new Date(Date.now() + 90000000).toISOString(), 'd1', 'Service'],
  ['e2', 'Choir Practice', new Date(Date.now() - 86400000).toISOString(), new Date(Date.now() - 80000000).toISOString(), 'd1', 'Rehearsal'],
  ['e3', 'Leadership Summit', new Date(Date.now() + 604800000).toISOString(), new Date(Date.now() + 610000000).toISOString(), 'd2', 'Conference'],
];

const FINANCIAL_RECORDS = [
  ['f1', 'Income', 'Tithes', '500.00', 'u2', new Date().toISOString()],
  ['f2', 'Income', 'Offering', '1200.00', 'u2', new Date().toISOString()],
  ['f3', 'Expense', 'Electricity Bill', '350.00', 'u2', new Date().toISOString()],
  ['f4', 'Income', 'Pledge Redemption', '2000.00', 'u2', new Date().toISOString()],
  ['f5', 'Expense', 'Equipment Maintenance', '150.00', 'u2', new Date().toISOString()],
];

const DONATIONS = [
  ['dn1', 'm1', '200.00', 'Cash', 'Tithe', new Date().toISOString()],
  ['dn2', 'm2', '100.00', 'MoMo', 'Offering', new Date().toISOString()],
  ['dn3', 'm3', '50.00', 'Cash', 'Welfare', new Date().toISOString()],
  ['dn4', 'm1', '500.00', 'Bank Transfer', 'Building Project', new Date().toISOString()],
];

async function seedDatabase() {
  console.log('Starting database seed...');
  
  // Dynamic import to ensure env vars are loaded before service initialization
  const { googleSheetsService } = await import('../src/lib/google-sheets');
  
  try {
    // We append to existing sheets. Ideally, you might want to clear them first or check for duplicates.
    // For this seed script, we'll just append.
    
    console.log('Seeding Users...');
    await googleSheetsService.appendToSheet('users!A:H', USERS);
    
    console.log('Seeding Departments...');
    await googleSheetsService.appendToSheet('departments!A:D', DEPARTMENTS);
    
    console.log('Seeding Members...');
    await googleSheetsService.appendToSheet('members!A:F', MEMBERS);
    
    console.log('Seeding Events...');
    await googleSheetsService.appendToSheet('events!A:F', EVENTS);
    
    console.log('Seeding Financial Records...');
    await googleSheetsService.appendToSheet('financial_records!A:F', FINANCIAL_RECORDS);
    
    console.log('Seeding Donations...');
    await googleSheetsService.appendToSheet('donations!A:F', DONATIONS);
    
    console.log('✅ Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
