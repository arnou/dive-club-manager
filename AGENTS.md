# Instructions for Codex — Dive Club Manager

## Project
Public AGPL-3.0 scuba diving club management PWA: https://github.com/arnou/dive-club-manager

Read `docs/PROJECT_CONTEXT.md` before implementation. Check existing code and GitHub issues before proposing changes. Do not assume any planned feature is already implemented.

## Architecture
- Provider-agnostic hexagonal architecture.
- Frontend: React, TypeScript, Vite, installable PWA.
- Portable HTTP API: Hono, TypeScript.
- Separate pure domain and application packages, API contracts, infrastructure adapters.
- PostgreSQL adapter; Docker Compose for local deployment; optional Cloudflare Workers adapter.
- Google shared calendar integration behind a replaceable adapter; avoid Google-specific domain dependencies.
- Never commit credentials, personal member data, medical information, or production secrets.

## Business invariants
- Diving level held is different from training level sought.
- Outing registrations and the safety sheet are separate; only the authorized dive director (DP) initiates safety-sheet creation.
- Snapshot member's current held qualification and last CACI when importing to safety sheet; validate relative to outing/dive date; highlight missing/invalid data; DP remains decision-maker.
- Reconciliation of late registrations must not overwrite DP edits or reintroduce deliberately removed participants.
- Offline operations belong to one DP device per outing, with an exclusive server-side lease; IndexedDB and idempotent sync. Financial posting is online only.
- One centrally configured price per completed dive, no outing-specific prices and no prorating.
- Role is per actual dive: actual instructor/encadrant is free and consumes no training credit; student on an eligible training dive may consume one credit; leisure dives are paid even for trainees; cancelled/non-completed dives neither charge nor consume credits.
- Training credits use an immutable audited movement ledger; reversals for corrections.
- Fee sheets: draft -> checked -> approved -> posted -> archived. Posting is atomic and idempotent; financial corrections use reversing entries, amounts in cents.

## Working method
- First inspect repository and issue details; report gaps instead of guessing.
- Implement small vertical slices with tests for domain rules and edge cases.
- Preserve offline exclusivity, financial auditability, idempotence, and privacy.
- Do not silently decide open product questions; document options and ask for a decision.
- Keep GitHub issue #13 in focus for safety-sheet initialization unless instructed otherwise.
