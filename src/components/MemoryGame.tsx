import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RotateCcw, Check, Star } from 'lucide-react';

export function MemoryGame({ difficulty = '初級' }) {
  const gameConfig = {
    '初級': { gridSize: 4, pairs: 8 },
    '中級': { gridSize: 6, pairs: 18 },
    '上級': { gridSize: 8, pairs: 32 }
  };
  
  const { gridSize, pairs } = gameConfig[difficulty];
  
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Card symbols/emojis
  const symbols = [
    '🎨', '🎵', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺',
    '🚀', '🚁', '🚂', '🚢', '🚙', '🚕', '🚌', '🚜',
    '🦄', '🦋', '🦊', '🦁', '🐯', '🐶', '🐱', '🐼',
    '🌺', '🌸', '🌼', '🌻', '🌹', '🌷', '🌿', '🍀',
    '🍎', '🍌', '🍇', '🍓', '🍑', '🍊', '🥝', '🍍'
  ];

  // Initialize game
  const initGame = () => {
    // Create pairs of cards
    const gameSymbols = symbols.slice(0, pairs);
    const cardPairs = [...gameSymbols, ...gameSymbols];
    
    // Shuffle cards
    const shuffledCards = cardPairs
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCards(new Set());
    setMoves(0);
    setTime(0);
    setIsCompleted(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  // Timer
  useEffect(() => {
    if (isPlaying && !isCompleted) {
      const timer = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, isCompleted]);

  // Handle card matches
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];
      
      setMoves(moves + 1);
      
      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setMatchedCards(prev => new Set([...prev, first, second]));
          setFlippedCards([]);
          
          // Check if game is completed
          if (matchedCards.size + 2 === cards.length) {
            setIsCompleted(true);
            setIsPlaying(false);
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
        }, 1500);
      }
    }
  }, [flippedCards, cards, matchedCards.size, moves]);

  const handleCardClick = (index) => {
    if (!isPlaying || 
        isCompleted || 
        flippedCards.includes(index) || 
        matchedCards.has(index) || 
        flippedCards.length >= 2) {
      return;
    }
    
    setFlippedCards([...flippedCards, index]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScore = () => {
    // Score based on time and moves (lower is better)
    const timeBonus = Math.max(0, 300 - time); // 5 minutes max bonus
    const moveBonus = Math.max(0, (pairs * 2) - moves); // Bonus for fewer moves
    return timeBonus + moveBonus * 10;
  };

  const isCardVisible = (index) => {
    return flippedCards.includes(index) || matchedCards.has(index);
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
              <div>ペア: <span className="font-semibold">{matchedCards.size / 2}/{pairs}</span></div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={initGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            新ゲーム
          </Button>
        </div>

        {/* Completion Message */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-800">
                <Check className="w-5 h-5 mr-2" />
                おめでとうございます！
              </div>
              <div className="flex items-center text-green-800">
                <Star className="w-4 h-4 mr-1" />
                スコア: {getScore()}
              </div>
            </div>
            <div className="text-sm text-green-700 mt-2">
              {moves}手、{formatTime(time)}でクリアしました！
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div 
            className="grid gap-3 p-4"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              maxWidth: '600px'
            }}
          >
            {cards.map((card, index) => (
              <button
                key={card.id}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-2xl
                  transition-all duration-300 transform
                  ${isCardVisible(index)
                    ? 'bg-white border-2 border-blue-300 shadow-lg scale-105'
                    : 'bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 cursor-pointer'
                  }
                  ${matchedCards.has(index) ? 'border-green-400 bg-green-50' : ''}
                  ${flippedCards.length >= 2 && !isCardVisible(index) ? 'cursor-not-allowed opacity-75' : ''}
                  w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24
                `}
                onClick={() => handleCardClick(index)}
                disabled={!isPlaying || isCompleted}
              >
                {isCardVisible(index) ? (
                  card.symbol
                ) : (
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white bg-opacity-40 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>カードをクリックしてめくり、同じペアを見つけてください</p>
          <p>全てのペアを見つけるとクリア！</p>
          
          {isPlaying && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 ヒント: カードの位置を覚えて、効率よくペアを見つけましょう
              </p>
            </div>
          )}
        </div>

        {/* Progress */}
        {isPlaying && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(matchedCards.size / (pairs * 2)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}