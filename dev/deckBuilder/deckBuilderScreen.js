
/**
 * WHIMSY & WOE
 * Bear Deck Builder Screen
 *
 * File: dev/deckBuilder/deckBuilderScreen.js
 *
 * Canvas: 1000 x 650
 * Collection: 5 columns x 3 rows
 *
 * Required files:
 * - classes/bear/bearAbilities.js
 * - classes/bear/bear.js
 * - deckBuilder/energyCards.js
 * - deckBuilder/deckBuilder.js
 */

// =====================================================
// CONFIGURATION
// =====================================================

const DB_WIDTH = 1000;
const DB_HEIGHT = 650;

const DB_BACK_URL = "index.html";
const DB_TEST_ACHIEVEMENTS = [];

const DB_LAYOUT = {
  saved: {
    x: 12,
    y: 86,
    w: 190,
    h: 520
  },

  collection: {
    x: 212,
    y: 86,
    w: 516,
    h: 520
  },

  deck: {
    x: 738,
    y: 86,
    w: 250,
    h: 520
  }
};

/*
 * FIXED CARD GRID
 *
 * Collection panel:
 *   top = 86
 *   bottom = 606
 *
 * Card grid:
 *   first row top = 168
 *   card height = 108
 *   row spacing = 13
 *
 * Row 1: 168 - 276
 * Row 2: 289 - 397
 * Row 3: 410 - 518
 *
 * Footer: approximately 587
 *
 * This leaves 69px between the final
 * card bottom and footer text.
 */

const DB_CARD_LAYOUT = {
  x: 230,
  y: 168,

  w: 82,
  h: 108,

  gapX: 18,
  gapY: 13,

  columns: 5,
  rows: 3
};

const DB_VISIBLE_CARDS = 15;

const DB_PREVIEW = {
  w: 190,
  h: 250,
  infoH: 105,
  delay: 10
};

// =====================================================
// GLOBAL STATE
// =====================================================

let dbDeck = null;

let dbSavedDecks = [];
let dbEquippedDeckId = null;

let dbBackground = null;
let dbImages = {};

let dbTab = "combat";

let dbCollectionScroll = 0;
let dbListScroll = 0;
let dbSavedScroll = 0;

let dbDirty = false;

let dbMessage = "";
let dbMessageIsError = false;

let dbHoverCard = null;
let dbPreviousHoverId = null;
let dbHoverStartFrame = 0;

let dbCursorParticles = [];
let dbAmbientParticles = [];

// =====================================================
// GENERAL HELPERS
// =====================================================

function dbClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function dbHit(x, y, w, h) {
  return (
    mouseX >= x &&
    mouseX <= x + w &&
    mouseY >= y &&
    mouseY <= y + h
  );
}

function dbSetMessage(message, isError = false) {
  dbMessage = message;
  dbMessageIsError = isError;
}

function dbPanel(x, y, w, h) {
  push();

  stroke("#8262a4");
  strokeWeight(1.5);

  fill(27, 21, 42, 242);

  rect(x, y, w, h, 10);

  pop();
}

function dbText(
  value,
  x,
  y,
  size = 14,
  textColor = "#e8d8f5"
) {
  push();

  noStroke();

  fill(textColor);

  textAlign(LEFT, CENTER);
  textStyle(NORMAL);
  textSize(size);

  text(value, x, y);

  pop();
}

function dbButton(
  label,
  x,
  y,
  w,
  h,
  enabled = true,
  active = false
) {
  const hovered =
    enabled && dbHit(x, y, w, h);

  push();

  stroke(
    active
      ? "#f5d279"
      : enabled
        ? "#9879b5"
        : "#51445c"
  );

  strokeWeight(active ? 2 : 1);

  fill(
    !enabled
      ? "#342d3c"
      : active
        ? "#715123"
        : hovered
          ? "#70528e"
          : "#453552"
  );

  rect(x, y, w, h, 6);

  noStroke();

  fill(
    !enabled
      ? "#8c8195"
      : active
        ? "#ffe09a"
        : "#f5e9ff"
  );

  textAlign(CENTER, CENTER);
  textStyle(active ? BOLD : NORMAL);
  textSize(12);

  text(
    label,
    x + w / 2,
    y + h / 2
  );

  pop();
}

// =====================================================
// CARD DATA
// =====================================================

function dbGetCombatCards() {
  if (
    typeof BEAR_CLASS !== "undefined" &&
    Array.isArray(BEAR_CLASS.abilities)
  ) {
    return BEAR_CLASS.abilities;
  }

  return [];
}

function dbGetEnergyCards() {
  const cards = [];
  const seen = new Set();

  function add(card) {
    if (!card || !card.id || seen.has(card.id)) {
      return;
    }

    seen.add(card.id);
    cards.push(card);
  }

  add(getEnergyCard("basicEnergy"));

  const collections = [
    typeof ENERGY_CARDS !== "undefined"
      ? ENERGY_CARDS
      : null,

    typeof ENERGY_CARD_LIBRARY !== "undefined"
      ? ENERGY_CARD_LIBRARY
      : null
  ];

  for (const collection of collections) {
    if (!collection) continue;

    const values = Array.isArray(collection)
      ? collection
      : Object.values(collection);

    for (const card of values) {
      add(card);
    }
  }

  return cards;
}

function dbCollectionCards() {
  return dbTab === "combat"
    ? dbGetCombatCards()
    : dbGetEnergyCards();
}

function dbGetCard(cardId) {
  return (
    getBearAbility(cardId) ||
    getEnergyCard(cardId)
  );
}

function dbCardDescription(card) {
  if (!card) return "";

  if (typeof card.effect === "string") {
    return card.effect;
  }

  if (typeof card.description === "string") {
    return card.description;
  }

  if (typeof card.energyProvided === "number") {
    return `Provides ${card.energyProvided} Energy.`;
  }

  return "A card from the enchanted forest.";
}

// =====================================================
// IMAGE LOADING
// =====================================================

function preload() {
  dbBackground = loadImage(
    "assets/corrupted-forest-background.png",
    () => {},
    () => {
      dbBackground = null;
    }
  );

  for (const card of dbGetCombatCards()) {
    dbLoadCardImage(card);
  }

  for (const card of dbGetEnergyCards()) {
    dbLoadCardImage(card);
  }
}

function dbLoadCardImage(card) {
  if (!card || !card.id || !card.image) {
    return;
  }

  if (dbImages[card.id]) {
    return;
  }

  dbImages[card.id] = loadImage(
    card.image,
    () => {},
    () => {
      dbImages[card.id] = null;
    }
  );
}

// =====================================================
// SETUP
// =====================================================

function setup() {
  createCanvas(DB_WIDTH, DB_HEIGHT);

  textFont("Georgia");
  noCursor();

  dbInitializeParticles();

  dbSavedDecks = loadSavedDecks();

  if (dbSavedDecks.length > 0) {
    dbDeck = dbClone(dbSavedDecks[0]);
  } else {
    dbDeck = createStarterBearDeck();

    const result = saveDeckToLibrary(
      dbDeck,
      DB_TEST_ACHIEVEMENTS
    );

    if (result.success) {
      dbSavedDecks = loadSavedDecks();
    } else {
      dbDirty = true;
    }
  }

  dbEquippedDeckId = getEquippedDeckId();

  dbEnsureEquippedDeck();

  dbSetMessage(
    "Select a saved deck or edit your current deck."
  );
}

function dbEnsureEquippedDeck() {
  if (dbEquippedDeckId) {
    return;
  }

  const firstValid = dbSavedDecks.find(deck =>
    validateFullDeck(
      deck,
      DB_TEST_ACHIEVEMENTS
    ).valid
  );

  if (!firstValid) {
    return;
  }

  const result = equipSavedDeck(
    firstValid.id,
    DB_TEST_ACHIEVEMENTS
  );

  if (result.success) {
    dbEquippedDeckId = firstValid.id;
  }
}

// =====================================================
// MAIN DRAW
// =====================================================

function draw() {
  dbDrawBackground();

  dbHoverCard = null;

  dbDrawHeader();

  dbDrawSavedDecks();

  dbDrawCollection();

  dbDrawDeckPanel();

  dbDrawFooter();

  if (!dbHoverCard) {
    dbPreviousHoverId = null;
  }

  dbDrawCardPreview();

  dbDrawMagicCursor();
}

// =====================================================
// BACKGROUND
// =====================================================

function dbInitializeParticles() {
  dbAmbientParticles = [];

  for (let i = 0; i < 40; i++) {
    dbAmbientParticles.push({
      x: random(DB_WIDTH),
      y: random(DB_HEIGHT),

      size: random(1, 3),
      speed: random(0.1, 0.45),

      phase: random(TWO_PI),

      golden: random() < 0.3
    });
  }
}

function dbDrawBackground() {
  background(14, 10, 23);

  if (dbBackground && dbBackground.width > 1) {
    tint(255, 110);

    image(
      dbBackground,
      0,
      0,
      DB_WIDTH,
      DB_HEIGHT
    );

    noTint();
  }

  noStroke();

  fill(10, 7, 18, 180);

  rect(0, 0, DB_WIDTH, DB_HEIGHT);

  for (const p of dbAmbientParticles) {
    p.y -= p.speed;

    if (p.y < -5) {
      p.y = DB_HEIGHT + 5;
      p.x = random(DB_WIDTH);
    }

    const alpha =
      70 +
      sin(frameCount * 0.04 + p.phase) * 35;

    if (p.golden) {
      fill(255, 205, 110, alpha);
    } else {
      fill(170, 90, 230, alpha);
    }

    circle(
      p.x +
        sin(frameCount * 0.01 + p.phase) * 5,
      p.y,
      p.size
    );
  }
}

// =====================================================
// HEADER
// =====================================================

function dbDrawHeader() {
  push();

  const ctx = drawingContext;

  ctx.save();

  const gradient = ctx.createLinearGradient(
    0,
    10,
    0,
    53
  );

  gradient.addColorStop(0, "#37194b");
  gradient.addColorStop(0.5, "#a46ec8");
  gradient.addColorStop(1, "#e6bdf4");

  ctx.font = "bold 29px Georgia";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.strokeStyle = "#160d20";
  ctx.lineWidth = 3;

  ctx.strokeText(
    "WHIMSY & WOE",
    DB_WIDTH / 2,
    30
  );

  ctx.fillStyle = gradient;

  ctx.fillText(
    "WHIMSY & WOE",
    DB_WIDTH / 2,
    30
  );

  ctx.restore();

  noStroke();

  fill("#d5b3e9");

  textAlign(CENTER, CENTER);
  textSize(12);

  text(
    "BEAR DECK BUILDER",
    DB_WIDTH / 2,
    61
  );

  pop();

  dbButton(
    "← BACK",
    14,
    19,
    100,
    34
  );
}

// =====================================================
// SAVED DECKS
// =====================================================

function dbVisibleSavedDecks() {
  return dbSavedDecks.slice(
    dbSavedScroll,
    dbSavedScroll + 8
  );
}

function dbDrawSavedDecks() {
  const p = DB_LAYOUT.saved;

  dbPanel(p.x, p.y, p.w, p.h);

  dbText(
    "SAVED DECKS",
    p.x + 12,
    p.y + 23,
    16,
    "#f2dba2"
  );

  dbButton(
    "+ NEW DECK",
    p.x + 10,
    p.y + 43,
    p.w - 20,
    31,
    dbSavedDecks.length <
      DECK_BUILDER_RULES.maxSavedDecks
  );

  const visible = dbVisibleSavedDecks();

  visible.forEach((deck, index) => {
    const x = p.x + 9;
    const y = p.y + 88 + index * 37;

    const w = p.w - 18;
    const h = 32;

    const equipped =
      deck.id === dbEquippedDeckId;

    const viewing =
      deck.id === dbDeck.id;

    const hovered = dbHit(x, y, w, h);

    push();

    stroke(
      equipped
        ? "#f5d279"
        : viewing
          ? "#d5b3fa"
          : "#81699b"
    );

    strokeWeight(
      equipped ? 2.5 : viewing ? 2 : 1
    );

    fill(
      equipped
        ? hovered
          ? "#977139"
          : "#715123"
        : viewing
          ? hovered
            ? "#8867ad"
            : "#72549b"
          : hovered
            ? "#5c476f"
            : "#40334e"
    );

    rect(x, y, w, h, 6);

    noStroke();

    fill(
      equipped
        ? "#ffe09a"
        : "#f4e9ff"
    );

    textAlign(LEFT, CENTER);
    textSize(11);

    textStyle(
      equipped ? BOLD : NORMAL
    );

    const prefix = equipped ? "★ " : "";

    const maxName =
      viewing ? 13 : 18;

    const shortName =
      deck.name.length > maxName
        ? deck.name.slice(0, maxName - 1) + "…"
        : deck.name;

    text(
      prefix + shortName,
      x + 8,
      y + h / 2
    );

    if (viewing) {
      fill("#e8d2ff");

      textAlign(RIGHT, CENTER);
      textSize(9);

      text(
        "VIEW",
        x + w - 6,
        y + h / 2
      );
    }

    pop();
  });

  if (dbSavedDecks.length > 8) {
    dbText(
      "Scroll to see more decks",
      p.x + 12,
      p.y + 395,
      10,
      "#c3b3d3"
    );
  }

  if (dbDirty) {
    dbText(
      "Unsaved changes",
      p.x + 12,
      p.y + 418,
      11,
      "#ffcb84"
    );
  }

  dbButton(
    "RENAME",
    p.x + 10,
    p.y + 435,
    80,
    30
  );

  dbButton(
    "DELETE",
    p.x + 100,
    p.y + 435,
    80,
    30
  );

  dbButton(
    "SAVE",
    p.x + 10,
    p.y + 475,
    80,
    32
  );

  const isEquipped =
    dbDeck.id === dbEquippedDeckId;

  const isSaved = dbSavedDecks.some(
    deck => deck.id === dbDeck.id
  );

  dbButton(
    isEquipped ? "EQUIPPED" : "EQUIP",
    p.x + 100,
    p.y + 475,
    80,
    32,
    !isEquipped && !dbDirty && isSaved,
    isEquipped
  );
}

// =====================================================
// FIXED COLLECTION GRID
// =====================================================

function dbCollectionPosition(index) {
  const localIndex =
    index - dbCollectionScroll;

  const col =
    localIndex % DB_CARD_LAYOUT.columns;

  const row = Math.floor(
    localIndex / DB_CARD_LAYOUT.columns
  );

  return {
    x:
      DB_CARD_LAYOUT.x +
      col *
        (
          DB_CARD_LAYOUT.w +
          DB_CARD_LAYOUT.gapX
        ),

    y:
      DB_CARD_LAYOUT.y +
      row *
        (
          DB_CARD_LAYOUT.h +
          DB_CARD_LAYOUT.gapY
        )
  };
}

function dbDrawCollection() {
  const p = DB_LAYOUT.collection;

  dbPanel(p.x, p.y, p.w, p.h);

  dbText(
    "CARD COLLECTION",
    p.x + 17,
    p.y + 22,
    17,
    "#f2dba2"
  );

  dbButton(
    "COMBAT",
    p.x + 104,
    p.y + 45,
    140,
    32,
    true,
    dbTab === "combat"
  );

  dbButton(
    "ENERGY",
    p.x + 263,
    p.y + 45,
    140,
    32,
    true,
    dbTab === "energy"
  );

  const cards = dbCollectionCards();

  const visible = cards.slice(
    dbCollectionScroll,
    dbCollectionScroll + DB_VISIBLE_CARDS
  );

  /*
   * IMPORTANT:
   *
   * The cards are drawn directly at their
   * calculated positions.
   *
   * No clipping rectangle is used.
   *
   * All 3 rows fit completely inside the
   * panel and above the footer.
   */

  visible.forEach((card, index) => {
    const position = dbCollectionPosition(
      dbCollectionScroll + index
    );

    if (
      dbHit(
        position.x,
        position.y,
        DB_CARD_LAYOUT.w,
        DB_CARD_LAYOUT.h
      )
    ) {
      dbSetHoverCard(card);
    }

    dbDrawCollectionCard(
      card,
      position.x,
      position.y,
      DB_CARD_LAYOUT.w,
      DB_CARD_LAYOUT.h
    );
  });

  dbText(
    "Click a card to add it. Grey cards cannot be added.",
    p.x + 17,
    p.y + p.h - 19,
    11,
    "#c6b6d4"
  );

  if (cards.length > DB_VISIBLE_CARDS) {
    dbText(
      "Scroll for more cards",
      p.x + p.w - 140,
      p.y + 22,
      10,
      "#c6b6d4"
    );
  }
}

// =====================================================
// COLLECTION CARD RENDERING
// =====================================================

function dbDrawCollectionCard(card, x, y, w, h) {
  const copies = countCardCopies(
    dbDeck,
    card.id
  );

  const check = canAddCardToDeck(
    dbDeck,
    card.id,
    DB_TEST_ACHIEVEMENTS
  );

  const unavailable = !check.success;
  const selected = copies > 0;

  const hovered = dbHit(x, y, w, h);

  const img = dbImages[card.id];

  push();

  // Shadow
  noStroke();
  fill(0, 110);

  rect(
    x + 2,
    y + 3,
    w,
    h,
    6
  );

  // Complete card artwork
  if (img && img.width > 1) {
    imageMode(CORNER);

    image(
      img,
      x,
      y,
      w,
      h
    );
  } else {
    const isEnergy =
      getEnergyCard(card.id) != null;

    stroke(
      isEnergy
        ? "#89b7ec"
        : "#9f7ac4"
    );

    strokeWeight(1.5);

    fill(
      isEnergy
        ? "#304b70"
        : "#51405e"
    );

    rect(x, y, w, h, 6);

    noStroke();

    fill(
      isEnergy
        ? "#c7e1ff"
        : "#ead7fa"
    );

    textAlign(CENTER, CENTER);
    textSize(25);

    text(
      isEnergy ? "✦" : "◆",
      x + w / 2,
      y + h * 0.35
    );

    fill("#f4e9ff");
    textSize(10);

    text(
      card.name,
      x + 5,
      y + h * 0.66,
      w - 10,
      h * 0.28
    );
  }

  // Grey unavailable cards
  if (unavailable) {
    noStroke();

    fill(12, 10, 18, 155);

    rect(x, y, w, h, 6);
  }

  // Gold border for cards in deck
  if (selected) {
    const ctx = drawingContext;

    ctx.save();

    ctx.shadowBlur =
      7 + sin(frameCount * 0.07) * 2;

    ctx.shadowColor =
      "rgba(255,195,65,0.75)";

    noFill();

    stroke("#f5d279");
    strokeWeight(2);

    rect(x, y, w, h, 6);

    ctx.restore();

    noStroke();

    fill("#f5d279");

    circle(
      x + 11,
      y + 11,
      17
    );

    fill("#21172d");

    textAlign(CENTER, CENTER);
    textSize(11);

    text(
      "✓",
      x + 11,
      y + 11
    );
  }

  // Copy count
  stroke("#e8c47a");
  strokeWeight(1);

  fill("#201629");

  rect(
    x + w - 30,
    y + 3,
    26,
    17,
    4
  );

  noStroke();

  fill("#ffffff");

  textAlign(CENTER, CENTER);
  textSize(10);

  text(
    `x${copies}`,
    x + w - 17,
    y + 11.5
  );

  // Hover outline
  if (hovered) {
    noFill();

    stroke(
      unavailable
        ? "#ff7777"
        : "#ffffff"
    );

    strokeWeight(1.5);

    rect(x, y, w, h, 6);
  }

  pop();
}

// =====================================================
// CARD HOVER PREVIEW
// =====================================================

function dbSetHoverCard(card) {
  if (!card) return;

  dbHoverCard = card;

  if (dbPreviousHoverId !== card.id) {
    dbPreviousHoverId = card.id;
    dbHoverStartFrame = frameCount;
  }
}

function dbDrawCardPreview() {
  if (!dbHoverCard) {
    return;
  }

  if (
    frameCount - dbHoverStartFrame <
    DB_PREVIEW.delay
  ) {
    return;
  }

  const card = dbHoverCard;

  const w = DB_PREVIEW.w;
  const h = DB_PREVIEW.h;
  const infoH = DB_PREVIEW.infoH;

  let x = mouseX + 22;
  let y = mouseY - 35;

  if (x + w + 12 > DB_WIDTH) {
    x = mouseX - w - 22;
  }

  x = constrain(
    x,
    10,
    DB_WIDTH - w - 10
  );

  y = constrain(
    y,
    10,
    DB_HEIGHT - h - infoH - 10
  );

  const img = dbImages[card.id];

  push();

  const ctx = drawingContext;

  ctx.save();

  ctx.shadowBlur = 20;
  ctx.shadowColor =
    "rgba(255,195,70,0.75)";

  stroke("#f4cc72");
  strokeWeight(2.5);

  fill("#21172f");

  rect(
    x - 5,
    y - 5,
    w + 10,
    h + infoH + 10,
    9
  );

  ctx.restore();

  if (img && img.width > 1) {
    imageMode(CORNER);

    image(
      img,
      x,
      y,
      w,
      h
    );
  } else {
    noStroke();

    fill("#4e3b63");

    rect(
      x,
      y,
      w,
      h,
      7
    );

    fill("#e9d2ff");

    textAlign(CENTER, CENTER);
    textSize(55);

    text(
      "✦",
      x + w / 2,
      y + h / 2
    );
  }

  noStroke();

  fill("#17101f");

  rect(
    x,
    y + h,
    w,
    infoH,
    0,
    0,
    7,
    7
  );

  fill("#f4d99c");

  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(16);

  text(
    card.name,
    x + 8,
    y + h + 9,
    w - 16
  );

  fill("#e8d9f1");

  textStyle(NORMAL);
  textSize(12);

  text(
    dbCardDescription(card),
    x + 10,
    y + h + 35,
    w - 20,
    65
  );

  pop();
}

// =====================================================
// DECK CARD ENTRIES
// =====================================================

function dbDeckEntries() {
  const counts = {};

  for (const id of dbDeck.cards) {
    counts[id] =
      (counts[id] || 0) + 1;
  }

  const combat = [];
  const energy = [];

  for (
    const [id, count] of Object.entries(counts)
  ) {
    const ability = getBearAbility(id);
    const energyCard = getEnergyCard(id);

    if (ability) {
      combat.push({
        id,
        name: ability.name,
        count,
        type: "combat"
      });
    } else if (energyCard) {
      energy.push({
        id,
        name: energyCard.name,
        count,
        type: "energy"
      });
    }
  }

  return [
    {
      type: "heading",
      name: "COMBAT"
    },
    ...combat,
    {
      type: "heading",
      name: "ENERGY"
    },
    ...energy
  ];
}

// =====================================================
// CURRENT DECK PANEL
// =====================================================

function dbDrawDeckPanel() {
  const p = DB_LAYOUT.deck;

  dbPanel(p.x, p.y, p.w, p.h);

  const equipped =
    dbDeck.id === dbEquippedDeckId;

  const validation = validateFullDeck(
    dbDeck,
    DB_TEST_ACHIEVEMENTS
  );

  const counts =
    getDeckCategoryCounts(dbDeck);

  push();

  fill("#f2dba2");

  noStroke();

  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(16);

  text(
    dbDeck.name,
    p.x + 12,
    p.y + 24,
    p.w - 24
  );

  pop();

  dbText(
    equipped
      ? "★ EQUIPPED DECK"
      : "VIEWING / EDITING",
    p.x + 12,
    p.y + 49,
    11,
    equipped
      ? "#ffe09a"
      : "#d5b3fa"
  );

  dbText(
    `${dbDeck.cards.length}/40 CARDS`,
    p.x + 12,
    p.y + 78,
    15,
    validation.valid
      ? "#94e3a8"
      : "#ffca83"
  );

  dbText(
    `${counts.combat} Combat · ${counts.energy} Energy`,
    p.x + 12,
    p.y + 101,
    12,
    "#d3c4df"
  );

  noStroke();

  fill("#3a3148");

  rect(
    p.x + 12,
    p.y + 119,
    p.w - 24,
    8,
    4
  );

  fill(
    validation.valid
      ? "#79c08d"
      : "#a382ce"
  );

  rect(
    p.x + 12,
    p.y + 119,
    (p.w - 24) *
      Math.min(
        1,
        dbDeck.cards.length / 40
      ),
    8,
    4
  );

  const entries = dbDeckEntries();

  const listX = p.x + 10;
  const listY = p.y + 143;

  const rowH = 25;
  const visibleRows = 12;

  dbListScroll = constrain(
    dbListScroll,
    0,
    Math.max(
      0,
      entries.length - visibleRows
    )
  );

  for (let i = 0; i < visibleRows; i++) {
    const entry =
      entries[i + dbListScroll];

    if (!entry) {
      break;
    }

    const y = listY + i * rowH;

    if (entry.type === "heading") {
      dbText(
        entry.name,
        listX + 5,
        y + 11,
        12,
        "#f2dba2"
      );

      continue;
    }

    const hovered = dbHit(
      listX,
      y,
      p.w - 20,
      rowH - 2
    );

    if (hovered) {
      dbSetHoverCard(
        dbGetCard(entry.id)
      );
    }

    noStroke();

    fill(
      hovered
        ? "#5b4772"
        : i % 2 === 0
          ? "#30273e"
          : "#3a2e48"
    );

    rect(
      listX,
      y,
      p.w - 20,
      rowH - 2,
      4
    );

    dbText(
      entry.name,
      listX + 7,
      y + 11,
      12
    );

    dbText(
      `x${entry.count}`,
      listX + p.w - 69,
      y + 11,
      12,
      "#f5d279"
    );

    dbText(
      "−",
      listX + p.w - 39,
      y + 11,
      17,
      "#ffaaaa"
    );
  }

  const bottom = p.y + p.h;

  if (validation.valid) {
    dbText(
      "✓ DECK READY",
      p.x + 12,
      bottom - 56,
      13,
      "#94e3a8"
    );
  } else {
    push();

    fill("#ff8888");

    noStroke();

    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(11);

    text(
      validation.errors[0] ||
        "Incomplete deck",
      p.x + 12,
      bottom - 76,
      p.w - 24,
      45
    );

    pop();
  }

  dbText(
    "Click a card above to remove one.",
    p.x + 12,
    bottom - 17,
    10,
    "#c6b8d4"
  );
}

// =====================================================
// FOOTER
// =====================================================

function dbDrawFooter() {
  push();

  noStroke();

  fill(
    dbMessageIsError
      ? "#ff7777"
      : "#e6c98e"
  );

  textAlign(CENTER, CENTER);

  textStyle(
    dbMessageIsError
      ? BOLD
      : NORMAL
  );

  textSize(
    dbMessageIsError
      ? 14
      : 12
  );

  text(
    dbMessage,
    DB_WIDTH / 2,
    630,
    DB_WIDTH - 40
  );

  pop();
}

// =====================================================
// SAVED DECK ACTIONS
// =====================================================

function dbConfirmDiscard() {
  if (!dbDirty) {
    return true;
  }

  return confirm(
    "Discard unsaved deck changes?"
  );
}

function dbLoadSavedDeck(deck) {
  if (dbDeck.id === deck.id) {
    return;
  }

  if (!dbConfirmDiscard()) {
    return;
  }

  dbDeck = dbClone(deck);

  dbDirty = false;

  dbListScroll = 0;
  dbCollectionScroll = 0;

  dbSetMessage(
    `Loaded "${dbDeck.name}".`
  );
}

function dbNewDeck() {
  if (
    dbSavedDecks.length >=
    DECK_BUILDER_RULES.maxSavedDecks
  ) {
    dbSetMessage(
      "Maximum 10 saved decks.",
      true
    );

    return;
  }

  if (!dbConfirmDiscard()) {
    return;
  }

  const name = prompt(
    "Name your new deck:",
    "New Bear Deck"
  );

  if (name === null) {
    return;
  }

  dbDeck = createStarterBearDeck();

  dbDeck.name =
    name.trim().slice(0, 28) ||
    "New Bear Deck";

  dbDirty = true;

  dbListScroll = 0;
  dbCollectionScroll = 0;

  dbSetMessage(
    "New starter deck created. Save when ready."
  );
}

function dbRenameCurrentDeck() {
  const name = prompt(
    "Rename deck:",
    dbDeck.name
  );

  if (
    name === null ||
    !name.trim()
  ) {
    return;
  }

  dbDeck.name =
    name.trim().slice(0, 28);

  dbDirty = true;

  dbSetMessage(
    "Deck renamed. Click Save to keep it."
  );
}

function dbSaveCurrentDeck() {
  const result = saveDeckToLibrary(
    dbDeck,
    DB_TEST_ACHIEVEMENTS
  );

  if (result.success) {
    dbSavedDecks = loadSavedDecks();

    dbDirty = false;

    dbSetMessage(
      `"${dbDeck.name}" saved successfully!`
    );
  } else {
    dbSetMessage(
      result.errors[0] ||
        "Could not save deck.",
      true
    );
  }
}

function dbEquipCurrentDeck() {
  if (dbDirty) {
    dbSetMessage(
      "Save changes before equipping.",
      true
    );

    return;
  }

  if (
    dbDeck.id === dbEquippedDeckId
  ) {
    dbSetMessage(
      "This deck is already equipped."
    );

    return;
  }

  const result = equipSavedDeck(
    dbDeck.id,
    DB_TEST_ACHIEVEMENTS
  );

  if (result.success) {
    dbEquippedDeckId = dbDeck.id;
  }

  dbSetMessage(
    result.message,
    !result.success
  );
}

function dbDeleteCurrentDeck() {
  if (
    !confirm(
      `Delete "${dbDeck.name}"?`
    )
  ) {
    return;
  }

  const wasSaved = dbSavedDecks.some(
    deck => deck.id === dbDeck.id
  );

  if (wasSaved) {
    if (!deleteSavedDeck(dbDeck.id)) {
      dbSetMessage(
        "Could not delete deck.",
        true
      );

      return;
    }
  }

  dbSavedDecks = loadSavedDecks();

  dbEquippedDeckId =
    getEquippedDeckId();

  if (dbSavedDecks.length > 0) {
    dbDeck = dbClone(
      dbSavedDecks[0]
    );

    dbDirty = false;
  } else {
    dbDeck = createStarterBearDeck();

    dbDirty = true;
  }

  dbEnsureEquippedDeck();

  dbListScroll = 0;
  dbSavedScroll = 0;

  dbSetMessage(
    "Deck deleted."
  );
}

// =====================================================
// MOUSE CLICKS
// =====================================================

function mousePressed() {
  const saved = DB_LAYOUT.saved;
  const collection = DB_LAYOUT.collection;
  const deck = DB_LAYOUT.deck;

  // BACK
  if (
    dbHit(14, 19, 100, 34)
  ) {
    if (!dbConfirmDiscard()) {
      return false;
    }

    window.location.href =
      DB_BACK_URL;

    return false;
  }

  // NEW DECK
  if (
    dbHit(
      saved.x + 10,
      saved.y + 43,
      saved.w - 20,
      31
    )
  ) {
    if (
      dbSavedDecks.length <
      DECK_BUILDER_RULES.maxSavedDecks
    ) {
      dbNewDeck();
    }

    return false;
  }

  // LOAD SAVED DECK
  const visibleSaved =
    dbVisibleSavedDecks();

  for (
    let i = 0;
    i < visibleSaved.length;
    i++
  ) {
    const x = saved.x + 9;
    const y =
      saved.y + 88 + i * 37;

    if (
      dbHit(
        x,
        y,
        saved.w - 18,
        32
      )
    ) {
      dbLoadSavedDeck(
        visibleSaved[i]
      );

      return false;
    }
  }

  // RENAME
  if (
    dbHit(
      saved.x + 10,
      saved.y + 435,
      80,
      30
    )
  ) {
    dbRenameCurrentDeck();
    return false;
  }

  // DELETE
  if (
    dbHit(
      saved.x + 100,
      saved.y + 435,
      80,
      30
    )
  ) {
    dbDeleteCurrentDeck();
    return false;
  }

  // SAVE
  if (
    dbHit(
      saved.x + 10,
      saved.y + 475,
      80,
      32
    )
  ) {
    dbSaveCurrentDeck();
    return false;
  }

  // EQUIP
  if (
    dbHit(
      saved.x + 100,
      saved.y + 475,
      80,
      32
    )
  ) {
    if (
      dbDeck.id !== dbEquippedDeckId
    ) {
      dbEquipCurrentDeck();
    }

    return false;
  }

  // COMBAT TAB
  if (
    dbHit(
      collection.x + 104,
      collection.y + 45,
      140,
      32
    )
  ) {
    dbTab = "combat";
    dbCollectionScroll = 0;

    return false;
  }

  // ENERGY TAB
  if (
    dbHit(
      collection.x + 263,
      collection.y + 45,
      140,
      32
    )
  ) {
    dbTab = "energy";
    dbCollectionScroll = 0;

    return false;
  }

  // ADD CARD
  const cards = dbCollectionCards();

  const visibleCards = cards.slice(
    dbCollectionScroll,
    dbCollectionScroll + DB_VISIBLE_CARDS
  );

  for (
    let i = 0;
    i < visibleCards.length;
    i++
  ) {
    const card = visibleCards[i];

    const position = dbCollectionPosition(
      dbCollectionScroll + i
    );

    if (
      dbHit(
        position.x,
        position.y,
        DB_CARD_LAYOUT.w,
        DB_CARD_LAYOUT.h
      )
    ) {
      const result = addCardToDeck(
        dbDeck,
        card.id,
        DB_TEST_ACHIEVEMENTS
      );

      if (result.success) {
        dbDirty = true;
      }

      dbSetMessage(
        result.message,
        !result.success
      );

      return false;
    }
  }

  // REMOVE CARD
  const entries = dbDeckEntries();

  const listX = deck.x + 10;
  const listY = deck.y + 143;

  for (let i = 0; i < 12; i++) {
    const entry =
      entries[i + dbListScroll];

    if (
      !entry ||
      entry.type === "heading"
    ) {
      continue;
    }

    if (
      dbHit(
        listX,
        listY + i * 25,
        deck.w - 20,
        23
      )
    ) {
      if (
        removeCardFromDeck(
          dbDeck,
          entry.id
        )
      ) {
        dbDirty = true;

        dbSetMessage(
          `${entry.name} removed.`
        );
      }

      return false;
    }
  }

  return false;
}

// =====================================================
// MOUSE WHEEL SCROLLING
// =====================================================

function mouseWheel(event) {
  const saved = DB_LAYOUT.saved;
  const collection =
    DB_LAYOUT.collection;
  const deck = DB_LAYOUT.deck;

  const direction =
    event.delta > 0 ? 1 : -1;

  // SAVED DECK SCROLL
  if (
    dbHit(
      saved.x,
      saved.y + 80,
      saved.w,
      315
    )
  ) {
    dbSavedScroll = constrain(
      dbSavedScroll + direction,
      0,
      Math.max(
        0,
        dbSavedDecks.length - 8
      )
    );

    return false;
  }

  // COLLECTION SCROLL
  if (
    dbHit(
      collection.x,
      collection.y + 82,
      collection.w,
      415
    )
  ) {
    const count =
      dbCollectionCards().length;

    const maxScroll = Math.max(
      0,
      Math.ceil(
        (count - DB_VISIBLE_CARDS) /
        DB_CARD_LAYOUT.columns
      ) * DB_CARD_LAYOUT.columns
    );

    dbCollectionScroll = constrain(
      dbCollectionScroll +
        direction * DB_CARD_LAYOUT.columns,
      0,
      maxScroll
    );

    return false;
  }

  // CURRENT DECK SCROLL
  if (
    dbHit(
      deck.x,
      deck.y + 140,
      deck.w,
      310
    )
  ) {
    const count =
      dbDeckEntries().length;

    dbListScroll = constrain(
      dbListScroll + direction,
      0,
      Math.max(
        0,
        count - 12
      )
    );

    return false;
  }
}

// =====================================================
// GOLDEN MAGIC CURSOR
// =====================================================

function dbDrawMagicCursor() {
  const x = mouseX;
  const y = mouseY;

  if (
    x < 0 ||
    x > DB_WIDTH ||
    y < 0 ||
    y > DB_HEIGHT
  ) {
    dbCursorParticles = [];
    return;
  }

  const moving =
    abs(mouseX - pmouseX) +
    abs(mouseY - pmouseY) > 1;

  if (
    moving &&
    frameCount % 2 === 0 &&
    dbCursorParticles.length < 25
  ) {
    dbCursorParticles.push({
      x: x + random(-4, 4),
      y: y + random(-4, 4),

      vx: random(-0.5, 0.5),
      vy: random(-1.1, -0.2),

      size: random(1.5, 3.5),
      life: 110
    });
  }

  push();
  noStroke();

  for (
    let i = dbCursorParticles.length - 1;
    i >= 0;
    i--
  ) {
    const p = dbCursorParticles[i];

    fill(
      255,
      205,
      110,
      p.life * 0.4
    );

    circle(
      p.x,
      p.y,
      p.size * 3
    );

    fill(
      255,
      240,
      175,
      p.life * 1.5
    );

    circle(
      p.x,
      p.y,
      p.size
    );

    p.x += p.vx;
    p.y += p.vy;

    p.life -= 4;

    if (p.life <= 0) {
      dbCursorParticles.splice(
        i,
        1
      );
    }
  }

  const ctx = drawingContext;

  ctx.save();

  ctx.shadowBlur = 18;

  ctx.shadowColor =
    "rgba(255,190,55,0.9)";

  fill(255, 205, 90, 50);
  circle(x, y, 28);

  fill(255, 225, 140, 110);
  circle(x, y, 18);

  fill(255, 240, 175);
  circle(x, y, 9);

  fill(255, 255, 240);
  circle(x, y, 3);

  ctx.restore();

  pop();
}

// =====================================================
// PREVENT RIGHT CLICK MENU ON CANVAS
// =====================================================

document.addEventListener(
  "contextmenu",
  event => {
    if (
      event.target &&
      event.target.tagName === "CANVAS"
    ) {
      event.preventDefault();
    }
  }
);
