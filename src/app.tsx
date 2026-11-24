import './app.css'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import Notes from './notes'

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>📝 My Notes</h1>
        <div>
          <Show when="signed-out">
            <SignInButton />
            <SignUpButton />
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </header>

      <Show when="signed-out">
        <p>Please sign in to see your notes.</p>
      </Show>

      <Show when="signed-in">
        <Notes />
      </Show>
    </div>
  )
}
