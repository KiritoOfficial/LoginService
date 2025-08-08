const express = require("express");
const crypto = require("./utils/crypto");

const login = require("./middlewares/login");

const router = express.Router();

router.get("/login", login.handle);

module.exports = router;