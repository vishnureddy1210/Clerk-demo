import { useEffect, useState } from 'react'
import './app.css'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import Notes from './notes'
import Todos from './todos'
import CalendarView from './calendar'
import { getTiltHandlers } from './tilt3d'

type Tab = 'notes' | 'todos' | 'calendar'

export default function App() {
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
    const [activeTab, setActiveTab] = useState<Tab>('notes')
    const heroTilt = getTiltHandlers(3)

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
                <section className="hero tilt-surface" {...heroTilt}>
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
                <nav className="tab-navigation" role="tablist" aria-label="Workspace views">
                    <button
                        role="tab"
                        aria-selected={activeTab === 'notes'}
                        className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        <span className="tab-icon" aria-hidden="true">📝</span>
                        <span className="tab-label">Notes</span>
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'todos'}
                        className={`tab-btn ${activeTab === 'todos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('todos')}
                    >
                        <span className="tab-icon" aria-hidden="true">✅</span>
                        <span className="tab-label">To-Do</span>
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'calendar'}
                        className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
                        onClick={() => setActiveTab('calendar')}
                    >
                        <span className="tab-icon" aria-hidden="true">📅</span>
                        <span className="tab-label">Calendar</span>
                    </button>
                </nav>

                {/* View switcher with smooth 3D entrance on tab switch */}
                <main key={activeTab} className="tab-content view-enter">
                    {activeTab === 'notes' && <Notes />}
                    {activeTab === 'todos' && <Todos />}
                    {activeTab === 'calendar' && <CalendarView />}
                </main>
            </Show>
        </div>
    )
}
