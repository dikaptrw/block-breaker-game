"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import GameCanvas from "./GameCanvas";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import { ENV } from "@/app/constants";
import db from "@/app/utils/firestore";
import Player from "./Player";

// Game constants
const GAME_WIDTH = 500;
const GAME_HEIGHT = 400;
const HIGH_SCORE_STORAGE = "blockBreakerHighScore";
const HIGH_SCORE_PLAYER_STORAGE = "blockBreakerHighScorePlayer";

// Game states
type GameState = "idle" | "playing" | "paused" | "gameOver";

const GameContainer: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);
  const [highScorePlayer, setHighScorePlayer] = useState("");
  const [showGameInfo, setShowGameInfo] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const collectionRef = useMemo(() => {
    return collection(db, "dikaptrw-profile", ENV, "games");
  }, []);
  const docRef = useMemo(() => {
    return doc(
      collectionRef,
      process.env.NEXT_PUBLIC_BLOCK_BREAKER_GAME_DOC_ID
    );
  }, [collectionRef]);

  // Load high score from localStorage on mount
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_HIGH_SCORE_MODE === "firestore") {
      getDoc(docRef).then((res) => {
        const data = res.data();

        if (data) {
          setHighScore(data.highScore);
          setHighScorePlayer(data.playerName);
        }
      });
    } else {
      const storedHighScore = localStorage.getItem(HIGH_SCORE_STORAGE);
      const storedHighScorePlayer = localStorage.getItem(
        HIGH_SCORE_PLAYER_STORAGE
      );

      setHighScore(storedHighScore ? parseInt(storedHighScore, 10) : highScore);
      setHighScorePlayer(storedHighScorePlayer || highScorePlayer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update high score when score changes
  useEffect(() => {
    // Update high score if current score is higher
    if (score > highScore) {
      if (process.env.NEXT_PUBLIC_HIGH_SCORE_MODE === "firestore") {
        updateHighScoreFirestore({
          highScore: score,
          highScorePlayer: playerName,
        });
      } else {
        // Save high score to local storage
        localStorage.setItem(HIGH_SCORE_STORAGE, score.toString());
        localStorage.setItem(HIGH_SCORE_PLAYER_STORAGE, playerName.toString());
      }
      setHighScore(score);
      setHighScorePlayer(playerName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, highScore]);

  // Handle high score update on firestore
  const updateHighScoreFirestore = useCallback(
    ({
      highScore,
      highScorePlayer,
    }: {
      highScore: number;
      highScorePlayer: string;
    }) => {
      getDoc(docRef).then((res) => {
        if (res.exists()) {
          updateDoc(docRef, {
            highScore: Math.floor(highScore),
            playerName: highScorePlayer,
          });
        } else {
          setDoc(docRef, {
            highScore: Math.floor(highScore),
            playerName: highScorePlayer,
          });
        }
      });
    },
    [docRef]
  );

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
          {highScorePlayer && (
            <span className="text-xs pl-1">({highScorePlayer})</span>
          )}
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
              Press the left or right arrow keys, or swipe left or right, to
              move the paddle
            </p>
            <p className="mb-4">
              Press the space bar or tap the screen to launch the ball.
            </p>
            <p>Special blocks:</p>
            <p>
              <span className="text-yellow-500">TNT</span> - Destroys adjacent
              blocks
            </p>
            <p>
              <span className="text-yellow-500">Circle</span> - Extra points
            </p>
            <p>
              <span className="text-yellow-500">Plus</span> - Destroys blocks in
              same row and column
            </p>

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

      <div className="mt-4 text-white w-full flex items-center gap-4">
        <Player
          isPlaying={gameState === "playing"}
          playerName={playerName}
          setPlayerName={setPlayerName}
          handleStartGame={handleStartGame}
        />

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
