const categoryKeywords = {
  Billing: [
    "billing",
    "invoice",
    "payment",
    "charge",
    "charged",
    "refund",
    "subscription",
    "price",
    "pricing",
    "plan"
  ],
  Technical: [
    "error",
    "bug",
    "crash",
    "timeout",
    "latency",
    "down",
    "incident",
    "deploy",
    "server",
    "integration",
    "api"
  ],
  Account: [
    "login",
    "password",
    "account",
    "locked",
    "access",
    "permission",
    "unauthorized",
    "verify",
    "authentication",
    "2fa"
  ],
  "Feature Request": [
    "feature",
    "request",
    "enhancement",
    "improve",
    "roadmap",
    "wish",
    "would love",
    "support for"
  ]
};

const urgencyKeywords = [
  "urgent",
  "asap",
  "immediately",
  "critical",
  "blocker",
  "down",
  "outage",
  "production"
];

const severityWeights = {
  critical: 4,
  outage: 4,
  down: 3,
  blocked: 3,
  blocker: 3,
  fail: 2,
  failing: 2,
  error: 2,
  crash: 3,
  unable: 2,
  cannot: 2,
  asap: 2,
  urgent: 2
};

const securityKeywords = ["security", "breach", "hacked", "data leak", "compromised"];

module.exports = {
  categoryKeywords,
  urgencyKeywords,
  severityWeights,
  securityKeywords
};
