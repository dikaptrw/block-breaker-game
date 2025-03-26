"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useGameLoop } from "../../hooks/useGameLoop";
import {
  createBall,
  BallType,
  launchBall,
  updateBall,
  handleWallCollision,
  isBallOutOfBounds,
  resetBall,
  handlePaddleCollision,
} from "./Ball";
import { createPaddle, PaddleType, updatePaddle } from "./Paddle";
import { createBlockGrid, BlockType } from "./Block";
import {
  checkBlockCollision,
  handleBlockCollision,
  handleSpecialBlockEffect,
  areAllBlocksBroken,
  drawBlocks,
} from "./Collision";
import {
  createExplosion,
  updateParticle,
  drawParticles,
  ParticleType,
} from "./Effects";

interface GameCanvasProps {
  width: number;
  height: number;
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onGameOver: () => void;
  onLevelComplete: () => void;
  gameState: "idle" | "playing" | "paused" | "gameOver";
}

// Game constants
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 10;
const PADDLE_SPEED = 8;
const BALL_RADIUS = 8;
const BALL_SPEED = 5;
const BLOCK_WIDTH = 35;
const BLOCK_HEIGHT = 20;
const BLOCK_PADDING = 10;
const BLOCK_ROWS = 4;
const BLOCK_COLS = 7;

const GameCanvas: React.FC<GameCanvasProps> = ({
  width,
  height,
  onScoreChange,
  onLivesChange,
  onGameOver,
  onLevelComplete,
  gameState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game state
  const [paddle, setPaddle] = useState<PaddleType>(() =>
    createPaddle(
      width / 2 - PADDLE_WIDTH / 2,
      height - PADDLE_HEIGHT - 10,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
      PADDLE_SPEED
    )
  );

  const [ball, setBall] = useState<BallType>(() =>
    createBall(
      width / 2,
      height - PADDLE_HEIGHT - BALL_RADIUS - 10,
      BALL_RADIUS,
      BALL_SPEED
    )
  );

  const [blocks, setBlocks] = useState<BlockType[]>(() =>
    createBlockGrid(
      BLOCK_ROWS,
      BLOCK_COLS,
      BLOCK_WIDTH,
      BLOCK_HEIGHT,
      (width - (BLOCK_WIDTH + BLOCK_PADDING) * BLOCK_COLS + BLOCK_PADDING) / 2,
      50,
      BLOCK_PADDING
    )
  );

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [level, setLevel] = useState(1);
  const [particles, setParticles] = useState<ParticleType[]>([]);
  const [flashEffect, setFlashEffect] = useState(false);
  const [shakeEffect, setShakeEffect] = useState(false);

  // Touch event state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Handle key and touch events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [e.key]: true }));

      // Launch ball with spacebar
      if (
        e.key === " " &&
        gameState === "playing" &&
        ball.dx === 0 &&
        ball.dy === 0
      ) {
        setBall((prev) => launchBall(prev));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [e.key]: false }));
    };

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStartX(touch.clientX);

      // Launch ball with tap if it's not moving
      if (gameState === "playing" && ball.dx === 0 && ball.dy === 0) {
        setBall((prev) => launchBall(prev));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX === null) return;

      const touch = e.touches[0];
      const moveDiff = touch.clientX - touchStartX; // Calculate movement delta

      setPaddle((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(width - prev.width, prev.x + moveDiff)), // Keep within bounds
      }));

      setTouchStartX(touch.clientX); // Update touch start for next move

      e.preventDefault(); // Prevent page scrolling
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Add touch event listeners to the canvas
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("touchmove", handleTouchMove as EventListener);
      canvas.addEventListener("touchstart", handleTouchStart as EventListener);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      if (canvas) {
        canvas.removeEventListener(
          "touchmove",
          handleTouchMove as EventListener
        );
        canvas.removeEventListener(
          "touchstart",
          handleTouchStart as EventListener
        );
      }
    };
  }, [gameState, ball.dx, ball.dy, touchStartX, width]);

  // Reset game when state changes to playing
  useEffect(() => {
    const handleResetPaddlePosition = () => {
      // Reset paddle position
      setPaddle((prev) => ({
        ...prev,
        x: width / 2 - PADDLE_WIDTH / 2,
      }));
    };

    if (gameState === "playing" && lives > 0) {
      // Reset ball position if it's not moving
      if (ball.dx === 0 && ball.dy === 0) {
        handleResetPaddlePosition();

        setBall((prev) => ({
          ...prev,
          x: width / 2,
          y: height - PADDLE_HEIGHT - BALL_RADIUS - 10,
        }));
      }
    }

    if (gameState === "gameOver") {
      setBlocks(
        createBlockGrid(
          BLOCK_ROWS,
          BLOCK_COLS,
          BLOCK_WIDTH,
          BLOCK_HEIGHT,
          (width - (BLOCK_WIDTH + BLOCK_PADDING) * BLOCK_COLS + BLOCK_PADDING) /
            2,
          50,
          BLOCK_PADDING
        )
      );
      setLevel(1);
      setLives(3);
      handleResetPaddlePosition();
    }
  }, [gameState, width, height, lives, ball.dx, ball.dy]);

  // Create new level
  const createNewLevel = useCallback(() => {
    setLevel((prev) => prev + 1);
    setBlocks(
      createBlockGrid(
        BLOCK_ROWS,
        BLOCK_COLS,
        BLOCK_WIDTH,
        BLOCK_HEIGHT,
        (width - (BLOCK_WIDTH + BLOCK_PADDING) * BLOCK_COLS + BLOCK_PADDING) /
          2,
        50,
        BLOCK_PADDING
      )
    );
    setBall((prev) =>
      resetBall(prev, width / 2, height - PADDLE_HEIGHT - BALL_RADIUS - 10)
    );

    // Add level transition effect
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 300);
  }, [width, height]);

  // Check if level is complete
  useEffect(() => {
    if (gameState === "playing" && areAllBlocksBroken(blocks)) {
      onLevelComplete();
      createNewLevel();
    }
  }, [blocks, gameState, onLevelComplete, createNewLevel]);

  // Update score and lives
  useEffect(() => {
    onScoreChange(score);
  }, [score, onScoreChange]);

  useEffect(() => {
    onLivesChange(lives);
  }, [lives, onLivesChange]);

  // Handle screen shake effect
  useEffect(() => {
    if (shakeEffect) {
      setTimeout(() => setShakeEffect(false), 300);
    }
  }, [shakeEffect]);

  // Game loop
  useGameLoop(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = "#191919";
    ctx.fillRect(0, 0, width, height);

    // Apply screen shake effect
    if (shakeEffect) {
      const shakeAmount = 5;
      ctx.save();
      ctx.translate(
        Math.random() * shakeAmount - shakeAmount / 2,
        Math.random() * shakeAmount - shakeAmount / 2
      );
    }

    // Update paddle position
    setPaddle((prev) => updatePaddle(prev, keysPressed, width));

    // Create local variables to track state changes without causing re-renders
    let currentBall = { ...ball };
    let currentBlocks = [...blocks];
    let currentParticles = [...particles];
    let currentScore = score;
    let shouldShake = false;
    let collisionOccurred = false;

    // Update ball position if it's moving
    if (currentBall.dx !== 0 || currentBall.dy !== 0) {
      // Update ball position
      currentBall = updateBall(currentBall);

      // Handle wall collisions
      currentBall = handleWallCollision(currentBall, width, height);

      // Handle paddle collision
      currentBall = handlePaddleCollision(
        currentBall,
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height
      );

      // Check for ball out of bounds
      if (isBallOutOfBounds(currentBall, height)) {
        // Lose a life
        setLives((prev) => prev - 1);

        // Check for game over
        if (lives <= 1) {
          onGameOver();
        }

        // Reset ball
        currentBall = resetBall(
          currentBall,
          width / 2,
          height - PADDLE_HEIGHT - BALL_RADIUS - 10
        );
      }

      // Handle block collisions
      for (let i = 0; i < currentBlocks.length; i++) {
        const block = currentBlocks[i];
        if (!block.broken && checkBlockCollision(currentBall, block)) {
          // Handle collision physics
          currentBall = handleBlockCollision(currentBall, block);
          collisionOccurred = true;

          // Create particle effect for block breaking
          const newParticles = createExplosion(
            block.x + block.width / 2,
            block.y + block.height / 2,
            block.color,
            block.special ? 40 : 20
          );
          currentParticles = [...currentParticles, ...newParticles];

          // Handle block breaking and special effects
          const { blocks: newBlocks, scoreIncrease } = handleSpecialBlockEffect(
            currentBlocks,
            block.id
          );
          currentBlocks = newBlocks;
          currentScore += scoreIncrease;

          // Add special effects for special blocks
          if (block.special === "tnt") {
            shouldShake = true;
          }

          // Only handle one collision per frame to avoid multiple collisions
          break;
        }
      }

      // Update ball state only once
      setBall(currentBall);
    } else {
      // If ball is not moving, position it above the paddle
      currentBall = {
        ...currentBall,
        x: paddle.x + paddle.width / 2,
      };
      setBall(currentBall);
    }

    // Update other states only if changes occurred
    if (collisionOccurred) {
      setBlocks(currentBlocks);
      setParticles(currentParticles);
      setScore(currentScore);
      if (shouldShake) {
        setShakeEffect(true);
      }
    } else {
      // Update particles regardless of collisions
      setParticles((prev) =>
        prev.map(updateParticle).filter((particle) => particle.life > 0)
      );
    }

    // Draw particles
    drawParticles(ctx, particles);

    // Draw paddle
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();

    // Draw blocks
    drawBlocks(ctx, blocks);

    // Draw level indicator
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Level: ${level}`, 18, 25);

    // Reset screen shake
    if (shakeEffect) {
      ctx.restore();
    }

    // Draw flash effect for level transition
    if (flashEffect) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(0, 0, width, height);
    }
  });

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`rounded-lg shadow-lg ${shakeEffect ? "animate-shake" : ""}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    </>
  );
};

export default GameCanvas;
