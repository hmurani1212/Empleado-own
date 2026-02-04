import { useLocation } from 'react-router-dom'

export default function NotesViewer() {
  const { state } = useLocation()

  if (!state) {
    return <h2>No notes data</h2>
  }

  return (
    <div style={{
      padding: 24,
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      lineHeight: 1.6
    }}>
      <h2>{state.title}</h2>
      <hr />
      {state.content}
    </div>
  )
}
