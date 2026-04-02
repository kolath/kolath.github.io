import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialState,
  hitsSnake,
  hitsWall,
  placeFood,
  setDirection,
  stepGame
} from "./snake.js";

test("snake moves one cell in current direction", () => {
  const state = createInitialState({
    start: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    food: { x: 5, y: 5 }
  });

  const next = stepGame(state, () => 0);

  assert.deepEqual(next.snake, [
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 2 }
  ]);
});

test("snake grows and score increments when eating food", () => {
  const state = createInitialState({
    start: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    food: { x: 3, y: 2 }
  });

  const next = stepGame(state, () => 0);

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.notDeepEqual(next.food, { x: 3, y: 2 });
});

test("direction cannot reverse directly", () => {
  const state = createInitialState({ direction: "right", food: { x: 10, y: 10 } });
  const next = setDirection(state, "left");

  assert.equal(next.pendingDirection, "right");
});

test("queued turn cannot be reversed before the next tick", () => {
  const state = createInitialState({ direction: "right", food: { x: 10, y: 10 } });
  const turned = setDirection(state, "up");
  const reversed = setDirection(turned, "down");

  assert.equal(reversed.pendingDirection, "up");
});

test("wall collision ends the game", () => {
  const state = createInitialState({
    width: 4,
    height: 4,
    start: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 }
    ],
    food: { x: 0, y: 0 }
  });

  const next = stepGame(state);

  assert.equal(next.isGameOver, true);
});

test("self collision ends the game", () => {
  const state = createInitialState({
    direction: "up",
    start: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ],
    food: { x: 0, y: 0 }
  });

  const next = stepGame(state);

  assert.equal(next.isGameOver, true);
});

test("food placement skips occupied cells", () => {
  const food = placeFood(
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ],
    2,
    2,
    () => 0
  );

  assert.deepEqual(food, { x: 1, y: 1 });
});

test("collision helpers behave as expected", () => {
  assert.equal(hitsWall({ x: -1, y: 0 }, 4, 4), true);
  assert.equal(hitsSnake({ x: 1, y: 1 }, [{ x: 1, y: 1 }]), true);
});
