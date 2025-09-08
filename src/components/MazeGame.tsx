import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Check, Navigation } from 'lucide-react';

export function MazeGame({ difficulty = '初級' }) {
  const gameConfig = {
    '初級': { size: 15 },
    '中級': { size: 21 },
    '上級': { size: 31 }
  };
  
  const { size } = gameConfig[difficulty];
  
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ row: 1, col: 1 });
  const [goalPos, setGoalPos] = useState({ row: size - 2, col: size - 2 });
  const [path, setPath] = useState(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);

  // Generate maze using recursive backtracking
  const generateMaze = () => {
    // Initialize maze with all walls
    const newMaze = Array(size).fill().map(() => Array(size).fill(1));
    
    // Directions: up, right, down, left
    const directions = [
      [-2, 0], [0, 2], [2, 0], [0, -2]
    ];
    
    const isValid = (row, col) => {
      return row >= 1 && row < size - 1 && col >= 1 && col < size - 1;
    };
    
    const carve = (row, col) => {
      newMaze[row][col] = 0; // Create path
      
      // Randomize directions
      const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
      
      for (const [dr, dc] of shuffledDirections) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (isValid(newRow, newCol) && newMaze[newRow][newCol] === 1) {
          // Carve wall between current cell and new cell
          newMaze[row + dr / 2][col + dc / 2] = 0;
          carve(newRow, newCol);
        }
      }
    };
    
    // Start carving from (1, 1)
    carve(1, 1);
    
    // Ensure start and goal are paths
    newMaze[1][1] = 0;
    newMaze[size - 2][size - 2] = 0;
    
    return newMaze;
  };

  // Initialize game
  const initGame = () => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    setPlayerPos({ row: 1, col: 1 });
    setGoalPos({ row: size - 2, col: size - 2 });
    setPath(new Set(['1-1']));
    setIsCompleted(false);
    setMoves(0);
    setTime(0);
  };

  useEffect(() => {
    initGame();
  }, [difficulty, size]);

  // Timer
  useEffect(() => {
    if (!isCompleted && maze.length > 0) {
      const timer = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isCompleted, maze.length]);

  // Handle keyboard movement
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isCompleted) return;
      
      let newRow = playerPos.row;
      let newCol = playerPos.col;
      
      switch (e.key) {
        case 'ArrowUp': newRow--; break;
        case 'ArrowDown': newRow++; break;
        case 'ArrowLeft': newCol--; break;
        case 'ArrowRight': newCol++; break;
        default: return;
      }
      
      e.preventDefault();
      movePlayer(newRow, newCol);
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, isCompleted, maze]);

  const movePlayer = (newRow, newCol) => {
    // Check bounds and walls
    if (newRow < 0 || newRow >= size || 
        newCol < 0 || newCol >= size || 
        maze[newRow] && maze[newRow][newCol] === 1) {
      return;
    }
    
    setPlayerPos({ row: newRow, col: newCol });
    setPath(prev => new Set([...prev, `${newRow}-${newCol}`]));
    setMoves(moves + 1);
    
    // Check if reached goal
    if (newRow === goalPos.row && newCol === goalPos.col) {
      setIsCompleted(true);
    }
  };

  const getCellClassName = (row, col) => {
    let className = "w-4 h-4 sm:w-5 sm:h-5 ";
    
    if (maze[row] && maze[row][col] === 1) {
      className += "bg-gray-800"; // Wall
    } else {
      className += "bg-gray-100"; // Path
    }
    
    // Player position
    if (row === playerPos.row && col === playerPos.col) {
      className += " bg-blue-500 rounded-full relative";
    }
    // Goal position
    else if (row === goalPos.row && col === goalPos.col) {
      className += " bg-green-500 rounded-full relative";
    }
    // Visited path
    else if (path.has(`${row}-${col}`)) {
      className += " bg-blue-100";
    }
    
    return className;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (maze.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">迷路を生成中...</div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        {/* Game Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{difficulty}</Badge>
            <div className="text-sm">
              <div>移動回数: <span className="font-semibold">{moves}</span></div>
              <div>時間: <span className="font-semibold">{formatTime(time)}</span></div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={initGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            新しい迷路
          </Button>
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-green-800">
              <Check className="w-5 h-5 mr-2" />
              おめでとうございます！{moves}回の移動、{formatTime(time)}でゴールしました！
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>プレイヤー</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>ゴール</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100"></div>
            <span>通った道</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800"></div>
            <span>壁</span>
          </div>
        </div>

        {/* Maze */}
        <div className="flex justify-center mb-6 overflow-auto">
          <div 
            className="grid gap-0 border border-gray-300 w-fit"
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          >
            {maze.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClassName(rowIndex, colIndex)}
                >
                  {rowIndex === playerPos.row && colIndex === playerPos.col && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                  {rowIndex === goalPos.row && colIndex === goalPos.col && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-2 max-w-32 mx-auto mb-4">
          <div></div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => movePlayer(playerPos.row - 1, playerPos.col)}
            disabled={isCompleted}
            className="aspect-square p-0"
          >
            ↑
          </Button>
          <div></div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => movePlayer(playerPos.row, playerPos.col - 1)}
            disabled={isCompleted}
            className="aspect-square p-0"
          >
            ←
          </Button>
          <div></div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => movePlayer(playerPos.row, playerPos.col + 1)}
            disabled={isCompleted}
            className="aspect-square p-0"
          >
            →
          </Button>
          <div></div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => movePlayer(playerPos.row + 1, playerPos.col)}
            disabled={isCompleted}
            className="aspect-square p-0"
          >
            ↓
          </Button>
          <div></div>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>矢印キーまたはボタンでプレイヤーを移動させてください</p>
          <p>青い丸がプレイヤー、緑の丸がゴールです</p>
          <p>壁を避けてゴールまでの道を見つけましょう！</p>
        </div>

        {/* Hint */}
        {!isCompleted && moves > 20 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center text-yellow-800">
              <Navigation className="w-4 h-4 mr-2" />
              💡 ヒント: 行き止まりに入ったら戻って別の道を探してみましょう
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}