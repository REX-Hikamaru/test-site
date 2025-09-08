import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Trophy } from 'lucide-react';

export function Game2048({ difficulty = '初級' }) {
  const gridSize = difficulty === '初級' ? 4 : difficulty === '中級' ? 5 : 6;
  const winTarget = difficulty === '初級' ? 2048 : difficulty === '中級' ? 4096 : 8192;
  
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('2048-best-score');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [moves, setMoves] = useState(0);

  // Initialize empty board
  const createEmptyBoard = () => {
    return Array(gridSize).fill().map(() => Array(gridSize).fill(0));
  };

  // Add random tile (2 or 4)
  const addRandomTile = (currentBoard) => {
    const emptyCells = [];
    currentBoard.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 0) emptyCells.push([rowIndex, colIndex]);
      });
    });

    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newBoard = currentBoard.map(row => [...row]);
      newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
      return newBoard;
    }
    return currentBoard;
  };

  // Initialize game
  const initGame = () => {
    let newBoard = createEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setMoves(0);
  };

  useEffect(() => {
    initGame();
  }, [difficulty, gridSize]);

  // Move tiles left
  const moveLeft = (currentBoard) => {
    let newBoard = currentBoard.map(row => [...row]);
    let newScore = 0;
    let moved = false;

    for (let row = 0; row < gridSize; row++) {
      let arr = newBoard[row].filter(cell => cell !== 0);
      
      for (let col = 0; col < arr.length - 1; col++) {
        if (arr[col] === arr[col + 1]) {
          arr[col] *= 2;
          arr[col + 1] = 0;
          newScore += arr[col];
        }
      }
      
      arr = arr.filter(cell => cell !== 0);
      const newRow = [...arr, ...Array(gridSize - arr.length).fill(0)];
      
      if (JSON.stringify(newBoard[row]) !== JSON.stringify(newRow)) {
        moved = true;
      }
      newBoard[row] = newRow;
    }

    return { board: newBoard, score: newScore, moved };
  };

  // Rotate board 90 degrees clockwise
  const rotateBoard = (currentBoard) => {
    const newBoard = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        newBoard[col][gridSize - 1 - row] = currentBoard[row][col];
      }
    }
    return newBoard;
  };

  // Handle moves in all directions
  const handleMove = useCallback((direction) => {
    if (gameOver || gameWon) return;

    let currentBoard = board.map(row => [...row]);
    let rotations = 0;

    // Rotate board to convert all moves to left moves
    switch (direction) {
      case 'up': rotations = 3; break;
      case 'right': rotations = 2; break;
      case 'down': rotations = 1; break;
      default: rotations = 0; break;
    }

    for (let i = 0; i < rotations; i++) {
      currentBoard = rotateBoard(currentBoard);
    }

    const { board: movedBoard, score: moveScore, moved } = moveLeft(currentBoard);

    if (!moved) return;

    // Rotate back
    let finalBoard = movedBoard;
    for (let i = 0; i < (4 - rotations) % 4; i++) {
      finalBoard = rotateBoard(finalBoard);
    }

    // Add new tile
    finalBoard = addRandomTile(finalBoard);

    const newScore = score + moveScore;
    setBoard(finalBoard);
    setScore(newScore);
    setMoves(moves + 1);

    if (newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem('2048-best-score', newScore.toString());
    }

    // Check for win
    const hasWinTile = finalBoard.some(row => row.some(cell => cell >= winTarget));
    if (hasWinTile && !gameWon) {
      setGameWon(true);
    }

    // Check for game over
    const hasEmptyCell = finalBoard.some(row => row.some(cell => cell === 0));
    if (!hasEmptyCell && !canMove(finalBoard)) {
      setGameOver(true);
    }
  }, [board, score, bestScore, gameOver, gameWon, moves, winTarget]);

  // Check if any moves are possible
  const canMove = (currentBoard) => {
    // Check for empty cells
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (currentBoard[row][col] === 0) return true;
        
        // Check adjacent cells
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dx, dy] of directions) {
          const newRow = row + dx;
          const newCol = col + dy;
          if (
            newRow >= 0 && newRow < gridSize &&
            newCol >= 0 && newCol < gridSize &&
            currentBoard[row][col] === currentBoard[newRow][newCol]
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); handleMove('left'); break;
        case 'ArrowRight': e.preventDefault(); handleMove('right'); break;
        case 'ArrowUp': e.preventDefault(); handleMove('up'); break;
        case 'ArrowDown': e.preventDefault(); handleMove('down'); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleMove]);

  // Get tile color
  const getTileColor = (value) => {
    const colors = {
      0: 'bg-gray-100',
      2: 'bg-gray-200 text-gray-800',
      4: 'bg-gray-300 text-gray-800',
      8: 'bg-orange-200 text-white',
      16: 'bg-orange-300 text-white',
      32: 'bg-orange-400 text-white',
      64: 'bg-orange-500 text-white',
      128: 'bg-yellow-400 text-white',
      256: 'bg-yellow-500 text-white',
      512: 'bg-yellow-600 text-white',
      1024: 'bg-red-400 text-white',
      2048: 'bg-red-500 text-white',
      4096: 'bg-purple-500 text-white',
      8192: 'bg-purple-600 text-white',
    };
    return colors[value] || 'bg-pink-500 text-white';
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card className="p-6">
        {/* Game Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{difficulty}</Badge>
            <div className="text-sm">
              <div>スコア: <span className="font-semibold">{score.toLocaleString()}</span></div>
              <div>ベスト: <span className="font-semibold">{bestScore.toLocaleString()}</span></div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={initGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            新ゲーム
          </Button>
        </div>

        {/* Game Status */}
        {gameWon && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center text-yellow-800">
              <Trophy className="w-5 h-5 mr-2" />
              おめでとうございます！{winTarget}達成です！
            </div>
          </div>
        )}

        {gameOver && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="text-red-800">
              ゲームオーバー！最終スコア: {score.toLocaleString()}
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="bg-gray-300 p-4 rounded-lg">
          <div 
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    aspect-square rounded flex items-center justify-center
                    text-lg font-bold transition-all duration-150
                    ${getTileColor(cell)}
                    ${cell > 0 ? 'transform scale-100' : ''}
                  `}
                  style={{
                    fontSize: cell > 999 ? '0.75rem' : cell > 99 ? '0.875rem' : '1.125rem'
                  }}
                >
                  {cell > 0 ? cell : ''}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6">
          <div className="grid grid-cols-3 gap-2 max-w-32 mx-auto mb-4">
            <div></div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleMove('up')}
              disabled={gameOver}
              className="aspect-square p-0"
            >
              ↑
            </Button>
            <div></div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleMove('left')}
              disabled={gameOver}
              className="aspect-square p-0"
            >
              ←
            </Button>
            <div></div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleMove('right')}
              disabled={gameOver}
              className="aspect-square p-0"
            >
              →
            </Button>
            <div></div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleMove('down')}
              disabled={gameOver}
              className="aspect-square p-0"
            >
              ↓
            </Button>
            <div></div>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>矢印キーまたはボタンで移動</p>
            <p>同じ数字を合わせて{winTarget.toLocaleString()}を目指そう！</p>
            <p>手数: {moves}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}