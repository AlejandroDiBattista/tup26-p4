import { app } from './app.ts';

const PUERTO = 3000;

app.listen(PUERTO, () => {
  console.log(`MiniCRM andando en http://localhost:${PUERTO}`);
});