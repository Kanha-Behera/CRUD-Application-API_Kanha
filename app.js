const express = require('express');
const studentsRouter = require('./routes/students');

function createApp(db) {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/students', studentsRouter(db));

  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

  // Central error handler: bad JSON, unique-constraint violations, anything unexpected
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'A student with that email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
