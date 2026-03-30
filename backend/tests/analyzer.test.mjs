import { describe, it, expect } from "vitest";
import ticketAnalyzer from "../src/analyzer/ticketAnalyzer.js";

const { analyzeTicket } = ticketAnalyzer;

describe("ticketAnalyzer", () => {
  it("classifies billing tickets", () => {
    const result = analyzeTicket("I was charged twice and need a refund on my invoice");
    expect(result.category).toBe("Billing");
    expect(result.keywords).toContain("refund");
  });

  it("detects urgency and higher priority for outages", () => {
    const result = analyzeTicket("Production is down, this is urgent and critical");
    expect(result.urgency).toBe(true);
    expect(["P0", "P1"]).toContain(result.priority);
  });

  it("applies custom security rule for priority", () => {
    const result = analyzeTicket("Possible security breach and data leak detected");
    expect(result.category).toBe("Technical");
    expect(result.priority).toBe("P0");
    expect(result.signals).toContain("custom_security_rule_triggered");
  });

  it("falls back to Other category", () => {
    const result = analyzeTicket("Thanks for the great service");
    expect(result.category).toBe("Other");
    expect(result.priority).toBe("P3");
  });
});
