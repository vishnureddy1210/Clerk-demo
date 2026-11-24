import { useEffect, useState } from 'react'
import './app.css'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import Notes from './notes'
import Todos from './todos'
import CalendarView from './calendar'

type Tab = 'notes' | 'todos' | 'calendar'

export default function App() {
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
    const [activeTab, setActiveTab] = useState<Tab>('notes')

    useEffect(() => {
        const theme = dark ? 'dark' : 'light'
        document.documentElement.dataset.theme = theme
        localStorage.setItem('theme', theme)
    }, [dark])

    return (
        <div className="app">
            <header>
                <div className="brand-group">
                    <h1>🔥 Lock In</h1>
                    <span className="brand-tag">no cap</span>
                </div>

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
                    <h2>Time to lock in. No distractions.</h2>
                    <p>
                        Your personal space to cook: drop your brain dumps, slay your to-dos, 
                        and keep your schedule in check. 100% private to your account.
                    </p>
                    <div className="actions">
                        <SignUpButton>
                            <button className="btn primary">Start Cooking (Sign Up)</button>
                        </SignUpButton>
                        <SignInButton>
                            <button className="btn">Sign In</button>
                        </SignInButton>
                    </div>
                </section>
            </Show>

            <Show when="signed-in">
                {/* Navigation Bar / Tabs */}
                <nav className="tab-navigation">
                    <button
                        className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        📝 Notes & Thoughts
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'todos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('todos')}
                    >
                        ✅ To-Do Checklist
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
                        onClick={() => setActiveTab('calendar')}
                    >
                        📅 Calendar & Events
                    </button>
                </nav>

                {/* View switcher */}
                <main className="tab-content">
                    {activeTab === 'notes' && <Notes />}
                    {activeTab === 'todos' && <Todos />}
                    {activeTab === 'calendar' && <CalendarView />}
                </main>
            </Show>
        </div>
    )
}
