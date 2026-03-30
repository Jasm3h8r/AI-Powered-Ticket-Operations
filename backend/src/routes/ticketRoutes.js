const express = require("express");
const {
  analyzeTicketController,
  listTicketsController,
  updateTicketStatusController
} = require("../controllers/ticketController");

const router = express.Router();

router.post("/analyze", analyzeTicketController);
router.get("/", listTicketsController);
router.patch("/:id/status", updateTicketStatusController);

module.exports = router;
