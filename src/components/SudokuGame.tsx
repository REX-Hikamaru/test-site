import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Check, Lightbulb } from 'lucide-react';

export function SudokuGame({ difficulty = '初級' }) {
  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [initialBoard, setInitialBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState(null);
  const [errors, setErrors] = useState(new Set());
  const [completed, setCompleted] = useState(false);
  const [time, setTime] = useState(0);

  // Generate a valid Sudoku board
  const generateBoard = () => {
    // Simple Sudoku generation for demo
    const newBoard = Array(9).fill().map(() => Array(9).fill(0));
    
    // Pre-filled numbers based on difficulty
    const cellsToFill = difficulty === '初級' ? 35 : difficulty === '中級' ? 25 : 20;
    
    const sampleNumbers = [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ];
    
    setBoard([...sampleNumbers]);
    setInitialBoard([...sampleNumbers]);
    setErrors(new Set());
    setCompleted(false);
    setTime(0);
  };

  useEffect(() => {
    generateBoard();
  }, [difficulty]);

  useEffect(() => {
    if (!completed) {
      const timer = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [completed]);

  const isValidMove = (row, col, num) => {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (i !== col && board[row][i] === num) return false;
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
      if (i !== row && board[i][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if ((i !== row || j !== col) && board[i][j] === num) return false;
      }
    }
    
    return true;
  };

  const handleCellClick = (row, col) => {
    if (initialBoard[row][col] === 0) {
      setSelectedCell([row, col]);
    }
  };

  const handleNumberInput = (num) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    
    const newBoard = [...board];
    newBoard[row][col] = num;
    setBoard(newBoard);
    
    // Check for errors
    const newErrors = new Set();
    if (num > 0 && !isValidMove(row, col, num)) {
      newErrors.add(`${row}-${col}`);
    }
    setErrors(newErrors);
    
    // Check if completed
    const isComplete = newBoard.every(row => 
      row.every(cell => cell > 0)
    ) && newErrors.size === 0;
    
    if (isComplete) {
      setCompleted(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        {/* Game Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{difficulty}</Badge>
            <span className="text-lg font-mono">{formatTime(time)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={generateBoard}>
              <RotateCcw className="w-4 h-4 mr-2" />
              新しいゲーム
            </Button>
            <Button variant="outline" size="sm">
              <Lightbulb className="w-4 h-4 mr-2" />
              ヒント
            </Button>
          </div>
        </div>

        {completed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-green-800">
              <Check className="w-5 h-5 mr-2" />
              おめでとうございます！{formatTime(time)}でクリアしました！
            </div>
          </div>
        )}

        {/* Sudoku Grid */}
        <div className="grid grid-cols-9 gap-1 mb-6 bg-gray-900 p-2 rounded-lg mx-auto w-fit">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm font-semibold
                  border border-gray-300 transition-colors
                  ${initialBoard[rowIndex][colIndex] > 0 
                    ? 'bg-gray-100 text-gray-900 cursor-not-allowed' 
                    : 'bg-white text-gray-900 hover:bg-blue-50 cursor-pointer'
                  }
                  ${selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex 
                    ? 'ring-2 ring-blue-500' 
                    : ''
                  }
                  ${errors.has(`${rowIndex}-${colIndex}`) ? 'bg-red-100 text-red-600' : ''}
                  ${(colIndex + 1) % 3 === 0 && colIndex !== 8 ? 'border-r-2 border-r-gray-900' : ''}
                  ${(rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? 'border-b-2 border-b-gray-900' : ''}
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={initialBoard[rowIndex][colIndex] > 0 || completed}
              >
                {cell > 0 ? cell : ''}
              </button>
            ))
          )}
        </div>

        {/* Number Input */}
        <div className="grid grid-cols-9 gap-2 max-w-md mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <Button
              key={num}
              variant="outline"
              className="aspect-square p-0"
              onClick={() => handleNumberInput(num)}
              disabled={!selectedCell || completed}
            >
              {num}
            </Button>
          ))}
        </div>

        {/* Clear button */}
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => selectedCell && handleNumberInput(0)}
            disabled={!selectedCell || completed}
            className="w-20"
          >
            消去
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-sm text-gray-600 text-center">
          <p>空いているマスをクリックして、1-9の数字を入力してください</p>
          <p>同じ行・列・3×3ブロックに同じ数字は入りません</p>
        </div>
      </Card>
    </div>
  );
}