require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { getDb } = require('./db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'sql-dashboard-api' });
});

app.post('/api/results', async (req, res) => {
  try {
    const {
      imagePath = '',
      disease,
      severity = 'unknown',
      confidence = 0,
      locationLabel = 'My Farm',
      lat = 0,
      lng = 0,
      timestamp,
      diseaseDetails = {},
    } = req.body || {};

    if (!disease || typeof disease !== 'string') {
      return res.status(400).json({ ok: false, error: 'disease is required' });
    }

    const normalizedTimestamp =
      typeof timestamp === 'string' && timestamp.trim()
        ? timestamp
        : new Date().toISOString();

    const db = await getDb();
    const result = await db.run(
      `INSERT INTO dashboard_results (
        image_path, disease, severity, confidence, location_label,
        lat, lng, timestamp, disease_details_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        imagePath,
        disease,
        severity,
        Number(confidence) || 0,
        locationLabel,
        Number(lat) || 0,
        Number(lng) || 0,
        normalizedTimestamp,
        JSON.stringify(diseaseDetails || {}),
      ],
    );

    return res.status(201).json({ ok: true, id: result.lastID });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/results', async (_req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      `SELECT id, image_path, disease, severity, confidence, location_label, lat, lng, timestamp, disease_details_json
       FROM dashboard_results
       ORDER BY datetime(timestamp) DESC, id DESC`,
    );

    const items = rows.map((row) => {
      let diseaseDetails = {};
      try {
        diseaseDetails = JSON.parse(row.disease_details_json || '{}');
      } catch (_) {
        diseaseDetails = {};
      }

      return {
        id: row.id,
        imagePath: row.image_path || '',
        disease: row.disease || 'Unknown Disease',
        severity: row.severity || 'Unknown',
        confidence: typeof row.confidence === 'number' ? row.confidence : 0,
        locationLabel: row.location_label || 'My Farm',
        lat: typeof row.lat === 'number' ? row.lat : 0,
        lng: typeof row.lng === 'number' ? row.lng : 0,
        timestamp: row.timestamp,
        diseaseDetails,
      };
    });

    return res.json({ ok: true, items });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

const port = Number(process.env.PORT || 5050);

app.listen(port, async () => {
  await getDb();
  console.log(`SQL dashboard API listening on http://localhost:${port}`);
});
