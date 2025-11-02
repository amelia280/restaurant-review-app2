// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple API route (proves Node.js backend is working)
app.get('/api/status', (req, res) => {
  res.json({ message: 'Node.js backend is running!', status: 'OK' });
});

// Serve React frontend in production (optional)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ Node.js backend running on http://localhost:${PORT}`);
});