const test = require('node:test');
const assert = require('node:assert/strict');
const { createDb } = require('../src/db');
const { createApp } = require('../src/app');

let server, base;
test.before(async () => {
  server = createApp(createDb(':memory:')).listen(0);
  base = `http://localhost:${server.address().port}`;
});
test.after(() => server.close());

const call = (method, path, body) =>
  fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
const sample = { name: 'Asha Rao', email: 'Asha@Example.com', course: 'CSE', year: 2 };

test('full CRUD lifecycle', async () => {
  let r = await call('POST', '/api/students', sample);
  assert.equal(r.status, 201);
  const created = await r.json();
  assert.equal(created.email, 'asha@example.com'); // normalised

  r = await call('GET', `/api/students/${created.id}`);
  assert.equal(r.status, 200);

  r = await call('PATCH', `/api/students/${created.id}`, { year: 3 });
  assert.equal((await r.json()).year, 3);

  r = await call('PUT', `/api/students/${created.id}`, { ...sample, name: 'Asha R', email: 'asha@example.com' });
  assert.equal((await r.json()).name, 'Asha R');

  r = await call('GET', '/api/students?search=asha');
  assert.equal((await r.json()).total, 1);

  r = await call('DELETE', `/api/students/${created.id}`);
  assert.equal(r.status, 204);
  r = await call('GET', `/api/students/${created.id}`);
  assert.equal(r.status, 404);
});

test('validation and error handling', async () => {
  let r = await call('POST', '/api/students', { name: 'A', email: 'bad', course: '', year: 9 });
  assert.equal(r.status, 400);
  assert.equal(Object.keys((await r.json()).details).length, 4);

  await call('POST', '/api/students', { ...sample, email: 'dup@example.com' });
  r = await call('POST', '/api/students', { ...sample, email: 'dup@example.com' });
  assert.equal(r.status, 409);

  r = await call('GET', '/api/students/abc');
  assert.equal(r.status, 400);
  r = await call('DELETE', '/api/students/9999');
  assert.equal(r.status, 404);
  r = await fetch(base + '/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.equal(r.status, 400);
});

test('pagination', async () => {
  for (let i = 0; i < 12; i++) await call('POST', '/api/students', { ...sample, email: `p${i}@example.com` });
  const body = await (await call('GET', '/api/students?limit=5&page=2')).json();
  assert.equal(body.data.length, 5);
  assert.equal(body.page, 2);
});
