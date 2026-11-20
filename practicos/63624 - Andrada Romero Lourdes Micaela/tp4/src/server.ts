import { app } from "./app.ts";

const PUERTO = Number(process.env.PORT ?? 3000);

app.listen(PUERTO, () => {
  console.log(`MiniCRM en http://localhost:${PUERTO}`);
});
