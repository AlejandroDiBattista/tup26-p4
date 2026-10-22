import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

app.listen(PORT, () => console.log(`http://localhost:${PORT}/MiniCRM.html`));
