import { useEffect, useState } from 'react'
import { useUser } from '@clerk/react'

type Note = { id: number; text: string }

export default function Notes() {
    const { user } = useUser()
    const storageKey = `notes_${user?.id}`

    const [notes, setNotes] = useState<Note[]>([])
    const [text, setText] = useState('')
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem(storageKey)
        setNotes(saved ? JSON.parse(saved) : [])
        setLoaded(true)
    }, [storageKey])

    useEffect(() => {
        if (loaded) localStorage.setItem(storageKey, JSON.stringify(notes))
    }, [notes, loaded, storageKey])

    function addNote() {
        if (!text.trim()) return
        setNotes([{ id: Date.now(), text: text.trim() }, ...notes])
        setText('')
    }

    function deleteNote(id: number) {
        setNotes(notes.filter((n) => n.id !== id))
    }

    return (
        <div className="notes">
            <h2>Hi {user?.firstName || 'there'} 👋</h2>
            <p className="small">Your user ID: {user?.id}</p>

            <div className="row">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                    placeholder="Write a note..."
                />
                <button onClick={addNote}>Add</button>
            </div>

            {notes.length === 0 && <p>No notes yet. Add your first one!</p>}

            <ul>
                {notes.map((n) => (
                    <li key={n.id}>
                        <span>{n.text}</span>
                        <button onClick={() => deleteNote(n.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}