import { useState } from 'react'
import { useUser } from '@clerk/react'
import { useSupabaseSync } from './useSupabaseSync'

type CalendarEvent = {
    id: number
    title: string
    date: string // YYYY-MM-DD
    type: 'event' | 'deadline' | 'meeting' | 'reminder'
}

const TYPE_CONFIG = {
    event: { label: 'Event', color: '#2563eb', bg: '#eff6ff' },
    deadline: { label: 'Deadline', color: '#dc2626', bg: '#fef2f2' },
    meeting: { label: 'Meeting', color: '#d97706', bg: '#fffbeb' },
    reminder: { label: 'Reminder', color: '#16a34a', bg: '#f0fdf4' },
}

export default function CalendarView() {
    const { user } = useUser()
    const { items: events, loading, addItem, removeItem } =
        useSupabaseSync<CalendarEvent>('calendar_events', user?.id)

    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const d = new Date()
        return d.toISOString().split('T')[0]
    })
    const [newEventTitle, setNewEventTitle] = useState('')
    const [newEventType, setNewEventType] = useState<'event' | 'deadline' | 'meeting' | 'reminder'>('event')

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    function prevMonth() {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    function nextMonth() {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    function addEvent() {
        if (!newEventTitle.trim()) return
        const newEv: CalendarEvent = {
            id: Date.now(),
            title: newEventTitle.trim(),
            date: selectedDate,
            type: newEventType,
        }
        addItem(newEv)
        setNewEventTitle('')
    }

    function deleteEvent(id: number) {
        removeItem(id)
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const selectedEvents = events.filter((e) => e.date === selectedDate)

    if (loading) {
        return (
            <div className="empty">
                <div className="big">⏳</div>
                <p>Loading your calendar...</p>
            </div>
        )
    }

    return (
        <div className="calendar-container">
            <div className="calendar-layout">
                {/* Month Grid */}
                <div className="calendar-main-card">
                    <div className="calendar-nav-header">
                        <h2>{monthNames[month]} {year}</h2>
                        <div className="actions">
                            <button className="btn small" onClick={prevMonth}>‹ Prev</button>
                            <button className="btn small" onClick={() => setCurrentDate(new Date())}>Today</button>
                            <button className="btn small" onClick={nextMonth}>Next ›</button>
                        </div>
                    </div>

                    <div key={`${year}-${month}`} className="calendar-grid month-enter">
                        {daysOfWeek.map((d) => (
                            <div key={d} className="calendar-day-header">{d}</div>
                        ))}

                        {/* Empty padding days for start of month */}
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                            <div key={`empty-${i}`} className="calendar-cell empty-cell"></div>
                        ))}

                        {/* Month days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1
                            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                            const isSelected = dayStr === selectedDate
                            const dayEvents = events.filter((e) => e.date === dayStr)
                            const isToday = new Date().toISOString().split('T')[0] === dayStr

                            return (
                                <div
                                    key={dayNum}
                                    className={`calendar-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                                    onClick={() => setSelectedDate(dayStr)}
                                >
                                    <span className="cell-day-num">{dayNum}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="cell-indicators">
                                            {dayEvents.slice(0, 3).map((e) => (
                                                <span
                                                    key={e.id}
                                                    className="cell-dot"
                                                    style={{ backgroundColor: TYPE_CONFIG[e.type].color }}
                                                    title={e.title}
                                                />
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <span className="cell-more">+{dayEvents.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Day Details & Event Creator Sidebar */}
                <div className="calendar-sidebar-card">
                    <h3>Events on {selectedDate}</h3>
                    
                    {/* Add Event */}
                    <div className="cal-add-form">
                        <input
                            placeholder="Add event or deadline..."
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                        />
                        <div className="cal-type-selector">
                            {(['event', 'deadline', 'meeting', 'reminder'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`tag-pill ${newEventType === t ? 'active' : ''}`}
                                    style={{
                                        borderColor: newEventType === t ? TYPE_CONFIG[t].color : undefined,
                                        color: newEventType === t ? TYPE_CONFIG[t].color : undefined,
                                    }}
                                    onClick={() => setNewEventType(t)}
                                >
                                    {TYPE_CONFIG[t].label}
                                </button>
                            ))}
                        </div>
                        <button className="btn primary" onClick={addEvent} style={{ width: '100%' }}>
                            Add Event
                        </button>
                    </div>

                    {/* Day Events list */}
                    <div key={selectedDate} className="cal-event-list view-enter">
                        {selectedEvents.length === 0 ? (
                            <p className="muted small" style={{ textAlign: 'center', marginTop: 24 }}>
                                No events scheduled for this day.
                            </p>
                        ) : (
                            selectedEvents.map((e) => (
                                <div key={e.id} className="cal-event-item">
                                    <div className="cal-event-info">
                                        <span
                                            className="note-badge"
                                            style={{
                                                backgroundColor: TYPE_CONFIG[e.type].bg,
                                                color: TYPE_CONFIG[e.type].color,
                                            }}
                                        >
                                            {TYPE_CONFIG[e.type].label}
                                        </span>
                                        <span className="cal-event-text">{e.title}</span>
                                    </div>
                                    <button
                                        className="btn small danger-btn"
                                        onClick={() => deleteEvent(e.id)}
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
