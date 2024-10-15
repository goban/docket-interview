import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  // Test 1: App renders and displays the title
  test('renders the app and displays the title', () => {
    // Render the App component
    render(<App />)
    // Check that the title is displayed
    const titleElement = screen.getByText(/Docketing Waste as Part of the/i)
    expect(titleElement).toBeInTheDocument()
  })

  // Test 2: Initial grid is empty
  test('initial grid is empty', () => {
    // Render the App component
    render(<App />)
    // Get all cells using data-testid attribute
    const cells = screen.getAllByTestId('cell')
    // Check that all cells are empty
    cells.forEach((cell) => {
      expect(cell.textContent).toBe('')
    })
  })

  // Test 3: Clicking on a cell toggles its state
  test('clicking a cell toggles its state', () => {
    // Render the App component
    render(<App />)
    // Get all the cells
    const cells = screen.getAllByTestId('cell')
    const cell = cells[0] // Select the first cell
    // Click the cell to activate it
    fireEvent.click(cell)
    // Check that the cell now displays the trash can icon
    expect(cell.textContent).toBe('🗑️')
    // Click the cell again to deactivate it
    fireEvent.click(cell)
    // Check that the cell is empty again
    expect(cell.textContent).toBe('')
  })

  // Test 4: Random button populates the grid
  test('clicking "Random" populates the grid', () => {
    // Render the App component
    render(<App />)
    // Find and click the "Random" button
    const randomButton = screen.getByText('Random')
    fireEvent.click(randomButton)
    // Get all the cells
    const cells = screen.getAllByTestId('cell')
    // Check that at least one cell is active
    const hasActiveCell = cells.some((cell) => cell.textContent === '🗑️')
    expect(hasActiveCell).toBe(true)
  })

  // Test 5: Reset button clears the grid
  test('clicking "Reset" clears the grid', () => {
    // Render the App component
    render(<App />)
    // Find and click the "Random" button to populate the grid
    const randomButton = screen.getByText('Random')
    fireEvent.click(randomButton)
    // Find and click the "Reset" button
    const resetButton = screen.getByText('Reset')
    fireEvent.click(resetButton)
    // Get all the cells
    const cells = screen.getAllByTestId('cell')
    // Check that all cells are empty
    cells.forEach((cell) => {
      expect(cell.textContent).toBe('')
    })
  })

  // Test 6: Simulation starts and stops correctly
  test('simulation starts and stops when buttons are clicked', () => {
    // Render the App component
    render(<App />)
    // Find the "Start" button and click it to start the simulation
    const startButton = screen.getByText('Start')
    fireEvent.click(startButton)
    // Verify that the button text changes to "Stop"
    expect(startButton.textContent).toBe('Stop')
    // Click the "Stop" button to stop the simulation
    fireEvent.click(startButton)
    // Verify that the button text changes back to "Start"
    expect(startButton.textContent).toBe('Start')
  })

  // Test 7: Step Forward advances the simulation by one generation
  test('clicking "Step Forward" advances the simulation by one generation', () => {
    // Render the App component
    render(<App />)
    // Get all the cells
    const cells = screen.getAllByTestId('cell')
    // Activate a simple pattern (e.g., three cells in a row)
    fireEvent.click(cells[1])
    fireEvent.click(cells[2])
    fireEvent.click(cells[3])
    // Capture the initial state of the grid
    const initialState = cells.map((cell) => cell.textContent)
    // Find and click the "Step Forward" button
    const stepButton = screen.getByText('Step Forward')
    fireEvent.click(stepButton)
    // Get the new state of the grid
    const newState = cells.map((cell) => cell.textContent)
    // Check that the grid state has changed
    expect(newState).not.toEqual(initialState)
  })
})
