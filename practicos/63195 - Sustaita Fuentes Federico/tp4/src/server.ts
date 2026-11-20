import app from './app';
import { sembrar } from './db/seed';

const PUERTO = Number(process.env.PORT ?? 3000);

sembrar();

app.listen(PUERTO, () => {
  console.log(`MiniCRM en http://localhost:${PUERTO}`);
});
