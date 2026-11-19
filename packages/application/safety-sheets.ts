import { canPrepare, currentSnapshot, differences, warnings } from "../domain/safety-sheet.ts";
import type { Candidate, Outing, Participant, Profile, Sheet, Snapshot } from "../domain/safety-sheet.ts";

export type Action =
  | { kind: "initialize" }
  | { kind: "add_member"; memberId: string }
  | { kind: "add_guest"; profile: Profile; verified: true }
  | { kind: "remove" | "restore"; participantId: string }
  | { kind: "import"; registrationId: string }
  | { kind: "link"; participantId: string; registrationId: string }
  | { kind: "refresh"; participantId: string; registrationId: string; field: "heldLevel" | "qualifications" | "lastCaci" };

export type Result = { revision: number };

export interface SafetyTransaction {
  outing: Outing;
  sheet(): Promise<Sheet | null>;
  registrations(): Promise<Candidate[]>;
  findMember(id: string): Promise<Profile | null>;
  searchMembers(name: string): Promise<{ id: string; firstName: string; lastName: string }[]>;
  receipt(actorId: string, key: string): Promise<{ digest: string; result: Result } | null>;
  save(change: {
    sheet: Sheet;
    changedParticipants: Participant[];
    actorId: string;
    at: string;
    action: Action["kind"];
    field: string | null;
    key: string;
    digest: string;
  }): Promise<void>;
}

export interface SafetyStore {
  transact<T>(outingId: string, run: (tx: SafetyTransaction) => Promise<T>): Promise<T>;
}

export class SafetyError extends Error {
  readonly code;

  constructor(code: "not_found" | "forbidden" | "locked" | "outing_state" | "stale" | "duplicate" | "no_confirmed" | "key_reused") {
    super(code);
    this.code = code;
  }
}

type Dependencies = { store: SafetyStore; now(): string; id(): string; digest(data: unknown): Promise<string> };

export function safetySheets({ store, now, id, digest }: Dependencies) {
  function forDirector<T>(outingId: string, actorId: string, run: (tx: SafetyTransaction) => Promise<T>) {
    return store.transact(outingId, async tx => {
      if (tx.outing.directorId !== actorId) throw new SafetyError("forbidden");
      return run(tx);
    });
  }

  async function context(tx: SafetyTransaction) {
    const sheet = await tx.sheet();
    const candidates = await tx.registrations();
    const { id, status, startsOn } = tx.outing;
    const confirmed = candidates.filter(registration => registration.status === "confirmed");
    const token = await digest({ id, status, startsOn, revision: sheet?.revision, candidates });
    const changes = sheet ? differences(sheet, candidates) : [];
    return { sheet, confirmed, token, changes };
  }

  function writable(outing: Outing) {
    if (outing.reservedDeviceId) throw new SafetyError("locked");
    if (!canPrepare(outing.status)) throw new SafetyError("outing_state");
  }

  function view(outingId: string, actorId: string) {
    return forDirector(outingId, actorId, async tx => {
      const { sheet, confirmed, token, changes } = await context(tx);
      const { startsOn, status, reservedDeviceId } = tx.outing;
      return {
        token,
        revision: sheet?.revision ?? 0,
        startsOn,
        canWrite: !reservedDeviceId && canPrepare(status),
        confirmed: sheet ? [] : confirmed.map(candidate => ({
          ...candidate,
          warnings: warnings(candidate.profile, startsOn),
        })),
        participants: sheet?.participants.map(({ snapshots, ...participant }) => ({
          ...participant,
          snapshot: snapshots[snapshots.length - 1],
          warnings: warnings(snapshots[snapshots.length - 1].profile, startsOn),
        })) ?? [],
        changes: changes.map(change => ({ ...change, warnings: warnings(change.candidate.profile, startsOn) })),
      };
    });
  }

  function mutate(outingId: string, actorId: string, key: string, token: string, action: Action) {
    return forDirector(outingId, actorId, async tx => {
      const digestOfCommand = await digest({ token, action });
      const receipt = await tx.receipt(actorId, key);
      if (receipt) {
        if (receipt.digest !== digestOfCommand) throw new SafetyError("key_reused");
        return receipt.result;
      }

      writable(tx.outing);
      const { sheet, confirmed, token: expected, changes } = await context(tx);
      if (expected !== token) throw new SafetyError("stale");
      if (action.kind === "initialize" && sheet) throw new SafetyError("duplicate");
      if (action.kind !== "initialize" && !sheet) throw new SafetyError("not_found");

      const at = now();
      function snapshot(profile: Profile, source: Snapshot["source"], registration?: Candidate): Snapshot {
        return {
          profile, source, recordedAt: at, recordedBy: actorId,
          registrationId: registration?.id ?? null, registrationStatus: registration?.status ?? null,
        };
      }
      function participant(profile: Profile, source: Snapshot["source"], memberId: string | null, registration?: Candidate): Participant {
        return {
          id: id(), memberId, registrationId: registration?.id ?? null, origin: source,
          present: null, removed: false, snapshots: [snapshot(profile, source, registration)],
        };
      }

      const participants = sheet?.participants ?? [];
      const changedParticipants: Participant[] = [];
      switch (action.kind) {
        case "initialize":
          if (!confirmed.length) throw new SafetyError("no_confirmed");
          changedParticipants.push(...confirmed.map(candidate => participant(candidate.profile, "registration", candidate.memberId, candidate)));
          break;
        case "add_member": {
          if (participants.some(existing => existing.memberId === action.memberId)) throw new SafetyError("duplicate");
          const profile = await tx.findMember(action.memberId);
          if (!profile) throw new SafetyError("not_found");
          changedParticipants.push(participant(profile, "member", action.memberId));
          break;
        }
        case "add_guest": {
          if (!action.verified) throw new SafetyError("forbidden");
          changedParticipants.push(participant(action.profile, "guest", null));
          break;
        }
        case "import": {
          const change = changes.find(change => change.kind === "add" && change.candidate.id === action.registrationId);
          if (!change) throw new SafetyError("stale");
          changedParticipants.push(participant(change.candidate.profile, "registration", change.candidate.memberId, change.candidate));
          break;
        }
        case "remove":
        case "restore": {
          const existing = participants.find(participant => participant.id === action.participantId);
          if (!existing) throw new SafetyError("not_found");
          const removed = action.kind === "remove";
          if (existing.removed === removed) throw new SafetyError("stale");
          changedParticipants.push({ ...existing, removed });
          break;
        }
        case "link":
        case "refresh": {
          const existing = participants.find(participant => participant.id === action.participantId);
          const change = changes.find(change => (change.kind === "link" || change.kind === "refresh")
            && change.kind === action.kind && change.participantId === action.participantId
            && change.candidate.id === action.registrationId
            && (action.kind !== "refresh" || (change.kind === "refresh" && change.field === action.field)));
          if (!existing || !change) throw new SafetyError("stale");
          if (action.kind === "link") {
            changedParticipants.push({ ...existing, registrationId: change.candidate.id });
          } else {
            const profile = { ...currentSnapshot(existing).profile, [action.field]: change.candidate.profile[action.field] };
            changedParticipants.push({ ...existing, snapshots: [...existing.snapshots, snapshot(profile, "registration", change.candidate)] });
          }
          break;
        }
      }

      const revision = (sheet?.revision ?? 0) + 1;
      await tx.save({
        sheet: { revision, participants },
        changedParticipants, actorId, key, digest: digestOfCommand, at, action: action.kind,
        field: action.kind === "refresh" ? action.field : null,
      });
      return { revision };
    });
  }

  function search(outingId: string, actorId: string, name: string) {
    return forDirector(outingId, actorId, tx => tx.searchMembers(name));
  }

  return { view, mutate, search };
}

export type SafetyView = Awaited<ReturnType<ReturnType<typeof safetySheets>["view"]>>;
