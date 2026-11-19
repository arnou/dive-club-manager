export type OutingStatus = "draft" | "published" | "closed" | "preparing" | "in_progress" | "completed" | "archived" | "cancelled";
export type RegistrationStatus = "confirmed" | "waitlisted" | "cancelled";

export interface Profile {
  firstName: string;
  lastName: string;
  heldLevel: string | null;
  qualifications: string[];
  lastCaci: string | null;
}

export interface Registration {
  id: string;
  memberId: string;
  status: RegistrationStatus;
}

export interface Candidate extends Registration {
  profile: Profile;
}

export interface Snapshot {
  profile: Profile;
  recordedAt: string;
  recordedBy: string;
  source: "registration" | "member" | "guest";
  registrationId: string | null;
  registrationStatus: RegistrationStatus | null;
}

export interface Participant {
  id: string;
  memberId: string | null;
  registrationId: string | null;
  origin: Snapshot["source"];
  present: boolean | null;
  removed: boolean;
  snapshots: Snapshot[];
}

export interface Sheet {
  revision: number;
  participants: Participant[];
}

export interface Outing {
  id: string;
  directorId: string;
  status: OutingStatus;
  startsOn: string;
  reservedDeviceId: string | null;
}

const preparationStates = new Set<OutingStatus>(["published", "closed", "preparing"]);

export function canPrepare(status: OutingStatus) {
  return preparationStates.has(status);
}

export function warnings(profile: Profile, startsOn: string) {
  const alerts: string[] = [];
  if (!profile.heldLevel) alerts.push("held_level_missing");
  if (!profile.lastCaci) alerts.push("caci_missing");
  else if (profile.lastCaci > startsOn) alerts.push("caci_after_outing");
  else alerts.push("caci_unverified");
  return alerts;
}

export function currentSnapshot(participant: Participant) {
  return participant.snapshots[participant.snapshots.length - 1];
}

export function profileChanges(before: Profile, after: Profile) {
  const changes: Array<"heldLevel" | "qualifications" | "lastCaci"> = [];
  if (before.heldLevel !== after.heldLevel) changes.push("heldLevel");
  if (JSON.stringify([...before.qualifications].sort()) !== JSON.stringify([...after.qualifications].sort())) {
    changes.push("qualifications");
  }
  if (before.lastCaci !== after.lastCaci) changes.push("lastCaci");
  return changes;
}

export function differences(sheet: Sheet, candidates: Candidate[]) {
  const byMember = new Map(sheet.participants.filter(p => p.memberId !== null).map(p => [p.memberId, p]));
  return candidates.flatMap(candidate => {
    const participant = byMember.get(candidate.memberId);
    if (!participant) {
      return candidate.status === "confirmed" ? [{ kind: "add", candidate } as const] : [];
    }
    if (participant.removed) return [];

    const changes: Difference[] = [];
    if (!participant.registrationId && candidate.status === "confirmed") {
      changes.push({ kind: "link", participantId: participant.id, candidate });
    }
    if (participant.registrationId && candidate.status === "cancelled") {
      changes.push({ kind: "cancelled", participantId: participant.id, candidate });
    }
    if (candidate.status === "confirmed") {
      const before = currentSnapshot(participant).profile;
      const fields = profileChanges(before, candidate.profile);
      for (const field of fields) {
        changes.push({ kind: "refresh", participantId: participant.id, candidate, before, field });
      }
    }
    return changes;
  });
}

export type Difference =
  | { kind: "add"; candidate: Candidate }
  | { kind: "link" | "cancelled"; participantId: string; candidate: Candidate }
  | { kind: "refresh"; participantId: string; candidate: Candidate; before: Profile; field: ReturnType<typeof profileChanges>[number] };
