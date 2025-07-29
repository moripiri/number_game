// Frontend game logic - converted from Python backend
// This replaces the need for a backend server

// Create the initial game board: 3 rows of 9 numbers + 1 row of 8 numbers (35 total)
// Each number 1-9 appears at least 2 times, remaining 17 numbers distributed freely
export function createInitialBoard() {
  // First, ensure each number 1-9 appears at least 2 times (18 numbers total)
  let numbers = [];
  for (let i = 1; i <= 9; i++) {
    numbers.push(i, i); // 1-9, two times each
  }
  
  // Add 17 more random numbers (1-9) to make total 35
  for (let i = 0; i < 17; i++) {
    numbers.push(Math.floor(Math.random() * 9) + 1);
  }
  
  // Shuffle all numbers
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  // Create the board: 3 rows of 9 + 1 row of 8
  const board = [];
  for (let i = 0; i < 3; i++) {
    board.push(numbers.slice(i * 9, (i + 1) * 9)); // First 3 rows: 9 numbers each
  }
  board.push(numbers.slice(27, 35)); // Last row: 8 numbers
  return board;
}

// Collect all remaining numbers from the board (excluding null/empty cells)
export function collectRemainingNumbers(board) {
  const remaining = [];
  for (const row of board) {
    for (const cell of row) {
      if (cell !== null) {
        remaining.push(cell);
      }
    }
  }
  return remaining;
}

// Create a new board using only the remaining numbers from the current board
// Returns the remaining numbers in their original order (no shuffle)
export function createBoardFromRemaining(board) {
  // Collect all remaining numbers
  const remainingNumbers = collectRemainingNumbers(board);
  
  // If no numbers left, return empty board
  if (remainingNumbers.length === 0) {
    return [];
  }
  
  // Return the remaining numbers as a single row (maintaining original order)
  return [remainingNumbers];
}

// Check if two positions can be removed according to the game rules
// Rules:
// - The numbers must be the same or sum to 10
// - The positions must be adjacent, or all cells between them must be empty (null)
export function canRemove(board, pos1, pos2) {
  const [r1, c1] = pos1;
  const [r2, c2] = pos2;

  // Can't remove the same cell
  if (r1 === r2 && c1 === c2) {
    return false;
  }
  // Both positions must have a number
  if (board[r1][c1] === null || board[r2][c2] === null) {
    return false;
  }
    
  // Must be same number or sum to 10
  const num1 = board[r1][c1];
  const num2 = board[r2][c2];
  if (num1 !== num2 && num1 + num2 !== 10) {
    return false;
  }

  // Must be adjacent or have a clear path (no numbers in between)
  return isAdjacentOrClearPath(board, pos1, pos2);
}

// Check if two positions are adjacent or have a clear path (no numbers in between)
export function isAdjacentOrClearPath(board, pos1, pos2) {
  const [r1, c1] = pos1;
  const [r2, c2] = pos2;
  
  // Adjacent (including diagonals)
  if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) {
    return true;
  }
  
  // Same row: check all cells between
  if (r1 === r2) {
    const startCol = Math.min(c1, c2);
    const endCol = Math.max(c1, c2);
    for (let col = startCol + 1; col < endCol; col++) {
      if (col < board[r1].length && board[r1][col] !== null) {
        return false;
      }
    }
    return true;
  }
  
  // Same column: check all cells between
  if (c1 === c2) {
    const startRow = Math.min(r1, r2);
    const endRow = Math.max(r1, r2);
    for (let row = startRow + 1; row < endRow; row++) {
      if (row < board.length && c1 < board[row].length && board[row][c1] !== null) {
        return false;
      }
    }
    return true;
  }
  
  // Diagonal: check all cells between
  if (Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
    return isDiagonalPathClear(board, pos1, pos2);
  }
  
  // For non-adjacent, non-same-row/column, non-diagonal positions:
  // Check if there's a clear path by checking if all cells in the rows between them are null
  
  const startRow = Math.min(r1, r2);
  const endRow = Math.max(r1, r2);
  
  for (let row = startRow; row <= endRow; row++) {
    // Check all columns in this row
    for (let col = 0; col < 9; col++) {
      if (row === startRow && col < c1) {
        continue;
      }
      // Skip the two positions we're checking
      if (row === r1 && col === c1) {
        continue;
      }
      if (row === r2 && col === c2) {
        break;
      }
      // Check if cell is not null
      if (board[row][col] !== null) {
        return false;
      }
    }
  }
  
  return true;
}

// Check if the diagonal path between two positions is clear (no numbers in between)
export function isDiagonalPathClear(board, pos1, pos2) {
  const [r1, c1] = pos1;
  const [r2, c2] = pos2;
  // Determine the direction of the diagonal
  const rowStep = r2 > r1 ? 1 : -1;
  const colStep = c2 > c1 ? 1 : -1;
  let currentRow = r1 + rowStep;
  let currentCol = c1 + colStep;
  // Move along the diagonal and check each cell
  while (currentRow !== r2 && currentCol !== c2) {
    // Check if the cell exists and is not null
    if (currentRow < board.length && 
        currentCol < board[currentRow].length && 
        board[currentRow][currentCol] !== null) {
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }
  return true;
}

// Remove two numbers from the board (set them to null) and clean up empty rows
export function removeNumbers(board, pos1, pos2) {
  const [r1, c1] = pos1;
  const [r2, c2] = pos2;
  // Make a copy of the board
  const newBoard = board.map(row => [...row]);
  // Set the two positions to null (removed)
  newBoard[r1][c1] = null;
  newBoard[r2][c2] = null;
  // Clean up empty rows (remove rows that are completely empty)
  return cleanEmptyRows(newBoard);
}

// Remove rows that are completely empty (all cells are null)
export function cleanEmptyRows(board) {
  // Keep only rows that have at least one non-null cell
  return board.filter(row => row.some(cell => cell !== null));
}

// Check if the game is won (board is completely empty)
export function isGameWon(board) {
  // Since cleanEmptyRows removes all empty rows,
  // if board is empty, all numbers have been removed
  return board.length === 0;
}

// Helper function to get the last number index in a row
function getLastNumberIndex(row) {
  for (let i = row.length - 1; i >= 0; i--) {
    if (row[i] !== null) {
      return i;
    }
  }
  return -1; // 숫자가 없으면 -1
}

// Add remaining numbers from the current board (unlimited times)
export function addNumbers(board, remainingAdds) {
  // Create new board using remaining numbers from current board
  const newBoard = createBoardFromRemaining(board);
  
  // Make a deep copy of the current board
  const updatedBoard = board.map(row => [...row]);
  
  if (newBoard && newBoard[0] && newBoard[0].length > 0) { // If there are remaining numbers
    const remainingNumbers = newBoard[0]; // Get the single row of remaining numbers
    
    // Start with the last row if it exists, otherwise create a new row
    let currentRow = updatedBoard.length - 1;
    
    for (const number of remainingNumbers) {
      // If we need a new row (no rows exist or current row is full)
      if (currentRow < 0 || (getLastNumberIndex(updatedBoard[currentRow]) + 1) >= 9) {
        updatedBoard.push([]);
        currentRow = updatedBoard.length - 1;
      }
      
      // Find the next position after the last number in current row
      const lastNumIndex = getLastNumberIndex(updatedBoard[currentRow]);
      const nextPosition = lastNumIndex + 1;
      
      // Add the number at the next position
      if (nextPosition < updatedBoard[currentRow].length) {
        updatedBoard[currentRow][nextPosition] = number;
      } else {
        updatedBoard[currentRow].push(number);
      }
    }
  }
  
  // Ensure the last row has exactly 9 cells by padding with null
  if (updatedBoard && updatedBoard.length > 0) {
    const lastRow = updatedBoard[updatedBoard.length - 1];
    while (lastRow.length < 9) {
      lastRow.push(null);
    }
  }
  
  return {
    board: updatedBoard,
    remaining_adds: remainingAdds // Don't decrease - keep it unlimited
  };
}

// Start a new game
export function startGame() {
  const board = createInitialBoard();
  return {
    board: board,
    remaining_adds: 999 // Unlimited adds (999 is effectively unlimited)
  };
} 