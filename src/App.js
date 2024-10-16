import React, { useState, useEffect, useCallback } from 'react'
import * as fs from 'fs'
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
  'https://www.atlasandboots.com/wp-content/uploads/2019/05/ama-dablam2-most-beautiful-mountains-in-the-world.jpg',
  'https://worldwildschooling.com/wp-content/uploads/2024/03/Must-Visit-American-Landscapes-for-Stunning-Photography-Denali-National-Park-Alaska_%C2%A9-evenfh_Adobe-Stock-Photo_231359324-1536x864.jpg',
  'https://worldwildschooling.com/wp-content/uploads/2024/05/Mountains-in-the-US_Grand-Teton-Wyoming_Kennytong_Adobe-Stock-Photo_67602283.webp',
]

function App() {
  const [numRows, setNumRows] = useState(DEFAULT_SIZE)
  const [numCols, setNumCols] = useState(DEFAULT_SIZE)
  const [grid, setGrid] = useState(() => generateEmptyGrid(DEFAULT_SIZE, DEFAULT_SIZE))
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)

  // const [imageSourceUrl, setImageSourceUrl] = useState("")
  const [backgroundIndex, setBackgroundIndex] = useState(0)
  // const [background, setBackground] = useState(null)
  const [backgroundMessage, setBackgroundMessage] = useState('')
  const [backgroundFetching, setBackgroundFetching] = useState(false)

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
      if (backgroundFetching) {
        setBackgroundMessage('Fetching image...')
        try {
          const fetchResult = await fetch(BACKGROUND_IMAGES[backgroundIndex])
          if (!fetchResult.ok) {
            throw new Error('Failed to fetch image')
          }
          const blob = fetchResult.blob()
          var buffer = await blob.arrayBuffer()
          buffer = Buffer.from(buffer)
          fs.createWriteStream('../public/dumpster.png').write(buffer)
          setBackgroundMessage('Image fetched successfully')
        } catch (error) {
          setBackgroundMessage(`${error}`)
        } finally {
          setBackgroundFetching(false)
          setBackgroundIndex(backgroundIndex === BACKGROUND_IMAGES.length - 1 ? 0 : backgroundIndex + 1)
        }
      }

      if (!isActive || !running) return

      setGrid((g) => simulateStep(g))
      await new Promise((resolve) => setTimeout(resolve, speed))
      runSimulation()
    }

    if (running) {
      runSimulation()
    }
    return () => {
      isActive = false
    }
  }, [backgroundFetching, setBackgroundFetching, setBackgroundMessage, running, speed, simulateStep, backgroundIndex, setBackgroundIndex])

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

  // Populate the grid with random cells
  const activateDownload = () => {
    setBackgroundFetching(true)
  }

  return (
    <div className="app-container">
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
          <button onClick={activateDownload} disabled={backgroundFetching}>
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
