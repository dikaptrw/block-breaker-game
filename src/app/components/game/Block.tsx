export interface BlockType {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  health: number;
  special?: "tnt" | "circle" | "plus";
  broken: boolean;
}

// Block factory function to create different types of blocks
export const createBlock = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  health: number = 1,
  special?: "tnt" | "circle" | "plus"
): BlockType => {
  return {
    id,
    x,
    y,
    width,
    height,
    color,
    health,
    special,
    broken: false,
  };
};

// Function to create a grid of blocks
export const createBlockGrid = (
  rows: number,
  cols: number,
  blockWidth: number,
  blockHeight: number,
  startX: number,
  startY: number,
  padding: number
): BlockType[] => {
  const blocks: BlockType[] = [];
  const colors = ["#187498", "#EB5353", "#F9D923", "#36AE7C"]; // Blue, Red, Yellow, Green

  for (let row = 0; row < rows; row++) {
    const color = colors[row % colors.length];

    for (let col = 0; col < cols; col++) {
      const x = startX + col * (blockWidth + padding);
      const y = startY + row * (blockHeight + padding);

      // Determine if this block should be special
      let special: "tnt" | "circle" | "plus" | undefined = undefined;

      // Add some special blocks randomly
      if (Math.random() < 0.1) {
        const specialTypes: ("tnt" | "circle" | "plus")[] = [
          "tnt",
          "circle",
          "plus",
        ];
        special = specialTypes[Math.floor(Math.random() * specialTypes.length)];
      }

      blocks.push(
        createBlock(
          `block-${row}-${col}`,
          x,
          y,
          blockWidth,
          blockHeight,
          color,
          1, // Basic health
          special
        )
      );
    }
  }

  return blocks;
};
