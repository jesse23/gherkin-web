import { useState } from 'react'
import './App.css'

import { executeGherkinFeature } from '@gherkin-web/core/gherkin'
import '../test/support/setup'
import '../test/steps/app.steps'

const runTestFeature = async () => {
  try {
    const response = await fetch('/features/app.feature');
    const featureContent = await response.text();
    await executeGherkinFeature(featureContent)
  } catch (error) {
    console.error('Error loading or parsing feature file:', error)
  }
}

function App() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  return (
    <>
      <h2>Gherkin Web Test Bed (Playwright)</h2>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <div className="input-group">
          <label htmlFor="textInput">Enter text:</label>
          <input 
            id="textInput"
            type="text" 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something..."
          />
          <div className="text-display">
            Current text: <span id="textValue">{text}</span>
          </div>
        </div>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <button onClick={runTestFeature} className="test-button">
        Run Test Feature
      </button>
    </>
  )
}

export default App
