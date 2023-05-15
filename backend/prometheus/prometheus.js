const express = require("express");
const router = express.Router();
const register = require("./config/prometheus");

router.get("/metrics", (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  register.metrics().then((metricsBody) => {
    res.end(metricsBody);
  });
});

module.exports = router;
