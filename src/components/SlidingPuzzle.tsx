import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Shuffle, Check } from 'lucide-react';

export function SlidingPuzzle({ difficulty = '初級' }) {
  const gridSize = difficulty === '初級' ? 3 : difficulty === '中級' ? 4 : 5;
  const totalTiles = gridSize * gridSize - 1;
  
  const [tiles, setTiles] = useState([]);
  const [emptyPos, setEmptyPos] = useState({ row: gridSize - 1, col: gridSize - 1 });
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize solved state
  const createSolvedBoard = () => {
    const board = [];
    for (let i = 0; i < gridSize; i++) {
      const row = [];
      for (let j = 0; j < gridSize; j++) {
        if (i === gridSize - 1 && j === gridSize - 1) {
          row.push(0); // Empty space
        } else {
          row.push(i * gridSize + j + 1);
        }
      }
      board.push(row);
    }
    return board;
  };

  // Check if current state is solved
  const isSolved = (board) => {
    const solved = createSolvedBoard();
    return JSON.stringify(board) === JSON.stringify(solved);
  };

  // Shuffle the board
  const shuffleBoard = () => {
    let board = createSolvedBoard();
    let empty = { row: gridSize - 1, col: gridSize - 1 };
    
    // Perform random valid moves to ensure solvability
    const directions = [
      { row: -1, col: 0 }, // up
      { row: 1, col: 0 },  // down
      { row: 0, col: -1 }, // left
      { row: 0, col: 1 }   // right
    ];
    
    for (let i = 0; i < 1000; i++) {
      const validMoves = directions.filter(dir => {
        const newRow = empty.row + dir.row;
        const newCol = empty.col + dir.col;
        return newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize;
      });
      
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      const tileRow = empty.row + randomMove.row;
      const tileCol = empty.col + randomMove.col;
      
      // Swap empty space with tile
      board[empty.row][empty.col] = board[tileRow][tileCol];
      board[tileRow][tileCol] = 0;
      empty = { row: tileRow, col: tileCol };
    }
    
    setTiles(board);
    setEmptyPos(empty);
    setMoves(0);
    setTime(0);
    setIsCompleted(false);
    setIsPlaying(true);
  };

  // Initialize game
  useEffect(() => {
    const solvedBoard = createSolvedBoard();
    setTiles(solvedBoard);
    setEmptyPos({ row: gridSize - 1, col: gridSize - 1 });
    setMoves(0);
    setTime(0);
    setIsCompleted(false);
    setIsPlaying(false);
  }, [difficulty, gridSize]);

  // Timer
  useEffect(() => {
    if (isPlaying && !isCompleted) {
      const timer = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, isCompleted]);

  // Handle tile click
  const handleTileClick = (row, col) => {
    if (isCompleted || !isPlaying) return;
    
    // Check if clicked tile is adjacent to empty space
    const rowDiff = Math.abs(row - emptyPos.row);
    const colDiff = Math.abs(col - emptyPos.col);
    
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      // Swap tile with empty space
      const newTiles = tiles.map(r => [...r]);
      newTiles[emptyPos.row][emptyPos.col] = newTiles[row][col];
      newTiles[row][col] = 0;
      
      setTiles(newTiles);
      setEmptyPos({ row, col });
      setMoves(moves + 1);
      
      // Check if solved
      if (isSolved(newTiles)) {
        setIsCompleted(true);
        setIsPlaying(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTileColor = (value) => {
    if (value === 0) return 'bg-gray-100';
    
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800', 
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-red-100 text-red-800',
      'bg-orange-100 text-orange-800',
      'bg-teal-100 text-teal-800'
    ];
    
    return colors[(value - 1) % colors.length];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        {/* Game Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{difficulty}</Badge>
            <div className="text-sm">
              <div>手数: <span className="font-semibold">{moves}</span></div>
              <div>時間: <span className="font-semibold">{formatTime(time)}</span></div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={shuffleBoard}>
              <Shuffle className="w-4 h-4 mr-2" />
              シャッフル
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const solvedBoard = createSolvedBoard();
              setTiles(solvedBoard);
              setEmptyPos({ row: gridSize - 1, col: gridSize - 1 });
              setMoves(0);
              setTime(0);
              setIsCompleted(true);
              setIsPlaying(false);
            }}>
              <RotateCcw className="w-4 h-4 mr-2" />
              リセット
            </Button>
          </div>
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-green-800">
              <Check className="w-5 h-5 mr-2" />
              おめでとうございます！{moves}手、{formatTime(time)}でクリアしました！
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div 
            className="grid gap-2 p-4 bg-gray-200 rounded-lg"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              width: 'fit-content'
            }}
          >
            {tiles.map((row, rowIndex) =>
              row.map((tile, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center
                    text-lg font-bold transition-all duration-200
                    ${tile === 0 ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'}
                    ${getTileColor(tile)}
                    ${tile === 0 ? '' : 'shadow-md border-2 border-white'}
                  `}
                  onClick={() => handleTileClick(rowIndex, colIndex)}
                  disabled={tile === 0}
                >
                  {tile > 0 ? tile : ''}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>タイルをクリックして空いているマスに移動させてください</p>
          <p>数字を1から{totalTiles}まで順番に並べるとクリア！</p>
          {!isPlaying && !isCompleted && (
            <p className="text-blue-600 font-medium">「シャッフル」ボタンを押してゲーム開始</p>
          )}
        </div>

        {/* Hint */}
        {isPlaying && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 ヒント: 角から順番に配置していくと解きやすくなります
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}