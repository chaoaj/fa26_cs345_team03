// Drag cards from your hand into the arena, drag an arrow to the enemy to attack, heal yourself using the heal button.

const ATTACK_DAMAGE = 15;
const HEAL_AMOUNT = 12;
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
let buttons = [];         // heal button
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
let draggedFrom = null;   // where the dragged card came from
let dragOffsetX = 0;      // mouse offset from the card's center, so the card does not jump 
let dragOffsetY = 0;
let dragStartX = 0;       // where the mouse was pressed, to tell a click from a real drag
let dragStartY = 0;

let hoveredArenaCard = null;                // arena card under the mouse that can attack
let aimingCard = null;                      // arena card currently pulling the attack arrow

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  noCursor();
  textFont("Georgia"); // storybook-style font
  makeBackground();    // draw the forest scene once

  arena = { x: width / 2, y: ARENA_Y, w: 700, h: 246 };

  // Heal button, to the right of the arena
  const bx = arena.x + arena.w / 2 + 12;
  buttons = [
    new Button("Heal", null, "heal", bx, ARENA_Y  - 20),
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

  enemyAI = new EnemyAI({healThreshold: ENEMY_HEAL_THRESHOLD});

  playerSanity = new PlayerSanity(width / 2, SANITY_BAR_Y, 480, 26);

  board = [];
  hand = [];
  effects = [];

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
  updateArenaHover();

  drawTurnText();

  const lockedOn = aimingCard && enemy.contains(mouseX, mouseY);

  enemy.update();

  if (lockedOn) {
    drawCardGlow(enemy, [255, 70, 210]);
  }
  enemy.draw();

  drawArenaZone();
  deckPile.draw();
  discardPile.draw();

  for (const card of board) {
    card.update();
    if (card === hoveredArenaCard) {
      drawCardGlow(card, [255, 210, 110]);
    }
    card.draw();
  }

  for (const b of buttons) {
    b.draw(canUseButtons());
  }

  playerSanity.update();
  playerSanity.draw();


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

  if (aimingCard) {
    drawAttackArrow(aimingCard);
  }

  // Hovering a card in play shows its info panel
  if (!draggedCard && !aimingCard) {
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

  if (!aimingCard) {
    drawGameCursor(getCursorMode());
  }
}

// ---------- Turns and actions ----------

// The heal button works only on player's turn while nothing is animating
function canUseButtons() {
  return currentTurn === "player" && !busy && !gameOverMessage;
}

// Cards can be played except during the enemy's turn or an animation
function canMoveCards() {
  return currentTurn !== "enemy" && !busy && !gameOverMessage;
}

// Playing a card also needs a free spot in the arena
function canPlayCard() {
  return canMoveCards() && board.length < MAX_BOARD;
}

// Any arena card can attack on player's turn while nothing is animating
function canAim(card) {
  return currentTurn === "player" && board.includes(card) && !busy && !gameOverMessage;
}

// Fires an orb at the target, damage lands on the impact, then the turn passes
function performAttack(actor) {
  const target = actor.side === "player" ? enemy : playerSanity;

  busy = true;
  effects.push(new AttackProjectile(actor, target, () => {
    target.takeDamage(ATTACK_DAMAGE);
    endTurn();
  }));
}

// Restores the sanity bar, it costs one turn
function healPlayer() {
  busy = true;
  effects.push(new HealBurst(playerSanity, () => {
    playerSanity.heal(HEAL_AMOUNT);
    endTurn();
  }));
}

// Enemy turn: a short pause, then it attacks player's sanity bar
function startEnemyTurn() {
  busy = true;
  setTimeout(() => { // pause so the enemy's hit does not land on top of player's
    if (gameOverMessage) {
      return;
    }
    const action = enemyAI.chooseAction(enemy.sanity, MAX_SANITY);
    if (action === "heal") {
      enemyHeal();
    } else {
      performAttack(enemy);
    }
  }, 700);
}

function enemyHeal() {
  effects.push(new HealBurst(enemy, () => {
    enemy.heal(HEAL_AMOUNT);
    endTurn();
  }));
}

// Checks for a winner, then passes the turn to the other side
function endTurn() {
  if (enemy.sanity <= 0) {
    gameOverMessage = "Enemy went insane! You win.";
  } else if (playerSanity.sanity <= 0) {
    gameOverMessage = "You lost your mind... Returning to checkpoint.";
  }

  if (currentTurn === "player") {
    currentTurn = "enemy";
  } else {
    currentTurn = "player";
  }
  busy = false;

  // The enemy acts on its own...
  if (currentTurn === "enemy" && !gameOverMessage) {
    startEnemyTurn();
  }
}

function drawTurnText() {
  if (gameOverMessage) return;

  let message;
  if (currentTurn === null) message = "Drag a card into the arena to begin";
  else if (currentTurn === "enemy") message = "Enemy's turn";
  else if (board.length === 0) message = "Your turn: play a card";
  else message = "Your turn: drag from any card to attack";

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

  // Pressing an arena card starts aiming
  for (const card of board) {
    if (canAim(card) && card.contains(mouseX, mouseY)) {
      aimingCard = card;
      return;
    }
  }

  // Heal button
  for (const b of buttons) {
    if (b.contains(mouseX, mouseY) && canUseButtons()) {
      healPlayer();
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
  // Releasing on the enemy attacks them, releasing anywhere else cancels the arrow
  if (aimingCard) {
    if (enemy.contains(mouseX, mouseY) && canAim(aimingCard)) {
      performAttack(aimingCard);
    }
    aimingCard = null;
    return;
  }
  
  if (draggedCard) {
    if (draggedFrom === "hand" && movedEnough() && canPlayCard() && isOverArena(mouseX, mouseY)) {
      playCard(draggedCard);
      selectedCard = null;
    }
    draggedCard = null;
    draggedFrom = null;
    layoutHand();
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

// Pulsing glow drawn behind the card
function drawCardGlow(card, rgb) {
  const seconds = millis() / 1000;
  const pulse = (sin(seconds * TWO_PI * 0.5) + 1) / 2;

  push();
  rectMode(CENTER);
  noStroke();

  drawingContext.shadowBlur = 26;
  drawingContext.shadowColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${0.6 + 0.4 * pulse})`;
  fill(rgb[0], rgb[1], rgb[2], 150 + 90* pulse);
  rect(card.x, card.y, card.w + 10, card.h + 10, 16);
  pop();
}

// Tracks the arena card under the mouse that can attack and enlarges it slightly
function updateArenaHover() {
  hoveredArenaCard = null;

  if (aimingCard) {
    hoveredArenaCard = aimingCard;
  } else {
    for (const card of board) {
      if (canAim(card) && card.contains(mouseX, mouseY)) {
        hoveredArenaCard = card;
      }
    }
  }
  for (const card of board) {
    const grow = card === hoveredArenaCard ? 1.05 : 1;
    card.targetW = BOARD_W * grow;
    card.targetH = BOARD_H * grow;
  }
}

// Point along the arrow's curve, t = 0 at the card, t = 1 at the mouse
function arrowPoint(start, end, t, bend) {
  return {
    x: lerp(start.x, end.x, t) + sin(t * PI) * bend,
    y: lerp(start.y, end.y, t),
  };
}

// Firefly-chain arrow from the aiming card to the mouse
function drawAttackArrow(card) {
  if (card.contains(mouseX, mouseY)) {
    return;
  }

  const start = {x: card.x, y: card.y};
  const end = {x: mouseX, y: mouseY};
  const length = dist(start.x, start.y, end.x, end.y);
  const bend = length * 0.12;
  const count = floor(length / 22);
  const c = [255, 220, 120];

  push();
  noStroke();
  blendMode(ADD);

  const flow = (millis() / 450) % 1;

  for (let i = 0; i < count; i++) {
    const t = (i + flow) / count;
    const p = arrowPoint(start, end, t, bend);
    if (dist(p.x, p.y, end.x, end.y) < 34) {
      continue;
    }
    fill(255, 150, 40, 70);
    circle(p.x, p.y, 16);
    fill(c);
    circle(p.x, p.y, 10);
  }
  blendMode(BLEND);
  pop();

  const before = arrowPoint(start, end, 0.95, bend);
  const angle = atan2(end.y - before.y, end.x - before.x);

  push();
  translate(end.x, end.y);
  rotate(angle);
  stroke(INK);
  strokeWeight(2.5);
  fill(c);
  triangle(4, 0, -24, -15, -24, 15);
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

function isOverArena(mx, my) {
  return mx >= arena.x - arena.w / 2 && mx <= arena.x + arena.w / 2 &&
         my >= arena.y - arena.h / 2 && my <= arena.y + arena.h / 2;
}

// A small panel beside a card showing its info
function drawInfoPanel(card) {
  const w = 150;
  const h = 70;
  let x = card.x + card.w / 2 + 15;

  // Right of the card, or left of it if it would cover the Heal button
  if (x + w > arena.x + arena.w / 2) {
    x = card.x - card.w / 2 - 15 - w;
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

  if (hoveredArenaCard) {
    return "hover";
  }

  for (const b of buttons) {
    if (b.contains(mouseX, mouseY) && canUseButtons()) return "hover";
  }

  if (gameOverMessage && restartButton.contains(mouseX, mouseY)) return "hover";

  return "normal";
}
