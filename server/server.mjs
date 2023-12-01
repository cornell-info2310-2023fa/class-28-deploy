import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// connect to MongoDB
import db from './db/conn.mjs';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// delay all requests by 1 second
app.use(function (req, res, next) { setTimeout(next, 1000) });


// vvv all routes go below this line vvv

app.get('/api/alert.json', async (req, res) => {
  const alert = await db.collection('alerts').findOne();
  if (alert) {
    res.json(alert).status(200);
  } else {
    // there is no alert (null)
    // this isn't an error, so we return an empty object
    res.json({}).status(200);
  }
});

app.get('/api/docs.json', async (req, res) => {
  const docs = await db.collection('docs').find()
    .toArray();
  res.json(docs).status(200);
});

app.get('/api/docs/:id.json', async (req, res) => {
  const id = parseInt(req.params.id);
  const doc = await db.collection('docs').findOne({ id: id });
  if (doc) {
    res.json(doc).status(200);
  } else {
    res.status(404).json({ message: 'not found' });
  }
});

app.post('/api/docs/:id/read', async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await db.collection('docs').updateOne({ id: id }, { $inc: { readCount: 1 } });

  if (result.modifiedCount > 0) {
    res.status(200).send();
  } else {
    res.status(404).send();
  }
});

// ^^^ all routes go above this line ^^^


// 404
app.use(function (req, res, next) {
  return res.status(404).json({ message: 'resource ' + req.url + ' not found' });
});

// 500 - Any server error
app.use(function (err, req, res, next) {
  return res.status(500).json({ error: err });
});

// listen for requests
app.listen(port, () => {
  console.log(`app listening on http://localhost:${port}/`);
});
