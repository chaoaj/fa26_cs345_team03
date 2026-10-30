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

function setup() {
  createCanvas(500, 800);

  // Enemy on top, player on the bottom
  enemy = new Card("Enemy", width / 2, 270, color(140, 70, 170));
  player = new Card("Player", width / 2, 620, color(60, 110, 200));

  for (const card of [player, enemy]) {
    const top = card.y + card.h / 2 + 18;
    buttons.push(new Button("Attack", card, "attack", card.x - 75, top));
    buttons.push(new Button("Heal", card, "heal", card.x + 5, top));
  }

  restartButton = new Button("Restart Battle", null, "restart", width / 2 - 80, 55);
  restartButton.w = 160;

  currentTurn = player;
}

function draw() {
  background(35, 32, 45);

  for (const card of [player, enemy]) {
    card.update();
    card.draw();
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
