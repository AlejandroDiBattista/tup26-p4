require("dotenv").config();

const app = require("./app");

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`MiniCRM disponible en http://localhost:${port}`);
});
