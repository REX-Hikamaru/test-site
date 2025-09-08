import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Flag, Bomb } from 'lucide-react';

export function MinesweeperGame({ difficulty = '初級' }) {
  const gameConfig = {
    '初級': { rows: 9, cols: 9, mines: 10 },
    '中級': { rows: 16, cols: 16, mines: 40 },
    '上級': { rows: 16, cols: 30, mines: 99 }
  };
  
  const { rows, cols, mines } = gameConfig[difficulty];
  
  const [board, setBoard] = useState([]);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [time, setTime] = useState(0);
  const [firstClick, setFirstClick] = useState(true);

  // Initialize empty board
  const createEmptyBoard = () => {
    return Array(rows).fill().map(() => 
      Array(cols).fill().map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );
  };

  // Place mines on the board
  const placeMines = (board, firstClickRow, firstClickCol) => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    let minesPlaced = 0;
    
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      
      // Don't place mine on first click or if already has mine
      if (!newBoard[row][col].isMine && 
          !(row === firstClickRow && col === firstClickCol)) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }
    
    return newBoard;
  };

  // Calculate neighbor mines
  const calculateNeighborMines = (board) => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < rows && 
                newCol >= 0 && newCol < cols && 
                newBoard[newRow][newCol].isMine) {
              count++;
            }
          });
          newBoard[row][col].neighborMines = count;
        }
      }
    }
    
    return newBoard;
  };

  // Initialize new game
  const initGame = () => {
    setBoard(createEmptyBoard());
    setGameState('playing');
    setFlaggedCount(0);
    setTime(0);
    setFirstClick(true);
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && !firstClick) {
      const timer = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, firstClick]);

  // Reveal cell and adjacent cells
  const revealCell = (row, col) => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const visited = new Set();
    
    const reveal = (r, c) => {
      const key = `${r}-${c}`;
      if (visited.has(key) || 
          r < 0 || r >= rows || 
          c < 0 || c >= cols ||
          newBoard[r][c].isRevealed || 
          newBoard[r][c].isFlagged) {
        return;
      }
      
      visited.add(key);
      newBoard[r][c].isRevealed = true;
      
      // If no neighboring mines, reveal adjacent cells
      if (newBoard[r][c].neighborMines === 0 && !newBoard[r][c].isMine) {
        const directions = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ];
        directions.forEach(([dx, dy]) => {
          reveal(r + dx, c + dy);
        });
      }
    };
    
    reveal(row, col);
    return newBoard;
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameState !== 'playing' || board[row][col].isFlagged || board[row][col].isRevealed) {
      return;
    }
    
    let newBoard = board;
    
    // First click - place mines
    if (firstClick) {
      newBoard = placeMines(board, row, col);
      newBoard = calculateNeighborMines(newBoard);
      setFirstClick(false);
    }
    
    // Reveal cells
    newBoard = revealCell(row, col);
    setBoard(newBoard);
    
    // Check game state
    if (newBoard[row][col].isMine) {
      setGameState('lost');
      // Reveal all mines
      const finalBoard = newBoard.map(row => 
        row.map(cell => ({
          ...cell,
          isRevealed: cell.isMine ? true : cell.isRevealed
        }))
      );
      setBoard(finalBoard);
    } else {
      // Check win condition
      const revealedCount = newBoard.flat().filter(cell => cell.isRevealed).length;
      if (revealedCount === rows * cols - mines) {
        setGameState('won');
      }
    }
  };

  // Handle right click (flag)
  const handleRightClick = (e, row, col) => {
    e.preventDefault();
    if (gameState !== 'playing' || board[row][col].isRevealed) {
      return;
    }
    
    const newBoard = board.map(r => r.map(cell => ({ ...cell })));
    const cell = newBoard[row][col];
    
    if (cell.isFlagged) {
      cell.isFlagged = false;
      setFlaggedCount(flaggedCount - 1);
    } else {
      cell.isFlagged = true;
      setFlaggedCount(flaggedCount + 1);
    }
    
    setBoard(newBoard);
  };

  const getCellContent = (cell) => {
    if (cell.isFlagged) {
      return <Flag className="w-4 h-4 text-red-500" />;
    }
    if (!cell.isRevealed) {
      return '';
    }
    if (cell.isMine) {
      return <Bomb className="w-4 h-4 text-red-600" />;
    }
    return cell.neighborMines > 0 ? cell.neighborMines : '';
  };

  const getCellClassName = (cell, row, col) => {
    let baseClass = "w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-semibold border transition-colors";
    
    if (cell.isRevealed) {
      if (cell.isMine) {
        baseClass += " bg-red-200";
      } else {
        baseClass += " bg-gray-100";
        // Number colors
        const numberColors = {
          1: "text-blue-600",
          2: "text-green-600", 
          3: "text-red-600",
          4: "text-purple-600",
          5: "text-yellow-600",
          6: "text-pink-600",
          7: "text-black",
          8: "text-gray-600"
        };
        if (cell.neighborMines > 0) {
          baseClass += " " + (numberColors[cell.neighborMines] || "text-black");
        }
      }
    } else {
      baseClass += " bg-gray-300 hover:bg-gray-200 cursor-pointer";
    }
    
    return baseClass;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        {/* Game Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{difficulty}</Badge>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Bomb className="w-4 h-4" />
                {mines - flaggedCount}
              </div>
              <div>時間: {time}秒</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={initGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            新ゲーム
          </Button>
        </div>

        {/* Game Status */}
        {gameState === 'won' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="text-green-800">
              🎉 おめでとうございます！{time}秒でクリアしました！
            </div>
          </div>
        )}

        {gameState === 'lost' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="text-red-800">
              💣 ゲームオーバー！地雷を踏んでしまいました。
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="overflow-auto max-w-full">
          <div 
            className="grid gap-1 w-fit mx-auto bg-gray-400 p-2 rounded"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClassName(cell, rowIndex, colIndex)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                  disabled={gameState !== 'playing'}
                >
                  {getCellContent(cell)}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-sm text-gray-600 text-center">
          <p>左クリック: セルを開く | 右クリック: フラグを立てる</p>
          <p>数字は隣接する地雷の数を示します</p>
          <p>全ての地雷以外のセルを開けばクリア！</p>
        </div>
      </Card>
    </div>
  );
}