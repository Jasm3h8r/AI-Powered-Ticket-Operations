const { analyzeTicket } = require("../analyzer/ticketAnalyzer");
const { insertTicket, listTickets, updateTicketStatus } = require("../db/database");

const ALLOWED_PRODUCTS = ["Dashboard", "API", "Billing Portal", "Mobile App", "Other"];
const ALLOWED_STATUSES = ["incoming", "in_progress", "resolved", "archived"];

function validateString(value, fieldName, maxLength = 200) {
  if (typeof value !== "string") {
    const error = new Error(`${fieldName} must be a string`);
    error.statusCode = 400;
    throw error;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    const error = new Error(`${fieldName} is required`);
    error.statusCode = 400;
    throw error;
  }
  if (trimmed.length > maxLength) {
    const error = new Error(`${fieldName} must be at most ${maxLength} characters`);
    error.statusCode = 400;
    throw error;
  }
  return trimmed;
}

function validateMessage(message) {
  return validateString(message, "message", 5000);
}

function validateCustomerName(name) {
  return validateString(name, "customerName", 200);
}

function normalizeOptionalCustomerName(name) {
  if (name == null) {
    return "";
  }
  return validateCustomerName(name);
}

function validateCustomerEmail(email) {
  const trimmed = validateString(email, "customerEmail", 200);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    const error = new Error("customerEmail must be a valid email address");
    error.statusCode = 400;
    throw error;
  }
  return trimmed;
}

function normalizeOptionalCustomerEmail(email) {
  if (email == null || String(email).trim() === "") {
    return "";
  }
  return validateCustomerEmail(email);
}

function validateProduct(product) {
  if (!ALLOWED_PRODUCTS.includes(product)) {
    const error = new Error(`product must be one of: ${ALLOWED_PRODUCTS.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
  return product;
}

function normalizeOptionalProduct(product) {
  if (product == null || String(product).trim() === "") {
    return "Other";
  }
  return validateProduct(product);
}

function analyzeAndSaveTicket(message, customerName, customerEmail, product) {
  const cleanMessage = validateMessage(message);
  const cleanName = normalizeOptionalCustomerName(customerName);
  const cleanEmail = normalizeOptionalCustomerEmail(customerEmail);
  const cleanProduct = normalizeOptionalProduct(product);

  const analysis = analyzeTicket(cleanMessage);

  const id = insertTicket({
    message: cleanMessage,
    customerName: cleanName,
    customerEmail: cleanEmail,
    product: cleanProduct,
    ...analysis
  });

  return {
    id,
    message: cleanMessage,
    customerName: cleanName,
    customerEmail: cleanEmail,
    product: cleanProduct,
    ...analysis
  };
}

function getRecentTickets(limit, customerEmail) {
  const parsedLimit = Number(limit);
  const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 50;
  const emailFilter = customerEmail == null || String(customerEmail).trim() === ""
    ? ""
    : validateCustomerEmail(customerEmail);
  return listTickets(safeLimit, emailFilter);
}

function setTicketStatus(ticketId, status) {
  const id = Number(ticketId);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("ticket id must be a positive integer");
    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    const error = new Error(`status must be one of: ${ALLOWED_STATUSES.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  const updated = updateTicketStatus(id, status);
  if (!updated) {
    const error = new Error("ticket not found");
    error.statusCode = 404;
    throw error;
  }

  return { id, status };
}

module.exports = {
  analyzeAndSaveTicket,
  getRecentTickets,
  setTicketStatus
};
