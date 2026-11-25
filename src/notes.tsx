import { useState } from 'react'
import { useUser } from '@clerk/react'
import { getTiltHandlers } from './tilt3d'
import { useSupabaseSync } from './useSupabaseSync'
import RichEditor, { getPlainNoteText, normalizeNoteHtml } from './RichEditor'

export type NoteTag = 'work' | 'personal' | 'ideas' | 'urgent'

export type Note = {
    id: number
    title: string
    text: string
    tag?: NoteTag
    pinned: boolean
    created: number
}

const TAG_CONFIG: Record<NoteTag, { label: string; color: string; bg: string }> = {
    work: { label: 'Work', color: '#2563eb', bg: '#eff6ff' },
    personal: { label: 'Personal', color: '#16a34a', bg: '#f0fdf4' },
    ideas: { label: 'Ideas', color: '#d97706', bg: '#fffbeb' },
    urgent: { label: 'Urgent', color: '#dc2626', bg: '#fef2f2' },
}

function timeAgo(time: number) {
    const mins = Math.floor((Date.now() - time) / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(time).toLocaleDateString()
}

export default function Notes() {
    const { user } = useUser()
    const { items: notes, loading, addItem, updateItem, removeItem } =
        useSupabaseSync<Note>('notes', user?.id)

    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [tag, setTag] = useState<NoteTag>('ideas')
    const [search, setSearch] = useState('')
    const [selectedTag, setSelectedTag] = useState<string>('all')

    // Editing states
    const [editId, setEditId] = useState<number | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editText, setEditText] = useState('')
    const [editTag, setEditTag] = useState<NoteTag>('ideas')

    function addNote() {
        if (!title.trim() && !getPlainNoteText(text)) return
        const now = Date.now()
        const newNote: Note = {
            id: now,
            title: title.trim(),
            text,
            tag,
            pinned: false,
            created: now,
        }
        addItem(newNote)
        setTitle('')
        setText('')
    }

    function deleteNote(id: number) {
        if (window.confirm('Delete this note?')) {
            removeItem(id)
        }
    }

    function togglePin(id: number) {
        updateItem(id, (n) => ({ ...n, pinned: !n.pinned }))
    }

    function startEdit(n: Note) {
        setEditId(n.id)
        setEditTitle(n.title)
        setEditText(normalizeNoteHtml(n.text))
        setEditTag(n.tag || 'ideas')
    }

    function saveEdit() {
        if (!editTitle.trim() && !getPlainNoteText(editText)) return
        if (editId !== null) {
            updateItem(editId, (n) => ({
                ...n,
                title: editTitle.trim(),
                text: editText,
                tag: editTag,
            }))
        }
        setEditId(null)
    }

    const filtered = notes
        .filter((n) => {
            const plainText = getPlainNoteText(n.text)
            const matchesSearch =
                n.title.toLowerCase().includes(search.toLowerCase()) ||
                plainText.toLowerCase().includes(search.toLowerCase())
            const matchesTag = selectedTag === 'all' || n.tag === selectedTag
            return matchesSearch && matchesTag
        })
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.created - a.created)

    if (loading) {
        return (
            <div className="empty">
                <div className="big">⏳</div>
                <p>Loading your notes...</p>
            </div>
        )
    }

    return (
        <div className="notes-container">
            <div className="notes-header-bar">
                <div>
                    <h2 className="greet">
                        Welcome back, <span>{user?.firstName || 'there'}</span> 👋
                    </h2>
                    <p className="muted">
                        {notes.length} {notes.length === 1 ? 'note' : 'notes'} saved
                    </p>
                </div>

                <div className="search-wrap">
                    <input
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="🔍 Search notes by title or content..."
                    />
                </div>
            </div>

            {/* Note Creation Card */}
            <div className="composer-card">
                <input
                    className="composer-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note Title..."
                />
                <RichEditor
                    content={text}
                    onChange={setText}
                    placeholder="Take a note, capture thoughts, or paste links..."
                    minHeight={90}
                />
                <div className="composer-footer">
                    <div className="tag-selector">
                        <span className="small muted">Tag:</span>
                        {(['ideas', 'work', 'personal', 'urgent'] as NoteTag[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                className={`tag-pill ${tag === t ? 'active' : ''}`}
                                style={{
                                    borderColor: tag === t ? TAG_CONFIG[t].color : undefined,
                                    color: tag === t ? TAG_CONFIG[t].color : undefined,
                                }}
                                onClick={() => setTag(t)}
                            >
                                {TAG_CONFIG[t].label}
                            </button>
                        ))}
                    </div>

                    <button className="btn primary" onClick={addNote}>
                        Add note
                    </button>
                </div>
            </div>

            {/* Filter by tags */}
            <div className="tag-filters">
                <button
                    className={`tag-filter-btn ${selectedTag === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedTag('all')}
                >
                    All Notes ({notes.length})
                </button>
                {(['ideas', 'work', 'personal', 'urgent'] as NoteTag[]).map((t) => {
                    const count = notes.filter((n) => n.tag === t).length
                    return (
                        <button
                            key={t}
                            className={`tag-filter-btn ${selectedTag === t ? 'active' : ''}`}
                            onClick={() => setSelectedTag(t)}
                        >
                            {TAG_CONFIG[t].label} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
                <div className="empty">
                    <div className="big">📝</div>
                    <p>
                        {notes.length === 0
                            ? 'No notes yet. Create your first one above!'
                            : 'No notes match your current search or tag filter.'}
                    </p>
                </div>
            )}

            {/* Notes Grid */}
            <div className="notes-grid">
                {filtered.map((n, index) => {
                    const isEditing = editId === n.id
                    const cardTilt = getTiltHandlers(4.5, isEditing)
                    return (
                    <div
                        key={n.id}
                        className={`note-card tilt-surface ${n.pinned ? 'pinned' : ''} ${isEditing ? 'is-editing' : ''}`}
                        style={{ animationDelay: `${Math.min(index * 40, 240)}ms` }}
                        {...cardTilt}
                    >
                        {isEditing ? (
                            <div className="edit-form edit-enter">
                                <input
                                    className="composer-title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Title"
                                    autoFocus
                                />
                                <RichEditor
                                    content={editText}
                                    onChange={setEditText}
                                    placeholder="Content"
                                    minHeight={110}
                                />
                                <div className="edit-tag-row">
                                    {(['ideas', 'work', 'personal', 'urgent'] as NoteTag[]).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            className={`tag-pill ${editTag === t ? 'active' : ''}`}
                                            style={{
                                                borderColor: editTag === t ? TAG_CONFIG[t].color : undefined,
                                                color: editTag === t ? TAG_CONFIG[t].color : undefined,
                                            }}
                                            onClick={() => setEditTag(t)}
                                        >
                                            {TAG_CONFIG[t].label}
                                        </button>
                                    ))}
                                </div>
                                <div className="actions edit-actions">
                                    <button className="btn primary small" onClick={saveEdit}>
                                        Save changes
                                    </button>
                                    <button className="btn small" onClick={() => setEditId(null)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="note-card-top">
                                    <div className="note-card-meta">
                                        {n.tag && (
                                            <span
                                                className="note-badge"
                                                style={{
                                                    backgroundColor: TAG_CONFIG[n.tag]?.bg,
                                                    color: TAG_CONFIG[n.tag]?.color,
                                                }}
                                            >
                                                {TAG_CONFIG[n.tag]?.label}
                                            </span>
                                        )}
                                        <span className="small muted">{timeAgo(n.created)}</span>
                                    </div>
                                    <button
                                        className={`pin-action-btn ${n.pinned ? 'is-pinned' : ''}`}
                                        onClick={() => togglePin(n.id)}
                                        title={n.pinned ? 'Unpin note' : 'Pin to top'}
                                    >
                                        📌
                                    </button>
                                </div>

                                {n.title && <h3 className="note-title">{n.title}</h3>}
                                <div
                                    className="note-text"
                                    dangerouslySetInnerHTML={{ __html: normalizeNoteHtml(n.text) }}
                                />

                                {/* Action bar visible on hover */}
                                <div className="note-hover-actions">
                                    <button className="btn small" onClick={() => startEdit(n)}>
                                        ✏️ Edit
                                    </button>
                                    <button className="btn small danger-btn" onClick={() => deleteNote(n.id)}>
                                        🗑️ Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    )
                })}
            </div>
        </div>
    )
}
