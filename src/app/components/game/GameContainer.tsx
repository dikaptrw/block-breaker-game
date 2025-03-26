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
  const [showGameInfo, setShowGameInfo] = useState(false);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handlePauseGame();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handlePauseGame]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="mb-4 text-base flex items-center justify-between w-full max-w-[800px]">
        <div className="text-white font-bold">
          Score:{" "}
          <span className="text-yellow-500">
            {score.toString().padStart(5, "0")}
          </span>
        </div>
        <div className="text-white font-bold">
          High Score:{" "}
          <span className="text-yellow-500">
            {highScore.toString().padStart(5, "0")}
          </span>
        </div>
        <div className="flex space-x-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border ${
                i < lives
                  ? "bg-white border-white"
                  : "bg-[#191919] border-[#697565]/40"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-[#697565]/20">
        <GameCanvas
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          onScoreChange={handleScoreChange}
          onLivesChange={handleLivesChange}
          onGameOver={handleGameOver}
          onLevelComplete={handleLevelComplete}
          gameState={gameState}
        />

        {showGameInfo && (
          <div className="absolute inset-0 p-8 bg-[#191919] bg-opacity-70 flex flex-col items-start justify-center text-2sm text-white">
            <h1 className="text-2xl font-bold mb-4 text-center w-full -mt-1">
              Game Info
            </h1>
            <p className="mb-4">
              Press the left and right arrow keys to move the paddle.
            </p>
            <p className="mb-4">
              Press the space bar or touch the screen to launch the ball.
            </p>
            <p>Special blocks:</p>
            <p>TNT - Destroys adjacent blocks</p>
            <p>Circle - Extra points</p>
            <p>Plus - Destroys blocks in same row and column</p>

            <div className="mt-6 flex justify-center w-full">
              <button
                onClick={() => setShowGameInfo(false)}
                className="px-6 py-3 bg-[#697565] text-white font-bold rounded-md transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {!showGameInfo && gameState === "idle" && (
          <div className="absolute inset-0 p-14 flex flex-col items-center justify-center bg-[#191919] bg-opacity-70">
            <h1 className="text-2xl text-white font-bold mb-6">
              Are you ready?
            </h1>
            <p className="text-lg text-white mb-8 text-center">
              Break all the blocks to advance to the next level!
            </p>
            <button
              onClick={handleStartGame}
              className="px-6 py-3 bg-[#697565] text-white font-bold rounded-md transition cursor-pointer"
            >
              Start Game
            </button>
          </div>
        )}

        {!showGameInfo && gameState === "paused" && (
          <div className="absolute inset-0 p-8 flex flex-col items-center justify-center bg-[#191919] bg-opacity-70">
            <h2 className="text-3xl text-white font-bold mb-6">Game Paused</h2>

            <div className="mb-8 text-white text-center">
              Tap &apos;Resume&apos; to continue! Take a break and come back
              stronger!
            </div>

            <button
              onClick={handlePauseGame}
              className="px-6 py-3 bg-[#697565] text-white font-bold rounded-md transition cursor-pointer"
            >
              Resume Game
            </button>
          </div>
        )}

        {!showGameInfo && gameState === "gameOver" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#191919] bg-opacity-70">
            <h2 className="text-3xl text-white font-bold mb-4">Game Over</h2>
            <p className="text-lg text-white mb-2">
              Final Score:
              <span className="text-yellow-500">{score}</span>
            </p>
            <p className="text-lg text-white mb-6">
              High Score:
              <span className="text-yellow-500">{highScore}</span>
            </p>
            <button
              onClick={handleRestartGame}
              className="px-6 py-3 bg-[#697565] text-white font-bold rounded-md transition"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-white">
        For detailed game instructions and tips,{" "}
        <button
          onClick={() => {
            setShowGameInfo(true);
            if (gameState === "playing") {
              handlePauseGame();
            }
          }}
          className="text-yellow-500 cursor-pointer"
        >
          click here
        </button>
        .
      </div>
    </div>
  );
};

export default GameContainer;
