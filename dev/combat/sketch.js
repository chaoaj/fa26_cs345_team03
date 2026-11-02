// sketch.js
// Two cards take turns. Click Attack or Heal on the side whose turn it is.

const ATTACK_DAMAGE = 15;
const HEAL_AMOUNT = 10;

let player;
let enemy;
let currentTurn;   // the Card whose turn it is
let buttons = [];
let effects = [];  // animations currently playing
let busy = false;  // true while an animation plays; blocks clicks
let gameOverMessage = null; // set when a card reaches 0 sanity
let restartButton;

let arena;
let hand = [];

let draggedCard = null;
let dragOffsetX = 0;
let dragOffsetY = 0;


function setup() {
  createCanvas(500, 950);
  noCursor();

  arena = {x: width / 2, y: 620, w: 150, h: 200};

  // Enemy on top, player on the bottom
  enemy = new Card("Enemy", width / 2, 270, color(140, 70, 170));
  player = null;

  for (const card of [arena, enemy]) {
    const top = card.y + card.h / 2 + 18;
    buttons.push(new Button("Attack", card, "attack", card.x - 75, top));
    buttons.push(new Button("Heal", card, "heal", card.x + 5, top));
  }

  restartButton = new Button("Restart Battle", null, "restart", width / 2 - 80, 55);
  restartButton.w = 160;

  const names = ["Brawler", "Trickster", "Guardian", "Mystic"];
  for (const name of names) {
    const card = new Card(name, 0, 0, color(60, 110, 200), 90, 120);
    card.showBar = false;
    hand.push(card);
  }
  layoutHand();
  currentTurn = player;
}

function draw() {
  background(35, 32, 45);

  enemy.update();
  enemy.draw();

  if (player) {
    player.update();
    player.draw();
  } else {
    drawArenaSlot();
  }
  
  for (const card of hand) {
    if (card !== draggedCard) {
      card.update();
      card.draw();
    }
  }

  for (const b of buttons) {
    b.draw(canAct(b.owner));
  }

  for (const e of effects) {
    e.update();
    e.draw();
  }
  effects = effects.filter((e) => !e.done);

  // Message at the top when someone loses all their sanity
  if (gameOverMessage) {
    push();
    fill(255, 205, 60);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    textStyle(BOLD);
    text(gameOverMessage, width / 2, 30);
    pop();

    restartButton.draw(true);
  }

  if (draggedCard) {
    draggedCard.update();
    draggedCard.draw();
  }

  drawGameCursor(getCursorMode());
}

// A side can act only on its own turn and when no animation is playing
function canAct(card) {
  return card === currentTurn && !busy && !gameOverMessage;
}

function mousePressed() {
  if (gameOverMessage && restartButton.contains(mouseX, mouseY)) {
    restartBattle();
    return;
  }

  for (const card of hand) {
    if (card.contains(mouseX, mouseY)) {
      draggedCard = card;
      dragOffsetX = mouseX - card.x;
      dragOffsetY = mouseY - card.y;
      return;
    }
  }
  for (const b of buttons) {
    if (b.contains(mouseX, mouseY) && canAct(b.owner)) {
      performAction(b.owner, b.action);
      return;
    }
  }
}

function opponentOf(card) {
  return card === player ? enemy : player;
}

function performAction(actor, action) {
  busy = true;

  if (action === "attack") {
    const target = opponentOf(actor);
    effects.push(new AttackProjectile(actor, target, () => {
      target.takeDamage(ATTACK_DAMAGE);
      endTurn();
    }));
  } else if (action === "heal") {
    effects.push(new HealBurst(actor, () => {
      actor.heal(HEAL_AMOUNT);
      endTurn();
    }));
  }
}

function endTurn() {
  if (enemy.sanity <= 0) {
    gameOverMessage = "Enemy went insane! Player wins.";
  } else if (player.sanity <= 0) {
    gameOverMessage = "You lost your mind... Returning to checkpoint.";
  }
  currentTurn = opponentOf(currentTurn);
  busy = false;
}

// Put both cards back to full sanity and start a new battle
function restartBattle() {
  for (const card of [player, enemy]) {
    card.sanity = MAX_SANITY;
    card.displaySanity = MAX_SANITY;
    card.hitTimer = 0;
    card.healTimer = 0;
  }
  effects = [];
  busy = false;
  gameOverMessage = null;
  currentTurn = player;
}


function drawArenaSlot() {
  push();
  rectMode(CENTER);
  noFill();
  stroke(150);
  strokeWeight(2);
  drawingContext.setLineDash([8, 6]);
  rect(arena.x, arena.y, arena.w, arena.h, 12);
  drawingContext.setLineDash([]);

  noStroke();
  fill(150);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("Drag a card here", arena.x, arena.y);
  pop();
}

function layoutHand() {
  const spacing = 100;
  const startX = width / 2 - (hand.length - 1) * spacing / 2;

  for (let i = 0; i < hand.length; i++) {
    hand[i].x = startX + i * spacing;
    hand[i].y = height - 80;
  }
}

function mouseDragged() {
  if (draggedCard) {
    draggedCard.x = mouseX - dragOffsetX;
    draggedCard.y = mouseY - dragOffsetY;
  }
}

function mouseReleased() {
  if (draggedCard) {
    if (player === null && isOverArena(mouseX, mouseY)) {
      playCard(draggedCard);
    }
    draggedCard = null;
    layoutHand();
  }
}

function isOverArena(mx, my) {
  return mx >= arena.x - arena.w / 2 && mx <= arena.x + arena.w / 2 &&
  my >= arena.y - arena.h / 2 && my <= arena.y + arena.h / 2;
}

function playCard(card) {
  const index = hand.indexOf(card);
  hand.splice(index, 1);

  card.x = arena.x;
  card.y = arena.y;
  card.w = arena.w;
  card.h = arena.h;
  card.showBar = true;

  player = card;

  for (const b of buttons) {
    if (b.owner === arena) {
      b.owner = card;
    }
  }

  currentTurn = player;
}

function getCursorMode() {
  if (draggedCard) {
    return "drag";
  }

  for (const card of hand) {
    if (card.contains(mouseX, mouseY)) {
      return "hover";
    }
  }

  for (const b of buttons) {
    if (b.contains(mouseX, mouseY) && canAct(b.owner)) {
      return "hover";
    }
  }

  if (gameOverMessage && restartButton.contains(mouseX, mouseY)) {
    return "hover";
  }

  return "normal";
}