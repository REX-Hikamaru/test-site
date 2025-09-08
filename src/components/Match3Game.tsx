import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Star, Timer, Zap } from 'lucide-react';

export function Match3Game({ difficulty = '初級' }) {
  const BOARD_WIDTH = 8;
  const BOARD_HEIGHT = 8;
  
  const gameConfig = {
    '初級': { colors: 5, timeLimit: 120, targetScore: 1000 },
    '中級': { colors: 6, timeLimit: 100, targetScore: 2000 },
    '上級': { colors: 7, timeLimit: 80, targetScore: 3000 }
  };
  
  const { colors, timeLimit, targetScore } = gameConfig[difficulty];
  
  const gemColors = [
    'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 
    'bg-purple-400', 'bg-pink-400', 'bg-orange-400'
  ];
  
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [selectedGem, setSelectedGem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [combo, setCombo] = useState(0);
  const [moves, setMoves] = useState(0);

  // Initialize board with random gems
  const generateBoard = () => {
    const newBoard = [];
    
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      const boardRow = [];
      for (let col = 0; col < BOARD_WIDTH; col++) {
        // Ensure no initial matches by avoiding creating 3 in a row
        let gemColor;
        do {
          gemColor = Math.floor(Math.random() * colors);
        } while (
          (col >= 2 && boardRow[col - 1] === gemColor && boardRow[col - 2] === gemColor) ||
          (row >= 2 && newBoard[row - 1] && newBoard[row - 1][col] === gemColor && 
           newBoard[row - 2] && newBoard[row - 2][col] === gemColor)
        );
        boardRow.push(gemColor);
      }
      newBoard.push(boardRow);
    }
    
    return newBoard;
  };

  // Check for matches
  const findMatches = (board) => {
    const matches = new Set();
    
    // Check horizontal matches
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      let matchCount = 1;
      let currentColor = board[row][0];
      
      for (let col = 1; col < BOARD_WIDTH; col++) {
        if (board[row][col] === currentColor) {
          matchCount++;
        } else {
          if (matchCount >= 3) {
            for (let i = col - matchCount; i < col; i++) {
              matches.add(`${row}-${i}`);
            }
          }
          matchCount = 1;
          currentColor = board[row][col];
        }
      }
      
      if (matchCount >= 3) {
        for (let i = BOARD_WIDTH - matchCount; i < BOARD_WIDTH; i++) {
          matches.add(`${row}-${i}`);
        }
      }
    }
    
    // Check vertical matches
    for (let col = 0; col < BOARD_WIDTH; col++) {
      let matchCount = 1;
      let currentColor = board[0][col];
      
      for (let row = 1; row < BOARD_HEIGHT; row++) {
        if (board[row][col] === currentColor) {
          matchCount++;
        } else {
          if (matchCount >= 3) {
            for (let i = row - matchCount; i < row; i++) {
              matches.add(`${i}-${col}`);
            }
          }
          matchCount = 1;
          currentColor = board[row][col];
        }
      }
      
      if (matchCount >= 3) {
        for (let i = BOARD_HEIGHT - matchCount; i < BOARD_HEIGHT; i++) {
          matches.add(`${i}-${col}`);
        }
      }
    }
    
    return Array.from(matches).map(match => {
      const [row, col] = match.split('-').map(Number);
      return { row, col };
    });
  };

  // Remove matches and drop gems
  const removeMatches = (board, matches) => {
    if (matches.length === 0) return board;
    
    const newBoard = board.map(row => [...row]);
    
    // Mark matched gems for removal
    matches.forEach(({ row, col }) => {
      newBoard[row][col] = -1;
    });
    
    // Drop gems down
    for (let col = 0; col < BOARD_WIDTH; col++) {
      const column = [];
      for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
        if (newBoard[row][col] !== -1) {
          column.unshift(newBoard[row][col]);
        }
      }
      
      // Fill with new random gems
      while (column.length < BOARD_HEIGHT) {
        column.unshift(Math.floor(Math.random() * colors));
      }
      
      // Update board column
      for (let row = 0; row < BOARD_HEIGHT; row++) {
        newBoard[row][col] = column[row];
      }
    }
    
    return newBoard;
  };

  // Process all matches and cascades
  const processMatches = useCallback((currentBoard) => {
    let board = currentBoard;
    let totalMatches = 0;
    let currentCombo = 0;
    
    while (true) {
      const matches = findMatches(board);
      if (matches.length === 0) break;
      
      board = removeMatches(board, matches);
      totalMatches += matches.length;
      currentCombo++;
      
      // Calculate score with combo bonus
      const matchScore = matches.length * 10 * (currentCombo + 1);
      setScore(prev => prev + matchScore);
    }
    
    setCombo(currentCombo);
    return board;
  }, []);

  // Initialize game
  useEffect(() => {
    const newBoard = generateBoard();
    setBoard(newBoard);
    setTimeLeft(timeLimit);
    setScore(0);
    setMoves(0);
    setCombo(0);
    setGameState('playing');
  }, [difficulty, timeLimit]);

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState(score >= targetScore ? 'won' : 'lost');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft, score, targetScore]);

  // Check win condition
  useEffect(() => {
    if (score >= targetScore && gameState === 'playing') {
      setGameState('won');
    }
  }, [score, targetScore, gameState]);

  // Handle gem click
  const handleGemClick = (row, col) => {
    if (isAnimating || gameState !== 'playing') return;
    
    if (!selectedGem) {
      setSelectedGem({ row, col });
    } else {
      const { row: selectedRow, col: selectedCol } = selectedGem;
      
      // Check if clicked gem is adjacent
      const rowDiff = Math.abs(row - selectedRow);
      const colDiff = Math.abs(col - selectedCol);
      
      if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        // Swap gems
        const newBoard = board.map(boardRow => [...boardRow]);
        const temp = newBoard[row][col];
        newBoard[row][col] = newBoard[selectedRow][selectedCol];
        newBoard[selectedRow][selectedCol] = temp;
        
        // Check if this creates matches
        const matches = findMatches(newBoard);
        
        if (matches.length > 0) {
          setIsAnimating(true);
          setBoard(newBoard);
          setMoves(prev => prev + 1);
          
          // Process matches after animation
          setTimeout(() => {
            const finalBoard = processMatches(newBoard);
            setBoard(finalBoard);
            setIsAnimating(false);
          }, 300);
        } else {
          // No matches, swap back
          setTimeout(() => {
            setBoard(board);
          }, 200);
        }
      }
      
      setSelectedGem(null);
    }
  };

  const startNewGame = () => {
    const newBoard = generateBoard();
    setBoard(newBoard);
    setScore(0);
    setTimeLeft(timeLimit);
    setMoves(0);
    setCombo(0);
    setSelectedGem(null);
    setIsAnimating(false);
    setGameState('playing');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGemClassName = (row, col) => {
    const isSelected = selectedGem && selectedGem.row === row && selectedGem.col === col;
    const baseClass = "w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 cursor-pointer transition-all duration-200 ";
    
    if (isSelected) {
      return baseClass + gemColors[board[row][col]] + " border-white ring-2 ring-yellow-400 scale-110 ";
    }
    
    return baseClass + gemColors[board[row][col]] + " border-white hover:scale-105 shadow-md ";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Game Board */}
          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <Badge variant="outline">{difficulty}</Badge>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4" />
                {score.toLocaleString()} / {targetScore.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Timer className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Zap className="w-4 h-4" />
                手数: {moves}
              </div>
            </div>

            {/* Game Status */}
            {gameState === 'won' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="text-green-800">
                  🎉 おめでとうございます！目標スコアを達成しました！
                </div>
              </div>
            )}

            {gameState === 'lost' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="text-red-800">
                  時間切れ！最終スコア: {score.toLocaleString()}
                </div>
              </div>
            )}

            {/* Board */}
            <div className="border-4 border-gray-300 bg-gray-800 p-3 rounded-lg mx-auto w-fit">
              <div 
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)` }}
              >
                {board.map((row, rowIndex) =>
                  row.map((gem, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      className={getGemClassName(rowIndex, colIndex)}
                      onClick={() => handleGemClick(rowIndex, colIndex)}
                      disabled={isAnimating || gameState !== 'playing'}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-full lg:w-64 space-y-4">
            {/* Progress */}
            <div>
              <h3 className="font-semibold mb-2">進捗</h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((score / targetScore) * 100, 100)}%` }}
                />
              </div>
              <div className="text-sm text-gray-600 mt-1 text-center">
                {((score / targetScore) * 100).toFixed(1)}%
              </div>
            </div>

            {/* Combo */}
            {combo > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="text-center">
                  <div className="text-orange-600 font-semibold">
                    {combo}x コンボ！
                  </div>
                  <div className="text-sm text-orange-500">
                    連鎖ボーナス発動中
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="space-y-2">
              <Button onClick={startNewGame} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                新ゲーム
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-sm text-gray-600 space-y-2">
              <h3 className="font-semibold">遊び方</h3>
              <div className="space-y-1">
                <p>• 隣接する宝石をクリックして交換</p>
                <p>• 3つ以上同じ色を揃えて消去</p>
                <p>• 連鎖でボーナスポイント獲得</p>
                <p>• 制限時間内に目標スコア達成！</p>
              </div>
              
              {selectedGem && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-3">
                  <p className="text-blue-800 text-xs">
                    宝石が選択されています。隣接する宝石をクリックして交換してください。
                  </p>
                </div>
              )}
            </div>

            {/* Color Legend */}
            <div>
              <h3 className="font-semibold mb-2 text-sm">宝石の種類</h3>
              <div className="grid grid-cols-3 gap-2">
                {gemColors.slice(0, colors).map((color, index) => (
                  <div 
                    key={index}
                    className={`w-6 h-6 rounded-lg border-2 border-white shadow-sm ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}