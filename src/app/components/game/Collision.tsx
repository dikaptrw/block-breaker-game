import { BlockType } from './Block';
import { BallType } from './Ball';

// Function to check collision between ball and block
export const checkBlockCollision = (ball: BallType, block: BlockType): boolean => {
  // Find the closest point on the block to the ball
  const closestX = Math.max(block.x, Math.min(ball.x, block.x + block.width));
  const closestY = Math.max(block.y, Math.min(ball.y, block.y + block.height));
  
  // Calculate the distance between the ball's center and this closest point
  const distanceX = ball.x - closestX;
  const distanceY = ball.y - closestY;
  
  // If the distance is less than the ball's radius, there is a collision
  const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
  return distanceSquared < (ball.radius * ball.radius);
};

// Function to handle ball collision with a block
export const handleBlockCollision = (ball: BallType, block: BlockType): BallType => {
  if (block.broken) return ball;
  
  // Determine which side of the block was hit
  const ballCenterX = ball.x;
  const ballCenterY = ball.y;
  const blockCenterX = block.x + block.width / 2;
  const blockCenterY = block.y + block.height / 2;
  
  // Calculate the overlap on x and y axes
  const overlapX = ball.radius + block.width / 2 - Math.abs(ballCenterX - blockCenterX);
  const overlapY = ball.radius + block.height / 2 - Math.abs(ballCenterY - blockCenterY);
  
  let newDx = ball.dx;
  let newDy = ball.dy;
  
  // Determine which side was hit based on overlap and velocity
  if (overlapX < overlapY) {
    // Hit on left or right side
    newDx = -ball.dx;
  } else {
    // Hit on top or bottom
    newDy = -ball.dy;
  }
  
  return {
    ...ball,
    dx: newDx,
    dy: newDy
  };
};

// Function to handle special block effects
export const handleSpecialBlockEffect = (
  blocks: BlockType[],
  blockId: string
): { blocks: BlockType[], scoreIncrease: number } => {
  const blockIndex = blocks.findIndex(b => b.id === blockId);
  if (blockIndex === -1) return { blocks, scoreIncrease: 0 };
  
  const block = blocks[blockIndex];
  let newBlocks = [...blocks];
  let scoreIncrease = 10; // Base score for breaking a block
  
  // Mark the block as broken
  newBlocks[blockIndex] = { ...block, broken: true };
  
  // Handle special block effects
  if (block.special) {
    switch (block.special) {
      case 'tnt':
        // TNT blocks destroy adjacent blocks
        scoreIncrease = 50;
        newBlocks = newBlocks.map(b => {
          if (b.broken) return b;
          
          // Check if block is adjacent to the TNT block
          const isAdjacent = 
            Math.abs(b.x - block.x) <= block.width * 1.5 &&
            Math.abs(b.y - block.y) <= block.height * 1.5;
            
          if (isAdjacent) {
            scoreIncrease += 10;
            return { ...b, broken: true };
          }
          
          return b;
        });
        break;
        
      case 'circle':
        // Circle blocks give extra points
        scoreIncrease = 30;
        break;
        
      case 'plus':
        // Plus blocks destroy all blocks in the same row and column
        scoreIncrease = 40;
        newBlocks = newBlocks.map(b => {
          if (b.broken) return b;
          
          // Check if block is in the same row or column
          const isSameRow = Math.abs(b.y - block.y) < block.height / 2;
          const isSameColumn = Math.abs(b.x - block.x) < block.width / 2;
          
          if (isSameRow || isSameColumn) {
            scoreIncrease += 10;
            return { ...b, broken: true };
          }
          
          return b;
        });
        break;
    }
  }
  
  return { blocks: newBlocks, scoreIncrease };
};

// Function to check if all blocks are broken
export const areAllBlocksBroken = (blocks: BlockType[]): boolean => {
  return blocks.every(block => block.broken);
};

// Function to draw blocks on canvas
export const drawBlocks = (
  ctx: CanvasRenderingContext2D,
  blocks: BlockType[]
): void => {
  blocks.forEach(block => {
    if (block.broken) return;
    
    // Draw block background
    ctx.fillStyle = block.color;
    ctx.fillRect(block.x, block.y, block.width, block.height);
    
    // Draw block border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(block.x, block.y, block.width, block.height);
    
    // Draw special block indicators
    if (block.special) {
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '14px Arial';
      
      const centerX = block.x + block.width / 2;
      const centerY = block.y + block.height / 2;
      
      switch (block.special) {
        case 'tnt':
          ctx.fillText('TNT', centerX, centerY);
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(centerX, centerY, block.width / 4, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'plus':
          ctx.beginPath();
          ctx.moveTo(centerX - block.width / 4, centerY);
          ctx.lineTo(centerX + block.width / 4, centerY);
          ctx.moveTo(centerX, centerY - block.height / 4);
          ctx.lineTo(centerX, centerY + block.height / 4);
          ctx.stroke();
          break;
      }
    }
  });
};
