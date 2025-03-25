export interface PaddleType {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
}

// Paddle factory function
export const createPaddle = (
  x: number,
  y: number,
  width: number = 100,
  height: number = 20,
  speed: number = 8,
  color: string = '#e0e0e0'
): PaddleType => {
  return {
    x,
    y,
    width,
    height,
    speed,
    color
  };
};

// Function to move paddle left
export const movePaddleLeft = (paddle: PaddleType, canvasWidth: number): PaddleType => {
  const newX = Math.max(0, paddle.x - paddle.speed);
  return {
    ...paddle,
    x: newX
  };
};

// Function to move paddle right
export const movePaddleRight = (paddle: PaddleType, canvasWidth: number): PaddleType => {
  const newX = Math.min(canvasWidth - paddle.width, paddle.x + paddle.speed);
  return {
    ...paddle,
    x: newX
  };
};

// Function to update paddle position based on keyboard input
export const updatePaddle = (
  paddle: PaddleType,
  keysPressed: { [key: string]: boolean },
  canvasWidth: number
): PaddleType => {
  let newPaddle = { ...paddle };
  
  if (keysPressed['ArrowLeft']) {
    newPaddle = movePaddleLeft(newPaddle, canvasWidth);
  }
  
  if (keysPressed['ArrowRight']) {
    newPaddle = movePaddleRight(newPaddle, canvasWidth);
  }
  
  return newPaddle;
};
