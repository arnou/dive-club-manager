
# AGENTS.md — Dive Club Manager

## 1. Project overview

Dive Club Manager is an open-source web application for
managing scuba diving club activities.

Repository: https://github.com/arnou/dive-club-manager
License: AGPL-3.0
Default branch: main

The application covers:

- Club members and their diving qualifications
- Training enrollments and training credits
- Outings and member registrations
- Safety sheets and dive groups (palanquées)
- Offline operations for the diving director (DP)
- Dive fees and member financial accounts
- Email invitations and shared calendar integration

The project must remain self-hostable and independent
of any specific cloud provider.

## 2. Language and terminology

- Communicate with the user in French.
- Write user-facing interface text in French.
- Use English for source code identifiers.
- Prefer English for commit messages and PR titles.
- Write functional documentation in French.
- Preserve established French diving terminology:
  DP, palanquée, CACI, encadrant, adhérent.

## 3. Source of truth

Before implementing an issue:

1. Read this AGENTS.md file.
2. Read docs/PROJECT_CONTEXT.md if present.
3. Read the GitHub issue and its comments.
4. Inspect the existing code and tests.

Priority when requirements conflict:

1. Explicit instructions from the user
2. Validated business decisions in project documentation
3. GitHub issue acceptance criteria
4. Existing implementation conventions

If requirements are contradictory or a business decision
is missing, ask the user before implementing.

Do not silently invent business rules.

## 4. Architecture

Use a provider-agnostic hexagonal architecture.

Preferred technology stack:

- TypeScript
- React
- Vite
- Progressive Web App (PWA)
- Hono for the portable HTTP API
- PostgreSQL
- IndexedDB for authorized offline operations
- Docker Compose for local deployment

Suggested monorepo structure:

apps/
  web/
  api/

packages/
  domain/
  application/
  contracts/
  infrastructure/

docs/

Architecture rules:

- Domain logic must be pure and independently testable.
- Application use cases must depend on interfaces/ports.
- Infrastructure adapters implement those ports.
- HTTP controllers must not contain business logic.
- Database access must not leak into the domain layer.
- UI components must not implement financial rules.
- Cloudflare-specific code must remain in adapters.
- Google-specific code must remain in adapters.
- Avoid unnecessary dependencies and abstractions.
- Prefer extending existing patterns over introducing
  new frameworks or architectural conventions.

Do not reorganize the repository unnecessarily.

## 5. Provider independence

The application must be deployable without Cloudflare.

Required principles:

- Docker Compose must remain a supported deployment path.
- PostgreSQL is the primary database.
- The HTTP API must be portable.
- Cloudflare Workers may be supported through an adapter.
- Calendar integration must use an interchangeable port.
- Google Calendar is an initial implementation, not
  a domain dependency.
- Email delivery must use an interchangeable port.
- Secrets must be supplied through configuration.

Never hardcode credentials or provider-specific secrets.

## 6. Members and qualifications

A member may have:

- Identity and contact information
- Currently held diving level
- Additional diving qualifications
- Date of the latest CACI
- Training enrollments
- Financial account

Important business rule:

The currently held diving level is distinct from
the level being prepared during training.

For example:

A member who currently holds N2 and is preparing N3
must still be identified as N2 until N3 is obtained.

Do not infer qualifications from training enrollment.

## 7. Outings and registrations

An outing may include:

- Date and location
- Meeting and dive times
- Responsible organizer
- Diving director (DP)
- Capacity and registration deadline
- Registration form
- Email invitations
- Shared calendar event
- Registrations and waiting list

Registration forms must be generated from configurable
templates and hosted by the application.

Registration statuses should distinguish:

- Pending
- Confirmed
- Waiting list
- Cancelled

The organizer manages the outing and registrations.

The DP manages operational diving safety decisions.

Do not assume these roles have identical permissions.

## 8. Safety sheet initialization

The safety sheet must never be initialized automatically
when an outing is created or registrations open.

Initialization is explicitly triggered by an authorized DP.

The initial participant list comes from confirmed
registrations.

For each imported member, retain a snapshot of:

- Member identifier
- Name and first name
- Currently held diving level
- Relevant additional qualifications
- Date of latest CACI
- CACI validation information, when available
- Source registration identifier
- Import timestamp and author

Validation must use the outing or dive date,
not merely the date of import.

Missing, expired, inconsistent, or unverifiable
information must be clearly flagged.

Do not automatically consider a participant fit to dive.

The DP must be able to:

- Confirm actual attendance
- Add a participant manually
- Remove a participant from the operational list
- Adjust relevant participant information
- Assign roles for each dive
- Organize palanquées
- Record actual dive participation

A later reconciliation with registrations must:

- Propose newly confirmed registrants
- Detect existing participants
- Avoid duplicates
- Flag cancellations and changed member data
- Preserve manual DP modifications
- Never silently reintroduce a deliberately removed person
- Be idempotent
- Maintain an audit trail

The following business decisions are still open:

- Whether non-member guests are allowed
- Whether invalid or missing CACI blocks import
  or only raises an alert
- Whether member data changes require explicit DP
  approval before updating the safety sheet

Do not decide these points without user validation.

## 9. Offline operations

Offline mode is reserved for the DP responsible
for a specific outing.

The DP must explicitly reserve the outing for
offline use on one device.

Rules:

- Only one device may hold the exclusive reservation.
- The server enforces the reservation.
- Other devices must not concurrently modify the
  reserved operational data.
- Operational changes are stored locally in IndexedDB.
- Offline operations must survive application restart.
- Synchronization must be idempotent.
- Each offline operation must have a unique identifier.
- Synchronization conflicts must be handled explicitly.
- An audit trail must be preserved.
- Recovery of a lost or unavailable device requires
  an explicit controlled procedure.

Initial safety sheet import and reconciliation with
server registrations require online access.

Financial posting is never performed offline.

Do not introduce unrestricted multi-device offline editing.

## 10. Training and credits

Training enrollments are separate from qualifications
already obtained.

Training credits belong to a specific enrollment.

Credits must be represented by an immutable,
auditable movement ledger.

Do not implement credits as a mutable counter.

Supported operations may include:

- Initial allocation
- Additional allocation
- Consumption
- Reversal or correction

Available credits are derived from ledger movements.

Prevent double consumption and negative balances
through appropriate transactional controls.

## 11. Dive pricing and billing

There is one centrally configured unit price
per completed dive.

The unit price is not configured separately
for each outing.

Preserve the price applicable to the relevant dive
when producing financial records.

Use integer cents for all financial calculations.

Charging rules:

1. A participant who actually acted as an encadrant
   during a dive is not charged for that dive.
2. Acting as an encadrant never consumes a training credit.
3. An eligible student participating in a training dive
   may consume one available training credit.
4. When an eligible credit is consumed, that dive is free.
5. Otherwise, a completed dive is charged at the unit price.
6. A leisure dive is charged even if the participant
   is enrolled in training, unless another explicitly
   validated rule applies.
7. Cancelled or uncompleted dives are not charged
   and do not consume training credits.

Billing must use the actual role during each dive,
not merely the participant's qualifications.

A qualified instructor is not automatically free.

Corrections must preserve financial history.

If an encadrant status correction invalidates a previous
credit consumption, reverse the consumption with
an auditable movement.

## 12. Fee sheets and financial accounts

Fee sheet lifecycle:

- Draft
- Checked
- Approved
- Posted
- Archived

Posting must be:

- Online only
- Atomic
- Idempotent
- Auditable

Do not directly edit posted financial movements.

Corrections must use reversal or adjustment movements.

Member balances must be derived from financial movements.

Ensure that posting cannot produce duplicate charges
or duplicate training-credit consumption.

## 13. Security and privacy

The repository is public.

Never commit:

- Personal member data
- Real medical information
- Credentials
- API keys
- Access tokens
- Production database exports
- Private configuration files

Use fictional data in examples, fixtures, and tests.

Enforce authorization on the server.

Use least-privilege permissions.

Audit sensitive operations, including:

- Safety sheet initialization
- DP overrides
- Offline reservation and recovery
- Credit movements
- Fee sheet approval and posting
- Financial corrections

Avoid exposing unnecessary personal information
in application logs.

## 14. Quality and testing

Every implementation must include appropriate tests.

Prioritize tests for:

- Domain business rules
- Application use cases
- Authorization
- Financial calculations
- Idempotency
- Offline synchronization
- Safety sheet reconciliation
- Transaction boundaries

Before creating a pull request, run the available:

- Linter
- TypeScript type checker
- Unit tests
- Integration tests where applicable
- Production build

Use the scripts already defined by the repository.

Do not claim tests passed if they were not executed.

If a test cannot be run, document why in the PR.

## 15. GitHub issue workflow

Repository: arnou/dive-club-manager
Base branch: main

When the user asks to implement a GitHub issue
by its number, automatically follow this workflow.

### Step 1 — Understand

- Fetch the issue and its comments.
- Read its acceptance criteria.
- Inspect related documentation.
- Inspect the relevant existing implementation.
- Identify dependencies and unresolved requirements.

Ask questions only when necessary to resolve
important ambiguity or contradictory requirements.

### Step 2 — Create a branch

Start from the latest available main.

Use a dedicated branch for each issue.

Branch naming convention:

- feat/<issue-number>-<short-description>
- fix/<issue-number>-<short-description>
- docs/<issue-number>-<short-description>
- refactor/<issue-number>-<short-description>

Examples:

feat/13-safety-sheet-initialization
fix/22-credit-consumption
docs/26-deployment-guide

Never commit directly to main.

If a suitable branch or open PR already exists,
inspect it before creating another one.

Preserve unrelated local changes.

### Step 3 — Implement

- Make the smallest coherent change that satisfies
  the issue's acceptance criteria.
- Follow the established architecture.
- Add or update tests.
- Update documentation when behavior changes.
- Avoid unrelated refactoring.
- Do not introduce unrequested features.

### Step 4 — Validate

Run all relevant checks supported by the repository.

Fix failures introduced by the implementation.

Report pre-existing failures separately.

### Step 5 — Commit and push

Codex is authorized to:

- Create a dedicated branch
- Modify relevant files
- Create commits
- Push the dedicated branch to origin

Use descriptive commit messages.

Prefer conventional commit prefixes:

- feat:
- fix:
- docs:
- test:
- refactor:
- chore:

Do not force-push to main.

Do not commit unrelated changes.

### Step 6 — Create the pull request

Codex is authorized to create a pull request
targeting main.

The PR must contain:

- A clear title
- A summary of the implementation
- A reference to the issue
- The exact text "Closes #<issue-number>"
- The tests executed and their results
- Any remaining limitations
- Screenshots when relevant to UI changes

Prefer a draft PR when the implementation is incomplete.

Do not open a PR claiming the issue is complete
when acceptance criteria remain unmet.

### Step 7 — Hand back to the user

At the end, provide:

- Issue number
- Branch name
- Pull request URL
- Summary of changes
- Tests executed
- Any points requiring review

Do not merge the pull request.

Wait for explicit user approval before merging.

## 16. GitHub permissions and safeguards

The user authorizes Codex to:

- Read repository contents
- Read GitHub issues and comments
- Create dedicated issue branches
- Commit changes
- Push those branches
- Open pull requests

These instructions do not override actual GitHub,
network, sandbox, or environment permissions.

If an operation is blocked by authentication
or environment restrictions, explain the blocker.

Never:

- Push directly to main
- Merge without explicit approval
- Delete branches without explicit approval
- Rewrite shared Git history
- Modify production data
- Change repository visibility
- Change repository secrets
- Disable security checks or branch protections
- Close issues manually without authorization

## 17. Definition of Done

An issue is ready for review when:

- Its acceptance criteria are implemented.
- Relevant tests are present.
- Applicable checks pass or blockers are documented.
- Architecture rules are respected.
- Documentation is updated when necessary.
- No secrets or personal data are introduced.
- A dedicated branch has been pushed.
- A pull request targeting main has been opened.
- The PR references the issue.
- The user has received the PR URL.

The issue is not considered merged or delivered
until the pull request is reviewed and merged.

## 18. Default behavior

For requests such as:

"Traite l'issue #13"
"Implémente l'issue #21"
"Corrige l'issue #8"

Do not ask the user to repeat the workflow.

Read the issue, create the branch, implement,
test, commit, push, and open a pull request
according to this AGENTS.md.

Never merge automatically.
