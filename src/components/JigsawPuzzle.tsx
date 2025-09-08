import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Check, Shuffle, Image } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function JigsawPuzzle({ difficulty = '初級' }) {
  const gameConfig = {
    '初級': { gridSize: 3, pieces: 9 },
    '中級': { gridSize: 4, pieces: 16 },
    '上級': { gridSize: 5, pieces: 25 }
  };
  
  const { gridSize, pieces } = gameConfig[difficulty];
  
  const [puzzlePieces, setPuzzlePieces] = useState([]);
  const [solvedPositions, setSolvedPositions] = useState([]);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

  // Sample puzzle images
  const puzzleImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400'
  ];

  // Initialize puzzle
  const initPuzzle = () => {
    const pieces = [];
    const positions = [];
    
    // Create pieces and their correct positions
    for (let i = 0; i < gridSize * gridSize; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      pieces.push({
        id: i,
        correctPosition: i,
        currentPosition: i,
        backgroundPosition: `-${col * (100 / (gridSize - 1))}% -${row * (100 / (gridSize - 1))}%`
      });
      
      positions.push(i);
    }
    
    // Shuffle pieces
    const shuffledPieces = [...pieces];
    for (let i = shuffledPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPieces[i].currentPosition, shuffledPieces[j].currentPosition] = 
      [shuffledPieces[j].currentPosition, shuffledPieces[i].currentPosition];
    }
    
    setPuzzlePieces(shuffledPieces);
    setSolvedPositions(positions);
    setIsCompleted(false);
    setMoves(0);
    setTime(0);
  };

  useEffect(() => {
    initPuzzle();
  }, [difficulty, selectedImage]);

  // Timer
  useEffect(() => {
    if (!isCompleted && puzzlePieces.length > 0) {
      const timer = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isCompleted, puzzlePieces.length]);

  // Check if puzzle is solved
  const checkSolution = (pieces) => {
    return pieces.every(piece => piece.correctPosition === piece.currentPosition);
  };

  // Handle drag start
  const handleDragStart = (e, piece) => {
    setDraggedPiece(piece);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drop
  const handleDrop = (e, targetPosition) => {
    e.preventDefault();
    
    if (!draggedPiece) return;
    
    const newPieces = [...puzzlePieces];
    const draggedIndex = newPieces.findIndex(p => p.id === draggedPiece.id);
    const targetIndex = newPieces.findIndex(p => p.currentPosition === targetPosition);
    
    if (targetIndex !== -1) {
      // Swap positions
      const temp = newPieces[draggedIndex].currentPosition;
      newPieces[draggedIndex].currentPosition = newPieces[targetIndex].currentPosition;
      newPieces[targetIndex].currentPosition = temp;
    } else {
      // Move to empty position
      newPieces[draggedIndex].currentPosition = targetPosition;
    }
    
    setPuzzlePieces(newPieces);
    setMoves(moves + 1);
    setDraggedPiece(null);
    
    // Check if solved
    if (checkSolution(newPieces)) {
      setIsCompleted(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPieceAtPosition = (position) => {
    return puzzlePieces.find(piece => piece.currentPosition === position);
  };

  const isCorrectPosition = (piece) => {
    return piece && piece.correctPosition === piece.currentPosition;
  };

  return (
    <div className="max-w-4xl mx-auto">
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
            <Button variant="outline" size="sm" onClick={initPuzzle}>
              <Shuffle className="w-4 h-4 mr-2" />
              シャッフル
            </Button>
            <Button variant="outline" size="sm" onClick={initPuzzle}>
              <RotateCcw className="w-4 h-4 mr-2" />
              リセット
            </Button>
          </div>
        </div>

        {/* Image Selection */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Image className="w-4 h-4 mr-2" />
            パズル画像を選択
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {puzzleImages.map((img, index) => (
              <button
                key={index}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <ImageWithFallback
                  src={img}
                  alt={`Puzzle ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-green-800">
              <Check className="w-5 h-5 mr-2" />
              おめでとうございます！{moves}手、{formatTime(time)}でパズルを完成させました！
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Reference Image */}
          <div className="lg:w-1/3">
            <h3 className="font-semibold mb-3">完成図</h3>
            <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 mb-4">
              <ImageWithFallback
                src={puzzleImages[selectedImage]}
                alt="Complete puzzle"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>進捗</span>
                <span>{puzzlePieces.filter(p => isCorrectPosition(p)).length}/{pieces}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(puzzlePieces.filter(p => isCorrectPosition(p)).length / pieces) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Puzzle Grid */}
          <div className="lg:w-2/3">
            <h3 className="font-semibold mb-3">パズル</h3>
            <div 
              className="grid gap-1 bg-gray-200 p-2 rounded-lg mx-auto w-fit"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                aspectRatio: '1'
              }}
            >
              {Array.from({ length: gridSize * gridSize }, (_, index) => {
                const piece = getPieceAtPosition(index);
                return (
                  <div
                    key={index}
                    className={`
                      relative aspect-square border-2 transition-all duration-200
                      ${piece 
                        ? `cursor-move hover:scale-105 ${
                            isCorrectPosition(piece) 
                              ? 'border-green-400 shadow-md' 
                              : 'border-gray-300 hover:border-blue-400'
                          }`
                        : 'border-dashed border-gray-400 bg-gray-100'
                      }
                    `}
                    style={{ 
                      width: `${300 / gridSize}px`, 
                      height: `${300 / gridSize}px` 
                    }}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragOver={handleDragOver}
                  >
                    {piece && (
                      <div
                        className="w-full h-full cursor-move select-none"
                        draggable
                        onDragStart={(e) => handleDragStart(e, piece)}
                        style={{
                          backgroundImage: `url(${puzzleImages[selectedImage]})`,
                          backgroundSize: `${gridSize * 100}%`,
                          backgroundPosition: piece.backgroundPosition,
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
          <p>ピースをドラッグ&ドロップして正しい位置に配置してください</p>
          <p>緑の枠のピースは正しい位置にあります</p>
          <p>すべてのピースを正しい位置に配置するとクリア！</p>
        </div>
      </Card>
    </div>
  );
}