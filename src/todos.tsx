import { useState } from 'react'
import { useUser } from '@clerk/react'
import { useSupabaseSync } from './useSupabaseSync'

export type TodoItem = {
    id: number
    text: string
    completed: boolean
    priority: 'low' | 'medium' | 'high'
    dueDate?: string
    created: number
}

const PRIORITY_THEME = {
    low: { label: 'Low', color: '#10b981', bg: '#ecfdf5' },
    medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
    high: { label: 'High', color: '#ef4444', bg: '#fef2f2' },
}

export default function Todos() {
    const { user } = useUser()
    const { items: todos, loading, addItem, updateItem, removeItem } =
        useSupabaseSync<TodoItem>('todos', user?.id)

    const [text, setText] = useState('')
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
    const [dueDate, setDueDate] = useState('')
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

    function addTodo() {
        if (!text.trim()) return
        const newTodo: TodoItem = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            priority,
            dueDate: dueDate || undefined,
            created: Date.now(),
        }
        addItem(newTodo)
        setText('')
        setDueDate('')
    }

    function toggleTodo(id: number) {
        updateItem(id, (t) => ({ ...t, completed: !t.completed }))
    }

    function deleteTodo(id: number) {
        removeItem(id)
    }

    const completedCount = todos.filter((t) => t.completed).length
    const progressPercent = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100)

    const filtered = todos.filter((t) => {
        if (filter === 'active') return !t.completed
        if (filter === 'completed') return t.completed
        return true
    })

    if (loading) {
        return (
            <div className="empty">
                <div className="big">⏳</div>
                <p>Loading your tasks...</p>
            </div>
        )
    }

    return (
        <div className="todos-container">
            <div className="todos-header">
                <div>
                    <h2>Things to Crush ✅</h2>
                    <p className="muted">Tasks that need you to lock in. Zero procrastination.</p>
                </div>
                <div className="progress-badge">
                    <span>{progressPercent}% Crushed</span>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Todo Input Box */}
            <div className="composer-card">
                <div className="todo-input-row">
                    <input
                        className="composer-title"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                        placeholder="What do you need to get done?"
                    />
                </div>
                <div className="composer-footer">
                    <div className="todo-controls">
                        <div className="tag-selector">
                            <span className="small muted">Priority:</span>
                            {(['low', 'medium', 'high'] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`tag-pill ${priority === p ? 'active' : ''}`}
                                    style={{
                                        borderColor: priority === p ? PRIORITY_THEME[p].color : undefined,
                                        color: priority === p ? PRIORITY_THEME[p].color : undefined,
                                    }}
                                    onClick={() => setPriority(p)}
                                >
                                    {PRIORITY_THEME[p].label}
                                </button>
                            ))}
                        </div>

                        <div className="todo-due-group">
                            <span className="small muted">Due:</span>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="todo-date-input"
                                aria-label="Due date"
                            />
                        </div>
                    </div>
                    <button className="btn primary" onClick={addTodo}>
                        Add Task
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="tag-filters">
                <button
                    className={`tag-filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({todos.length})
                </button>
                <button
                    className={`tag-filter-btn ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Active ({todos.length - completedCount})
                </button>
                <button
                    className={`tag-filter-btn ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed ({completedCount})
                </button>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
                <div className="empty">
                    <div className="big">🎯</div>
                    <p>{todos.length === 0 ? 'No tasks yet. Add one above!' : 'No tasks match this filter.'}</p>
                </div>
            )}

            {/* Task list */}
            <div className="todo-list">
                {filtered.map((t, index) => (
                    <div
                        key={t.id}
                        className={`todo-item ${t.completed ? 'completed' : ''}`}
                        style={{ animationDelay: `${Math.min(index * 35, 210)}ms` }}
                    >
                        <label className="todo-check-wrapper">
                            <input
                                type="checkbox"
                                checked={t.completed}
                                onChange={() => toggleTodo(t.id)}
                            />
                            <span className="checkmark"></span>
                        </label>
                        <div className="todo-content">
                            <span className="todo-text">{t.text}</span>
                            <div className="todo-meta">
                                <span
                                    className="note-badge"
                                    style={{
                                        backgroundColor: PRIORITY_THEME[t.priority].bg,
                                        color: PRIORITY_THEME[t.priority].color,
                                    }}
                                >
                                    {PRIORITY_THEME[t.priority].label}
                                </span>
                                {t.dueDate && (
                                    <span className="small muted">📅 {t.dueDate}</span>
                                )}
                            </div>
                        </div>
                        <button
                            className="btn small danger-btn todo-delete-btn"
                            onClick={() => deleteTodo(t.id)}
                            title="Delete task"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
