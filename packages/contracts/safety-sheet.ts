import { z } from "zod";

export const uuid = z.uuid();
export const versionToken = z.string().regex(/^[a-f0-9]{64}$/);
const name = z.string().trim().min(1).max(100);
const optionalText = name.nullable();
const qualification = z.string().trim().min(1).max(100);

const guestProfile = z.object({
  firstName: name,
  lastName: name,
  heldLevel: optionalText,
  qualifications: z.array(qualification).max(20),
  lastCaci: z.iso.date().nullable(),
}).strict();

export const actionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("initialize") }).strict(),
  z.object({ kind: z.literal("add_member"), memberId: uuid }).strict(),
  z.object({ kind: z.literal("add_guest"), profile: guestProfile, verified: z.literal(true) }).strict(),
  z.object({ kind: z.literal("remove"), participantId: uuid }).strict(),
  z.object({ kind: z.literal("restore"), participantId: uuid }).strict(),
  z.object({ kind: z.literal("import"), registrationId: uuid }).strict(),
  z.object({ kind: z.literal("link"), registrationId: uuid, participantId: uuid }).strict(),
  z.object({
    kind: z.literal("refresh"), registrationId: uuid, participantId: uuid,
    field: z.enum(["heldLevel", "qualifications", "lastCaci"]),
  }).strict(),
]);

export const mutationSchema = z.object({ token: versionToken, action: actionSchema }).strict();
