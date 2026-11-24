import { useEffect, useState } from 'react'
import './app.css'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import Notes from './notes'

export default function App() {
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

    useEffect(() => {
        const theme = dark ? 'dark' : 'light'
        document.documentElement.dataset.theme = theme
        localStorage.setItem('theme', theme)
    }, [dark])

    return (
        <div className="app">
            <header>
                <h1>📝 My Notes</h1>
                <div className="actions">
                    <button
                        className="btn small"
                        onClick={() => setDark(!dark)}
                        aria-label="Switch light and dark mode"
                    >
                        {dark ? '☀️ Light' : '🌙 Dark'}
                    </button>
                    <Show when="signed-in">
                        <UserButton />
                    </Show>
                </div>
            </header>

            <Show when="signed-out">
                <section className="hero">
                    <h2>Your notes, private to you.</h2>
                    <p>Sign in and your notes load only for your account. Another person on this app sees their own.</p>
                    <div className="actions">
                        <SignUpButton>
                            <button className="btn primary">Create account</button>
                        </SignUpButton>
                        <SignInButton>
                            <button className="btn">Sign in</button>
                        </SignInButton>
                    </div>
                </section>
            </Show>

            <Show when="signed-in">
                <Notes />
            </Show>
        </div>
    )
}