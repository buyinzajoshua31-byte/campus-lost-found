// BACK END: Express web server that talks to MongoDB
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());            // lets the server read JSON sent by the browser
app.use(express.static('public'));  // serves the front end (public/index.html)

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
let db;

const COLLECTIONS = ['users', 'locations', 'items', 'claims'];
const NUMBERS = ['reportedBy', 'locationId', 'itemId', 'claimantId'];
const DATES = ['dateReported', 'claimDate'];

// Browser forms send everything as text, so convert numbers and dates to the right type
function clean(body) {
  const doc = {};
  for (const [k, v] of Object.entries(body)) {
    if (k === '_id' || v === '') continue;
    doc[k] = NUMBERS.includes(k) ? Number(v) : DATES.includes(k) ? new Date(v) : v;
  }
  return doc;
}
const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(500).json({ error: e.message }));

app.param('col', (req, res, next, col) =>
  COLLECTIONS.includes(col) ? next() : res.status(404).json({ error: 'Unknown collection' }));

// CRUD action_read, MongoDB call_ find() (your $group query)
app.get('/api/report/status', wrap(async (req, res) => {
  res.json(await db.collection('items').aggregate([
    { $group: { _id: '$status', total: { $sum: 1 } } }, { $sort: { _id: 1 } }
  ]).toArray());
}));

// READ (with optional search ?q=...)  MongoDB call_ find()
app.get('/api/:col', wrap(async (req, res) => {
  const filter = {};
  if (req.query.q) {
    const r = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = ['title', 'name', 'category', 'status', 'description', 'email', 'proof'].map(f => ({ [f]: r }));
  }
  res.json(await db.collection(req.params.col).find(filter).sort({ _id: 1 }).toArray());
}));

// CREATE action and MongoDB call_ insertOne()
app.post('/api/:col', wrap(async (req, res) => {
  const c = db.collection(req.params.col);
  const last = await c.find().sort({ _id: -1 }).limit(1).toArray();
  const doc = { _id: (last[0] ? last[0]._id : 0) + 1, ...clean(req.body) };
  await c.insertOne(doc);
  res.json(doc);
}));

// UPDATE action and MongoDB call_ updateOne()
app.put('/api/:col/:id', wrap(async (req, res) => {
  await db.collection(req.params.col).updateOne({ _id: Number(req.params.id) }, { $set: clean(req.body) });
  res.json({ ok: true });
}));

// DELETE action and MongoDB call_ deleteOne()
app.delete('/api/:col/:id', wrap(async (req, res) => {
  await db.collection(req.params.col).deleteOne({ _id: Number(req.params.id) });
  res.json({ ok: true });
}));

client.connect().then(() => {
  db = client.db('campus_lost_found');
  app.listen(3000, () => console.log('Running at http://localhost:3000'));
}).catch(e => console.error('Could not connect to MongoDB. Is it running?', e.message));
