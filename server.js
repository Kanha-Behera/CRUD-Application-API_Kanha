const { createDb } = require('./src/db');
const { createApp } = require('./src/app');

const PORT = process.env.PORT || 3000;
const app = createApp(createDb());
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
