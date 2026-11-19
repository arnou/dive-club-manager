import assert from "node:assert/strict";
import test from "node:test";
import { canPrepare, differences, profileChanges, warnings } from "../packages/domain/safety-sheet.ts";
import type { Candidate, Participant, Profile } from "../packages/domain/safety-sheet.ts";

const profile: Profile = {
  firstName: "Camille", lastName: "Exemple", heldLevel: "N2", qualifications: ["PA20", "PE40"], lastCaci: null,
};

test("signale le CACI sans déduire une durée de validité", () => {
  assert.deepEqual(warnings(profile, "2030-07-03"), ["caci_missing"]);
  assert.deepEqual(warnings({ ...profile, heldLevel: null, lastCaci: "2030-07-04" }, "2030-07-03"), [
    "held_level_missing", "caci_after_outing",
  ]);
  assert.deepEqual(warnings({ ...profile, lastCaci: "2027-07-02" }, "2030-07-03"), ["caci_unverified"]);
});

test("la préparation est accessible pendant que les inscriptions sont ouvertes", () => {
  assert.equal(canPrepare("published"), true);
  assert.equal(canPrepare("closed"), true);
  assert.equal(canPrepare("draft"), false);
  assert.equal(canPrepare("cancelled"), false);
});

test("propose les champs séparément et ignore un retrait volontaire même après réinscription", () => {
  const participant: Participant = {
    id: "p", memberId: "m", registrationId: "r", present: true, removed: false, origin: "registration",
    snapshots: [{
      profile, recordedAt: "2030-07-01", recordedBy: "DP", source: "registration",
      registrationId: "r", registrationStatus: "confirmed",
    }],
  };
  const candidate: Candidate = {
    id: "r", memberId: "m", status: "confirmed",
    profile: { ...profile, heldLevel: "N3", qualifications: ["PE40", "PA20"], lastCaci: "2030-06-01" },
  };

  assert.deepEqual(profileChanges(profile, candidate.profile), ["heldLevel", "lastCaci"]);
  assert.deepEqual(differences({ revision: 1, participants: [participant] }, [candidate]).map(change => change.kind), ["refresh", "refresh"]);
  assert.deepEqual(differences({ revision: 2, participants: [{ ...participant, removed: true }] }, [candidate]), []);
});
