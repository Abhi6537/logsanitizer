# CLOAK (`cloak`)

> **Local-first developer privacy shield for terminal logs and AI assistants.**

Cloak intercepts raw terminal errors, stack traces, and server logs, deterministically tokenizes sensitive production credentials (database connection strings, AWS keys, JWTs, private IPs, emails) into syntactically valid semantic placeholders, and enables two-way reverse rehydration so AI-suggested code fixes can be applied back to your real environment.

---

## ⚡ Quickstart

### 1. Daily Developer Workflow (Clipboard Bridge)
```bash
# 1. An error occurs in VS Code -> Press Ctrl+C (copy error)
# 2. Run cloak clip in your terminal:
node packages/cli/dist/index.js clip

# 3. Paste into ChatGPT / Claude / Copilot / Antigravity -> Zero secrets leaked!
# 4. Copy the AI's response -> Rehydrate real values:
node packages/cli/dist/index.js restore

# 5. Paste fix in your code editor -> Working code with real endpoints!
```

### 2. Direct Terminal AI Query (`cloak ask`)
Query **Gemma 4** open-weights directly from your command line:
```bash
# Cloud API mode (Gemini API):
cat fixtures/postgres-timeout.log | node packages/cli/dist/index.js ask "How do I fix this connection timeout?"

# 100% Offline Air-Gapped mode (local Ollama):
cat fixtures/postgres-timeout.log | node packages/cli/dist/index.js ask --local "Analyze this crash"
```

### 3. Unix Pipeline
```bash
cat server.log | node packages/cli/dist/index.js
```

### 4. Interactive Companion Web Dashboard
```bash
node packages/cli/dist/index.js ui
# Or run directly:
npm run --workspace=@cloak/web dev
# Opens http://localhost:3000
```

---

## 🏗 Architecture

```
[ Developer Terminal / Clipboard ]
                │
                ▼ (Raw logs with secrets)
     ┌──────────────────────┐
     │      `cloak`         │
     │ 1. Format Sniff      │ ───▶ [ Local Session Vault ]
     │ 2. Regex / Pattern   │      (In-Memory / SQLite)
     │ 3. Deterministic Mock│      { real_secret ⟷ synthetic_mock }
     └──────────────────────┘
                │
                ▼ (Clean logs with valid synthetic mocks)
   [ AI Chat / Gemma 4 / Claude / ChatGPT ]
                │
                ▼ (AI fixes with synthetic values)
     ┌──────────────────────┐
     │  `cloak restore`     │ ◀─── [ Local Session Vault ]
     │ (Reverse Rehydration)│
     └──────────────────────┘
                │
                ▼ (Usable commands & fixes with real local hosts/IDs)
[ Ready to execute in local terminal ]
```

---

## 🧪 Testing

```bash
# Run automated vitest test suite
npm run test
```

---

## 🏆 Hackathon Alignment
- **Best Open-Source AI Project:** 100% original developer privacy architecture built on open-weights model standards.
- **Best Use of Gemma 4:** Integrated dual-engine support for Gemma 4 via Gemini API and local Ollama.
