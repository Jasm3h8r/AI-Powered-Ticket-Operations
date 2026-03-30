const {
  analyzeAndSaveTicket,
  getRecentTickets,
  setTicketStatus
} = require("../services/ticketService");

function analyzeTicketController(req, res, next) {
  try {
    const { message, customerName, customerEmail, product } = req.body || {};
    const result = analyzeAndSaveTicket(message, customerName, customerEmail, product);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

function listTicketsController(req, res, next) {
  try {
    const tickets = getRecentTickets(req.query.limit, req.query.customerEmail);
    res.json({ tickets });
  } catch (error) {
    next(error);
  }
}

function updateTicketStatusController(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const result = setTicketStatus(id, status);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeTicketController,
  listTicketsController,
  updateTicketStatusController
};
