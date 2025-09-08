import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Play, Pause, RotateCw } from 'lucide-react';

export function TetrisGame({ difficulty = '初級' }) {
  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;
  
  const gameConfig = {
    '初級': { speed: 800 },
    '中級': { speed: 400 },
    '上級': { speed: 200 }
  };
  
  const { speed } = gameConfig[difficulty];
  
  // Tetris pieces
  const PIECES = {
    I: {
      shape: [[1, 1, 1, 1]],
      color: 'bg-cyan-400'
    },
    O: {
      shape: [[1, 1], [1, 1]],
      color: 'bg-yellow-400'
    },
    T: {
      shape: [[0, 1, 0], [1, 1, 1]],
      color: 'bg-purple-400'
    },
    S: {
      shape: [[0, 1, 1], [1, 1, 0]],
      color: 'bg-green-400'
    },
    Z: {
      shape: [[1, 1, 0], [0, 1, 1]],
      color: 'bg-red-400'
    },
    J: {
      shape: [[1, 0, 0], [1, 1, 1]],
      color: 'bg-blue-400'
    },
    L: {
      shape: [[0, 0, 1], [1, 1, 1]],
      color: 'bg-orange-400'
    }
  };
  
  const PIECE_TYPES = Object.keys(PIECES);
  
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [nextPiece, setNextPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Generate random piece
  const getRandomPiece = () => {
    const pieceType = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
    return {
      type: pieceType,
      shape: PIECES[pieceType].shape,
      color: PIECES[pieceType].color
    };
  };

  // Rotate piece 90 degrees clockwise
  const rotatePiece = (piece) => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  };

  // Check if position is valid
  const isValidPosition = (piece, pos, board) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = pos.x + x;
          const boardY = pos.y + y;
          
          if (boardX < 0 || boardX >= BOARD_WIDTH || 
              boardY >= BOARD_HEIGHT || 
              (boardY >= 0 && board[boardY][boardX])) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Place piece on board
  const placePiece = (piece, pos, board) => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = pos.x + x;
          const boardY = pos.y + y;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    
    return newBoard;
  };

  // Clear completed lines
  const clearLines = (board) => {
    const newBoard = board.filter(row => row.some(cell => !cell));
    const clearedLines = BOARD_HEIGHT - newBoard.length;
    
    // Add empty rows at top
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }
    
    return { board: newBoard, clearedLines };
  };

  // Start new game
  const startGame = () => {
    const newBoard = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));
    const firstPiece = getRandomPiece();
    const nextPiece = getRandomPiece();
    
    setBoard(newBoard);
    setCurrentPiece(firstPiece);
    setCurrentPos({ x: Math.floor(BOARD_WIDTH / 2) - Math.floor(firstPiece.shape[0].length / 2), y: 0 });
    setNextPiece(nextPiece);
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsPlaying(true);
    setIsPaused(false);
    setGameOver(false);
  };

  // Move piece
  const movePiece = useCallback((dx, dy) => {
    if (!currentPiece || !isPlaying || isPaused || gameOver) return;
    
    const newPos = { x: currentPos.x + dx, y: currentPos.y + dy };
    
    if (isValidPosition(currentPiece, newPos, board)) {
      setCurrentPos(newPos);
      return true;
    }
    return false;
  }, [currentPiece, currentPos, board, isPlaying, isPaused, gameOver]);

  // Drop piece
  const dropPiece = useCallback(() => {
    if (!currentPiece || !isPlaying || isPaused || gameOver) return;
    
    if (!movePiece(0, 1)) {
      // Piece can't move down, place it on board
      const newBoard = placePiece(currentPiece, currentPos, board);
      const { board: clearedBoard, clearedLines } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      
      // Update score and lines
      if (clearedLines > 0) {
        const lineScore = [0, 100, 300, 500, 800][clearedLines] * level;
        setScore(prev => prev + lineScore);
        setLines(prev => prev + clearedLines);
        setLevel(Math.floor((lines + clearedLines) / 10) + 1);
      }
      
      // Spawn next piece
      const startPos = { 
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(nextPiece.shape[0].length / 2), 
        y: 0 
      };
      
      if (isValidPosition(nextPiece, startPos, clearedBoard)) {
        setCurrentPiece(nextPiece);
        setCurrentPos(startPos);
        setNextPiece(getRandomPiece());
      } else {
        // Game over
        setGameOver(true);
        setIsPlaying(false);
      }
    }
  }, [currentPiece, currentPos, board, nextPiece, movePiece, level, lines, isPlaying, isPaused, gameOver]);

  // Rotate current piece
  const rotatePieceAction = useCallback(() => {
    if (!currentPiece || !isPlaying || isPaused || gameOver) return;
    
    const rotated = rotatePiece(currentPiece);
    if (isValidPosition(rotated, currentPos, board)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, currentPos, board, isPlaying, isPaused, gameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotatePieceAction();
          break;
        case ' ':
          e.preventDefault();
          // Hard drop
          while (movePiece(0, 1)) {}
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePieceAction]);

  // Game loop
  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      const gameSpeed = Math.max(100, speed - (level - 1) * 50);
      const timer = setInterval(dropPiece, gameSpeed);
      return () => clearInterval(timer);
    }
  }, [dropPiece, isPlaying, isPaused, gameOver, speed, level]);

  // Get display board with current piece
  const getDisplayBoard = () => {
    let displayBoard = board.map(row => [...row]);
    
    if (currentPiece && currentPos) {
      displayBoard = placePiece(currentPiece, currentPos, displayBoard);
    }
    
    return displayBoard;
  };

  const displayBoard = getDisplayBoard();

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Game Board */}
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-4">
              <Badge variant="outline">{difficulty}</Badge>
              <div className="text-sm">
                スコア: <span className="font-semibold">{score.toLocaleString()}</span>
              </div>
              <div className="text-sm">
                レベル: <span className="font-semibold">{level}</span>
              </div>
              <div className="text-sm">
                ライン: <span className="font-semibold">{lines}</span>
              </div>
            </div>

            {gameOver && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="text-red-800">
                  ゲームオーバー！最終スコア: {score.toLocaleString()}
                </div>
              </div>
            )}

            <div className="border-2 border-gray-300 bg-gray-100 p-2 rounded">
              <div 
                className="grid gap-px bg-gray-300"
                style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)` }}
              >
                {displayBoard.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`${y}-${x}`}
                      className={`w-6 h-6 border ${
                        cell ? cell : 'bg-gray-50'
                      }`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-full lg:w-64 space-y-4">
            {/* Next Piece */}
            <div>
              <h3 className="font-semibold mb-2">次のピース</h3>
              <div className="border border-gray-300 bg-gray-50 p-4 rounded">
                {nextPiece && (
                  <div 
                    className="grid gap-px mx-auto w-fit"
                    style={{ gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 1fr)` }}
                  >
                    {nextPiece.shape.map((row, y) =>
                      row.map((cell, x) => (
                        <div
                          key={`${y}-${x}`}
                          className={`w-5 h-5 border ${
                            cell ? nextPiece.color : 'bg-transparent border-transparent'
                          }`}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-2">
              {!isPlaying ? (
                <Button onClick={startGame} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  ゲーム開始
                </Button>
              ) : (
                <Button onClick={() => setIsPaused(!isPaused)} className="w-full">
                  {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                  {isPaused ? '再開' : '一時停止'}
                </Button>
              )}
              
              <Button variant="outline" onClick={startGame} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                新ゲーム
              </Button>
            </div>

            {/* Game Controls */}
            <div className="space-y-3">
              <h3 className="font-semibold">コントロール</h3>
              <div className="grid grid-cols-3 gap-2">
                <div></div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={rotatePieceAction}
                  disabled={!isPlaying || isPaused || gameOver}
                  className="aspect-square p-0"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <div></div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => movePiece(-1, 0)}
                  disabled={!isPlaying || isPaused || gameOver}
                  className="aspect-square p-0"
                >
                  ←
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => movePiece(0, 1)}
                  disabled={!isPlaying || isPaused || gameOver}
                  className="aspect-square p-0"
                >
                  ↓
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => movePiece(1, 0)}
                  disabled={!isPlaying || isPaused || gameOver}
                  className="aspect-square p-0"
                >
                  →
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>↑ または回転ボタン: 回転</p>
              <p>← → ↓: 移動</p>
              <p>スペース: ハードドロップ</p>
              <p>横一列揃えると消えます！</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}