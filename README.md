# CLOAK (`cloak`)

```text
   ____ _     ___   _    _  __
  / ___| |   / _ \ / \  | |/ /
 | |   | |  | | | / _ \ | ' / 
 | |___| |__| |_| / ___ \| . \ 
  \____|_____\___/_/   \_\_|\_\  v1.0.0
  ───────────────────────────────────────
  Local-first privacy shield for AI logs
```

<p align="center">
  <img src="https://img.shields.io/badge/Language-TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/AI_Engine-Google_Gemma_4-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemma" />
  <img src="https://img.shields.io/badge/Local_Inference-Ollama_(Offline)-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama" />
  <img src="https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT" />
  <img src="https://img.shields.io/badge/Security-Zero_Egress_Localhost-6366F1?style=for-the-badge" alt="Localhost" />
</p>

> **Don't let your emergency production fix become your next data breach.**  
> Cloak sits directly between your terminal, clipboard, and AI models. It intercepts raw production errors and stack traces, redacts real credentials into syntactically valid synthetic mocks, queries **Gemma**, and deterministically inverts placeholders back into your real host secrets in the final fix.

---

## ⚡ The Zero-Knowledge Workflow

```text
PS > cloak ask "Explain the error and give fix command"

  [INPUT SANITIZATION] (Source: clipboard)
  [-] RED: Raw Sensitive Secret  ->  [+] GREEN: Safe Synthetic Mock

  [-] sk_live_mock_stripe_key_prod_99182 [STRIPE_KEY]
   -> [+] sk_live_mock_stripe_key_01

  [-] 192.168.1.55 [IPV4]
   -> [+] 10.0.0.101

  [-] eyJhbGciOiJIUzI1N...Lm3k2Vx81nK9p7LmQ [JWT]
   -> [+] <CLOAK_JWT_TOKEN_01>

  [-] finance-director@enterprise-client.com [EMAIL]
   -> [+] dev_user_01@example.internal

  [OK] Sanitized 4 secrets locally. Payload locked for zero-knowledge query.

? Select Gemma runtime engine:
❯ Gemma 4 26B-A4B (API) · Fast Mixture-of-Experts
  Gemma 4 31B (API) · Flagship deep reasoning
  Gemma Local (Ollama: gemma2:2b) · 100% Offline
  [X] Cancel / Exit

  [ / ] Querying gemma-4-26b-a4b-it (Gemini API)...
  [OK] Model reasoning complete.

  [OUTPUT REHYDRATION] (Deterministic Local Inversion)
  [+] GREEN: AI Synthetic Mock  ->  [-] RED: Restored Local Host Value

  [+] sk_live_mock_stripe_key_01 [STRIPE_KEY]
   -> [-] sk_live_mock_stripe_key_prod_99182

  [+] 10.0.0.101 [IPV4]
   -> [-] 192.168.1.55

  [+] <CLOAK_JWT_TOKEN_01> [JWT]
   -> [-] eyJhbGciOiJIUzI1N...Lm3k2Vx81nK9p7LmQ

  [+] dev_user_01@example.internal [EMAIL]
   -> [-] finance-director@enterprise-client.com

  [FINAL SOLUTION]
  ┌──────────────────────────────────────────────────────────────────────
  │ ### Error Analysis
  │ The billing-webhook-service failed due to credential rejection on key:
  │ sk_live_mock_stripe_key_prod_99182.
  │
  │ ### Fix Command
  │ kubectl create secret generic stripe-credentials \
  │   --from-literal=STRIPE_SECRET_KEY='<ACTUAL_KEY>' \
  │   --dry-run=client -o yaml | kubectl apply -f -
  │ kubectl rollout restart deployment/billing-webhook-service
  └──────────────────────────────────────────────────────────────────────
  [OK] All identifiers accurately restored to your real environment.
```

---

## 🛠 Tech Stack & Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      DEVELOPER LOCAL MACHINE                           │
 │                                                                        │
 │  [ Terminal / kubectl / docker ]    [ Clipboard (Ctrl+C from Sentry) ] │
 │               │                                     │                  │
 │               └─────────────────┬───────────────────┘                  │
 │                                 ▼                                      │
 │                       ┌───────────────────┐                            │
 │                       │   @cloak/core     │                            │
 │                       │ • Format Sniffer  │                            │
 │                       │ • Semantic AST    │                            │
 │                       │ • Shannon Entropy │                            │
 │                       └─────────┬─────────┘                            │
 │                                 │                                      │
 │                 ┌───────────────┴───────────────┐                      │
 │                 ▼                               ▼                      │
 │    ┌─────────────────────────┐     ┌────────────────────────┐          │
 │    │  IN-MEMORY VAULT LEDGER │     │   CLOAKED PAYLOAD      │          │
 │    │  { Real ⟷ Synthetic }   │     │  (Valid Mocks Only)    │          │
 │    └────────────┬────────────┘     └────────────┬───────────┘          │
 └─────────────────┼───────────────────────────────┼──────────────────────┘
                   │                               │
                   │               ┌───────────────┴──────────────┐
                   │               ▼                              ▼
                   │     [ Gemma 4 Cloud API ]          [ Gemma Local (Ollama) ]
                   │     (Gemini 26B-A4B / 31B)         (100% Offline Engine)
                   │               │                              │
                   │               └───────────────┬──────────────┘
                   ▼                               ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │  REHYDRATION ENGINE                                                    │
 │  Inverts synthetic placeholders back to real database endpoints/keys  │
 │                                 │                                      │
 │                                 ▼                                      │
 │               [ Actionable Fix Ready for Terminal ]                    │
 └────────────────────────────────────────────────────────────────────────┘
```

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Core Privacy Engine** | TypeScript, RegEx AST, Shannon Entropy | Zero-dependency deterministic tokenizer and in-memory Session Vault |
| **Terminal CLI** | Node.js, Commander, Chalk, Inquirer Prompts | High-performance interactive CLI with paired diffs & buffer animations |
| **AI Runtime** | Google GenAI SDK (`@google/genai`) & Ollama REST | Native integration with Gemma 4 (31B, 26B-A4B) & offline Gemma 2 models |
| **Web Companion** | React 19, Vite, Tailwind-style Vanilla CSS | Real-time browser companion UI with live side-by-side ledger inspection |

---

## 🚀 Quickstart

### Installation

```bash
# Clone the repository
git clone https://github.com/Abhi6537/logsanitizer.git
cd logsanitizer

# Install dependencies and build
npm install
npm run build

# Link CLI globally to your PATH
npm link --workspace=cloak
```

### Daily Usage Commands

```bash
# 1. Ask Gemma directly from your clipboard (Copy error with Ctrl+C, then run):
cloak ask "What caused this and how do I fix it?"

# 2. From a specific log file:
cloak ask -f ./fixtures/prisma-rds-crash.log

# 3. 100% Offline (Zero network egress via local Ollama):
cloak ask --local -f ./fixtures/python-celery-crash.log

# 4. Clipboard Shield for Web AI (ChatGPT / Claude / Gemini Web):
cloak clip     # Masks secrets on clipboard with safe mocks
cloak restore  # Rehydrates AI response back to real host values

# 5. Unix Pipe Workflow:
kubectl logs -n prod deployment/billing-api --tail=100 | cloak ask
cat error.log | cloak > safe-output.log

# 6. Launch Companion Web Dashboard:
cloak ui       # Opens http://localhost:3000
```

---

## 🛡 What Cloak Detects & Masks

Unlike naive tools that replace strings with `[REDACTED]` (which breaks JSON parsing and confuses LLMs), Cloak substitutes **syntactically compatible synthetic mocks**:

| Category | Real Production Secret | Synthetic Safe Mock |
| :--- | :--- | :--- |
| **Database URIs** | `postgresql://usr:pass99!@prod-db.us-east-1.rds.amazonaws.com:5432/main` | `postgresql://dev_usr_01:mock_cred_01@internal-mock-db-01.mock:5432/sandbox_db` |
| **AWS Access Keys** | `AKIA7K9P2X4M1W8V3T0Q` | `AKIA0000EXAMPLE01` |
| **Stripe Keys** | `sk_live_mock_stripe_key_prod_99182` | `sk_live_mock_stripe_key_01` |
| **JWT Tokens** | `eyJhbGciOiJIUzI1Ni...SflKxwRJ` | `<CLOAK_JWT_TOKEN_01>` |
| **Internal IPv4** | `10.244.3.89`, `192.168.1.104` | `10.0.0.101`, `10.0.0.102` |
| **Cloud Hostnames**| `redis-cluster-cache.us-east-1.rds.amazonaws.com` | `internal-mock-db-01.mock` |
| **Customer Emails**| `finance-director@enterprise-client.com` | `dev_user_01@example.internal` |
| **Private Keys** | `-----BEGIN PRIVATE KEY----- ...` | `-----BEGIN PRIVATE KEY-----\nMOCK_KEY_DATA_01...` |

---

## 🔒 Security & Privacy Guarantees

* **Zero Disk Persistence:** Token mappings are stored strictly in temporary RAM (`SessionVault`). Once your command completes or session closes, mappings are destroyed.
* **Preserves Code Integrity:** Maintains port numbers, query strings, and schema definitions so Gemma has full technical context to diagnose network timeouts and syntax errors.
* **No Telemetry / No Tracking:** Cloak does not collect analytics or track your requests.

---

## 🧪 Testing

```bash
# Run automated vitest test suite
npm test
```

---

## 📄 License
Released under the [MIT License](LICENSE).
