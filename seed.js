// Run once: node seed.js  -> loads your mid-semester data into MongoDB
const { MongoClient } = require('mongodb');
(async () => {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db('campus_lost_found');
  for (const c of ['users', 'locations', 'items', 'claims']) await db.collection(c).deleteMany({});

  await db.collection('users').insertMany([
    { _id: 1, name: 'Nakato Aisha', email: 'naisha@campus.gmail.com', role: 'student', phone: '0700111222' },
    { _id: 2, name: 'Okello Brian', email: 'okbrian@campus.gmail.com', role: 'student', phone: '0700333444' },
    { _id: 3, name: 'Dr. Onyango Laban', email: 'olaban@bu.ac.com', role: 'staff', phone: '0700555666' },
    { _id: 4, name: 'Madasi Charles', email: 'mcharles01@gmail.com', role: 'security', phone: '0700777888' },
    { _id: 5, name: 'Buyinza Joshua', email: 'buyinzajoshua31@gmail.com', role: 'student', phone: '0700999000' }
  ]);
  await db.collection('locations').insertMany([
    { _id: 1, name: 'Main Library', building: 'Lib Block', description: 'Ground floor reading area' },
    { _id: 2, name: 'Cafeteria', building: 'Café Block', description: 'Student dining hall' },
    { _id: 3, name: 'Lind Hall', building: 'Block A', description: 'Opp graduation square' },
    { _id: 4, name: 'Computer Lab', building: 'IT Block', description: 'Opp graduation square' },
    { _id: 5, name: 'Sports Ground', building: 'Outdoor', description: 'Football pitch and track' }
  ]);
  await db.collection('items').insertMany([
    { _id: 1, title: 'Samsung Galaxy A14', category: 'phone', description: 'Black, cracked corner', status: 'found', dateReported: new Date('2026-10-01'), reportedBy: 4, locationId: 1 },
    { _id: 2, title: 'Student ID Card', category: 'id_card', description: 'Reg no. 25/BIT/BU/R/0017', status: 'found', dateReported: new Date('2026-10-02'), reportedBy: 4, locationId: 2 },
    { _id: 3, title: 'HP Laptop Charger', category: 'electronics', description: '65W, grey cable', status: 'claimed', dateReported: new Date('2026-10-03'), reportedBy: 3, locationId: 4 },
    { _id: 4, title: 'Blue Water Bottle', category: 'personal', description: 'Stainless steel, sticker on side', status: 'found', dateReported: new Date('2026-10-05'), reportedBy: 2, locationId: 5 },
    { _id: 5, title: 'Laptop bag', category: 'stationery', description: 'BU logo, name written inside', status: 'found', dateReported: new Date('2026-10-08'), reportedBy: 1, locationId: 3 }
  ]);
  await db.collection('claims').insertMany([
    { _id: 1, itemId: 1, claimantId: 5, status: 'pending', claimDate: new Date('2026-10-02'), proof: 'Can unlock phone, wallpaper is a cat' },
    { _id: 2, itemId: 2, claimantId: 1, status: 'approved', claimDate: new Date('2026-10-03'), proof: 'Photo ID matches' },
    { _id: 3, itemId: 3, claimantId: 3, status: 'approved', claimDate: new Date('2026-10-04'), proof: 'Serial number matches' },
    { _id: 4, itemId: 4, claimantId: 2, status: 'rejected', claimDate: new Date('2026-10-06'), proof: 'Could not describe the sticker' },
    { _id: 5, itemId: 5, claimantId: 5, status: 'pending', claimDate: new Date('2026-10-09'), proof: 'My name is inside the bag' }
  ]);
  console.log('Seeded campus_lost_found with 5 documents in each collection.');
  await client.close();
})();
