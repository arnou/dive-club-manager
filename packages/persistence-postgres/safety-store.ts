import type { Pool } from "pg";
import { SafetyError } from "../application/safety-sheets.ts";
import type { SafetyStore, SafetyTransaction } from "../application/safety-sheets.ts";
import type { Candidate, Outing, Participant, Profile } from "../domain/safety-sheet.ts";

function profile(row: Record<string, unknown>): Profile {
  return {
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    heldLevel: row.held_level as string | null,
    qualifications: row.qualifications as string[],
    lastCaci: row.last_caci as string | null,
  };
}

const profileFields = "m.first_name, m.last_name, m.held_level, m.qualifications, to_char(m.last_caci, 'YYYY-MM-DD') AS last_caci";

export function postgresSafetyStore(pool: Pool): SafetyStore {
  return {
    async transact(outingId, run) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const { rows: [outing] } = await client.query<Outing>(`
          SELECT id, director_id AS "directorId", status, to_char(starts_on, 'YYYY-MM-DD') AS "startsOn",
                 reserved_device_id AS "reservedDeviceId"
          FROM outing WHERE id = $1 FOR UPDATE`, [outingId]);
        if (!outing) throw new SafetyError("not_found");

        const tx: SafetyTransaction = {
          outing,
          async sheet() {
            const { rows: [sheet] } = await client.query<{ revision: number }>(
              "SELECT revision FROM safety_sheet WHERE outing_id = $1", [outingId],
            );
            if (!sheet) return null;
            const { rows: participants } = await client.query<Participant>(`
              SELECT p.id, p.member_id AS "memberId", p.registration_id AS "registrationId",
                     p.origin, p.present, p.removed, history.snapshots
              FROM safety_participant p
              CROSS JOIN LATERAL (
                SELECT jsonb_agg(s.contents ORDER BY s.number) AS snapshots
                FROM safety_snapshot s WHERE s.participant_id = p.id
              ) history
              WHERE p.outing_id = $1 ORDER BY p.id`, [outingId]);
            return { ...sheet, participants };
          },
          async registrations() {
            const { rows } = await client.query(`
              SELECT r.id, r.member_id AS "memberId", r.status, ${profileFields}
              FROM outing_registration r JOIN member m ON m.id = r.member_id
              WHERE r.outing_id = $1 ORDER BY r.id FOR SHARE OF r, m`, [outingId]);
            return rows.map((row): Candidate => ({
              id: row.id, memberId: row.memberId, status: row.status, profile: profile(row),
            }));
          },
          async findMember(id) {
            const { rows: [row] } = await client.query(
              `SELECT ${profileFields} FROM member m WHERE m.id = $1 FOR SHARE`, [id],
            );
            return row ? profile(row) : null;
          },
          async searchMembers(name) {
            const { rows } = await client.query<{ id: string; firstName: string; lastName: string }>(`
              SELECT id, first_name AS "firstName", last_name AS "lastName" FROM member
              WHERE strpos(lower(first_name || ' ' || last_name), lower($1)) > 0
                 OR strpos(lower(last_name || ' ' || first_name), lower($1)) > 0
              ORDER BY last_name, first_name, id LIMIT 20`, [name]);
            return rows;
          },
          async receipt(actorId, key) {
            const { rows: [row] } = await client.query<{ digest: string; revision: number }>(`
              SELECT command_digest AS digest, revision FROM safety_mutation
              WHERE outing_id = $1 AND actor_id = $2 AND idempotency_key = $3`, [outingId, actorId, key]);
            return row ? { digest: row.digest, result: { revision: row.revision } } : null;
          },
          async save({ sheet, changedParticipants, actorId, at, action, field, key, digest }) {
            await client.query(`
              INSERT INTO safety_sheet (outing_id, revision) VALUES ($1, $2)
              ON CONFLICT (outing_id) DO UPDATE SET revision = EXCLUDED.revision`, [outingId, sheet.revision]);
            for (const participant of changedParticipants) {
              await client.query(`
                INSERT INTO safety_participant (id, outing_id, member_id, registration_id, origin, present, removed)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (id) DO UPDATE SET registration_id = EXCLUDED.registration_id, removed = EXCLUDED.removed`,
              [participant.id, outingId, participant.memberId, participant.registrationId, participant.origin, participant.present, participant.removed]);
              const number = participant.snapshots.length;
              await client.query(`
                INSERT INTO safety_snapshot (participant_id, number, contents) VALUES ($1, $2, $3)
                ON CONFLICT (participant_id, number) DO NOTHING`, [participant.id, number, participant.snapshots[number - 1]]);
            }
            await client.query(`
              INSERT INTO safety_mutation
                (outing_id, revision, actor_id, occurred_at, action, field, participant_ids, idempotency_key, command_digest)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [outingId, sheet.revision, actorId, at, action, field, changedParticipants.map(p => p.id), key, digest]);
          },
        };

        const result = await run(tx);
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
