const express = require("express");
const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(routes);

app.disable("x-powered-by");

module.exports = app;