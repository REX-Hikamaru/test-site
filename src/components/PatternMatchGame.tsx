import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Check, Eye, EyeOff, Play } from 'lucide-react';

export function PatternMatchGame({ difficulty = '初級' }) {
  const gameConfig = {
    '初級': { gridSize: 4, patternCount: 3, displayTime: 3000 },
    '中級': { gridSize: 5, patternCount: 5, displayTime: 2500 },
    '上級': { gridSize: 6, patternCount: 8, displayTime: 2000 }
  };
  
  const { gridSize, patternCount, displayTime } = gameConfig[difficulty];
  
  const [currentPattern, setCurrentPattern] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [gamePhase, setGamePhase] = useState('ready'); // ready, showing, input, result
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showingTime, setShowingTime] = useState(displayTime / 1000);

  // Generate random pattern
  const generatePattern = () => {
    const pattern = [];
    const totalCells = gridSize * gridSize;
    
    // Generate random cells for the pattern
    while (pattern.length < Math.min(patternCount + Math.floor(level / 3), totalCells / 2)) {
      const cell = Math.floor(Math.random() * totalCells);
      if (!pattern.includes(cell)) {
        pattern.push(cell);
      }
    }
    
    return pattern.sort((a, b) => a - b);
  };

  // Start new round
  const startNewRound = () => {
    if (lives <= 0) {
      setGameOver(true);
      return;
    }
    
    const newPattern = generatePattern();
    setCurrentPattern(newPattern);
    setPlayerInput([]);
    setGamePhase('showing');
    setShowingTime(displayTime / 1000);
    
    // Show pattern for specified time
    const showTimer = setInterval(() => {
      setShowingTime(prev => {
        if (prev <= 1) {
          clearInterval(showTimer);
          setGamePhase('input');
          setTimeLeft(10); // 10 seconds to input
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Start input phase timer
    setTimeout(() => {
      const inputTimer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(inputTimer);
            checkAnswer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, displayTime);
  };

  // Check player's answer
  const checkAnswer = () => {
    const isCorrect = 
      playerInput.length === currentPattern.length &&
      playerInput.every(cell => currentPattern.includes(cell)) &&
      currentPattern.every(cell => playerInput.includes(cell));
    
    setGamePhase('result');
    
    if (isCorrect) {
      const levelBonus = level * 10;
      const timeBonus = timeLeft * 5;
      const patternBonus = currentPattern.length * 20;
      const totalPoints = levelBonus + timeBonus + patternBonus;
      
      setScore(prev => prev + totalPoints);
      setLevel(prev => prev + 1);
      
      setTimeout(() => {
        startNewRound();
      }, 2000);
    } else {
      setLives(prev => prev - 1);
      setTimeout(() => {
        if (lives > 1) {
          startNewRound();
        } else {
          setGameOver(true);
        }
      }, 2000);
    }
  };

  // Handle cell click during input phase
  const handleCellClick = (cellIndex) => {
    if (gamePhase !== 'input') return;
    
    if (playerInput.includes(cellIndex)) {
      setPlayerInput(prev => prev.filter(cell => cell !== cellIndex));
    } else {
      setPlayerInput(prev => [...prev, cellIndex]);
    }
  };

  // Start new game
  const startNewGame = () => {
    setScore(0);
    setLevel(1);
    setLives(3);
    setGameOver(false);
    setGamePhase('ready');
    setPlayerInput([]);
    setCurrentPattern([]);
  };

  const getCellClassName = (cellIndex) => {
    let className = "w-12 h-12 sm:w-16 sm:h-16 border-2 rounded-lg transition-all duration-200 cursor-pointer ";
    
    if (gamePhase === 'showing' && currentPattern.includes(cellIndex)) {
      className += "bg-blue-500 border-blue-600 animate-pulse ";
    } else if (gamePhase === 'input' && playerInput.includes(cellIndex)) {
      className += "bg-green-400 border-green-500 ";
    } else if (gamePhase === 'result') {
      if (currentPattern.includes(cellIndex) && playerInput.includes(cellIndex)) {
        className += "bg-green-400 border-green-500 "; // Correct
      } else if (currentPattern.includes(cellIndex)) {
        className += "bg-red-400 border-red-500 "; // Missed
      } else if (playerInput.includes(cellIndex)) {
        className += "bg-yellow-400 border-yellow-500 "; // Wrong selection
      } else {
        className += "bg-gray-200 border-gray-300 ";
      }
    } else {
      className += "bg-gray-200 border-gray-300 hover:bg-gray-300 ";
    }
    
    return className;
  };

  const getStatusMessage = () => {
    switch (gamePhase) {
      case 'ready':
        return 'スタートボタンを押してゲーム開始！';
      case 'showing':
        return `パターンを覚えてください... ${showingTime}`;
      case 'input':
        return `パターンを再現してください (残り${timeLeft}秒)`;
      case 'result':
        const isCorrect = 
          playerInput.length === currentPattern.length &&
          playerInput.every(cell => currentPattern.includes(cell)) &&
          currentPattern.every(cell => playerInput.includes(cell));
        return isCorrect ? '正解！次のレベルへ...' : '不正解... 次のチャンスで頑張ろう！';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        {/* Game Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{difficulty}</Badge>
            <div className="text-sm">
              <div>スコア: <span className="font-semibold">{score}</span></div>
              <div>レベル: <span className="font-semibold">{level}</span></div>
              <div>ライフ: <span className="font-semibold">{'❤️'.repeat(lives)}{'🤍'.repeat(3 - lives)}</span></div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={startNewGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            新ゲーム
          </Button>
        </div>

        {/* Game Over */}
        {gameOver && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-center text-red-800">
              <h3 className="font-semibold mb-2">ゲームオーバー</h3>
              <p>最終スコア: {score}</p>
              <p>到達レベル: {level}</p>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            {gamePhase === 'showing' && <Eye className="w-5 h-5 text-blue-500" />}
            {gamePhase === 'input' && <EyeOff className="w-5 h-5 text-green-500" />}
            {gamePhase === 'result' && <Check className="w-5 h-5 text-purple-500" />}
            <span className="text-lg font-medium">
              {getStatusMessage()}
            </span>
          </div>
          
          {gamePhase === 'ready' && !gameOver && (
            <Button onClick={startNewRound} className="mb-4">
              <Play className="w-4 h-4 mr-2" />
              ゲーム開始
            </Button>
          )}
        </div>

        {/* Game Grid */}
        <div className="flex justify-center mb-6">
          <div 
            className="grid gap-2 p-4 bg-gray-100 rounded-lg"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {Array.from({ length: gridSize * gridSize }, (_, index) => (
              <button
                key={index}
                className={getCellClassName(index)}
                onClick={() => handleCellClick(index)}
                disabled={gamePhase !== 'input' || gameOver}
              />
            ))}
          </div>
        </div>

        {/* Input Progress */}
        {gamePhase === 'input' && (
          <div className="mb-4">
            <div className="text-center text-sm text-gray-600 mb-2">
              選択済み: {playerInput.length} / {currentPattern.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(playerInput.length / currentPattern.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        {gamePhase === 'input' && (
          <div className="flex justify-center mb-6">
            <Button 
              onClick={checkAnswer}
              disabled={playerInput.length === 0}
              className="px-8"
            >
              答えを確定
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>青く光るセルのパターンを覚えて、同じパターンを再現してください</p>
          <p>レベルが上がるとパターンが複雑になります</p>
          <p>3回間違えるとゲームオーバーです</p>
          
          {/* Legend */}
          {gamePhase === 'result' && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap justify-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded border"></div>
                  <span>正解</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 rounded border"></div>
                  <span>見落とし</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded border"></div>
                  <span>誤選択</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}