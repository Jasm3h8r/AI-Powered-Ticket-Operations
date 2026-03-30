
# 🚀 AI-Powered Support Ticket Operations (v4)

A full-stack application that analyzes support tickets using **local heuristic NLP logic (no external AI APIs)**, stores results, and visualizes them in a dashboard.

---

## 🛠 Tech Stack

**Backend**

* Node.js
* Express
* SQLite (`better-sqlite3`)

**Frontend**

* React + Vite

**Testing**

* Vitest

**DevOps**

* Docker + Docker Compose

---

## ✨ Features

### 🔐 Authentication

* `POST /auth/login`

  * Role-based login (`Client` / `Admin`)

### 🎫 Ticket Processing

* `POST /tickets/analyze` → Analyze & store ticket
* `GET /tickets` → Fetch recent tickets (latest first)
* `PATCH /tickets/:id/status` → Update ticket status

Supported statuses:

```
incoming | in_progress | resolved | archived
```

---

## 🧠 NLP / Heuristic Engine

### Classification

* **Category**

  * Billing, Technical, Account, Feature Request, Other
* **Priority**

  * P0, P1, P2, P3

### Analysis Capabilities

* Urgency detection (`urgent`, `asap`, `down`, etc.)
* Keyword extraction
* Signal generation
* Confidence scoring (rule-based)

---

## 🖥 Frontend

* Ticket input + submit
* Analysis result panel:

  * Category
  * Priority
  * Urgency
  * Confidence
  * Signals
  * Keywords
* Recent tickets table
* Loading & error states

---

## 📁 Project Structure

```
backend/
  src/
    analyzer/     
    config/       
    services/     
    controllers/  
    routes/       
    db/           
  tests/          

frontend/
  src/
    main.jsx      
```

---

## 📡 API Contract

### ➤ POST `/tickets/analyze`

**Request**

```json
{
  "message": "Production is down, urgent issue after deploy"
}
```

**Response**

```json
{
  "id": 1,
  "message": "Production is down, urgent issue after deploy",
  "category": "Technical",
  "priority": "P0",
  "urgency": true,
  "confidence": 0.78,
  "signals": ["urgency_detected", "severity_terms_detected"],
  "keywords": ["down", "urgent", "production", "deploy"]
}
```

---

### ➤ GET `/tickets`

```json
{
  "tickets": [
    {
      "id": 3,
      "message": "...",
      "category": "Billing",
      "priority": "P2",
      "urgency": false,
      "confidence": 0.46,
      "signals": ["severity_terms_detected"],
      "keywords": ["refund", "invoice"],
      "createdAt": "2026-03-21 10:20:30"
    }
  ]
}
```

---

### ➤ POST `/auth/login`

```json
{
  "role": "client",
  "name": "Jane Smith",
  "email": "jane@example.com"
}
```

> Note: `email` is optional for admin users.

---

### ➤ PATCH `/tickets/:id/status`

```json
{
  "status": "resolved"
}
```

---

## ⚙️ Local Setup

### Backend

```bash
cd backend
npm install
npm start
```

Runs at: [http://localhost:4000](http://localhost:4000)

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at: [http://localhost:5173](http://localhost:5173)

---

## 🐳 Docker Setup

```bash
docker compose up --build
```

* Frontend → [http://localhost:5173](http://localhost:5173)
* Backend → [http://localhost:4000](http://localhost:4000)

---

## 🔄 Dev Mode (Hot Reload)

* Edit files inside:

  * `backend/src`
  * `frontend/src`
* Auto reload enabled:

  * Backend → nodemon
  * Frontend → Vite

### Clean Restart

```bash
docker compose down
docker compose up --build
```

---

## 🧪 Tests

```bash
cd backend
npm test
```

### Coverage

* Category classification
* Urgency & priority logic
* Fallback handling
* Custom rule

### Results

```
4 passed, 0 failed
```

---

## ⚠️ Custom Rule: Security Escalation

If a ticket contains:

```
security, breach, hacked, data leak, compromised
```

### Behavior

* Category → `Technical`
* Priority → forced to `P0`
* Signal → `custom_security_rule_triggered`

### Example

**Input**

```
We suspect a security breach and possible data leak
```

**Output**

* Priority: `P0`
* Signal: `custom_security_rule_triggered`

---

## 🤔 Reflection

### Design Choices

* Layered architecture:

  ```
  routes → controller → service → analyzer/db
  ```
* Config-driven rules for flexibility
* SQLite for simplicity and portability

---

### Trade-offs

* Keyword-based logic:

  * ✅ Explainable
  * ❌ Not robust to typos or ambiguity
* Heuristic confidence (not ML-based)
* Mixed-intent tickets may misclassify

---

## 🚧 Future Improvements

* Stemming / lemmatization
* Typo tolerance
* Weighted scoring model
* Explainability metadata
* Pagination & filtering
* Integration tests
* Production hardening:

  * Auth
  * Rate limiting
  * Logging
  * DB migrations

---
