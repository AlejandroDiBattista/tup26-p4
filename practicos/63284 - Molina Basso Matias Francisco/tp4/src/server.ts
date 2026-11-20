import { app } from "./app.js";
import { client } from "./db/index.js";

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () =>
  console.log(`MiniCRM: http://localhost:${port}`),
);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () =>
    server.close(() => {
      client.close();
      process.exit(0);
    }),
  );
}
