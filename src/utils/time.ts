export const parseTime = (time: string): number => {
    if (!time) return 0
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}

export const stringifyTime = (minutes: number): string => {
    let h = Math.floor(minutes / 60)
    let m = Math.floor(minutes % 60)

    // Handle overflow (24h)
    if (h >= 24) h = h % 24
    if (h < 0) h = 23 // Handle negative wrap around if needed, though unlikely for schedule

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export const addMinutes = (time: string, minutes: number): string => {
    const total = parseTime(time) + minutes
    return stringifyTime(total)
}

export const diffMinutes = (start: string, end: string): number => {
    return parseTime(end) - parseTime(start)
}

export const formatTime = (time: string, format: '12h' | '24h' = '24h'): string => {
    if (!time) return ''
    if (format === '24h') return time

    const [hours, minutes] = time.split(':')
    const h = parseInt(hours, 10)

    if (isNaN(h)) return time

    const suffix = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12

    return `${h12}:${minutes} ${suffix}`
}
