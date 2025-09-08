import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Check, Lightbulb } from 'lucide-react';

export function NumberPlaceGame({ difficulty = '初級' }) {
  const gridSize = difficulty === '初級' ? 6 : difficulty === '中級' ? 8 : 9;
  const maxNumber = gridSize;
  
  const [board, setBoard] = useState([]);
  const [initialBoard, setInitialBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [errors, setErrors] = useState(new Set());
  const [completed, setCompleted] = useState(false);
  const [time, setTime] = useState(0);

  // Generate a solvable number place puzzle
  const generateBoard = () => {
    const newBoard = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    
    // Sample puzzles for each difficulty
    const samplePuzzles = {
      6: [
        [1,0,3,0,5,0],
        [0,5,0,2,0,1],
        [3,0,0,0,6,0],
        [0,6,0,0,0,3],
        [5,0,2,0,1,0],
        [0,1,0,6,0,4]
      ],
      8: [
        [1,0,3,0,5,0,7,0],
        [0,5,0,2,0,7,0,1],
        [3,0,0,0,6,0,0,0],
        [0,6,0,0,0,3,0,0],
        [5,0,2,0,1,0,8,0],
        [0,1,0,6,0,4,0,3],
        [7,0,0,0,3,0,0,6],
        [0,8,0,7,0,2,0,4]
      ],
      9: [
        [1,0,3,0,5,0,7,0,2],
        [0,5,0,2,0,7,0,1,0],
        [3,0,0,0,6,0,0,0,8],
        [0,6,0,0,0,3,0,0,0],
        [5,0,2,0,1,0,8,0,6],
        [0,1,0,6,0,4,0,3,0],
        [7,0,0,0,3,0,0,6,0],
        [0,8,0,7,0,2,0,4,0],
        [2,0,6,0,8,0,1,0,7]
      ]
    };

    const puzzle = samplePuzzles[gridSize];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        newBoard[i][j] = puzzle[i][j];
      }
    }
    
    setBoard([...newBoard]);
    setInitialBoard([...newBoard]);
    setErrors(new Set());
    setCompleted(false);
    setTime(0);
  };

  useEffect(() => {
    generateBoard();
  }, [difficulty, gridSize]);

  useEffect(() => {
    if (!completed) {
      const timer = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [completed]);

  const isValidMove = (row, col, num) => {
    if (num === 0) return true;
    
    // Check row
    for (let i = 0; i < gridSize; i++) {
      if (i !== col && board[row][i] === num) return false;
    }
    
    // Check column
    for (let i = 0; i < gridSize; i++) {
      if (i !== row && board[i][col] === num) return false;
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

  const getHint = () => {
    if (!selectedCell) return;
    
    const [row, col] = selectedCell;
    if (initialBoard[row][col] !== 0) return;
    
    // Find a valid number for the selected cell
    for (let num = 1; num <= maxNumber; num++) {
      const tempBoard = [...board];
      tempBoard[row][col] = num;
      
      const tempErrors = new Set();
      if (!isValidMove(row, col, num)) {
        tempErrors.add(`${row}-${col}`);
      }
      
      if (tempErrors.size === 0) {
        handleNumberInput(num);
        break;
      }
    }
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
              新しいパズル
            </Button>
            <Button variant="outline" size="sm" onClick={getHint}>
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

        {/* Number Place Grid */}
        <div className="grid gap-1 mb-6 bg-gray-900 p-2 rounded-lg mx-auto w-fit"
             style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm font-semibold
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
        <div className="grid gap-2 max-w-sm mx-auto"
             style={{ gridTemplateColumns: `repeat(${Math.ceil(maxNumber / 2)}, 1fr)` }}>
          {Array.from({ length: maxNumber }, (_, i) => i + 1).map(num => (
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
        <div className="mt-6 text-sm text-gray-600 text-center space-y-1">
          <p>空いているマスをクリックして、1-{maxNumber}の数字を入力してください</p>
          <p>同じ行・列に同じ数字は入りません</p>
          <p>全てのマスを埋めるとクリア！</p>
          
          {/* Rules explanation */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium mb-2">ナンバープレースのルール:</p>
            <div className="text-blue-700 text-left space-y-1">
              <p>• 各行に1-{maxNumber}の数字を1つずつ配置</p>
              <p>• 各列に1-{maxNumber}の数字を1つずつ配置</p>
              <p>• グレーのマスは変更できません</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}