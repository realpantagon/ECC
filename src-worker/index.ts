import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { HTTPException } from 'hono/http-exception'
import { neon } from '@neondatabase/serverless'
import type { MiddlewareHandler } from 'hono'

type Role = 'admin' | 'buddy' | 'participant'
type MeetingStatus = 'scheduled' | 'completed' | 'canceled'

type Bindings = {
  DATABASE_URL: string
  FRONTEND_ORIGIN?: string
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>
  }
}

type Variables = {
  userId: string
  userRole: Role
}

type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}

type UserRow = {
  id: string
  name: string
  role: Role
  score: number | null
  username: string | null
  emp_code: string | null
}

type AvailabilityRow = {
  id: string
  buddy_id: string
  date: string
  start_time: string
  end_time: string
  booked: boolean
}

type SlotRequestRow = {
  id: string
  participant_id: string
  availability_id: string
  topic: string | null
}

type MeetingRow = {
  id: string
  availability_id: string | null
  buddy_id: string
  start_time: string
  end_time: string
  status: MeetingStatus
  topic: string | null
}

type MeetingParticipantRow = {
  meeting_id: string
  participant_id: string
}

type SessionLogRow = {
  id: string
  meeting_id: string
  buddy_id: string
  duration_minutes: number
}

const uuidSchema = z.string().uuid()

const loginSchema = z.object({
  username: z.string().min(1),
  empCode: z.string().min(1),
})

const addAvailabilitySchema = z.object({
  buddyId: uuidSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  booked: z.boolean().optional().default(false),
})

const slotRequestSchema = z.object({
  participantId: uuidSchema,
  availabilityId: uuidSchema,
  topic: z.string().trim().min(1),
})

const createMeetingSchema = z.object({
  availabilityId: uuidSchema,
  buddyId: uuidSchema,
  participants: z.array(uuidSchema).min(1),
})

const app = new Hono<AppEnv>()

function getSql(c: { env: Bindings }) {
  const url = c.env.DATABASE_URL
  if (!url) {
    throw new HTTPException(500, { message: 'DATABASE_URL is missing' })
  }
  return neon(url)
}

function toIsoString(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString()
}

async function pingDatabase(env: Bindings) {
  const sql = neon(env.DATABASE_URL)
  await sql`SELECT 1`
}

function originAllowed(origin: string, rules: string[]) {
  return rules.some((rule) => {
    if (rule === '*') return true
    if (rule.includes('*')) {
      const escaped = rule.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
      return new RegExp(`^${escaped}$`, 'i').test(origin)
    }
    return rule === origin
  })
}

/**
 * Role-based auth middleware.
 * Reads X-User-Id header, validates the user exists in DB, and checks their role.
 * Pass no roles to allow any authenticated user.
 */
function requireRole(...allowedRoles: Role[]): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const userId = c.req.header('X-User-Id')
    if (!userId) {
      return c.json({ message: 'Unauthorized: missing user ID' }, 401)
    }

    const sql = getSql(c)
    let rows: Pick<UserRow, 'id' | 'role'>[]
    try {
      rows = (await sql`
        SELECT id, role FROM users WHERE id = ${userId}::uuid LIMIT 1
      `) as Pick<UserRow, 'id' | 'role'>[]
    } catch {
      return c.json({ message: 'Unauthorized: invalid user ID' }, 401)
    }

    if (!rows.length) {
      return c.json({ message: 'Unauthorized: user not found' }, 401)
    }

    const user = rows[0]

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return c.json({ message: 'Forbidden: insufficient permissions' }, 403)
    }

    c.set('userId', user.id)
    c.set('userRole', user.role)

    await next()
  }
}

app.use('/api/*', cors({
  origin: (origin, c) => {
    const configured = (c.env.FRONTEND_ORIGIN || '')
      .split(',')
      .map((item: string) => item.trim())
      .filter(Boolean)

    if (configured.length === 0) {
      return '*'
    }

    if (!origin) {
      return configured[0]
    }

    return originAllowed(origin, configured) ? origin : configured[0]
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
}))

app.options('/api/*', (c) => c.body(null, 204))

// ── Public routes (no auth required) ──────────────────────────────────────

app.get('/api/health', async (c) => {
  try {
    await pingDatabase(c.env)
    return c.json({ ok: true, date: new Date().toISOString() })
  } catch (error) {
    console.error('Health check failed', error)
    return c.json({ ok: false, message: 'Database ping failed' }, 500)
  }
})

app.post('/api/auth/login', zValidator('json', loginSchema), async (c) => {
  const sql = getSql(c)
  const { username, empCode } = c.req.valid('json')

  const rows = (await sql`
    SELECT id, name, role, score, username, emp_code
    FROM users
    WHERE username = ${username}
      AND emp_code = ${empCode}
    LIMIT 1
  `) as UserRow[]

  if (!rows.length) {
    return c.json({ ok: false, message: 'Invalid credentials' }, 401)
  }

  const user = rows[0]
  return c.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name || user.username || 'Unknown',
      role: user.role,
      score: user.score ?? 0,
    },
  })
})

// ── Authenticated routes (any role) ───────────────────────────────────────

app.get('/api/bootstrap', requireRole(), async (c) => {
  const sql = getSql(c)

  const [usersRows, availabilityRows, requestRows, meetingRows, meetingParticipantRows, sessionLogRows] =
    await Promise.all([
      sql`SELECT id, name, role, score, username, emp_code FROM users`,
      sql`SELECT id, buddy_id, date::text AS date, start_time::text AS start_time, end_time::text AS end_time, booked FROM availabilities`,
      sql`SELECT id, participant_id, availability_id, topic FROM slot_requests`,
      sql`SELECT id, availability_id, buddy_id, start_time, end_time, status, topic FROM meetings`,
      sql`SELECT meeting_id, participant_id FROM meeting_participants`,
      sql`SELECT id, meeting_id, buddy_id, duration_minutes FROM session_logs`,
    ])

  const typedUsersRows = usersRows as UserRow[]
  const typedAvailabilityRows = availabilityRows as AvailabilityRow[]
  const typedRequestRows = requestRows as SlotRequestRow[]
  const typedMeetingRows = meetingRows as MeetingRow[]
  const typedMeetingParticipantRows = meetingParticipantRows as MeetingParticipantRow[]
  const typedSessionLogRows = sessionLogRows as SessionLogRow[]

  const availabilityById = new Map(typedAvailabilityRows.map((a) => [a.id, a]))

  const users = typedUsersRows.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    score: u.score ?? 0,
  }))

  const availabilities = typedAvailabilityRows.map((a) => ({
    id: a.id,
    buddyId: a.buddy_id,
    date: a.date,
    start: a.start_time.substring(0, 5),
    end: a.end_time.substring(0, 5),
    booked: a.booked,
  }))

  const requests = typedRequestRows.map((r) => ({
    id: r.id,
    participantId: r.participant_id,
    availabilityId: r.availability_id,
    topic: r.topic ?? '',
  }))

  const meetings = typedMeetingRows.map((m) => {
    const participants = typedMeetingParticipantRows
      .filter((p) => p.meeting_id === m.id)
      .map((p) => p.participant_id)

    const availability = m.availability_id ? availabilityById.get(m.availability_id) : undefined
    const start = availability
      ? `${availability.date} ${availability.start_time.substring(0, 5)}`
      : m.start_time
    const end = availability
      ? `${availability.date} ${availability.end_time.substring(0, 5)}`
      : m.end_time

    return {
      id: m.id,
      availabilityId: m.availability_id,
      buddyId: m.buddy_id,
      participants,
      start,
      end,
      status: m.status,
      topic: m.topic ?? undefined,
    }
  })

  const participantsByMeetingId = new Map<string, string[]>()
  for (const row of typedMeetingParticipantRows) {
    const current = participantsByMeetingId.get(row.meeting_id) ?? []
    current.push(row.participant_id)
    participantsByMeetingId.set(row.meeting_id, current)
  }

  const sessionLogs = typedSessionLogRows.map((l) => ({
    id: l.id,
    meetingId: l.meeting_id,
    buddyId: l.buddy_id,
    participants: participantsByMeetingId.get(l.meeting_id) ?? [],
    durationMinutes: l.duration_minutes,
  }))

  return c.json({ users, availabilities, requests, meetings, sessionLogs })
})

// ── Buddy-only routes ──────────────────────────────────────────────────────

app.post('/api/availabilities', requireRole('buddy'), zValidator('json', addAvailabilitySchema), async (c) => {
  const sql = getSql(c)
  const payload = c.req.valid('json')
  const userId = c.get('userId')

  // Buddy can only add slots for themselves
  if (payload.buddyId !== userId) {
    return c.json({ message: 'Forbidden: can only add availability for yourself' }, 403)
  }

  const inserted = (await sql`
    INSERT INTO availabilities (buddy_id, date, start_time, end_time, booked)
    VALUES (${payload.buddyId}, ${payload.date}::date, ${payload.start}::time, ${payload.end}::time, ${payload.booked})
    RETURNING id, buddy_id, date::text AS date, start_time::text AS start_time, end_time::text AS end_time, booked
  `) as AvailabilityRow[]

  return c.json({
    availability: {
      id: inserted[0].id,
      buddyId: inserted[0].buddy_id,
      date: inserted[0].date,
      start: inserted[0].start_time.substring(0, 5),
      end: inserted[0].end_time.substring(0, 5),
      booked: inserted[0].booked,
    },
  }, 201)
})

app.delete('/api/availabilities/:id', requireRole('buddy'), async (c) => {
  const sql = getSql(c)
  const id = c.req.param('id')
  const userId = c.get('userId')

  // Verify ownership: buddy can only delete their own slots
  const rows = (await sql`
    SELECT id, buddy_id, booked FROM availabilities WHERE id = ${id}::uuid LIMIT 1
  `) as Pick<AvailabilityRow, 'id' | 'buddy_id' | 'booked'>[]

  if (!rows.length) {
    throw new HTTPException(404, { message: 'Availability not found' })
  }

  if (rows[0].buddy_id !== userId) {
    return c.json({ message: 'Forbidden: can only delete your own slots' }, 403)
  }

  if (rows[0].booked) {
    return c.json({ message: 'Cannot delete a booked slot' }, 400)
  }

  await sql`DELETE FROM availabilities WHERE id = ${id}::uuid`
  return c.json({ ok: true })
})

// ── Participant-only routes ────────────────────────────────────────────────

app.post('/api/slot-requests', requireRole('participant'), zValidator('json', slotRequestSchema), async (c) => {
  const sql = getSql(c)
  const payload = c.req.valid('json')
  const userId = c.get('userId')

  // Participant can only request slots for themselves
  if (payload.participantId !== userId) {
    return c.json({ message: 'Forbidden: can only request slots for yourself' }, 403)
  }

  const inserted = (await sql`
    WITH updated_availability AS (
      UPDATE availabilities
      SET booked = true
      WHERE id = ${payload.availabilityId}::uuid
        AND booked = false
      RETURNING id
    ), inserted_request AS (
      INSERT INTO slot_requests (participant_id, availability_id, topic)
      SELECT ${payload.participantId}::uuid, ${payload.availabilityId}::uuid, ${payload.topic}
      FROM updated_availability
      ON CONFLICT (participant_id, availability_id) DO NOTHING
      RETURNING id, participant_id, availability_id, topic
    )
    SELECT id, participant_id, availability_id, topic
    FROM inserted_request
  `) as SlotRequestRow[]

  if (!inserted.length) {
    const availabilityRows = (await sql`
      SELECT id, booked
      FROM availabilities
      WHERE id = ${payload.availabilityId}::uuid
      LIMIT 1
    `) as Pick<AvailabilityRow, 'id' | 'booked'>[]

    if (!availabilityRows.length) {
      throw new HTTPException(404, { message: 'Availability not found' })
    }

    return c.json({ message: 'This slot has already been requested or booked' }, 409)
  }

  return c.json({
    request: {
      id: inserted[0].id,
      participantId: inserted[0].participant_id,
      availabilityId: inserted[0].availability_id,
      topic: inserted[0].topic ?? '',
    },
  }, 201)
})

// Participant can cancel their own; admin can cancel any
app.delete('/api/slot-requests/:id', requireRole('participant', 'admin'), async (c) => {
  const sql = getSql(c)
  const requestId = c.req.param('id')
  const userId = c.get('userId')
  const userRole = c.get('userRole')

  if (userRole === 'participant') {
    // Verify ownership: participant can only cancel their own requests
    const rows = (await sql`
      SELECT id, participant_id FROM slot_requests WHERE id = ${requestId}::uuid LIMIT 1
    `) as Pick<SlotRequestRow, 'id' | 'participant_id'>[]

    if (!rows.length) {
      throw new HTTPException(404, { message: 'Slot request not found' })
    }

    if (rows[0].participant_id !== userId) {
      return c.json({ message: 'Forbidden: can only cancel your own requests' }, 403)
    }
  }

  const deleted = (await sql`
    DELETE FROM slot_requests
    WHERE id = ${requestId}::uuid
    RETURNING availability_id
  `) as Pick<SlotRequestRow, 'availability_id'>[]

  if (deleted.length > 0) {
    await sql`
      UPDATE availabilities a
      SET booked = false
      WHERE a.id = ${deleted[0].availability_id}::uuid
        AND NOT EXISTS (
          SELECT 1
          FROM slot_requests sr
          WHERE sr.availability_id = a.id
        )
        AND NOT EXISTS (
          SELECT 1
          FROM meetings m
          WHERE m.availability_id = a.id
        )
    `
  }

  return c.json({ ok: true })
})

// ── Admin-only routes ──────────────────────────────────────────────────────

app.post('/api/meetings', requireRole('admin'), zValidator('json', createMeetingSchema), async (c) => {
  const sql = getSql(c)
  const { availabilityId, buddyId, participants } = c.req.valid('json')

  const availabilityRows = (await sql`
    SELECT id, buddy_id, date::text AS date, start_time::text AS start_time, end_time::text AS end_time, booked
    FROM availabilities
    WHERE id = ${availabilityId}::uuid
    LIMIT 1
  `) as AvailabilityRow[]

  if (!availabilityRows.length) {
    throw new HTTPException(404, { message: 'Availability not found' })
  }

  const availability = availabilityRows[0]

  const requestRows = (await sql`
    SELECT id, participant_id, availability_id, topic
    FROM slot_requests
    WHERE availability_id = ${availabilityId}::uuid
      AND participant_id = ANY(${participants}::uuid[])
    LIMIT 1
  `) as SlotRequestRow[]

  const topic = requestRows[0]?.topic ?? null

  const insertedMeetings = (await sql`
    INSERT INTO meetings (availability_id, buddy_id, start_time, end_time, status, topic)
    VALUES (
      ${availabilityId}::uuid,
      ${buddyId}::uuid,
      ${toIsoString(availability.date, availability.start_time.substring(0, 5))}::timestamptz,
      ${toIsoString(availability.date, availability.end_time.substring(0, 5))}::timestamptz,
      'scheduled'::meeting_status,
      ${topic}
    )
    RETURNING id, availability_id, buddy_id, start_time, end_time, status, topic
  `) as MeetingRow[]

  const meeting = insertedMeetings[0]

  for (const participantId of participants) {
    await sql`
      INSERT INTO meeting_participants (meeting_id, participant_id)
      VALUES (${meeting.id}::uuid, ${participantId}::uuid)
      ON CONFLICT DO NOTHING
    `
  }

  await sql`
    UPDATE availabilities
    SET booked = true
    WHERE id = ${availabilityId}::uuid
  `

  return c.json({
    meeting: {
      id: meeting.id,
      availabilityId: meeting.availability_id,
      buddyId: meeting.buddy_id,
      participants,
      start: `${availability.date} ${availability.start_time.substring(0, 5)}`,
      end: `${availability.date} ${availability.end_time.substring(0, 5)}`,
      status: meeting.status,
      topic: meeting.topic ?? undefined,
    },
  }, 201)
})

app.post('/api/meetings/:id/cancel', requireRole('admin'), async (c) => {
  const sql = getSql(c)
  const meetingId = c.req.param('id')

  const meetings = (await sql`
    SELECT id, availability_id, buddy_id, start_time, end_time, status, topic
    FROM meetings
    WHERE id = ${meetingId}::uuid
    LIMIT 1
  `) as MeetingRow[]

  if (!meetings.length) {
    throw new HTTPException(404, { message: 'Meeting not found' })
  }

  const meeting = meetings[0]

  const participantsRows = (await sql`
    SELECT meeting_id, participant_id
    FROM meeting_participants
    WHERE meeting_id = ${meetingId}::uuid
  `) as MeetingParticipantRow[]

  const participants = participantsRows.map((p) => p.participant_id)

  await sql`DELETE FROM meetings WHERE id = ${meetingId}::uuid`

  if (meeting.availability_id) {
    await sql`
      UPDATE availabilities
      SET booked = false
      WHERE id = ${meeting.availability_id}::uuid
    `

    if (participants.length > 0) {
      await sql`
        DELETE FROM slot_requests
        WHERE availability_id = ${meeting.availability_id}::uuid
          AND participant_id = ANY(${participants}::uuid[])
      `
    }
  }

  return c.json({ ok: true, availabilityId: meeting.availability_id })
})

app.post('/api/meetings/:id/complete', requireRole('admin'), async (c) => {
  const sql = getSql(c)
  const meetingId = c.req.param('id')

  const meetings = (await sql`
    SELECT id, availability_id, buddy_id, start_time, end_time, status, topic
    FROM meetings
    WHERE id = ${meetingId}::uuid
    LIMIT 1
  `) as MeetingRow[]

  if (!meetings.length) {
    throw new HTTPException(404, { message: 'Meeting not found' })
  }

  const meeting = meetings[0]

  if (meeting.status === 'completed') {
    return c.json({ ok: true }) // idempotent — already done
  }

  await sql`
    UPDATE meetings
    SET status = 'completed'::meeting_status
    WHERE id = ${meetingId}::uuid
  `

  const participantRows = (await sql`
    SELECT meeting_id, participant_id
    FROM meeting_participants
    WHERE meeting_id = ${meetingId}::uuid
  `) as MeetingParticipantRow[]

  // Increment score for every participant
  for (const participant of participantRows) {
    await sql`
      UPDATE users
      SET score = COALESCE(score, 0) + 1
      WHERE id = ${participant.participant_id}::uuid
    `
  }

  // Increment score for the buddy
  await sql`
    UPDATE users
    SET score = COALESCE(score, 0) + 1
    WHERE id = ${meeting.buddy_id}::uuid
  `

  // Compute duration from actual meeting times (fallback to 20 min)
  const durationMinutes = Math.round(
    (new Date(meeting.end_time).getTime() - new Date(meeting.start_time).getTime()) / 60000
  ) || 20

  await sql`
    INSERT INTO session_logs (meeting_id, buddy_id, duration_minutes)
    VALUES (${meetingId}::uuid, ${meeting.buddy_id}::uuid, ${durationMinutes})
  `

  return c.json({ ok: true })
})

app.notFound(async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw)
  }

  return c.json({ message: 'Not Found' }, 404)
})

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status)
  }

  console.error('Unhandled error', err)
  return c.json({ message: 'Internal Server Error' }, 500)
})

export type AppType = typeof app

const worker = {
  fetch: app.fetch,
  scheduled: async (_event: unknown, env: Bindings) => {
    try {
      await pingDatabase(env)
      console.log('Scheduled keep-alive ping succeeded')
    } catch (error) {
      console.error('Scheduled keep-alive ping failed', error)
    }
  },
}

export default worker
