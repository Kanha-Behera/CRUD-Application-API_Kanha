const express = require('express');
const { validateStudent } = require('../validate');

module.exports = function studentsRouter(db) {
  const r = express.Router();

  const q = {
    insert: db.prepare('INSERT INTO students (name, email, course, year) VALUES (@name, @email, @course, @year)'),
    byId:   db.prepare('SELECT * FROM students WHERE id = ?'),
    remove: db.prepare('DELETE FROM students WHERE id = ?'),
  };

  // Parse :id once; reject non-numeric ids with 400
  r.param('id', (req, res, next, raw) => {
    const id = Number(raw);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'id must be a positive integer' });
    req.studentId = id;
    next();
  });

  // CREATE
  r.post('/', (req, res) => {
    const { errors, value } = validateStudent(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', details: errors });
    const { lastInsertRowid } = q.insert.run(value);
    res.status(201).location(`/api/students/${lastInsertRowid}`).json(q.byId.get(lastInsertRowid));
  });

  // READ (list) with optional ?course=&year=&search=&page=&limit=
  r.get('/', (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const where = [], params = {};
    if (req.query.course) { where.push('course = @course'); params.course = req.query.course; }
    if (req.query.year)   { where.push('year = @year');     params.year = Number(req.query.year); }
    if (req.query.search) { where.push('(name LIKE @s OR email LIKE @s)'); params.s = `%${req.query.search}%`; }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = db.prepare(`SELECT COUNT(*) AS n FROM students ${clause}`).get(params).n;
    const data = db.prepare(`SELECT * FROM students ${clause} ORDER BY id LIMIT @limit OFFSET @offset`)
      .all({ ...params, limit, offset: (page - 1) * limit });
    res.json({ data, page, limit, total, pages: Math.ceil(total / limit) });
  });

  // READ (one)
  r.get('/:id', (req, res) => {
    const row = q.byId.get(req.studentId);
    if (!row) return res.status(404).json({ error: 'Student not found' });
    res.json(row);
  });

  // UPDATE: PUT = full replace, PATCH = partial
  const update = (partial) => (req, res) => {
    if (!q.byId.get(req.studentId)) return res.status(404).json({ error: 'Student not found' });
    const { errors, value } = validateStudent(req.body, { partial });
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', details: errors });
    const cols = Object.keys(value);
    const sql = `UPDATE students SET ${cols.map((c) => `${c} = @${c}`).join(', ')}, updated_at = datetime('now') WHERE id = @id`;
    db.prepare(sql).run({ ...value, id: req.studentId });
    res.json(q.byId.get(req.studentId));
  };
  r.put('/:id', update(false));
  r.patch('/:id', update(true));

  // DELETE
  r.delete('/:id', (req, res) => {
    const { changes } = q.remove.run(req.studentId);
    if (!changes) return res.status(404).json({ error: 'Student not found' });
    res.status(204).end();
  });

  return r;
};
