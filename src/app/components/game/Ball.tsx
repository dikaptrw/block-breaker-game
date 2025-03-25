export interface BallType {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  speed: number;
  color: string;
}

// Ball factory function
export const createBall = (
  x: number,
  y: number,
  radius: number = 10,
  speed: number = 5,
  color: string = '#ffffff'
): BallType => {
  return {
    x,
    y,
    radius,
    dx: 0,
    dy: 0,
    speed,
    color
  };
};

// Function to launch the ball
export const launchBall = (ball: BallType, angle?: number): BallType => {
  // If angle is not provided, use a random angle between -45 and 45 degrees
  const launchAngle = angle ?? (Math.random() * 90 - 45) * (Math.PI / 180);
  
  return {
    ...ball,
    dx: ball.speed * Math.sin(launchAngle),
    dy: -ball.speed * Math.cos(launchAngle)
  };
};

// Function to update ball position
export const updateBall = (ball: BallType): BallType => {
  return {
    ...ball,
    x: ball.x + ball.dx,
    y: ball.y + ball.dy
  };
};

// Function to handle ball collision with walls
export const handleWallCollision = (ball: BallType, width: number, height: number): BallType => {
  let newDx = ball.dx;
  let newDy = ball.dy;
  
  // Collision with left or right wall
  if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= width) {
    newDx = -ball.dx;
  }
  
  // Collision with top wall
  if (ball.y - ball.radius <= 0) {
    newDy = -ball.dy;
  }
  
  return {
    ...ball,
    dx: newDx,
    dy: newDy
  };
};

// Function to check if ball is out of bounds (bottom)
export const isBallOutOfBounds = (ball: BallType, height: number): boolean => {
  return ball.y - ball.radius > height;
};

// Function to reset ball
export const resetBall = (ball: BallType, x: number, y: number): BallType => {
  return {
    ...ball,
    x,
    y,
    dx: 0,
    dy: 0
  };
};

// Function to handle ball collision with paddle
export const handlePaddleCollision = (
  ball: BallType,
  paddleX: number,
  paddleY: number,
  paddleWidth: number,
  paddleHeight: number
): BallType => {
  // Check if ball is colliding with paddle
  if (
    ball.y + ball.radius >= paddleY &&
    ball.y - ball.radius <= paddleY + paddleHeight &&
    ball.x + ball.radius >= paddleX &&
    ball.x - ball.radius <= paddleX + paddleWidth
  ) {
    // Calculate where the ball hit the paddle (0 to 1)
    const hitPosition = (ball.x - paddleX) / paddleWidth;
    
    // Calculate new angle based on hit position
    // Middle of paddle sends ball straight up, edges send at angle
    const angle = (hitPosition - 0.5) * Math.PI * 0.7; // Max angle of about 60 degrees
    
    return {
      ...ball,
      dy: -Math.abs(ball.dy), // Always bounce up
      dx: ball.speed * Math.sin(angle)
    };
  }
  
  return ball;
};
