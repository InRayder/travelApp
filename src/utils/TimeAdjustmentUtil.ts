import { Event, Transport } from '../stores/trip'
import { addMinutes, diffMinutes } from './time'

export const TIME_ADJUSTMENT_AI_DOCS = `
### Time Adjustment & Conflict Detection Utility
The system includes a robust utility for handling itinerary time changes.
1. **Ripple Shift**: When an event's time is changed, subsequent events in the same day are automatically shifted by the same time difference to maintain the schedule's structure.
   - Exception: Events with fixed time constraints (e.g., flight, train with specific departure) are NOT shifted.
2. **Conflict Detection**: The system validates the schedule and highlights conflicts:
   - **Transport Conflict**: 
     - "Missed Connection": Previous event ends after transport departure.
     - "Late Arrival": Transport arrives after next event starts.
   - **Overlap**: Event time overlaps with the previous event (without transport buffer).
   - Conflicting events are visually highlighted with a red border.
`

/**
 * Calculates the new start time for an event based on a time delta.
 * @param time Original "HH:MM" string
 * @param deltaMinutes Number of minutes to shift (positive or negative)
 * @returns New "HH:MM" string
 */
export const shiftTime = (time: string, deltaMinutes: number): string => {
    return addMinutes(time, deltaMinutes)
}

/**
 * Checks if an event should be locked (not automatically shifted).
 * Criteria:
 * - Category is 'flight' or 'transport' (usually fixed schedules)
 * - Explicitly marked as fixed (future feature, currently inferred)
 */
export const isFixedTimeEvent = (event: Event): boolean => {
    // For now, we assume flights and public transport with specific times are fixed
    // But since 'transport' is usually a sub-property, we check main category
    if (event.category === 'flight') return true

    // If it has a specific transport with a departure time that matches event time, it might be fixed
    // But for general "fun" events, we assume they are flexible unless stated otherwise
    return false
}

/**
 * Validates the schedule for a single day and returns IDs of conflicting events.
 */
export const validateDaySchedule = (events: Event[]): { transportConflicts: string[], eventConflicts: string[] } => {
    const transportConflicts: Set<string> = new Set()
    const eventConflicts: Set<string> = new Set()

    for (let i = 0; i < events.length; i++) {
        const current = events[i]
        const next = events[i + 1]

        // 1. Check Transport Conflicts (within the event itself)
        if (current.transports && current.transports.length > 0) {
            // Usually transport represents travel TO this event.
            // So we check if the *previous* event ends before this transport departs.
            const prev = events[i - 1]
            if (prev) {
                const firstTransport = current.transports[0]
                if (firstTransport.dep) {
                    const prevEndTime = prev.endTime || addMinutes(prev.time, 60) // Default 1h duration if not set
                    const depTime = firstTransport.dep

                    // If previous event ends AFTER transport departs -> Missed Connection
                    if (diffMinutes(prevEndTime, depTime) < 0) {
                        transportConflicts.add(current.id || '')
                        // We mark the current event's transport as conflicting. 
                        // Optionally mark previous event as 'eventConflict'? No, keep it specific.
                    }
                }
            }

            // Check if transport arrives after event starts
            const lastTransport = current.transports[current.transports.length - 1]
            if (lastTransport.arr) {
                if (diffMinutes(lastTransport.arr, current.time) < 0) {
                    // Transport arrives AFTER event starts -> Late
                    transportConflicts.add(current.id || '')
                }
            }
        }

        // 2. Check Overlap with Next Event
        if (next) {
            const currentEndTime = current.endTime || addMinutes(current.time, 60)

            // If next event has transport, we check against transport departure (handled in next iteration's transport check)
            // If next event has NO transport, we check against its start time directly
            if ((!next.transports || next.transports.length === 0) && diffMinutes(currentEndTime, next.time) < 0) {
                // Current ends AFTER next starts
                eventConflicts.add(current.id || '')
                eventConflicts.add(next.id || '')
            }
        }
    }

    return {
        transportConflicts: Array.from(transportConflicts).filter(id => id !== ''),
        eventConflicts: Array.from(eventConflicts).filter(id => id !== '')
    }
}

/**
 * Ripples a time change to subsequent events.
 * @param events The full list of events for the day
 * @param changedEventIndex The index of the event that was manually changed
 * @param newTime The new start time for the changed event
 * @returns A new list of events with times adjusted
 */
export const rippleShiftEvents = (events: Event[], changedEventIndex: number, newTime: string): Event[] => {
    const changedEvent = events[changedEventIndex]
    const oldTime = changedEvent.time
    const delta = diffMinutes(oldTime, newTime)

    if (delta === 0) return events

    // Create a deep copy to avoid mutation
    const newEvents = JSON.parse(JSON.stringify(events))

    // Update the changed event first
    newEvents[changedEventIndex].time = newTime
    if (newEvents[changedEventIndex].endTime) {
        newEvents[changedEventIndex].endTime = addMinutes(newEvents[changedEventIndex].endTime, delta)
    }

    // Shift subsequent events
    for (let i = changedEventIndex + 1; i < newEvents.length; i++) {
        const evt = newEvents[i]

        // Stop rippling if we hit a fixed time event
        if (isFixedTimeEvent(evt)) break

        // Apply shift
        evt.time = addMinutes(evt.time, delta)
        if (evt.endTime) {
            evt.endTime = addMinutes(evt.endTime, delta)
        }

        // Also shift transport times if they exist and are relative (inferred)
        // But usually transport times are specific. 
        // Strategy: If we shift the event, we should probably shift the transport *to* it as well, 
        // UNLESS it's a public transport with fixed schedule.
        // For now, let's shift transport times too if they are 'walk' or 'drive' (flexible).
        if (evt.transports) {
            evt.transports.forEach((t: Transport) => {
                if (['walk', 'drive', 'taxi'].includes(t.type)) {
                    if (t.dep) t.dep = addMinutes(t.dep, delta)
                    if (t.arr) t.arr = addMinutes(t.arr, delta)
                }
            })
        }
    }

    return newEvents
}
