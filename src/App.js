import React, { useState, useEffect, useCallback } from 'react'
import './App.css' // External CSS for styling

const DEFAULT_SPEED = 500
const DEFAULT_SIZE = 20
const MIN_SIZE = 10
const MAX_SIZE = 100
const MIN_SPEED = 50
const MAX_SPEED = 2000
const DEAD_FREQUENCY = 0.7

// Directions to check the eight neighbors around a cell (excluding the cell itself)
const neighborDirections = [-1, 0, 1]
  .flatMap(dx => [-1, 0, 1].map(dy => [dx, dy]))
  .filter(([dx, dy]) => dx !== 0 || dy !== 0)

// Helper function to create an empty grid
const generateEmptyGrid = (rows, cols, existingGrid = null) =>
  Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) =>
      existingGrid && existingGrid[i] && existingGrid[i][j] !== undefined
        ? existingGrid[i][j]
        : 0
    )
  )

// Helper function to randomly populate the grid with 1s (alive) and 0s (dead)
const randomPopulateGrid = (rows, cols) =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() > DEAD_FREQUENCY ? 1 : 0))
  )

const BACKGROUND_IMAGES = [
  'https://t3.ftcdn.net/jpg/08/95/60/58/240_F_895605832_9DKMp9WdTprPSxCEvDn4p69hByYXnZBk.jpg',
  'https://as1.ftcdn.net/v2/jpg/07/45/14/78/1000_F_745147868_ZDDQOsRgip9lgNYFasL9Od3NVQZiqyiD.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg/1280px-Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg'
]

function App() {
  const [numRows, setNumRows] = useState(DEFAULT_SIZE)
  const [numCols, setNumCols] = useState(DEFAULT_SIZE)
  const [grid, setGrid] = useState(() => generateEmptyGrid(DEFAULT_SIZE, DEFAULT_SIZE))
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)

  const [backgroundIndex, setBackgroundIndex] = useState(0)
  const [backgroundMessage, setBackgroundMessage] = useState('')
  const [backgroundImage, setBackgroundImage] = useState(null)

  // Function to simulate one step of the Game of Life
  const simulateStep = useCallback(
    (currentGrid) => {
      return currentGrid.map((row, i) =>
        row.map((cell, k) => {
          let neighbors = 0

          // Count alive neighbors
          neighborDirections.forEach(([dx, dy]) => {
            const x = i + dx
            const y = k + dy

            // Check if neighbor is within grid bounds
            if (x >= 0 && x < numRows && y >= 0 && y < numCols) {
              neighbors += currentGrid[x][y]
            }
          })

          // Apply the Game of Life rules
          if (cell === 1) {
            // Cell is alive
            if (neighbors < 2 || neighbors > 3) return 0 // Cell dies due to underpopulation or overpopulation
            return 1 // Cell lives to the next generation
          } else {
            // Cell is dead
            if (neighbors === 3) return 1 // Cell becomes alive by reproduction
            return 0 // Cell remains dead
          }
        })
      )
    },
    [numRows, numCols]
  )

  // Asynchronous function to handle the simulation loop
  useEffect(() => {
    let isActive = true

    const runSimulation = async () => {
      if (!isActive || !running) return

      setGrid((g) => simulateStep(g))
      await new Promise((resolve) => setTimeout(resolve, speed))

      if (running) {
        runSimulation()
      }
    }

    if (running) {
      runSimulation()
    }

    return () => {
      isActive = false
    }
  }, [running, speed, simulateStep])

  // Reset the grid and stop the simulation
  const handleReset = () => {
    setGrid(generateEmptyGrid(numRows, numCols))
    setRunning(false)
  }

  // Manually step forward by one generation
  const handleStepForward = () => {
    setGrid((g) => simulateStep(g))
  }

  // Populate the grid with random cells
  const handleRandomPopulate = () => {
    setGrid(randomPopulateGrid(numRows, numCols))
  }

  // Set the background image when the component mounts
  useEffect(() => {
    const setInitialBackground = async () => {
      setBackgroundMessage('Fetching initial background image...')
      try {
        const response = await fetch(BACKGROUND_IMAGES[backgroundIndex])
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`)
        }
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onloadend = () => {
          setBackgroundImage(reader.result)
          setBackgroundMessage('Background image set')
        }
        reader.readAsDataURL(blob)
      } catch (error) {
        setBackgroundMessage(`Error fetching image: ${error.message}`)
      }
    }

    setInitialBackground()
  }, [backgroundIndex])

  // Function to change the background image
  const changeBackground = async () => {
    setBackgroundMessage('Fetching new background image...')
    let nextIndex = (backgroundIndex + 1) % BACKGROUND_IMAGES.length
    try {
      const response = await fetch(BACKGROUND_IMAGES[nextIndex])
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      const blob = await response.blob()
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackgroundImage(reader.result)
        setBackgroundMessage('Background image updated')
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      setBackgroundMessage(`Error fetching image: ${error.message}`)
    } finally {
      setBackgroundIndex(nextIndex)
    }
  }

  return (
    <div
      className="app-container"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
      }}
    >
      <h1 className="title">
        Docketing Waste as Part of the<br />
        Cycle of Life Core Service
      </h1>

      <p>
        Message: {backgroundMessage}
      </p>

      <div className="controls">
        {/* Sliders Section */}
        <div className="slider-section">
          <div className="slider-group">
            <label>Rows: {numRows}</label>
            <input
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={numRows}
              onChange={(e) => {
                const value = Number(e.target.value)
                setNumRows(value)
                setGrid((g) => generateEmptyGrid(value, numCols, g))
              }}
              disabled={running}
            />
          </div>
          <div className="slider-group">
            <label>Cols: {numCols}</label>
            <input
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={numCols}
              onChange={(e) => {
                const value = Number(e.target.value)
                setNumCols(value)
                setGrid((g) => generateEmptyGrid(numRows, value, g))
              }}
              disabled={running}
            />
          </div>
          <div className="slider-group">
            <label>Speed: {speed} ms</label>
            <input
              type="range"
              min={MIN_SPEED}
              max={MAX_SPEED}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Buttons Section */}
        <div className="button-group">
          <button onClick={() => setRunning(!running)}>{running ? 'Stop' : 'Start'}</button>
          <button onClick={handleReset} disabled={running}>
            Reset
          </button>
          <button onClick={handleStepForward} disabled={running}>
            Step Forward
          </button>
          <button onClick={handleRandomPopulate} disabled={running}>
            Random
          </button>
          <button onClick={changeBackground}>
            Change Background
          </button>
        </div>
      </div>

      <div
        className="board"
        style={{ gridTemplateColumns: `repeat(${numCols}, 25px)` }}
      >
        {grid.map((row, i) =>
          row.map((cell, k) => (
            <div
              key={`${i}-${k}`}
              data-testid="cell"
              onClick={() => {
                // Toggle cell state on click
                const newGrid = grid.map((row, rowIndex) =>
                  rowIndex === i
                    ? row.map((cellValue, colIndex) =>
                      colIndex === k ? (cellValue ? 0 : 1) : cellValue
                    )
                    : row
                )
                setGrid(newGrid)
              }}
              className={`cell ${cell ? 'alive' : ''}`}
            >
              {cell ? '🗑️' : ''}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App
