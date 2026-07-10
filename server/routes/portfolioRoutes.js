const express = require("express");
const router = express.Router();

const {
  buyStock,
  sellStock,
  getPortfolio,
} = require("../controllers/portfolioController");

router.post("/buy", buyStock);
router.post("/sell", sellStock);
router.get("/:userId", getPortfolio);

module.exports = router;