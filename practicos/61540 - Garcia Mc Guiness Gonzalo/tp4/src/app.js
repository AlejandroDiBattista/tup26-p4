const express = require("express");
const path = require("node:path");

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

module.exports = app;
