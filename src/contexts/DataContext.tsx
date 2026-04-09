import { useState, useEffect, useCallback, createContext, type ReactNode } from 'react'
import type { User } from '../types/User'
import type { Availability, SlotRequest } from '../types/Availability'
import type { Meeting, SessionLog } from '../types/Meeting'
import { getISOWeekKey } from '../shared/utils/dateUtils'
import { api, unwrapJson } from '../lib/api-client'
import { useAuth } from '../hooks/useAuth'

export interface DataContextType {
  users: User[]
  availabilities: Availability[]
  requests: SlotRequest[]
  meetings: Meeting[]
  sessionLogs: SessionLog[]
  refreshData: () => Promise<void>

  addAvailability: (availability: Omit<Availability, 'id'>) => Promise<void>
  deleteAvailability: (id: string) => Promise<void>
  requestSlot: (participantId: string, availabilityId: string, topic: string) => Promise<void>
  createMeeting: (availabilityId: string, buddyId: string, participants: string[]) => Promise<void>
  cancelMeeting: (meetingId: string) => Promise<void>
  cancelRequest: (requestId: string) => Promise<void>
  completeMeeting: (meetingId: string) => Promise<void>
}

type BootstrapPayload = {
  users: User[]
  availabilities: Availability[]
  requests: SlotRequest[]
  meetings: Meeting[]
  sessionLogs: SessionLog[]
}

export const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [requests, setRequests] = useState<SlotRequest[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([])

  const fetchData = useCallback(async () => {
    const response = await api['api/bootstrap'].$get({})
    const payload = await unwrapJson<BootstrapPayload>(response)

    setUsers(payload.users)
    setAvailabilities(payload.availabilities)
    setRequests(payload.requests)
    setMeetings(payload.meetings)
    setSessionLogs(payload.sessionLogs)
  }, [])

  useEffect(() => {
    if (!user) {
      setUsers([])
      setAvailabilities([])
      setRequests([])
      setMeetings([])
      setSessionLogs([])
      return
    }

    const timeoutId = window.setTimeout(() => {
      fetchData().catch((error) => {
        console.error('Failed to fetch bootstrap data:', error)
      })
    }, 1000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [user?.id, fetchData])

  const addAvailability = async (availability: Omit<Availability, 'id'>) => {
    const response = await api['api/availabilities'].$post({
      json: {
        buddyId: availability.buddyId,
        date: availability.date,
        start: availability.start,
        end: availability.end,
        booked: availability.booked,
      },
    })

    const payload = await unwrapJson<{ availability: Availability }>(response)
    setAvailabilities((prev) => [...prev, payload.availability])
  }

  const deleteAvailability = async (id: string) => {
    const response = await api['api/availabilities/:id'].$delete({ param: { id } })
    await unwrapJson<{ ok: boolean }>(response)
    setAvailabilities((prev) => prev.filter((a) => a.id !== id))
  }

  const requestSlot = async (participantId: string, availabilityId: string, topic: string) => {
    const hasCanceledMeetingForSlot = meetings.some(
      (m) => m.participants.includes(participantId) && m.availabilityId === availabilityId && m.status === 'canceled'
    )

    const existingRequest = requests.find(
      (r) => r.participantId === participantId && r.availabilityId === availabilityId
    )

    if (existingRequest && !hasCanceledMeetingForSlot) return

    if (existingRequest && hasCanceledMeetingForSlot) {
      const cleanupResponse = await api['api/slot-requests/:id'].$delete({
        param: { id: existingRequest.id },
      })
      await unwrapJson<{ ok: boolean }>(cleanupResponse)

      setRequests((prev) =>
        prev.filter(
          (r) => !(r.participantId === participantId && r.availabilityId === availabilityId)
        )
      )
    }

    const normalizedTopic = topic.trim()
    if (!normalizedTopic) {
      console.warn('Topic is required when requesting a slot')
      return
    }

    const targetSlot = availabilities.find((a) => a.id === availabilityId)
    if (!targetSlot) return

    const weekKey = getISOWeekKey(targetSlot.date)
    let reservedCount = 0
    const countedAvailabilityIds = new Set<string>()

    const participantMeetings = meetings.filter((m) => m.participants.includes(participantId))
    const activeMeetingSlotIds = new Set(
      participantMeetings
        .filter((m) => m.status === 'scheduled' || m.status === 'completed')
        .map((m) => m.availabilityId)
        .filter((slotId): slotId is string => Boolean(slotId))
    )

    const canceledMeetingSlotIds = new Set(
      participantMeetings
        .filter((m) => m.status === 'canceled')
        .map((m) => m.availabilityId)
        .filter((slotId): slotId is string => Boolean(slotId))
    )

    requests
      .filter((r) => r.participantId === participantId)
      .forEach((r) => {
        if (activeMeetingSlotIds.has(r.availabilityId)) return
        if (canceledMeetingSlotIds.has(r.availabilityId)) return
        if (countedAvailabilityIds.has(r.availabilityId)) return

        const slot = availabilities.find((a) => a.id === r.availabilityId)
        if (slot && getISOWeekKey(slot.date) === weekKey) {
          countedAvailabilityIds.add(r.availabilityId)
          reservedCount += 1
        }
      })

    activeMeetingSlotIds.forEach((slotId) => {
      if (countedAvailabilityIds.has(slotId)) return
      const slot = availabilities.find((a) => a.id === slotId)
      if (slot && getISOWeekKey(slot.date) === weekKey) {
        countedAvailabilityIds.add(slotId)
        reservedCount += 1
      }
    })

    if (reservedCount >= 3) {
      console.warn('Weekly reservation limit reached for participant', participantId)
      return
    }

    const response = await api['api/slot-requests'].$post({
      json: {
        participantId,
        availabilityId,
        topic: normalizedTopic,
      },
    })

    const payload = await unwrapJson<{ request: SlotRequest }>(response)
    setRequests((prev) => [...prev, payload.request])
  }

  const createMeeting = async (availabilityId: string, buddyId: string, participants: string[]) => {
    const response = await api['api/meetings'].$post({
      json: { availabilityId, buddyId, participants },
    })

    const payload = await unwrapJson<{ meeting: Meeting }>(response)

    setMeetings((prev) => [...prev, payload.meeting])
    setAvailabilities((prev) =>
      prev.map((a) => (a.id === availabilityId ? { ...a, booked: true } : a))
    )

    // Session logs and related rows are created in backend; reload once to keep state in sync.
    await fetchData()
  }

  const cancelMeeting = async (meetingId: string) => {
    const meeting = meetings.find((m) => m.id === meetingId)
    if (!meeting) return

    const response = await api['api/meetings/:id/cancel'].$post({
      param: { id: meetingId },
    })
    await unwrapJson<{ ok: boolean }>(response)

    if (meeting.participants.length > 0) {
      setRequests((prev) =>
        prev.filter(
          (r) => !(r.availabilityId === meeting.availabilityId && meeting.participants.includes(r.participantId))
        )
      )
    }

    setMeetings((prev) => prev.filter((m) => m.id !== meetingId))
    if (meeting.availabilityId) {
      setAvailabilities((prev) =>
        prev.map((a) => (a.id === meeting.availabilityId ? { ...a, booked: false } : a))
      )
    }
  }

  const cancelRequest = async (requestId: string) => {
    const response = await api['api/slot-requests/:id'].$delete({
      param: { id: requestId },
    })
    await unwrapJson<{ ok: boolean }>(response)
    setRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  const completeMeeting = async (meetingId: string) => {
    const meeting = meetings.find((m) => m.id === meetingId)
    if (!meeting) return

    const response = await api['api/meetings/:id/complete'].$post({
      param: { id: meetingId },
    })
    await unwrapJson<{ ok: boolean }>(response)

    for (const participantId of meeting.participants) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === participantId
            ? { ...user, score: (user.score || 0) + 1 }
            : user
        )
      )
    }

    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, status: 'completed' } : m))
    )

    await fetchData()
  }

  return (
    <DataContext.Provider
      value={{
        users,
        availabilities,
        requests,
        meetings,
        sessionLogs,
        refreshData: fetchData,
        addAvailability,
        deleteAvailability,
        requestSlot,
        createMeeting,
        cancelMeeting,
        cancelRequest,
        completeMeeting,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
