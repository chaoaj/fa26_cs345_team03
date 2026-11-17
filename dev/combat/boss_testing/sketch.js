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
const MINIBOSS_CRITICAL_CHANCE = 0.2;
const MINIBOSS_CRITICAL_MULTIPLIER = 2;
const MINION_ATTACK_DAMAGE = 5;

let enemy;
let enemyAI;
let minibossAI;
let selectedMiniboss = null;
let minibossSanityThreshold = 0.25;
let screenMode = "bossTypeMenu";
let minibossAbilityUsed = false;
let nullifyNextAttack = false;
let nullifyNextStatBoost = false;
let stolenCards = [];
let minions = [];
let minibossStatusMessage = "";
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
let bossMenuButton;
let selectedMainBoss = null;
let corruptedBearCharacter = null;
let corruptedBearDeck = [];
let corruptedBearDiscard = [];
let currentCorruptedBearAbility = null;
let corruptedBearClassImage;
let corruptedBearAbilityImages = {};
let corruptedBearEnergy = 0;

const CORRUPTED_BEAR_MAX_ENERGY = 3;
const PLAYER_GUARD_ARMOR = 10;

function preload() {
  corruptedBearClassImage = loadImage("../../" + CORRUPTED_BEAR_CLASS.image);
  for (const ability of CORRUPTED_BEAR_CLASS.abilities) {
    const sourceImage = ability.image.replace(
      "assets/cards/boss/corrupted_bear_combat/",
      "assets/cards/boss/corrupted_bear/"
    );
    corruptedBearAbilityImages[ability.id] = loadImage("../../" + sourceImage);
  }
}

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

  bossMenuButton = new Button("Boss Menu", null, "bossMenu", width - 125, 8);
  bossMenuButton.w = 105;
  bossMenuButton.h = 32;
}

// Set everything up for a fresh battle (also used by Restart Battle)
function startBattle() {
  if (!selectedMiniboss && !selectedMainBoss) return;

  screenMode = "battle";
  minibossAI = selectedMiniboss
    ? new MinibossAI({
        sanityThreshold: minibossSanityThreshold,
        criticalChance: MINIBOSS_CRITICAL_CHANCE,
        criticalMultiplier: MINIBOSS_CRITICAL_MULTIPLIER
      })
    : null;
  minibossAbilityUsed = false;
  nullifyNextAttack = false;
  nullifyNextStatBoost = false;
  stolenCards = [];
  minions = [];
  minibossStatusMessage = "";

  const bossName = selectedMainBoss ? "Corrupted Bear" : selectedMiniboss.name;
  const bossWidth = selectedMainBoss ? 180 : BOARD_W;
  const bossHeight = selectedMainBoss ? 200 : BOARD_H;
  enemy = new Card(bossName, width / 2, ENEMY_Y, color(38, 18, 52), bossWidth, bossHeight);
  enemy.side = "enemy";
  enemy.isShadow = true; // dark body with glowing eyes
  enemy.maxSanity = selectedMainBoss ? selectedMainBoss.stats.maxSanity : MAX_SANITY;
  enemy.sanity = selectedMainBoss ? selectedMainBoss.stats.startingSanity : MAX_SANITY;
  enemy.displaySanity = enemy.sanity;

  enemyAI = selectedMiniboss ? new EnemyAI({healThreshold: ENEMY_HEAL_THRESHOLD}) : null;
  corruptedBearCharacter = selectedMainBoss ? createCorruptedBearCharacter() : null;
  corruptedBearDeck = corruptedBearCharacter ? corruptedBearCharacter.combatDeck.slice() : [];
  shuffle(corruptedBearDeck, true);
  corruptedBearDiscard = [];
  currentCorruptedBearAbility = null;
  corruptedBearEnergy = 0;

  playerSanity = new PlayerSanity(width / 2, SANITY_BAR_Y, 480, 26);
  buttons = [new Button("Heal", null, "heal", arena.x + arena.w / 2 + 12, 40)];
  buttons[0].w = 90;
  buttons[0].h = 40;
  if (selectedMainBoss) {
    const guardButton = new Button("Guard", null, "guard", width - 260, 40);
    guardButton.w = 90;
    guardButton.h = 40;
    buttons.push(guardButton);
  }

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
  aimingCard = null;
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

  if (screenMode !== "battle") {
    if (screenMode === "bossTypeMenu") drawBossTypeMenu();
    else if (screenMode === "minibossMenu") drawMinibossMenu();
    else if (screenMode === "mainBossMenu") drawMainBossMenu();
    drawGameCursor(isOverBossMenuChoice(mouseX, mouseY) ? "hover" : "normal");
    return;
  }

  updateHover();
  updateArenaHover();

  drawTurnText();
  drawMinibossStatus();

  const lockedOn = aimingCard && enemy.contains(mouseX, mouseY);

  enemy.update();

  if (lockedOn) {
    drawCardGlow(enemy, [255, 70, 210]);
  }
  enemy.draw();
  drawCorruptedBearAbility();
  for (const minion of minions) {
    minion.update();
    minion.draw();
  }

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
    for (const card of [...board, enemy, ...minions]) {
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

  drawBossMenuButton();
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
    let attackDamage = ATTACK_DAMAGE;
    let attackLabel;
    if (actor.side === "player" && selectedMiniboss &&
        selectedMiniboss.ability === "nullifyAttack" &&
        nullifyNextAttack) {
      attackDamage = minibossAI.nullifyAttack({ damage: ATTACK_DAMAGE }).damage;
      nullifyNextAttack = false;
      attackLabel = "NULLIFIED";
    } else if (actor.side === "enemy" && selectedMiniboss &&
        selectedMiniboss.ability === "criticalAttack") {
      const result = minibossAI.criticalAttack(ATTACK_DAMAGE);
      attackDamage = result.damage;
      if (result.critical) attackLabel = "CRITICAL!";
    }

    if (actor.side === "player" && selectedMainBoss) {
      attackDamage = Math.floor(attackDamage * playerSanity.nextAttackMultiplier);
      playerSanity.nextAttackMultiplier = 1;
    }

    const sanityBefore = target.sanity;
    if (attackDamage > 0) {
      if (actor.side === "player" && selectedMainBoss) {
        corruptedBearDealDamage(target, attackDamage);
        target.hitTimer = FLASH_FRAMES;
      } else {
        target.takeDamage(attackDamage);
      }
    }
    const damage = sanityBefore - target.sanity;

    effects.push(new FloatingText(
      attackLabel || "-" + damage,
      target.x,
      target.y,
      attackLabel === "NULLIFIED" ? [255, 210, 110] : [255, 70, 70],
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

    if (actor.side === "enemy") {
      finishEnemyTurn();
    } else {
      endTurn();
    }
  }));
}

// Restores the sanity bar, it costs one turn
function healPlayer() {
  busy = true;
  effects.push(new HealBurst(playerSanity, () => {
    if (nullifyNextStatBoost) {
      minibossAI.nullifyStatBoost({ stat: "sanity", amount: HEAL_AMOUNT });
      nullifyNextStatBoost = false;
      effects.push(new FloatingText(
        "BOOST NULLIFIED",
        playerSanity.x,
        playerSanity.y,
        [255, 210, 110],
        30
      ));
    } else {
      playerSanity.heal(Math.floor(
        HEAL_AMOUNT * (selectedMainBoss ? playerSanity.healingReductionMultiplier : 1)
      ));
    }
    endTurn();
  }));
}

function guardPlayer() {
  const armor = Math.floor(PLAYER_GUARD_ARMOR * playerSanity.nextArmorMultiplier);
  playerSanity.nextArmorMultiplier = 1;
  playerSanity.armor += armor;
  effects.push(new FloatingText(
    "Armor +" + armor,
    playerSanity.x,
    playerSanity.y,
    [120, 200, 255],
    30
  ));
  endTurn();
}

// Enemy turn: a short pause, then it attacks player's sanity bar
function startEnemyTurn() {
  busy = true;
  setTimeout(() => { // pause so the enemy's hit does not land on top of player's
    if (gameOverMessage) {
      return;
    }
    if (selectedMainBoss) {
      performCorruptedBearTurn();
      return;
    }
    activateMinibossAbility();
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
    finishEnemyTurn();
  }));
}

function performCorruptedBearTurn() {
  corruptedBearEnergy = CORRUPTED_BEAR_MAX_ENERGY;
  corruptedBearCharacter.energy = corruptedBearEnergy;
  if (corruptedBearDeck.length === 0) {
    corruptedBearDeck = corruptedBearDiscard;
    corruptedBearDiscard = [];
    shuffle(corruptedBearDeck, true);
  }

  const affordableIndexes = corruptedBearDeck
    .map((id, index) => ({ id, index, card: getCorruptedBearAbility(id) }))
    .filter(entry => entry.card && entry.card.energyCost <= corruptedBearCharacter.energy);
  if (affordableIndexes.length === 0) {
    throw new Error("The Corrupted Bear has no playable combat abilities.");
  }

  const choiceIndex = Math.floor(Math.random() * affordableIndexes.length);
  const choice = affordableIndexes[choiceIndex];
  corruptedBearDeck.splice(choice.index, 1);
  corruptedBearDiscard.push(choice.id);
  corruptedBearCharacter.energy -= choice.card.energyCost;
  corruptedBearEnergy = corruptedBearCharacter.energy;
  currentCorruptedBearAbility = choice.card;
  corruptedBearCharacter.sanity = enemy.sanity;

  effects.push(new AttackProjectile(enemy, playerSanity, () => {
    const sanityBefore = playerSanity.sanity;
    const decayBefore = playerSanity.decay;
    CorruptedBearAbilities[choice.id](corruptedBearCharacter, playerSanity);
    const sanityDamage = sanityBefore - playerSanity.sanity;
    if (sanityDamage > 0) playerSanity.hitTimer = FLASH_FRAMES;
    effects.push(new FloatingText(
      sanityDamage > 0 ? "-" + sanityDamage + " Sanity" : choice.card.name,
      playerSanity.x,
      playerSanity.y,
      [205, 90, 90],
      40
    ));
    if (playerSanity.decay > decayBefore) {
      effects.push(new FloatingText(
        "Decay +" + (playerSanity.decay - decayBefore),
        playerSanity.x,
        playerSanity.y + 24,
        [160, 90, 210],
        40
      ));
    }
    endTurn();
  }));
}

function resolveCorruptedBearPlayerTurn() {
  const sanityBefore = playerSanity.sanity;
  if (playerSanity.decay > 0) {
    resolveCorruptedDecay(playerSanity);
    const decayDamage = sanityBefore - playerSanity.sanity;
    if (decayDamage > 0) {
      playerSanity.hitTimer = FLASH_FRAMES;
      effects.push(new FloatingText(
        "Decay -" + decayDamage,
        playerSanity.x,
        playerSanity.y,
        [160, 90, 210],
        30
      ));
    }
  }
  if (playerSanity.healingReductionTurns > 0) {
    playerSanity.healingReductionTurns--;
    if (playerSanity.healingReductionTurns === 0) {
      playerSanity.healingReductionMultiplier = 1;
    }
  }
}

function activateMinibossAbility() {
  if (minibossAbilityUsed ||
      selectedMiniboss.ability === "criticalAttack" ||
      !minibossAI.shouldUseAbility(enemy.sanity, MAX_SANITY)) {
    return;
  }

  switch (selectedMiniboss.ability) {
    case "stealCard": {
      const stolenCard = minibossAI.stealCard(hand, stolenCards);
      if (!stolenCard) return;
      if (selectedCard === stolenCard) selectedCard = null;
      layoutHand();
      minibossStatusMessage = "The miniboss stole a card from your hand!";
      minibossAbilityUsed = true;
      break;
    }
    case "nullifyAttack":
      nullifyNextAttack = true;
      minibossAbilityUsed = true;
      minibossStatusMessage = "The miniboss is ready to nullify your next attack!";
      break;
    case "summonMinion": {
      const minionRoster = [];
      const minionData = minibossAI.summonMinion(minionRoster, {
        name: "Minion",
        sanity: MAX_SANITY,
        maxSanity: MAX_SANITY
      });
      const minion = new Card(
        minionData.name,
        width / 2 + 160,
        ENEMY_Y,
        color(52, 30, 66),
        100,
        135
      );
      minion.side = "enemy";
      minion.isShadow = true;
      minion.targetW = 100;
      minion.targetH = 135;
      minion.sanity = minionData.sanity;
      minion.displaySanity = minionData.sanity;
      minions.push(minion);
      minibossAbilityUsed = true;
      minibossStatusMessage = "A minion joined the miniboss!";
      break;
    }
    case "nullifyStatBoost":
      nullifyNextStatBoost = true;
      minibossAbilityUsed = true;
      minibossStatusMessage = "The miniboss will nullify your next Heal!";
      break;
  }
}

function finishEnemyTurn() {
  if (enemy.sanity <= 0 || playerSanity.sanity <= 0 || minions.length === 0) {
    endTurn();
    return;
  }

  const minion = minions[0];
  effects.push(new AttackProjectile(minion, playerSanity, () => {
    const damage = Math.min(MINION_ATTACK_DAMAGE, playerSanity.sanity);
    playerSanity.takeDamage(MINION_ATTACK_DAMAGE);
    effects.push(new FloatingText(
      "-" + damage,
      playerSanity.x,
      playerSanity.y,
      [255, 120, 90],
      30
    ));
    endTurn();
  }));
}

// Checks for a winner, then passes the turn to the other side
function endTurn() {
  if (currentTurn === "player" && selectedMainBoss) {
    resolveCorruptedBearPlayerTurn();
  }

  if (enemy.sanity <= 0) {
    gameOverMessage = selectedMainBoss
      ? "The Corrupted Bear is defeated! You win."
      : "Enemy went insane! You win.";
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

function drawBossTypeMenu() {
  push();
  rectMode(CENTER);
  drawMenuPanel();

  noStroke();
  fill(GOLD);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  text("Boss Testing", width / 2, 95);
  fill(CREAM);
  textStyle(NORMAL);
  textSize(17);
  text("Choose which boss list to browse.", width / 2, 140);

  drawBossCategoryCard(
    { x: 120, y: 225, w: 350, h: 250 },
    "Mini Bosses",
    "Choose from five bosses with unique abilities.",
    isPointInside(mouseX, mouseY, { x: 120, y: 225, w: 350, h: 250 })
  );
  drawBossCategoryCard(
    { x: 530, y: 225, w: 350, h: 250 },
    "Main Bosses",
    "Fight the Corrupted Bear and its ten abilities.",
    isPointInside(mouseX, mouseY, { x: 530, y: 225, w: 350, h: 250 })
  );
  pop();
}

function drawMenuPanel() {
  fill(32, 18, 42, 225);
  stroke(GOLD);
  strokeWeight(3);
  rect(width / 2, height / 2, 860, 590, 18);
}

function drawBossCategoryCard(bounds, title, description, hovered) {
  fill(hovered ? color(90, 62, 104) : color(55, 37, 68));
  stroke(hovered ? color(255, 220, 135) : color(GOLD));
  strokeWeight(hovered ? 3 : 2);
  rect(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, bounds.w, bounds.h, 12);
  noStroke();
  fill(GOLD);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(25);
  text(title, bounds.x + bounds.w / 2, bounds.y + 85);
  fill(CREAM);
  textStyle(NORMAL);
  textSize(15);
  text(description, bounds.x + bounds.w / 2, bounds.y + 145);
}

function drawMinibossMenu() {
  push();
  rectMode(CENTER);
  drawMenuPanel();

  noStroke();
  fill(GOLD);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  text("Choose a Miniboss", width / 2, 65);
  fill(CREAM);
  textStyle(NORMAL);
  textSize(16);
  text("Each fight uses the same combat rules; only the miniboss ability changes.", width / 2, 105);
  textStyle(BOLD);
  textSize(18);
  text("Ability trigger: " + Math.round(minibossSanityThreshold * 100) + "% sanity", width / 2, 151);

  drawMenuBackButton();
  drawThresholdControl("-", width - 190, 151);
  drawThresholdControl("+", width - 130, 151);

  for (let i = 0; i < MINIBOSS_TYPES.length; i++) {
    const type = MINIBOSS_TYPES[i];
    const bounds = getMinibossChoiceBounds(i);
    const hovered = isPointInside(mouseX, mouseY, bounds);

    fill(hovered ? color(90, 62, 104) : color(55, 37, 68));
    stroke(hovered ? color(255, 220, 135) : color(GOLD));
    strokeWeight(hovered ? 3 : 2);
    rect(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, bounds.w, bounds.h, 12);

    noStroke();
    fill(GOLD);
    textStyle(BOLD);
    textSize(19);
    text(type.name, bounds.x + bounds.w / 2, bounds.y + 32);
    fill(CREAM);
    textStyle(NORMAL);
    textSize(13);
    text(type.description, bounds.x + bounds.w / 2, bounds.y + 72);
    text("Selection chance: " + Math.round(type.selectionChance * 100) + "%",
      bounds.x + bounds.w / 2, bounds.y + 96);
  }
  pop();
}

function drawMainBossMenu() {
  const bounds = getMainBossChoiceBounds();
  const hovered = isPointInside(mouseX, mouseY, bounds);
  push();
  rectMode(CENTER);
  drawMenuPanel();

  noStroke();
  fill(GOLD);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  text("Choose a Main Boss", width / 2, 65);
  fill(CREAM);
  textStyle(NORMAL);
  textSize(16);
  text("Select a boss to test its class abilities.", width / 2, 105);
  drawMenuBackButton();

  fill(hovered ? color(90, 62, 104) : color(55, 37, 68));
  stroke(hovered ? color(255, 220, 135) : color(GOLD));
  strokeWeight(hovered ? 3 : 2);
  rect(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, bounds.w, bounds.h, 12);
  if (corruptedBearClassImage) {
    image(corruptedBearClassImage, width / 2 - 75, bounds.y + 25, 150, 150);
  }
  noStroke();
  fill(GOLD);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(23);
  text("Corrupted Bear", width / 2, bounds.y + 220);
  fill(CREAM);
  textStyle(NORMAL);
  textSize(14);
  text("The Ruined Guardian", width / 2, bounds.y + 251);
  text(CORRUPTED_BEAR_CLASS.abilities.length + " combat abilities", width / 2, bounds.y + 285);
  text("Click to start the fight", width / 2, bounds.y + 345);
  pop();
}

function getMinibossChoiceBounds(index) {
  if (index === 4) return { x: 305, y: 493, w: 390, h: 115 };
  return {
    x: index % 2 === 0 ? 95 : 515,
    y: index < 2 ? 190 : 340,
    w: 390,
    h: 115
  };
}

function getMainBossChoiceBounds() {
  return { x: 300, y: 180, w: 400, h: 410 };
}

function getMenuBackBounds() {
  return { x: 80, y: 136, w: 150, h: 30 };
}

function drawMenuBackButton() {
  const bounds = getMenuBackBounds();
  fill(isPointInside(mouseX, mouseY, bounds) ? color(90, 62, 104) : color(55, 37, 68));
  stroke(GOLD);
  strokeWeight(2);
  rect(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, bounds.w, bounds.h, 6);
  noStroke();
  fill(CREAM);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(13);
  text("Back to Boss Menu", bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
}

function isPointInside(mx, my, bounds) {
  return mx >= bounds.x && mx <= bounds.x + bounds.w &&
    my >= bounds.y && my <= bounds.y + bounds.h;
}

function isOverMinibossChoice(mx, my) {
  for (let i = 0; i < MINIBOSS_TYPES.length; i++) {
    if (isPointInside(mx, my, getMinibossChoiceBounds(i))) return true;
  }
  return false;
}

function isOverBossMenuChoice(mx, my) {
  if (screenMode === "bossTypeMenu") {
    return isPointInside(mx, my, { x: 120, y: 225, w: 350, h: 250 }) ||
      isPointInside(mx, my, { x: 530, y: 225, w: 350, h: 250 });
  }
  if (screenMode === "minibossMenu") {
    return isPointInside(mx, my, getMenuBackBounds()) ||
      isOverMinibossChoice(mx, my) ||
      isPointInside(mx, my, { x: width - 190 - 17, y: 136, w: 34, h: 30 }) ||
      isPointInside(mx, my, { x: width - 130 - 17, y: 136, w: 34, h: 30 });
  }
  return screenMode === "mainBossMenu" &&
    (isPointInside(mx, my, getMenuBackBounds()) ||
      isPointInside(mx, my, getMainBossChoiceBounds()));
}

function drawThresholdControl(label, x, y) {
  fill(100, 72, 54);
  stroke(GOLD);
  strokeWeight(2);
  rect(x, y, 34, 30, 6);
  noStroke();
  fill(CREAM);
  textStyle(BOLD);
  textSize(19);
  text(label, x, y - 1);
}

function drawBossMenuButton() {
  bossMenuButton.draw(!busy);
}

function drawCorruptedBearAbility() {
  if (!selectedMainBoss || !currentCorruptedBearAbility) return;
  const x = 710;
  const y = 160;
  const abilityImage = corruptedBearAbilityImages[currentCorruptedBearAbility.id];

  push();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(CREAM);
  noStroke();
  textSize(12);
  text("LAST ATTACK", x, y - 78);
  if (abilityImage) {
    image(abilityImage, x - 44, y - 68, 88, 112);
  }
  fill(GOLD);
  textSize(11);
  text(currentCorruptedBearAbility.name, x, y + 52);
  text("Energy: " + currentCorruptedBearAbility.energyCost, x, y + 68);
  pop();
}

function drawMinibossStatus() {
  if (screenMode !== "battle") return;
  push();
  noStroke();
  fill(CREAM);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(13);
  if (selectedMainBoss) {
    text("Main boss: Corrupted Bear", 20, 52);
    textStyle(NORMAL);
    textSize(12);
    text(currentCorruptedBearAbility
      ? "Last ability: " + currentCorruptedBearAbility.name
      : "Its combat deck contains all ten class abilities.",
    20, 70);
    pop();
    return;
  }

  text("Miniboss: " + selectedMiniboss.name, 20, 52);
  textStyle(NORMAL);
  textSize(12);
  text(selectedMiniboss.description, 20, 70);
  if (minibossStatusMessage) {
    fill(GOLD);
    text(minibossStatusMessage, 20, 88);
  }
  if (stolenCards.length > 0) {
    fill(CREAM);
    text("Cards stolen: " + stolenCards.length, 20, 106);
  }
  pop();
}

// ---------- Mouse ----------

function mousePressed() {
  if (screenMode !== "battle") {
    const back = getMenuBackBounds();
    if (screenMode === "bossTypeMenu") {
      if (isPointInside(mouseX, mouseY, { x: 120, y: 225, w: 350, h: 250 })) {
        screenMode = "minibossMenu";
      } else if (isPointInside(mouseX, mouseY, { x: 530, y: 225, w: 350, h: 250 })) {
        screenMode = "mainBossMenu";
      }
      return;
    }

    if (isPointInside(mouseX, mouseY, back)) {
      screenMode = "bossTypeMenu";
      return;
    }

    if (screenMode === "minibossMenu") {
      const minus = { x: width - 190 - 17, y: 136, w: 34, h: 30 };
      const plus = { x: width - 130 - 17, y: 136, w: 34, h: 30 };
      if (isPointInside(mouseX, mouseY, minus)) {
        minibossSanityThreshold = Math.max(0, Math.round((minibossSanityThreshold - 0.05) * 100) / 100);
        return;
      }
      if (isPointInside(mouseX, mouseY, plus)) {
        minibossSanityThreshold = Math.min(1, Math.round((minibossSanityThreshold + 0.05) * 100) / 100);
        return;
      }
      for (let i = 0; i < MINIBOSS_TYPES.length; i++) {
        if (isPointInside(mouseX, mouseY, getMinibossChoiceBounds(i))) {
          selectedMainBoss = null;
          selectedMiniboss = MINIBOSS_TYPES[i];
          startBattle();
          return;
        }
      }
    } else if (screenMode === "mainBossMenu" &&
        isPointInside(mouseX, mouseY, getMainBossChoiceBounds())) {
      selectedMiniboss = null;
      selectedMainBoss = CORRUPTED_BEAR_CLASS;
      startBattle();
    }
    return;
  }

  if (bossMenuButton.contains(mouseX, mouseY) && !busy) {
    screenMode = "bossTypeMenu";
    selectedCard = null;
    draggedCard = null;
    aimingCard = null;
    return;
  }

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
      if (b.action === "guard") guardPlayer();
      else healPlayer();
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
  if (bossMenuButton.contains(mouseX, mouseY) && !busy) return "hover";

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