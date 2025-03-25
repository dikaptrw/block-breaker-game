"use client";

import React, { useState, useCallback, useEffect } from "react";
import GameCanvas from "./GameCanvas";

// Game constants
const GAME_WIDTH = 500;
const GAME_HEIGHT = 400;

// Game states
type GameState = "idle" | "playing" | "paused" | "gameOver";

const GameContainer: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);

  // Load high score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem("blockBreakerHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Update high score when score changes
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("blockBreakerHighScore", score.toString());
    }
  }, [score, highScore]);

  // Handle game start
  const handleStartGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setLives(3);
  }, []);

  // Handle game pause
  const handlePauseGame = useCallback(() => {
    setGameState((prev) => (prev === "playing" ? "paused" : "playing"));
  }, []);

  // Handle game over
  const handleGameOver = useCallback(() => {
    setGameState("gameOver");
  }, []);

  // Handle restart game
  const handleRestartGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setLives(3);
  }, []);

  // Handle level complete
  const handleLevelComplete = useCallback(() => {
    // Add bonus points for completing a level
    setScore((prev) => prev + 100);
  }, []);

  // Handle score change
  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  // Handle lives change
  const handleLivesChange = useCallback((newLives: number) => {
    setLives(newLives);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="mb-4 text-base flex items-center justify-between w-full max-w-[800px]">
        <div className="text-white font-bold">
          Score:{" "}
          <span className="text-yellow-400">
            {score.toString().padStart(5, "0")}
          </span>
        </div>
        <div className="text-white font-bold">
          High Score:{" "}
          <span className="text-yellow-400">
            {highScore.toString().padStart(5, "0")}
          </span>
        </div>
        <div className="flex space-x-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${
                i < lives ? "bg-white" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative">
        <GameCanvas
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          onScoreChange={handleScoreChange}
          onLivesChange={handleLivesChange}
          onGameOver={handleGameOver}
          onLevelComplete={handleLevelComplete}
          gameState={gameState}
        />

        {gameState === "idle" && (
          <div className="absolute inset-0 p-14 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <h1 className="text-4xl text-white font-bold mb-6">
              Block Breaker
            </h1>
            <p className="text-xl text-white mb-8 text-center">
              Break all the blocks to advance to the next level!
            </p>
            <button
              onClick={handleStartGame}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition cursor-pointer"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === "paused" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <h2 className="text-3xl text-white font-bold mb-6">Game Paused</h2>
            <button
              onClick={handlePauseGame}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition"
            >
              Resume Game
            </button>
          </div>
        )}

        {gameState === "gameOver" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <h2 className="text-3xl text-white font-bold mb-4">Game Over</h2>
            <p className="text-xl text-white mb-2">Final Score: {score}</p>
            <p className="text-xl text-white mb-6">High Score: {highScore}</p>
            <button
              onClick={handleRestartGame}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameContainer;
