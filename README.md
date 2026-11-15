# CRUD API: Students

REST API built with **Node.js + Express + SQLite** (better-sqlite3).

## Run
```bash
npm install
npm start          # http://localhost:3000  (PORT and DB_FILE env vars supported)
npm test           # automated tests (in-memory DB)
```

## Data model: `students`
| column     | type    | rules                          |
|------------|---------|--------------------------------|
| id         | INTEGER | primary key, autoincrement     |
| name       | TEXT    | required, 2-100 chars          |
| email      | TEXT    | required, valid format, UNIQUE |
| course     | TEXT    | required, non-empty            |
| year       | INTEGER | required, 1-6                  |
| created_at | TEXT    | set automatically              |
| updated_at | TEXT    | refreshed on every update      |

## Endpoints
| Method | Path                | Action              | Success | Errors        |
|--------|---------------------|---------------------|---------|---------------|
| POST   | /api/students       | Create              | 201     | 400, 409      |
| GET    | /api/students       | List (filter/page)  | 200     |               |
| GET    | /api/students/:id   | Retrieve one        | 200     | 400, 404      |
| PUT    | /api/students/:id   | Replace (all fields)| 200     | 400, 404, 409 |
| PATCH  | /api/students/:id   | Partial update      | 200     | 400, 404, 409 |
| DELETE | /api/students/:id   | Delete              | 204     | 400, 404      |
| GET    | /health             | Health check        | 200     |               |

List query params: `course`, `year`, `search` (name/email), `page`, `limit` (max 100).

## Example
```bash
curl -X POST localhost:3000/api/students -H "Content-Type: application/json" \
  -d '{"name":"Asha Rao","email":"asha@example.com","course":"CSE","year":2}'

curl "localhost:3000/api/students?course=CSE&page=1&limit=5"
curl -X PATCH localhost:3000/api/students/1 -H "Content-Type: application/json" -d '{"year":3}'
curl -X DELETE localhost:3000/api/students/1
```

## Structure
```
server.js              entry point
src/app.js             Express setup + central error handler
src/db.js              schema + connection
src/validate.js        input validation
src/routes/students.js CRUD endpoints
test/students.test.js  integration tests
```
