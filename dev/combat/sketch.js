// Drag cards from your hand into the arena, drag an arrow to the enemy to attack, heal yourself using the heal button.

const ATTACK_DAMAGE = 15;
const HEAL_AMOUNT = 12;
const ENEMY_HEAL_THRESHOLD = 0.3;
const MAX_BOARD = 4; // most cards you can have in the arena at once

const START_HAND_SIZE = 7;
const DEAL_DELAY = 15;

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

const MAX_ENERGY = 10;

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

let deck = [];
let discard = [];

let cardsToDeal = 0;
let dealTimer = 0;

let selectedCard = null;  // the hand card the mouse is over (shown enlarged)
let draggedCard = null;   // the card being dragged
let draggedFrom = null;   // where the dragged card came from
let dragOffsetX = 0;      // mouse offset from the card's center, so the card does not jump 
let dragOffsetY = 0;
let dragStartX = 0;       // where the mouse was pressed, to tell a click from a real drag
let dragStartY = 0;

let hoveredArenaCard = null;                // arena card under the mouse that can attack
let aimingCard = null;                      // arena card currently pulling the attack arrow

let energy = 0;
let energyLayer;

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  noCursor();
  textFont("Georgia"); // storybook-style font
  makeBackground();    // draw the forest scene once

  arena = { x: width / 2, y: ARENA_Y, w: 700, h: 246 };

  energyLayer = createGraphics(90, 410);
  energyLayer.pixelDensity(1);

  // Heal button, to the right of the arena
  const bx = arena.x + arena.w / 2 + 12;
  buttons = [
    new Button("Heal", null, "heal", bx, 40),
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
  energy = 0;


  // The piles sit in the bottom corners, on either side of the hand
  deckPile = new Pile("Deck", width - 55, HAND_Y, true);
  discardPile = new Pile("Discard", 55, HAND_Y, false);
  deckPile.showCount = false;    // no number on the piles
  discardPile.showCount = false;
  discard = [];
  buildDeck();
  cardsToDeal = START_HAND_SIZE;
  dealTimer = 0;

  selectedCard = null;
  draggedCard = null;
  busy = false;
  gameOverMessage = null;
  currentTurn = null;

}

function makeCard (name, type) {
  const c = type === "energy" ? color(60, 120, 150) : color(172, 108, 60);
  const card = new Card(name, 0, 0, c, HAND_W, HAND_H);
  card.side = "player";
  card.type = type;
  card.showBar = false;
  
  return card;
}

function buildDeck() {
  deck = [];
  const names = ["Brawler", "Trickster", "Guardian", "Mystic", "Ranger", "Herbalist", 
    "Bard", "Brawler", "Trickster", "Guardian"];

    for (const name of names) {
      deck.push(makeCard(name, "combat"));
    }
    for (let i = 0; i < 10; i++) {
      deck.push(makeCard("Energy", "energy"));
    }
    shuffle(deck, true);
}

function drawCard() {
  if (deck.length === 0) {
    if (discard.length === 0) {
      return;
    }
    deck = discard;
    discard = [];
    shuffle(deck, true);
  }

  const card = deck.pop();
  card.x = deckPile.x;
  card.y = deckPile.y;
  hand.push(card);
  layoutHand();
}

function dealCards() {
  if (cardsToDeal <= 0) {
    return;
  }
  dealTimer--;
  if (dealTimer <= 0) {
    drawCard();
    cardsToDeal--;
    dealTimer = DEAL_DELAY;
  }
  
  
}

function discardCard(card) {
  board.splice(board.indexOf(card), 1);
  discard.push(card);
  layoutBoard();
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
  drawEnergyMeter();
  dealCards();
  deckPile.count = deck.length;
  discardPile.count = discard.length;
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
  return currentTurn !== "enemy" && !busy && !gameOverMessage && cardsToDeal === 0;
}

// Playing a card also needs a free spot in the arena
function canPlayCard(card) {
  if (!card || !canMoveCards()) {
    return false;
  }

  if (card.type === "energy") {
    return energy < MAX_ENERGY;
  }
  return board.length < MAX_BOARD;
}

// Any arena card can attack on player's turn while nothing is animating
function canAim(card) {
  return currentTurn === "player" && board.includes(card) && energy > 0 && !busy && !gameOverMessage;
}

// Fires an orb at the target, damage lands on the impact, then the turn passes
function performAttack(actor) {
  const target = actor.side === "player" ? enemy : playerSanity;

  if (actor.side === "player") {
    energy--;

    const target = getNextEnergyTarget();
    effects.push(new CrystalShatter(target.x, target.y));
  }
  busy = true;

  effects.push(new AttackProjectile(actor, target, () => {
    const damage = Math.min(ATTACK_DAMAGE, target.sanity);

    target.takeDamage(ATTACK_DAMAGE);

    effects.push(new FloatingText(
      "-" + damage,
      target.x,
      target.y,
      [255, 70, 70],
      30
    ));
    
    if (actor.side === "player") {
      effects.push(new CardShatter(
        actor,
        discardPile.x,
        discardPile.y,
        [205, 70, 50]
      ));

      discardCard(actor);
      drawCard();
    }

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
    if (currentTurn === "player" && !busy && !gameOverMessage && energy === 0 && card.contains(mouseX, mouseY)) {
      effects.push(new FloatingText(
        "You need energy to attack!",
        card.x,
        card.y
      ));

      return;
    }

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
    if (draggedFrom === "hand" && movedEnough() && canPlayCard(draggedCard) && isOverArena(mouseX, mouseY)) {
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
  const handIndex = hand.indexOf(card);

  // Only play a card that is in your hand and allowed.
  if (handIndex === -1 || !canPlayCard(card)) return;

  hand.splice(handIndex, 1);

  if (selectedCard === card) {
    selectedCard = null;
  }

  // Either card type can start the battle.
  if (currentTurn === null) {
    currentTurn = "player";
  }

  if (card.type === "energy") {
    playEnergyCard(card);
  } else {
    board.push(card);
    card.targetW = BOARD_W;
    card.targetH = BOARD_H;
    layoutBoard();
  }

  layoutHand();
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
  if (card.contains(mouseX, mouseY) || mouseY >= card.y + card.h / 2) {
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

function drawEnergyMeter() {
  const x = arena.x + arena.w / 2 + 12;
  const y = 90;
  const g = energyLayer;

  g.clear();

  g.noStroke();
  g.fill(30, 20, 46, 220);
  g.rect(0, 0, g.width, g.height, 12);

  g.fill(CREAM);
  g.textFont("Georgia");
  g.textAlign(CENTER, CENTER);
  g.textSize(14);
  g.text("Energy", g.width / 2, 18);

  drawCrystalMeter(
    g,
    39, 40,
    12, 330,
    energy,
    MAX_ENERGY,
    {
      gap: 5,
      glow: 0.45,
      animate: true,
      time: millis() / 1000
    }
  );

  g.fill(CREAM);
  g.text(`${energy} / ${MAX_ENERGY}`, g.width / 2, 390);

  image(g,x, y);
}

function getNextEnergyTarget() {
  const panelX = arena.x + arena.w / 2 + 12;
  const panelY = 90;

  const columnX = 39;
  const columnY = 40;
  const crystalWidth = 12;
  const columnHeight = 330;
  const gap = 5;

  const crystalHeight =
    (columnHeight - gap * (MAX_ENERGY - 1)) / MAX_ENERGY;

  // Fill from the bottom upward.
  const slot = MAX_ENERGY - 1 - energy;

  return {
    x: panelX + columnX + crystalWidth / 2,
    y: panelY + columnY + slot * (crystalHeight + gap) + crystalHeight / 2
  };
}

function playEnergyCard(card) {
  const target = getNextEnergyTarget();

  busy = true;

  effects.push(
    new CardShatter(
      card,
      target.x,
      target.y,
      [100, 220, 255],
      () => {
        energy = Math.min(energy + 1, MAX_ENERGY);

        discard.push(card);
        drawCard();

        busy = false;
      }
    )
  );
}