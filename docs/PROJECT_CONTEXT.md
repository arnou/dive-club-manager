# Y'a plouf ! — Project context for Codex

> Handoff summary of a prior ChatGPT conversation. This is a product specification and decision log, **not** evidence that code, documentation, or GitHub issues are fully implemented. Inspect the repository to establish actual state.

## Repository and project management
- GitHub: https://github.com/arnou/ya-plouf
- Public open-source license target: AGPL-3.0.
- A Python `import_issues.py` was discussed for 27 GitHub issues, labels, and five milestones. A previous version used unsupported `gh api --slurp`; corrected parsing used `json.JSONDecoder.raw_decode` over concatenated pages. Verify the actual script in the repository before relying on it.
- Intended milestones:
  - M1 - Fondations
  - M2 - Adherents et inscriptions
  - M3 - Securite et hors ligne
  - M4 - Formations et finances
  - M5 - Qualite et deploiement
- Recommended GitHub Project views: detailed Backlog, Kanban, concise Roadmap with five `epic` issues filtered by `label:epic`. `Priority` is a manually created single-select field, not automatically synchronized with priority labels.
- GitHub issue #13: https://github.com/arnou/ya-plouf/issues/13 — 'Initialiser la feuille de sécurité depuis les inscriptions'. Its initial acceptance criteria were DP-triggered initialization, manual add/remove, and reimport without overwriting validated edits.

## Product scope
### Members
Identity/contact details; currently held diving level; complementary qualifications; last CACI (medical fitness certificate) date; training enrollments. Never confuse held qualification with target qualification in training.

### Outings and registrations
Responsible user creates outing with location/date/time/capacity. Configurable templates produce a self-hosted member signup form, email invitation with form link, and a shared Google Calendar event through an interchangeable adapter. Registrations have confirmed/waitlisted/cancelled states; no duplicate signup. Responsible user manages registrations; DP prepares safety sheet.

### Safety sheet — functional specification (proposed, not fully approved)
- Only authorized DP or explicitly delegated person may initialize. No automatic initialization when registrations close.
- Initial creation from confirmed registrations; allow empty sheet and manual participant entry.
- Preview import and warnings before committing; server-side transaction and idempotency.
- Copy snapshots, not only references: member ID, identity, held level valid at outing/dive date, relevant supplemental qualifications, last CACI date, derived expiration/status (according to configurable and versioned applicable rule), registration ID/status, import timestamp and actor.
- DP-only fields start unset: presence 'to confirm', actual role, palanquée, completed dives, observations.
- Check authorization, outing state, concurrent initialization, duplicate registrations, missing member references, absent/inconsistent/expired CACI, unknown or contradictory qualifications. Assess validity at each dive date for multi-day outings.
- Import alerts should not automatically assert fitness or permission to dive. DP makes operational decision.
- Reconciliation compares new confirmed registrations and changes after initialization. New registrants are proposed; duplicates not created; cancellation flagged; manual participants may be linked to subsequent registration; previously removed participants not silently restored; changed level/CACI offered as before/after review; DP palanquée/role/presence edits never overwritten.
- Offline: first initialization and new registration imports online before the DP device reserves outing; local operational edits offline, later idempotent sync; server-side incoming registrations reconciled after sync.
- Separate entities for registration, safety-sheet participant/snapshot, and actual participation per dive. Actual role belongs to each dive and drives fees.
- Audit origin and changes; ensure concurrent operations and sync do not duplicate participants.

#### Open decisions — ask product owner, do not assume
1. Can non-member guests be manually added with verified identity/qualifications?
2. Missing/expired CACI: import with warning and no automatic approval, or block addition until resolved? (Recommended previously: warning.)
3. Changes to level/CACI after import: DP-approved update with audit, or automatic refresh only for fields not edited by DP? (Recommended previously: DP-approved.)
4. Exact CACI validity rules and applicable federation/regulatory context need confirmation. Do not hardcode one-year validity as universal.
5. Exact required safety-sheet fields/export format should be confirmed against club and regulatory requirements.

### DP offline workflow
One designated DP device per outing with exclusive server-side lease/reservation. IndexedDB local persistence, service worker, explicit online/offline status, unique event IDs, idempotent sync and conflict resolution. No offline financial posting. Recovery process required if device is lost/unavailable.

### Training and finance
Training enrollment owns training credits. Immutable ledger of allocation/consumption/reversal; no mutable authoritative counter. One centrally configured price per completed dive, effective-date price history, no per-outing tariff and no prorating. For each dive, actual encadrant role -> free and no credit consumed; eligible student on a training dive -> consume one credit and free; otherwise charge; leisure dive paid even for trainees; cancelled/not-completed dive -> no charge/credit. Correcting role reverses prior credit consumption if applicable. Fee sheet lifecycle draft -> checked -> approved -> posted -> archived; posting atomic/idempotent; money in cents; auditable member-account movements and payments; corrections by reversals.

## Architecture target
React/TypeScript/Vite PWA; portable Hono TypeScript API; pure domain/application packages; PostgreSQL adapter; Docker Compose local; optional Cloudflare Workers adapter; calendar/email integrations through ports and adapters. Avoid vendor coupling in domain.

## Suggested entities
members, qualifications, outings, registrations, dives, dive_participants, training, training_enrollments, credit_movements, unit_price_history, fee_sheets, fee_lines, member_accounts, financial_movements, payments, users, roles, permissions, audit, form/email/event templates, publication/sync state, safety_sheet, safety_sheet_participants, snapshots.

## Implementation priorities
1. Inspect current repo, docs, schema, issues, tests, and git status.
2. Confirm open product decisions for issue #13.
3. Propose detailed API contracts and PostgreSQL schema for safety-sheet initialization and reconciliation.
4. Implement in small testable increments: permissions, snapshots, validations, reconciliation, audit, idempotency.
5. Add integration tests covering CACI/qualification edge cases, duplicate registration, cancellation, manual DP changes, concurrent initialization, multi-day outings, and offline reconnection.

## Caution on earlier artifacts
Previous chat mentioned downloadable starter/documentation/issues ZIPs but their creation was not verified in that conversation. Do not treat those archives as existing or as authoritative without checking files.
