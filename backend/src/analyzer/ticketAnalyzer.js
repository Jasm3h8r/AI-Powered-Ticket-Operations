const {
  categoryKeywords,
  urgencyKeywords,
  severityWeights,
  securityKeywords
} = require("../config/rules");

function containsTerm(message, term) {
  return message.includes(term);
}

function analyzeTicket(message) {
  const normalized = String(message || "").toLowerCase().trim();

  const categoryMatches = {};
  Object.keys(categoryKeywords).forEach((category) => {
    const matches = categoryKeywords[category].filter((term) => containsTerm(normalized, term));
    categoryMatches[category] = matches;
  });

  let category = "Other";
  let winningCount = 0;

  Object.entries(categoryMatches).forEach(([name, matches]) => {
    if (matches.length > winningCount) {
      category = name;
      winningCount = matches.length;
    }
  });

  const urgencyTerms = urgencyKeywords.filter((term) => containsTerm(normalized, term));
  const severityTerms = Object.keys(severityWeights).filter((term) => containsTerm(normalized, term));
  const securityTerms = securityKeywords.filter((term) => containsTerm(normalized, term));

  let score = 0;
  severityTerms.forEach((term) => {
    score += severityWeights[term] || 0;
  });

  if (urgencyTerms.length > 0) {
    score += 2;
  }

  if (category === "Technical") {
    score += 1;
  }

  if (securityTerms.length > 0) {
    category = "Technical";
    score = Math.max(score, 8);
  }

  let priority = "P3";
  if (score >= 8) {
    priority = "P0";
  } else if (score >= 5) {
    priority = "P1";
  } else if (score >= 3) {
    priority = "P2";
  }

  const allKeywordHits = Object.values(categoryMatches).flat().length + urgencyTerms.length + severityTerms.length;
  const confidenceRaw = winningCount > 0 ? winningCount / Math.max(allKeywordHits, 1) : 0.2;
  const confidence = Number(Math.min(0.99, Math.max(0.2, confidenceRaw + (urgencyTerms.length > 0 ? 0.1 : 0))).toFixed(2));

  const keywords = [...new Set([
    ...categoryMatches[category] || [],
    ...urgencyTerms,
    ...severityTerms,
    ...securityTerms
  ])].slice(0, 12);

  const signals = [];
  if (urgencyTerms.length > 0) {
    signals.push("urgency_detected");
  }
  if (severityTerms.length > 0) {
    signals.push("severity_terms_detected");
  }
  if (securityTerms.length > 0) {
    signals.push("custom_security_rule_triggered");
  }

  return {
    category,
    priority,
    urgency: urgencyTerms.length > 0,
    confidence,
    signals,
    keywords
  };
}

module.exports = {
  analyzeTicket
};
