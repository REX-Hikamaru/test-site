import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Check, Search } from 'lucide-react';

export function WordSearchGame({ difficulty = '初級' }) {
  const gameConfig = {
    '初級': { gridSize: 10, wordCount: 5 },
    '中級': { gridSize: 15, wordCount: 8 },
    '上級': { gridSize: 20, wordCount: 12 }
  };
  
  const { gridSize, wordCount } = gameConfig[difficulty];
  
  // Word lists in Japanese
  const wordLists = {
    '初級': ['ねこ', 'いぬ', 'さくら', 'うみ', 'やま', 'そら', 'ひかり', 'みず'],
    '中級': ['こんにちは', 'ありがとう', 'がっこう', 'としょかん', 'でんしゃ', 'きょうしつ', 'せんせい', 'ともだち'],
    '上級': ['さっかーぼーる', 'こんぴゅーたー', 'でぱーと', 'れすとらん', 'びょういん', 'ゆうびんきょく', 'しょうがっこう', 'だいがく']
  };
  
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [foundCells, setFoundCells] = useState(new Set());
  const [time, setTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Generate random letter
  const getRandomLetter = () => {
    const hiragana = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
    return hiragana[Math.floor(Math.random() * hiragana.length)];
  };

  // Place word in grid
  const placeWord = (grid, word, startRow, startCol, direction) => {
    const directions = {
      horizontal: [0, 1],
      vertical: [1, 0],
      diagonal: [1, 1],
      diagonalUp: [-1, 1]
    };
    
    const [dRow, dCol] = directions[direction];
    
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;
      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        grid[row][col] = word[i];
      }
    }
    
    return {
      word,
      startRow,
      startCol,
      direction,
      cells: Array.from({ length: word.length }, (_, i) => ({
        row: startRow + i * dRow,
        col: startCol + i * dCol
      }))
    };
  };

  // Check if word can be placed
  const canPlaceWord = (grid, word, startRow, startCol, direction) => {
    const directions = {
      horizontal: [0, 1],
      vertical: [1, 0],
      diagonal: [1, 1],
      diagonalUp: [-1, 1]
    };
    
    const [dRow, dCol] = directions[direction];
    
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * dRow;
      const col = startCol + i * dCol;
      
      if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
        return false;
      }
      
      if (grid[row][col] !== '' && grid[row][col] !== word[i]) {
        return false;
      }
    }
    
    return true;
  };

  // Generate word search grid
  const generateGrid = () => {
    // Initialize empty grid
    const newGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    const placedWords = [];
    const selectedWords = wordLists[difficulty]
      .sort(() => Math.random() - 0.5)
      .slice(0, wordCount);
    
    const directions = ['horizontal', 'vertical', 'diagonal', 'diagonalUp'];
    
    // Try to place each word
    for (const word of selectedWords) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const startRow = Math.floor(Math.random() * gridSize);
        const startCol = Math.floor(Math.random() * gridSize);
        
        if (canPlaceWord(newGrid, word, startRow, startCol, direction)) {
          const wordInfo = placeWord(newGrid, word, startRow, startCol, direction);
          placedWords.push(wordInfo);
          placed = true;
        }
        
        attempts++;
      }
    }
    
    // Fill empty cells with random letters
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (newGrid[row][col] === '') {
          newGrid[row][col] = getRandomLetter();
        }
      }
    }
    
    return { grid: newGrid, words: placedWords };
  };

  // Initialize game
  const initGame = () => {
    const { grid: newGrid, words: newWords } = generateGrid();
    setGrid(newGrid);
    setWords(newWords);
    setFoundWords(new Set());
    setSelectedCells([]);
    setFoundCells(new Set());
    setTime(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  // Timer
  useEffect(() => {
    if (!isCompleted && words.length > 0) {
      const timer = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isCompleted, words.length]);

  // Handle mouse events for word selection
  const handleMouseDown = (row, col) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row, col) => {
    if (isSelecting && selectedCells.length > 0) {
      const start = selectedCells[0];
      const cells = getCellsInLine(start.row, start.col, row, col);
      setSelectedCells(cells);
    }
  };

  const handleMouseUp = () => {
    if (selectedCells.length > 1) {
      checkSelectedWord();
    }
    setIsSelecting(false);
    setSelectedCells([]);
  };

  // Get cells in a straight line
  const getCellsInLine = (startRow, startCol, endRow, endCol) => {
    const cells = [];
    const deltaRow = endRow - startRow;
    const deltaCol = endCol - startCol;
    const maxDelta = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
    
    if (maxDelta === 0) return [{ row: startRow, col: startCol }];
    
    // Only allow straight lines (horizontal, vertical, diagonal)
    if (Math.abs(deltaRow) !== Math.abs(deltaCol) && deltaRow !== 0 && deltaCol !== 0) {
      return [{ row: startRow, col: startCol }];
    }
    
    const stepRow = deltaRow === 0 ? 0 : deltaRow / Math.abs(deltaRow);
    const stepCol = deltaCol === 0 ? 0 : deltaCol / Math.abs(deltaCol);
    
    for (let i = 0; i <= maxDelta; i++) {
      cells.push({
        row: startRow + i * stepRow,
        col: startCol + i * stepCol
      });
    }
    
    return cells;
  };

  // Check if selected cells form a word
  const checkSelectedWord = () => {
    const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    for (const wordInfo of words) {
      if (wordInfo.word === selectedWord || wordInfo.word === reversedWord) {
        if (!foundWords.has(wordInfo.word)) {
          setFoundWords(prev => new Set([...prev, wordInfo.word]));
          setFoundCells(prev => {
            const newSet = new Set(prev);
            wordInfo.cells.forEach(cell => newSet.add(`${cell.row}-${cell.col}`));
            return newSet;
          });
          
          if (foundWords.size + 1 === words.length) {
            setIsCompleted(true);
          }
        }
        break;
      }
    }
  };

  const getCellClassName = (row, col) => {
    const isSelected = selectedCells.some(cell => cell.row === row && cell.col === col);
    const isFound = foundCells.has(`${row}-${col}`);
    
    let className = "w-6 h-6 sm:w-8 sm:h-8 border border-gray-300 flex items-center justify-center text-sm font-medium cursor-pointer select-none ";
    
    if (isFound) {
      className += "bg-green-200 text-green-800 ";
    } else if (isSelected) {
      className += "bg-blue-200 text-blue-800 ";
    } else {
      className += "bg-white hover:bg-gray-100 ";
    }
    
    return className;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="p-6">
        {/* Game Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{difficulty}</Badge>
            <div className="text-sm">
              <div>見つけた単語: <span className="font-semibold">{foundWords.size}/{words.length}</span></div>
              <div>時間: <span className="font-semibold">{formatTime(time)}</span></div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={initGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            新しいパズル
          </Button>
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-green-800">
              <Check className="w-5 h-5 mr-2" />
              おめでとうございます！{formatTime(time)}で全ての単語を見つけました！
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Word List */}
          <div className="lg:w-1/4">
            <h3 className="font-semibold mb-4 flex items-center">
              <Search className="w-4 h-4 mr-2" />
              探す単語
            </h3>
            <div className="space-y-2">
              {words.map((wordInfo, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border ${
                    foundWords.has(wordInfo.word)
                      ? 'bg-green-50 border-green-200 text-green-700 line-through'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {wordInfo.word}
                </div>
              ))}
            </div>
            
            {/* Progress */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(foundWords.size / words.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="lg:w-3/4">
            <div className="overflow-auto">
              <div 
                className="grid gap-1 w-fit mx-auto bg-gray-100 p-2 rounded"
                style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                onMouseLeave={() => {
                  setIsSelecting(false);
                  setSelectedCells([]);
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={getCellClassName(rowIndex, colIndex)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMouseDown(rowIndex, colIndex);
                      }}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                      onMouseUp={handleMouseUp}
                    >
                      {cell}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>文字をマウスでドラッグして単語を選択してください</p>
          <p>単語は縦・横・斜めのどの方向にも隠されています</p>
          <p>全ての単語を見つけるとクリア！</p>
        </div>
      </Card>
    </div>
  );
}