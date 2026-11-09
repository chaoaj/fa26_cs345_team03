// sketch.js
// Drag cards from your hand into the arena, then take turns attacking and healing.

const ATTACK_DAMAGE = 15;
const HEAL_AMOUNT = 10;
const ENEMY_HEAL_THRESHOLD = 0.3;
const MAX_BOARD = 4; // most cards you can have in the arena at once

// Canvas size: same on every screen of the game
const CANVAS_W = 1000, CANVAS_H = 650;

// Card sizes
const HAND_W = 80, HAND_H = 105;    // in your hand
const BIG_W = 180, BIG_H = 240;     // selected (enlarged) in your hand
const BOARD_W = 120, BOARD_H = 160; // in the arena (and the enemy)

// Where things sit (y = center)
const ENEMY_Y = 145;
const ARENA_Y = 365;
const SANITY_BAR_Y = 510; // your big shared sanity bar, under the arena
const HAND_Y = 590;

let enemy;
let enemyAI;
let board = [];           // your cards in the arena
let hand = [];            // your cards in hand
let buttons = [];         // the two shared buttons: Attack and Heal
let activeIndex = 0;      // which arena card (left to right) acts next on your turn
let effects = [];         // animations currently playing
let currentTurn = null;   // "player", "enemy", or null before the first card is played
let busy = false;         // true while an animation plays; blocks clicks
let gameOverMessage = null;
let restartButton;
let arena;                // the drop zone for your cards
let deckPile;             // right side: cards will be drawn from here (later)
let discardPile;          // left side: used cards will go here (later)
let playerSanity;         // your one shared sanity bar

let selectedCard = null;  // the hand card the mouse is over (shown enlarged)
let draggedCard = null;   // the card being dragged
let draggedFrom = null;   // "hand" or "arena": where the dragged card came from
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragStartX = 0;       // where the mouse was pressed, to tell a click from a real drag
let dragStartY = 0;

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  noCursor();
  textFont("Georgia"); // storybook-style font
  makeBackground();    // draw the forest scene once

  arena = { x: width / 2, y: ARENA_Y, w: 700, h: 246 };

  // The two shared action buttons, stacked to the right of the arena.
  // They act for whoever's turn it is: the active card on your turn, the enemy on its turn.
  const bx = arena.x + arena.w / 2 + 12;
  buttons = [
    new Button("Attack", null, "attack", bx, ARENA_Y - 48),
    new Button("Heal", null, "heal", bx, ARENA_Y + 8),
  ];
  for (const b of buttons) {
    b.w = 90;
    b.h = 40;
  }

  // Top-left, under the game over message
  restartButton = new Button("Restart Battle", null, "restart", 20, 45);
  restartButton.w = 160;

  startBattle();
}

// Set everything up for a fresh battle (also used by Restart Battle)
function startBattle() {
  enemy = new Card("Enemy", width / 2, ENEMY_Y, color(38, 18, 52), BOARD_W, BOARD_H);
  enemy.side = "enemy";
  enemy.isShadow = true; // dark body with glowing eyes
  enemyAI = new EnemyAI({ healThreshold: ENEMY_HEAL_THRESHOLD });

  playerSanity = new PlayerSanity(width / 2, SANITY_BAR_Y, 480, 26);

  board = [];
  hand = [];
  effects = [];
  activeIndex = 0;

  const names = ["Brawler", "Trickster", "Guardian", "Mystic", "Ranger", "Herbalist", "Bard"];
  for (const name of names) {
    const card = new Card(name, 0, 0, color(172, 108, 60), HAND_W, HAND_H); // warm wood
    card.side = "player";
    card.showBar = false;
    hand.push(card);
  }

  // The piles sit in the bottom corners, on either side of the hand
  deckPile = new Pile("Deck", width - 55, HAND_Y, true);
  discardPile = new Pile("Discard", 55, HAND_Y, false);
  deckPile.showCount = false;    // no number on the piles
  discardPile.showCount = false;
  // Placeholder counts so you can see the piles. Draw/discard logic will set these later.
  deckPile.count = 20;
  discardPile.count = 5;

  selectedCard = null;
  draggedCard = null;
  busy = false;
  gameOverMessage = null;
  currentTurn = null;

  layoutHand();
  // Start the hand cards in place instead of gliding in from the corner
  for (const card of hand) {
    card.x = card.targetX;
    card.y = card.targetY;
  }
}

function draw() {
  drawBackground(); // forest scene + fireflies
  updateHover();

  drawTurnText();

  enemy.update();
  enemy.draw();

  drawArenaZone();
  deckPile.draw();
  discardPile.draw();

  for (const card of board) {
    if (card !== draggedCard) {
      card.update();
      card.draw();
    }
  }

  // Gold glow around the card whose turn it is
  const actor = activeActor();
  if (actor && actor.side === "player" && actor !== draggedCard && !gameOverMessage) {
    drawActiveGlow(actor);
  }

  for (const b of buttons) {
    b.draw(canUseButtons());
  }

  playerSanity.update();
  playerSanity.draw();

  // While dragging an arena card, show where to drop it to take it back
  if (draggedCard && draggedFrom === "arena") {
    drawHandDropZone();
  }

  // Hand cards (the selected and dragged ones are drawn later, on top)
  for (const card of hand) {
    if (card !== draggedCard && card !== selectedCard) {
      card.update();
      card.draw();
    }
  }

  for (const e of effects) {
    e.update();
    e.draw();
  }
  effects = effects.filter((e) => !e.done);

  if (gameOverMessage) {
    push();
    fill(255, 205, 90);
    stroke(INK);
    strokeWeight(4); // dark outline so it reads on top of the leaves
    textAlign(LEFT, CENTER);
    textSize(20);
    textStyle(BOLD);
    text(gameOverMessage, 20, 25);
    pop();

    restartButton.draw(true);
  }

  // Hovering a card in play shows its info panel
  if (!draggedCard) {
    for (const card of [...board, enemy]) {
      if (card.contains(mouseX, mouseY)) {
        drawInfoPanel(card);
      }
    }
  }

  // The selected card is drawn on top of everything else
  if (selectedCard && selectedCard !== draggedCard) {
    selectedCard.update();
    selectedCard.draw();
  }

  if (draggedCard) {
    draggedCard.update();
    draggedCard.draw();
  }

  drawGameCursor(getCursorMode());
}

// ---------- Turns and actions ----------

// Who the two buttons act for right now: the enemy on its turn,
// or on your turn the arena card whose turn it is (null if nobody can act)
function activeActor() {
  if (currentTurn === "enemy") return enemy;
  if (currentTurn === "player") return board[activeIndex] || null;
  return null;
}

// The buttons work when someone can act and nothing is animating
function canUseButtons() {
  return activeActor() !== null && !busy && !gameOverMessage;
}

// You can move cards any time except during the enemy's turn
function canMoveCards() {
  return currentTurn !== "enemy" && !busy && !gameOverMessage;
}

// Playing a card also needs a free spot in the arena
function canPlayCard() {
  return canMoveCards() && board.length < MAX_BOARD;
}

function performAction(actor, action) {
  if (action === "attack") {
    // Your cards attack the enemy; the enemy attacks your shared sanity
    const target = actor.side === "player" ? enemy : playerSanity;

    busy = true;
    effects.push(new AttackProjectile(actor, target, () => {
      target.takeDamage(ATTACK_DAMAGE);
      endTurn();
    }));
  } else if (action === "heal") {
    // Your cards heal your shared sanity; the enemy heals itself
    const healTarget = actor.side === "player" ? playerSanity : actor;

    busy = true;
    effects.push(new HealBurst(actor, () => {
      healTarget.heal(HEAL_AMOUNT);
      endTurn();
    }));
  }
}

// Runs after every action: one of your cards acts (left to right, wrapping around),
// then the enemy, then your next card.
function endTurn() {
  if (enemy.sanity <= 0) {
    gameOverMessage = "Enemy went insane! You win.";
  } else if (playerSanity.sanity <= 0) {
    gameOverMessage = "You lost your mind... Returning to checkpoint.";
  }

  if (gameOverMessage) {
    busy = false;
    return;
  }

  if (currentTurn === "player") {
    activeIndex = board.length > 0 ? (activeIndex + 1) % board.length : 0;
    currentTurn = "enemy";
    performAction(enemy, enemyAI.chooseAction(enemy.sanity, MAX_SANITY));
    return;
  }

  currentTurn = "player";
  if (board.length === 0) activeIndex = 0;
  else activeIndex %= board.length;
  busy = false;
}

function drawTurnText() {
  if (gameOverMessage) return;

  let message;
  if (currentTurn === null) message = "Drag a card into the arena to begin";
  else if (currentTurn === "enemy") message = "Enemy's turn";
  else if (board.length === 0) message = "Your turn: play a card";
  else message = "Your turn: " + board[activeIndex].name;

  push();
  fill(CREAM);
  stroke(INK);
  strokeWeight(4); // dark outline so it reads on top of the leaves
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(18);
  text(message, 20, 25); // top-left, out of the enemy's way
  pop();
}

// ---------- Mouse ----------

function mousePressed() {
  if (gameOverMessage && restartButton.contains(mouseX, mouseY)) {
    startBattle();
    return;
  }

  // Press on the enlarged hand card: start dragging it
  if (selectedCard && isOverHandCard(selectedCard)) {
    draggedCard = selectedCard;
    draggedFrom = "hand";
    dragOffsetX = mouseX - selectedCard.x;
    dragOffsetY = mouseY - selectedCard.y;
    dragStartX = mouseX;
    dragStartY = mouseY;
    return;
  }

  // Pick up a card from the arena (to take it back into your hand)
  if (canMoveCards()) {
    for (const card of board) {
      if (card.contains(mouseX, mouseY)) {
        draggedCard = card;
        draggedFrom = "arena";
        dragOffsetX = mouseX - card.x;
        dragOffsetY = mouseY - card.y;
        dragStartX = mouseX;
        dragStartY = mouseY;
        return;
      }
    }
  }

  for (const b of buttons) {
    if (b.contains(mouseX, mouseY) && canUseButtons()) {
      performAction(activeActor(), b.action);
      return;
    }
  }
}

// Did the mouse actually move since it was pressed? (a plain click doesn't count)
function movedEnough() {
  return dist(mouseX, mouseY, dragStartX, dragStartY) > 20;
}

function mouseDragged() {
  if (draggedCard) {
    draggedCard.targetX = mouseX - dragOffsetX;
    draggedCard.targetY = mouseY - dragOffsetY;
  }
}

function mouseReleased() {
  if (draggedCard) {
    if (draggedFrom === "hand" && movedEnough() && canPlayCard() && isOverArena(mouseX, mouseY)) {
      playCard(draggedCard);
      selectedCard = null;
    } else if (draggedFrom === "arena" && movedEnough() && isOverHand(mouseX, mouseY)) {
      returnToHand(draggedCard);
    }
    draggedCard = null;
    draggedFrom = null;
    layoutHand();
    layoutBoard(); // an arena card dropped anywhere else glides back to its spot
  }
}

// ---------- Hovering the hand ----------

// Every frame: enlarge the hand card under the mouse, shrink it when the mouse leaves
function updateHover() {
  if (draggedCard) return; // don't change anything mid-drag

  let hovered = null;
  const mouseOnCanvas = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  if (mouseOnCanvas) {
    if (selectedCard && isOverHandCard(selectedCard)) {
      hovered = selectedCard; // still on the enlarged card: keep it
    } else {
      for (const card of hand) {
        if (isOverHandCard(card)) {
          hovered = card;
          break;
        }
      }
    }
  }

  if (hovered !== selectedCard) {
    selectedCard = hovered;
    layoutHand(); // grow the new one, shrink the old one, move the neighbors
  }
}

// Is the mouse over this hand card?
// Uses where the card is heading (targets), not where it is mid-animation,
// and also counts the card's normal spot in the row, so it doesn't flicker
// while the card grows upward away from the mouse.
function isOverHandCard(card) {
  const overCard =
    abs(mouseX - card.targetX) <= card.targetW / 2 &&
    abs(mouseY - card.targetY) <= card.targetH / 2;

  const overSpot =
    abs(mouseX - card.targetX) <= HAND_W / 2 &&
    mouseY >= HAND_Y - HAND_H / 2;

  return overCard || overSpot;
}

// ---------- Playing cards ----------

// Move a card out of the hand and into the arena
function playCard(card) {
  hand.splice(hand.indexOf(card), 1);
  board.push(card);

  card.targetW = BOARD_W;
  card.targetH = BOARD_H;
  layoutBoard(); // no buttons or sanity bar on your cards: you share them

  // The battle starts when your first card is played
  if (currentTurn === null) {
    currentTurn = "player";
  }
}

// Move a card out of the arena and back into the hand
function returnToHand(card) {
  const index = board.indexOf(card);
  board.splice(index, 1);

  // Keep the turn order pointing at the same card after the others shift left
  if (index < activeIndex) activeIndex--;
  if (activeIndex >= board.length) {
    activeIndex = 0;
  }

  hand.push(card); // targets (size and spot) are set by layoutHand()
  layoutHand();
  layoutBoard();
}

// Pulsing gold outline around the card whose turn it is
function drawActiveGlow(card) {
  const pulse = (sin(frameCount * 0.1) + 1) / 2; // 0..1
  push();
  rectMode(CENTER);
  noFill();
  drawingContext.shadowBlur = 18 + 10 * pulse;
  drawingContext.shadowColor = "rgba(255, 210, 110, 0.9)";
  stroke(255, 215, 120, 180 + 75 * pulse);
  strokeWeight(4);
  rect(card.x, card.y, card.w + 8, card.h + 8, 14);
  pop();
}

// ---------- Layout ----------

// Spread the arena cards evenly, centered
function layoutBoard() {
  const spacing = 180;
  const startX = width / 2 - (board.length - 1) * spacing / 2;

  for (let i = 0; i < board.length; i++) {
    board[i].targetX = startX + i * spacing;
    board[i].targetY = arena.y;
  }
}

// Spread the hand cards across the bottom; the selected card is big and lifted
function layoutHand() {
  const spacing = 90;
  const push = 45; // how far the neighbors move aside
  const startX = width / 2 - (hand.length - 1) * spacing / 2;
  const selectedIndex = hand.indexOf(selectedCard); // -1 if nothing is selected

  for (let i = 0; i < hand.length; i++) {
    const card = hand[i];
    let x = startX + i * spacing;

    if (selectedIndex !== -1) {
      if (i < selectedIndex) x -= push;
      if (i > selectedIndex) x += push;
    }

    card.targetX = x;
    if (card === selectedCard) {
      card.targetW = BIG_W;
      card.targetH = BIG_H;
      card.targetY = HAND_Y - 75; // lifted up over the board
      // keep the big card fully on screen
      card.targetX = constrain(x, BIG_W / 2 + 5, width - BIG_W / 2 - 5);
    } else {
      card.targetW = HAND_W;
      card.targetH = HAND_H;
      card.targetY = HAND_Y;
    }
  }
}

// ---------- Drawing helpers ----------

// The arena: a lighter mossy clearing with a dashed edge showing where cards can be dropped
function drawArenaZone() {
  push();
  rectMode(CENTER);
  noStroke();
  fill(120, 155, 80, 45);
  rect(arena.x, arena.y, arena.w, arena.h, 40);

  noFill();
  stroke(GOLD[0], GOLD[1], GOLD[2], 120);
  strokeWeight(2);
  drawingContext.setLineDash([8, 6]);
  rect(arena.x, arena.y, arena.w, arena.h, 40);
  drawingContext.setLineDash([]);

  if (board.length === 0) {
    noStroke();
    fill(CREAM[0], CREAM[1], CREAM[2], 170);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("Drag cards here", arena.x, arena.y);
  }
  pop();
}

// The strip along the bottom where your hand is
function isOverHand(mx, my) {
  return my >= HAND_Y - 65;
}

// Dashed outline over the hand while an arena card is being dragged
function drawHandDropZone() {
  push();
  rectMode(CORNER);
  noFill();
  stroke(200, 170, 90);
  strokeWeight(2);
  drawingContext.setLineDash([8, 6]);
  rect(20, HAND_Y - 62, width - 40, 122, 14);
  drawingContext.setLineDash([]);

  noStroke();
  fill(200, 170, 90);
  // In the gap between your hand and the deck, so the hand cards don't cover it
  textAlign(CENTER, CENTER);
  textSize(13);
  text("Drop here\nto return\nto hand", width - 160, HAND_Y - 22);
  pop();
}

function isOverArena(mx, my) {
  return mx >= arena.x - arena.w / 2 && mx <= arena.x + arena.w / 2 &&
         my >= arena.y - arena.h / 2 && my <= arena.y + arena.h / 2;
}

// A small panel beside a card showing its class
function drawInfoPanel(card) {
  const w = 150;
  const h = 70;
  let x = card.x + card.w / 2 + 15;           // right of the card...
  // ...or left of it if it would cover the Attack/Heal buttons
  if (x + w > arena.x + arena.w / 2) {
    x = card.x - card.w / 2 - 15 - w;         // ...or left of it if there's no room
  }
  const y = card.y - h / 2;

  push();
  fill(32, 18, 42, 235);
  stroke(GOLD);
  strokeWeight(2);
  rect(x, y, w, h, 8);

  noStroke();
  fill(GOLD);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(13);
  text("Class", x + 12, y + 10);

  fill(CREAM);
  textStyle(NORMAL);
  textSize(18);
  text(card.name, x + 12, y + 32);
  pop();
}

// What is the mouse over right now?
function getCursorMode() {
  if (draggedCard) return "drag";

  for (const card of hand) {
    if (card.contains(mouseX, mouseY)) return "hover";
  }

  if (canMoveCards()) {
    for (const card of board) {
      if (card.contains(mouseX, mouseY)) return "hover";
    }
  }

  for (const b of buttons) {
    if (b.contains(mouseX, mouseY) && canUseButtons()) return "hover";
  }

  if (gameOverMessage && restartButton.contains(mouseX, mouseY)) return "hover";

  return "normal";
}
