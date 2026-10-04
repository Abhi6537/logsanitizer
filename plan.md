# Cloak (`cloak`) — Step-by-Step Implementation Plan

Following all guidelines specified in [persona.md](file:///c:/Users/ghosh/OneDrive/Desktop/sanitizer/persona.md):
- **Understand before coding**
- **Build step-by-step & module-by-module**
- **Separate core logic from I/O**
- **Security & privacy first**
- **Human codebase (no AI boilerplate, clean and purposeful)**

---

## Phase 1: Repository Foundation & Workspace Architecture

### Milestone 1.1: Monorepo & TypeScript Configuration
- Initialize clean workspace root `package.json` with npm/pnpm workspaces.
- Configure strict `tsconfig.json` across packages (`core`, `cli`, `web`).
- Configure test runner (`vitest`) for lightning-fast, zero-overhead unit testing.
- Verify build scripts and linting without over-engineering.

---

## Phase 2: Core Sanitization Engine (`packages/core`)

*Zero I/O dependencies. Pure, deterministic, highly testable TypeScript.*

### Milestone 2.1: Domain Models & Types (`src/types.ts`)
- Define discrete entity categories: `AWS_KEY`, `GITHUB_TOKEN`, `JWT`, `IPV4`, `HOSTNAME`, `EMAIL`, `UUID`, `CONNECTION_STRING`.
- Define `SanitizedResult`, `VaultEntry`, `MaskedEntity`, and `Session` interfaces.

### Milestone 2.2: Pattern Detection Rules (`src/patterns.ts`)
- Build curated, boundary-safe regular expressions with negative lookarounds:
  - AWS Access Keys (`AKIA[0-9A-Z]{16}`)
  - GitHub Personal Access Tokens (`ghp_[a-zA-Z0-9]{36}`)
  - JWT Tokens (`eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+`)
  - IPv4 Addresses (`\b(?:\d{1,3}\.){3}\d{1,3}\b` with private IP range identification)
  - Cloud Hostnames (`*.rds.amazonaws.com`, internal clusters)
  - Emails (`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
  - Database connection strings (`postgres://...`, `mongodb://...`)
- Unit test patterns against false-positive benchmarks (e.g., `app.listen(3000)` must not match an IP or ID).

### Milestone 2.3: Deterministic Mock Replacer (`src/replacer.ts`)
- Implement deterministic generator:
  - Counter and hash-based semantic substitutions.
  - Ensures `user_a@test.com` always maps to `dev_usr_01@example.com` within the same session.
  - Generates structurally matching syntax (valid IP structure, valid email structure).

### Milestone 2.4: Session Vault Storage (`src/vault.ts`)
- In-memory bidirectional key-value store with JSON / SQLite fallback.
- Bidirectional lookup: `realToMock` and `mockToReal`.
- TTL auto-expiry mechanism (60 minutes).
- Export / import session states safely.

### Milestone 2.5: Format-Aware Sniffer & Sanitizer (`src/sniffer.ts` & `src/sanitizer.ts`)
- Format Sniffer: Detects JSON lines vs Stacktraces vs Generic logs.
- JSON Leaf Sanitizer: Parses JSON, walks strings, replaces values, re-serializes.
- Stack Trace Sanitizer: Preserves file paths and line numbers, redacting only usernames.
- Comprehensive end-to-end unit tests.

### Milestone 2.6: Reverse Rehydrator Engine (`src/rehydrator.ts`)
- Scans AI text responses for active session mock tokens.
- Replaces synthetic tokens with real source identifiers.
- Guarantees zero collision with standard English prose.
- Unit test suite for edge-case recovery.

---

## Phase 3: The Developer CLI (`packages/cli`)

*Fast, ergonomic, human-feeling command line tool.*

### Milestone 3.1: Command Architecture & CLI Entry (`src/index.ts`)
- Setup `commander` with clear subcommands:
  - `cloak clip` (main clipboard workflow)
  - `cloak restore` (rehydrate clipboard)
  - `cloak ask <question>` (query Gemma 4)
  - `cloak ui` (launch dashboard)
  - stdin/stdout Unix pipeline mode (`cat log | cloak`)

### Milestone 3.2: Clipboard Bridge (`src/clipboard.ts`)
- Cross-platform clipboard read/write handler (`clipboardy`).
- Graceful fallbacks for headless/CI environments.

### Milestone 3.3: Terminal UI & ASCII Aesthetics (`src/ui/`)
- Sleek ASCII logo & header banner.
- High-contrast summary report tables using `chalk` and clean box borders.
- Verbose diff mode (`--verbose`, `-v`) highlighting detected vs masked values.

### Milestone 3.4: Gemma 4 Integration (`src/ai.ts`)
- Official Gemini API SDK configured to use **Gemma 4** open-weights model.
- Automatically takes sanitized prompt $\rightarrow$ streams response $\rightarrow$ runs rehydrator $\rightarrow$ prints executable fix to terminal.

---

## Phase 4: Companion Local Web Dashboard (`packages/web`)

*High-impact visual interface for hackathon demos and non-terminal users.*

### Milestone 4.1: React + Vite Setup
- Clean, dark-mode developer UI inspired by modern devtools (Linear / Vercel style).
- 3-column split view:
  1. Input Pane (paste raw logs)
  2. Live Diff Viewer (red detected secrets, green mock replacements)
  3. AI Response & Rehydration Viewer (with raw vs rehydrated toggle switch)

### Milestone 4.2: Core Engine Linking
- Connect Web UI directly to `packages/core` for zero-latency in-browser sanitization.

---

## Phase 5: Verification, Benchmarks & Demo Scenarios

### Milestone 5.1: Real-World Test Scenarios
- Scenario 1: PostgreSQL connection timeout with leaked RDS endpoint, port, and credentials.
- Scenario 2: Node.js payment webhook stack trace with leaked Stripe Bearer token & customer email.
- Scenario 3: Kubernetes Docker log dump with private node IPs and UUIDs.

### Milestone 5.2: Verification Checklist
- [ ] No real secrets ever sent in network requests.
- [ ] Stdin / stdout pipeline performance < 20ms.
- [ ] Rehydration accurately translates 100% of synthetic tokens in code blocks.
- [ ] Test coverage on core engine > 90%.
