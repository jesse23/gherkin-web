import { useState } from 'react'
import './App.css'

import { executeGherkinFeature } from './services/gherkin'
// Import to register step definitions - world need not to be the same,
// as soon as step is working. But here we use the same world
import '../test/support/world'
import '../test/steps/app.steps'

function App() {
  const [count, setCount] = useState(0)

  const runTestFeature = async () => {
    try {
      const response = await fetch('/features/app.feature');
      const featureContent = await response.text();
      await executeGherkinFeature(featureContent)
    } catch (error) {
      console.error('Error loading or parsing feature file:', error)
    }
  }

  return (
    <>
      <h2>Gherkin Web Test Bed</h2>
      <div className="card">

        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
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