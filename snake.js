export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

export function toKey(position) {
  return `${position.x},${position.y}`;
}

export function createInitialState(config = {}) {
  const width = config.width ?? 16;
  const height = config.height ?? 16;
  const start = config.start ?? [
    { x: 7, y: 8 },
    { x: 6, y: 8 },
    { x: 5, y: 8 }
  ];
  const direction = config.direction ?? "right";
  const food = config.food ?? placeFood(start, width, height);

  return {
    width,
    height,
    snake: start,
    direction,
    pendingDirection: direction,
    food,
    score: 0,
    isGameOver: false,
    isPaused: false
  };
}

export function setDirection(state, nextDirection) {
  if (!DIRECTIONS[nextDirection] || state.isGameOver) {
    return state;
  }

  if (
    OPPOSITES[state.direction] === nextDirection ||
    OPPOSITES[state.pendingDirection] === nextDirection
  ) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection
  };
}

export function togglePause(state) {
  if (state.isGameOver) {
    return state;
  }

  return {
    ...state,
    isPaused: !state.isPaused
  };
}

export function stepGame(state, random = Math.random) {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const direction = state.pendingDirection;
  const offset = DIRECTIONS[direction];
  const nextHead = {
    x: state.snake[0].x + offset.x,
    y: state.snake[0].y + offset.y
  };
  const grows = nextHead.x === state.food.x && nextHead.y === state.food.y;
  const nextSnake = [nextHead, ...state.snake];

  if (!grows) {
    nextSnake.pop();
  }

  if (hitsWall(nextHead, state.width, state.height) || hitsSnake(nextHead, nextSnake.slice(1))) {
    return {
      ...state,
      direction,
      pendingDirection: direction,
      isGameOver: true
    };
  }

  const food = grows ? placeFood(nextSnake, state.width, state.height, random) : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: direction,
    food,
    score: grows ? state.score + 1 : state.score
  };
}

export function placeFood(snake, width, height, random = Math.random) {
  const occupied = new Set(snake.map(toKey));
  const open = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        open.push({ x, y });
      }
    }
  }

  if (open.length === 0) {
    return null;
  }

  const index = Math.min(open.length - 1, Math.floor(random() * open.length));
  return open[index];
}

export function hitsWall(position, width, height) {
  return position.x < 0 || position.y < 0 || position.x >= width || position.y >= height;
}

export function hitsSnake(position, snake) {
  return snake.some((segment) => segment.x === position.x && segment.y === position.y);
}
