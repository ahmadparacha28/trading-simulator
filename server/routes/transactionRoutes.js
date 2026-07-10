const express = require("express");
const router = express.Router();

const {
  getTransactions,
} = require("../controllers/transactionController");

router.get("/:userId", getTransactions);

module.exports = router;