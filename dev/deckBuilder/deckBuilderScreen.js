
/**
 * Whimsy & Woe - Deck Builder Screen
 *
 * Features:
 * - Saved deck management
 * - Combat and Energy collections
 * - Animated corrupted achievement locks
 * - Class origin emblems
 * - Numbered collection pages
 * - Magical book-page turning animation
 * - Card previews and golden cursor
 *
 * Canvas: 1000 x 650
 */

// =====================================================
// CONFIGURATION
// =====================================================

const DB_WIDTH = 1000;
const DB_HEIGHT = 650;

const DB_TEST_ACHIEVEMENTS = [];

const DB_LAYOUT = {
  saved: {
    x: 12, y: 86, w: 190, h: 520
  },
  collection: {
    x: 212, y: 86, w: 516, h: 520
  },
  deck: {
    x: 738, y: 86, w: 250, h: 520
  }
};

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

const DB_PAGE_TURN_FRAMES = 28;

const DB_PREVIEW = {
  w: 190,
  h: 250,
  infoH: 105,
  delay: 10
};

// =====================================================
// STATE
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

let dbPageTurn = null;

let dbDirty = false;
let dbMessage = "";
let dbMessageIsError = false;

let dbHoverCard = null;
let dbPreviousHoverId = null;
let dbHoverStartFrame = 0;

// Custom leave-deck-builder confirmation.
let dbExitModalOpen = false;

let dbCursorParticles = [];
let dbAmbientParticles = [];

// =====================================================
// NEW DECK NAMING WINDOW
// =====================================================

let dbNamingModalOpen = false;
let dbNewDeckName = "";
let dbNamingError = "";
let dbNamingDefaultSelected = false;

// Additional custom deck management dialogs.
let dbRenameModalOpen = false;
let dbRenameDeckName = "";
let dbRenameDefaultSelected = false;
let dbRenameError = "";
let dbDeleteModalOpen = false;
let dbDeleteHoldStartedAt = null;
const DB_DELETE_HOLD_MS = 1600;



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
    active ? "#f5d279" :
    enabled ? "#9879b5" :
    "#51445c"
  );

  strokeWeight(active ? 2 : 1);

  fill(
    !enabled ? "#342d3c" :
    active ? "#715123" :
    hovered ? "#70528e" :
    "#453552"
  );

  rect(x, y, w, h, 6);

  noStroke();

  fill(
    !enabled ? "#8c8195" :
    active ? "#ffe09a" :
    "#f5e9ff"
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
// CLASS ORIGIN EMBLEMS
// =====================================================

const DB_CLASS_ORIGINS = {
  bear: {
    symbol: "B",
    name: "Bear",
    color: "#d5a66a"
  },

  bunny: {
    symbol: "R",
    name: "Bunny",
    color: "#a2e5a5"
  },

  owl: {
    symbol: "O",
    name: "Owl",
    color: "#8dc6ff"
  },

  wolf: {
    symbol: "W",
    name: "Wolf",
    color: "#c49aff"
  }
};

function dbCardOrigin(card) {
  if (!card || !card.achievementId) {
    return null;
  }

  const originId =
    card.achievementId.split("_")[0];

  return DB_CLASS_ORIGINS[originId] || null;
}

function dbDrawOriginEmblem(card, x, y, w) {
  const origin = dbCardOrigin(card);

  if (!origin) return;

  push();

  const cx = x + w - 11;
  const cy = y + 11;

  const pulse =
    sin(frameCount * 0.045) * 2;

  drawingContext.shadowBlur =
    7 + pulse;

  drawingContext.shadowColor =
    origin.color;

  stroke(origin.color);
  strokeWeight(1.5);

  fill("#21152e");

  circle(cx, cy, 20);

  drawingContext.shadowBlur = 0;

  noStroke();
  fill(origin.color);

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(11);

  text(origin.symbol, cx, cy);

  pop();
}

// =====================================================
// COLLECTION PAGINATION
// =====================================================

function dbPageCount() {
  return Math.max(
    1,
    Math.ceil(
      dbCollectionCards().length /
      DB_VISIBLE_CARDS
    )
  );
}

function dbCurrentPage() {
  return Math.floor(
    dbCollectionScroll / DB_VISIBLE_CARDS
  );
}

function dbPageButtonLayout() {
  const p = DB_LAYOUT.collection;

  const total = dbPageCount();

  const buttonW = 30;
  const gap = 5;
  const arrowW = 36;

  const totalW =
    arrowW * 2 +
    total * buttonW +
    (total + 1) * gap;

  const startX =
    p.x + (p.w - totalW) / 2;

  const y = p.y + p.h - 42;

  return {
    startX,
    y,
    buttonW,
    arrowW,
    gap,
    total
  };
}

function dbChangePage(nextPage) {
  if (dbPageTurn) return;

  const target = constrain(
    nextPage,
    0,
    dbPageCount() - 1
  );

  const current = dbCurrentPage();

  if (target === current) return;

  dbPageTurn = {
    from: current,
    to: target,
    started: frameCount,
    switched: false
  };

  dbHoverCard = null;
  dbPreviousHoverId = null;
}

function dbDrawPageControls() {
  const layout = dbPageButtonLayout();

  const current = dbCurrentPage();
  const total = layout.total;

  let x = layout.startX;

  dbButton(
    "◀",
    x,
    layout.y,
    layout.arrowW,
    26,
    current > 0 && !dbPageTurn
  );

  x += layout.arrowW + layout.gap;

  for (let i = 0; i < total; i++) {
    dbButton(
      String(i + 1),
      x,
      layout.y,
      layout.buttonW,
      26,
      !dbPageTurn,
      i === current
    );

    x += layout.buttonW + layout.gap;
  }

  dbButton(
    "▶",
    x,
    layout.y,
    layout.arrowW,
    26,
    current < total - 1 && !dbPageTurn
  );
}

function dbHandlePageButtonClick() {
  const layout = dbPageButtonLayout();

  let x = layout.startX;

  if (dbHit(
    x,
    layout.y,
    layout.arrowW,
    26
  )) {
    dbChangePage(dbCurrentPage() - 1);
    return true;
  }

  x += layout.arrowW + layout.gap;

  for (let i = 0; i < layout.total; i++) {
    if (dbHit(
      x,
      layout.y,
      layout.buttonW,
      26
    )) {
      dbChangePage(i);
      return true;
    }

    x += layout.buttonW + layout.gap;
  }

  if (dbHit(
    x,
    layout.y,
    layout.arrowW,
    26
  )) {
    dbChangePage(dbCurrentPage() + 1);
    return true;
  }

  return false;
}

// =====================================================
// MAGICAL BOOK PAGE ANIMATION
// =====================================================

function dbPageTurnProgress() {
  if (!dbPageTurn) return 0;

  return constrain(
    (frameCount - dbPageTurn.started) /
      DB_PAGE_TURN_FRAMES,
    0,
    1
  );
}

function dbPageTurnEase(value) {
  return value * value *
    (3 - 2 * value);
}

function dbDrawPageTurn() {
  if (!dbPageTurn) return;

  const rawProgress =
    dbPageTurnProgress();

  const progress =
    dbPageTurnEase(rawProgress);

  const p = DB_LAYOUT.collection;

  const x = p.x + 12;
  const y = DB_CARD_LAYOUT.y - 4;

  const w = p.w - 24;
  const h = 365;

  const fold =
    sin(progress * PI);

  const direction =
    dbPageTurn.to > dbPageTurn.from
      ? 1
      : -1;

  push();

  // Dark magical shadow.
  noStroke();

  fill(
    9,
    4,
    17,
    fold * 220
  );

  rect(x, y, w, h, 5);

  // A parchment-colored edge moves across
  // the collection like a turning book page.
  const foldX = direction > 0
    ? x + w * (1 - progress)
    : x + w * progress;

  const edgeWidth =
    8 + fold * 24;

  drawingContext.shadowBlur =
    15 + fold * 20;

  drawingContext.shadowColor =
    "rgba(192, 110, 255, 0.9)";

  noStroke();

  fill(
    224,
    187,
    135,
    fold * 190
  );

  rect(
    foldX - edgeWidth / 2,
    y,
    edgeWidth,
    h,
    3
  );

  // Violet magical line along the fold.
  stroke(
    207,
    148,
    255,
    fold * 255
  );

  strokeWeight(
    2 + fold * 4
  );

  line(
    foldX,
    y,
    foldX,
    y + h
  );

  drawingContext.shadowBlur = 0;

  // Magical particles around the page edge.
  noStroke();

  for (let i = 0; i < 18; i++) {
    const particleY =
      y + ((i * 47 + frameCount * 2) % h);

    const offset =
      sin(frameCount * 0.09 + i) *
      (7 + fold * 15);

    fill(
      202,
      125,
      255,
      fold * (90 + i % 3 * 35)
    );

    circle(
      foldX + offset,
      particleY,
      2 + (i % 3)
    );
  }

  // Flash as the page changes.
  if (fold > 0.85) {
    fill(
      165,
      83,
      225,
      (fold - 0.85) * 370
    );

    rect(x, y, w, h, 5);
  }

  pop();

  // Change the displayed cards halfway
  // through the page-turn animation.
  if (
    rawProgress >= 0.5 &&
    !dbPageTurn.switched
  ) {
    dbCollectionScroll =
      dbPageTurn.to * DB_VISIBLE_CARDS;

    dbPageTurn.switched = true;
  }

  if (rawProgress >= 1) {
    dbPageTurn = null;
  }
}

// =====================================================
// PRELOAD
// =====================================================

function dbPreload() {
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

  if (dbImages[card.id]) return;

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


function dbSetup() {

  textFont("Georgia");

  // Initialize the deck builder's visual effects.
  dbInitializeParticles();

  dbExitModalOpen = false;
  dbNamingModalOpen = false;
  dbRenameModalOpen = false;
  dbDeleteModalOpen = false;
  dbDeleteHoldStartedAt = null;

  // Always start with a clean editing state.
  dbDirty = false;

  // Load decks belonging to the selected profile.
  dbSavedDecks = loadSavedDecks();

  // ================================================
  // EXISTING PROFILE DECKS
  // ================================================

  if (dbSavedDecks.length > 0) {

    // Load the first saved deck.
    dbDeck = dbClone(dbSavedDecks[0]);

    // Nothing has been edited yet.
    dbDirty = false;

  } else {

    // ================================================
    // NEW PROFILE: CREATE STARTER DECK
    // ================================================

    dbDeck = createStarterBearDeck();

    // Automatically save the starter deck
    // to the selected profile's storage.
    const result = saveDeckToLibrary(
      dbDeck,
      DB_TEST_ACHIEVEMENTS
    );

    if (result.success) {

      // Refresh the saved deck collection.
      dbSavedDecks = loadSavedDecks();

      // The starter deck is already saved.
      dbDirty = false;

      dbSetMessage(
        "Forest Guardian starter deck created and saved!"
      );

    } else {

      // Only mark unsaved if saving actually failed.
      dbDirty = true;

      dbSetMessage(
        result.errors?.[0] ||
          "Unable to save starter deck.",
        true
      );
    }
  }

  // ================================================
  // EQUIPPED DECK
  // ================================================

  // Retrieve this profile's equipped deck.
  dbEquippedDeckId = getEquippedDeckId();

  // If none is equipped, equip the first valid deck.
  dbEnsureEquippedDeck();

  // Confirm that the current deck is saved.
  if (!dbDirty) {
    dbSetMessage(
      "Your deck is saved and ready for adventure!"
    );
  }

  // Reset any temporary interface state.
  dbListScroll = 0;
  dbCollectionScroll = 0;
  dbPageTurn = null;
  dbHoverCard = null;
  dbPreviousHoverId = null;
}


function dbEnsureEquippedDeck() {
  if (dbEquippedDeckId) return;

  const firstValid = dbSavedDecks.find(
    deck =>
      validateFullDeck(
        deck,
        DB_TEST_ACHIEVEMENTS
      ).valid
  );

  if (!firstValid) return;

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

function dbDraw() {
  noCursor();

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

  if (!dbPageTurn) {
    dbDrawCardPreview();
  }

  dbDrawExitModal();
  dbDrawNamingModal();
  dbDrawRenameModal();
  dbDrawDeleteModal();
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

  if (
    dbBackground &&
    dbBackground.width > 1
  ) {
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

  rect(
    0,
    0,
    DB_WIDTH,
    DB_HEIGHT
  );

  for (const p of dbAmbientParticles) {
    p.y -= p.speed;

    if (p.y < -5) {
      p.y = DB_HEIGHT + 5;
      p.x = random(DB_WIDTH);
    }

    const alpha =
      70 +
      sin(
        frameCount * 0.04 +
        p.phase
      ) * 35;

    if (p.golden) {
      fill(255, 205, 110, alpha);
    } else {
      fill(170, 90, 230, alpha);
    }

    circle(
      p.x +
        sin(
          frameCount * 0.01 +
          p.phase
        ) * 5,
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

  const gradient =
    ctx.createLinearGradient(
      0,
      10,
      0,
      53
    );

  gradient.addColorStop(
    0,
    "#37194b"
  );

  gradient.addColorStop(
    0.5,
    "#a46ec8"
  );

  gradient.addColorStop(
    1,
    "#e6bdf4"
  );

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

  dbPanel(
    p.x,
    p.y,
    p.w,
    p.h
  );

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

  const visible =
    dbVisibleSavedDecks();

  visible.forEach((deck, index) => {
    const x = p.x + 9;
    const y = p.y + 88 + index * 37;

    const w = p.w - 18;
    const h = 32;

    const equipped =
      deck.id === dbEquippedDeckId;

    const viewing =
      deck.id === dbDeck.id;

    const hovered =
      dbHit(x, y, w, h);

    push();

    stroke(
      equipped ? "#f5d279" :
      viewing ? "#d5b3fa" :
      "#81699b"
    );

    strokeWeight(
      equipped ? 2.5 :
      viewing ? 2 : 1
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

    const prefix =
      equipped ? "★ " : "";

    const maxName =
      viewing ? 13 : 18;

    const shortName =
      deck.name.length > maxName
        ? deck.name.slice(
            0,
            maxName - 1
          ) + "…"
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

  const isSaved =
    dbSavedDecks.some(
      deck => deck.id === dbDeck.id
    );

  dbButton(
    isEquipped ? "EQUIPPED" : "EQUIP",
    p.x + 100,
    p.y + 475,
    80,
    32,
    !isEquipped &&
      !dbDirty &&
      isSaved,
    isEquipped
  );
}

// =====================================================
// CARD COLLECTION
// =====================================================

function dbCollectionPosition(index) {
  const localIndex =
    index - dbCollectionScroll;

  const col =
    localIndex %
    DB_CARD_LAYOUT.columns;

  const row =
    Math.floor(
      localIndex /
      DB_CARD_LAYOUT.columns
    );

  return {
    x:
      DB_CARD_LAYOUT.x +
      col * (
        DB_CARD_LAYOUT.w +
        DB_CARD_LAYOUT.gapX
      ),

    y:
      DB_CARD_LAYOUT.y +
      row * (
        DB_CARD_LAYOUT.h +
        DB_CARD_LAYOUT.gapY
      )
  };
}

function dbDrawCollection() {
  const p = DB_LAYOUT.collection;

  dbPanel(
    p.x,
    p.y,
    p.w,
    p.h
  );

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

  const cards =
    dbCollectionCards();

  const visible =
    cards.slice(
      dbCollectionScroll,
      dbCollectionScroll +
        DB_VISIBLE_CARDS
    );

  visible.forEach((card, index) => {
    const position =
      dbCollectionPosition(
        dbCollectionScroll + index
      );

    if (
      !dbPageTurn &&
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

  // Page-turn overlay is drawn over the cards,
  // while navigation remains visible below.
  dbDrawPageTurn();

  dbDrawPageControls();

  dbText(
    "Turn the page to discover more cards.",
    p.x + 17,
    p.y + p.h - 11,
    10,
    "#c6b6d4"
  );
}

// =====================================================
// ACHIEVEMENT LOCK CHECKS
// =====================================================

function dbIsCardLocked(card) {
  if (!card) return true;

  const ability =
    getBearAbility(card.id);

  if (ability) {
    return !isBearAbilityUnlocked(
      card.id,
      DB_TEST_ACHIEVEMENTS
    );
  }

  const energy =
    getEnergyCard(card.id);

  if (energy) {
    return !(
      energy.unlockedByDefault ||
      DB_TEST_ACHIEVEMENTS.includes(
        energy.achievementId
      )
    );
  }

  return true;
}

function dbAchievementRequirement(card) {
  if (!card || !card.achievementId) {
    return (
      "Complete the required achievement " +
      "to unlock this card."
    );
  }

  const origin = dbCardOrigin(card);

  const className =
    origin ? origin.name : "Unknown";

  return (
    `${className} achievement required: ` +
    `${card.achievementId}`
  );
}

// =====================================================
// ANIMATED CORRUPTED CHAINS
// =====================================================

function dbDrawCorruptedChain(
  x1,
  y1,
  x2,
  y2,
  phase
) {
  const links = 11;

  const angle =
    atan2(
      y2 - y1,
      x2 - x1
    );

  const length =
    dist(
      x1,
      y1,
      x2,
      y2
    );

  const step =
    length / links;

  push();

  translate(x1, y1);
  rotate(angle);

  for (let i = 0; i < links; i++) {
    const t =
      frameCount * 0.045 +
      phase +
      i * 0.4;

    const offset =
      sin(t) * 1.5;

    const px =
      i * step + step / 2;

    const py = offset;

    const glow =
      110 + sin(t) * 65;

    drawingContext.shadowBlur =
      8 + sin(t) * 3;

    drawingContext.shadowColor =
      `rgba(172,63,255,${glow / 255})`;

    stroke(43, 18, 57, 240);
    strokeWeight(4);
    noFill();

    ellipse(
      px,
      py,
      step * 1.1,
      8
    );

    stroke(
      185,
      89,
      245,
      glow
    );

    strokeWeight(1.3);

    ellipse(
      px,
      py,
      step * 1.1,
      8
    );
  }

  drawingContext.shadowBlur = 0;

  pop();
}

function dbDrawCorruptedLock(x, y, w, h) {
  push();

  noStroke();
  fill(9, 5, 17, 230);

  rect(x, y, w, h, 6);

  const pulse =
    sin(frameCount * 0.055);

  const cx =
    x + w / 2;

  const cy =
    y + h / 2;

  drawingContext.shadowBlur =
    13 + pulse * 6;

  drawingContext.shadowColor =
    "rgba(170,55,255,0.9)";

  dbDrawCorruptedChain(
    x - 6,
    y + 8,
    x + w + 6,
    y + h - 8,
    0
  );

  dbDrawCorruptedChain(
    x + w + 6,
    y + 8,
    x - 6,
    y + h - 8,
    PI
  );

  noStroke();
  fill(24, 9, 38, 240);

  circle(
    cx,
    cy,
    36 + pulse * 2
  );

  stroke(195, 110, 255);
  strokeWeight(2);
  noFill();

  circle(
    cx,
    cy,
    31 + pulse * 2
  );

  stroke(221, 158, 255);
  strokeWeight(3);
  noFill();

  arc(
    cx,
    cy - 3,
    13,
    15,
    PI,
    TWO_PI
  );

  noStroke();
  fill("#e9c7ff");

  rect(
    cx - 8,
    cy - 4,
    16,
    13,
    3
  );

  fill("#401c60");

  circle(
    cx,
    cy + 1,
    4
  );

  triangle(
    cx - 2,
    cy + 2,
    cx + 2,
    cy + 2,
    cx,
    cy + 7
  );

  drawingContext.shadowBlur = 0;

  fill(
    210,
    150,
    255,
    110 + pulse * 55
  );

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(8);

  text(
    "LOCKED",
    cx,
    y + h - 12
  );

  pop();
}

// =====================================================
// CARD RENDERING
// =====================================================

function dbDrawCollectionCard(
  card,
  x,
  y,
  w,
  h
) {
  const copies =
    countCardCopies(
      dbDeck,
      card.id
    );

  const check =
    canAddCardToDeck(
      dbDeck,
      card.id,
      DB_TEST_ACHIEVEMENTS
    );

  const locked =
    dbIsCardLocked(card);

  const unavailable =
    !check.success;

  const selected =
    copies > 0;

  const hovered =
    dbHit(x, y, w, h);

  const img =
    dbImages[card.id];

  push();

  noStroke();
  fill(0, 110);

  rect(
    x + 2,
    y + 3,
    w,
    h,
    6
  );

  if (locked) {
    dbDrawCorruptedLock(
      x,
      y,
      w,
      h
    );
  } else {
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

    if (unavailable) {
      noStroke();
      fill(12, 10, 18, 155);

      rect(x, y, w, h, 6);
    }

    if (selected) {
      const ctx =
        drawingContext;

      ctx.save();

      ctx.shadowBlur =
        7 +
        sin(frameCount * 0.07) * 2;

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
  }

  // Class origin emblem appears on both
  // locked and unlocked cards.
  dbDrawOriginEmblem(
    card,
    x,
    y,
    w
  );

  if (hovered && !dbPageTurn) {
    noFill();

    stroke(
      locked
        ? "#bd77ff"
        : unavailable
          ? "#ff7777"
          : "#ffffff"
    );

    strokeWeight(1.5);

    rect(x, y, w, h, 6);
  }

  pop();
}

// =====================================================
// HOVER PREVIEW
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
  if (!dbHoverCard) return;

  if (
    frameCount - dbHoverStartFrame <
    DB_PREVIEW.delay
  ) {
    return;
  }

  const card =
    dbHoverCard;

  const locked =
    dbIsCardLocked(card);

  const w =
    DB_PREVIEW.w;

  const h =
    DB_PREVIEW.h;

  const infoH =
    DB_PREVIEW.infoH;

  let x =
    mouseX + 22;

  let y =
    mouseY - 35;

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

  const img =
    dbImages[card.id];

  push();

  const ctx =
    drawingContext;

  ctx.save();

  ctx.shadowBlur = 20;

  ctx.shadowColor = locked
    ? "rgba(165,65,255,0.8)"
    : "rgba(255,195,70,0.75)";

  stroke(
    locked
      ? "#b66bfa"
      : "#f4cc72"
  );

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

  if (locked) {
    dbDrawCorruptedLock(
      x,
      y,
      w,
      h
    );
  } else if (
    img &&
    img.width > 1
  ) {
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

    rect(x, y, w, h, 7);

    fill("#e9d2ff");
    textAlign(CENTER, CENTER);
    textSize(55);

    text(
      "✦",
      x + w / 2,
      y + h / 2
    );
  }

  dbDrawOriginEmblem(
    card,
    x,
    y,
    w
  );

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

  fill(
    locked
      ? "#d8a8ff"
      : "#f4d99c"
  );

  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(
    locked ? 15 : 16
  );

  text(
    locked
      ? "UNKNOWN ENERGY"
      : card.name,
    x + 8,
    y + h + 9,
    w - 16
  );

  fill("#e8d9f1");
  textStyle(NORMAL);
  textSize(11);

  text(
    locked
      ? dbAchievementRequirement(card)
      : dbCardDescription(card),
    x + 10,
    y + h + 35,
    w - 20,
    65
  );

  pop();
}

// =====================================================
// DECK ENTRIES
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
    const [id, count]
    of Object.entries(counts)
  ) {
    const ability =
      getBearAbility(id);

    const energyCard =
      getEnergyCard(id);

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
  const p =
    DB_LAYOUT.deck;

  dbPanel(
    p.x,
    p.y,
    p.w,
    p.h
  );

  const equipped =
    dbDeck.id === dbEquippedDeckId;

  const validation =
    validateFullDeck(
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

  const entries =
    dbDeckEntries();

  const listX =
    p.x + 10;

  const listY =
    p.y + 143;

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

  for (
    let i = 0;
    i < visibleRows;
    i++
  ) {
    const entry =
      entries[
        i + dbListScroll
      ];

    if (!entry) break;

    const y =
      listY + i * rowH;

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

    const hovered =
      dbHit(
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

  const bottom =
    p.y + p.h;

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
  fill(19, 13, 30, 235);

  rect(
    215,
    611,
    570,
    34,
    7
  );

  stroke(
    dbMessageIsError
      ? "#a94d6a"
      : "#8262a4"
  );

  strokeWeight(1);
  noFill();

  rect(
    215,
    611,
    570,
    34,
    7
  );

  noStroke();

  fill(
    dbMessageIsError
      ? "#ff8888"
      : "#e6c98e"
  );

  textAlign(CENTER, CENTER);

  textStyle(
    dbMessageIsError
      ? BOLD
      : NORMAL
  );

  textSize(11);

  text(
    dbMessage,
    225,
    615,
    550,
    26
  );

  pop();
}


function dbOpenNamingModal() {
  dbNamingModalOpen = true;
  dbNewDeckName = "New Bear Deck";
  dbNamingDefaultSelected = true;
  dbNamingError = "";

  dbHoverCard = null;
  dbPreviousHoverId = null;
}

function dbCloseNamingModal() {
  dbNamingModalOpen = false;
  dbNewDeckName = "";
  dbNamingError = "";
  dbNamingDefaultSelected = false;
}

function dbConfirmNewDeck() {
  const name = dbNewDeckName.trim();

  if (name.length === 0) {
    dbNamingError = "Please enter a deck name.";
    return false;
  }

  if (name.length > 28) {
    dbNamingError = "Deck names cannot exceed 28 characters.";
    return false;
  }

  if (
    dbSavedDecks.length >=
    DECK_BUILDER_RULES.maxSavedDecks
  ) {
    dbNamingError = "Maximum 10 saved decks.";
    return false;
  }

  // Create the new starter deck.
  dbDeck = createStarterBearDeck();
  dbDeck.name = name;

  // New deck must be saved by the player.
  dbDirty = true;

  dbListScroll = 0;
  dbCollectionScroll = 0;
  dbPageTurn = null;

  dbCloseNamingModal();

  dbSetMessage(
    "New starter deck created. Save when ready."
  );

  return false;
}

function dbDrawNamingModal() {
  if (!dbNamingModalOpen) return;

  const x = 260;
  const y = 180;
  const w = 480;
  const h = 290;

  push();

  // Dark overlay.
  noStroke();
  fill(7, 4, 14, 220);
  rect(0, 0, DB_WIDTH, DB_HEIGHT);

  // Glowing purple-and-gold frame.
  drawingContext.shadowColor =
    "rgba(160, 85, 230, 0.7)";
  drawingContext.shadowBlur = 25;

  stroke("#d8b66d");
  strokeWeight(2);
  fill("#251a36");
  rect(x, y, w, h, 16);

  drawingContext.shadowBlur = 0;

  // Title.
  noStroke();
  fill("#f2d598");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(28);

  text("Name Your Deck", x + w / 2, y + 43);

  // Subtitle.
  fill("#c8b2d6");
  textStyle(NORMAL);
  textSize(15);

  text(
    "Every adventure begins with a name.",
    x + w / 2,
    y + 84
  );

  // Input field.
  stroke("#a782d0");
  strokeWeight(1.5);
  fill("#140f20");

  rect(x + 45, y + 115, w - 90, 50, 8);

  noStroke();
  fill("#ffe6a6");
  textAlign(LEFT, CENTER);
  textSize(19);

  text(
    dbNewDeckName + (frameCount % 60 < 30 ? "|" : ""),
    x + 60,
    y + 140,
    w - 120
  );

  // Character counter.
  fill("#a993ba");
  textAlign(RIGHT, CENTER);
  textSize(11);

  text(
    `${dbNewDeckName.length}/28`,
    x + w - 48,
    y + 179
  );

  // Validation message.
  if (dbNamingError) {
    fill("#ff9cae");
    textAlign(CENTER, CENTER);
    textSize(12);

    text(
      dbNamingError,
      x + w / 2,
      y + 201
    );
  }

  // Buttons.
  dbButton(
    "CANCEL",
    x + 45,
    y + 222,
    175,
    43
  );

  dbButton(
    "CREATE DECK",
    x + 260,
    y + 222,
    175,
    43
  );

  pop();
}

function dbHandleNamingModalClick() {
  if (!dbNamingModalOpen) return false;

  const x = 260;
  const y = 180;

  if (dbHit(x + 45, y + 222, 175, 43)) {
    dbCloseNamingModal();
    return false;
  }

  if (dbHit(x + 260, y + 222, 175, 43)) {
    return dbConfirmNewDeck();
  }

  return false;
}

function dbHandleNamingModalKey() {
  if (!dbNamingModalOpen) return true;

  if (keyCode === ESCAPE) {
    dbCloseNamingModal();
    return false;
  }

  if (keyCode === ENTER) {
    dbConfirmNewDeck();
    return false;
  }

  if (keyCode === BACKSPACE) {
    if (dbNamingDefaultSelected) {
      dbNewDeckName = "";
      dbNamingDefaultSelected = false;
    } else {
      dbNewDeckName = dbNewDeckName.slice(0, -1);
    }
    dbNamingError = "";
    return false;
  }

  // Use keyPressed for text input, since keyTyped may not fire
  // consistently when keyPressed returns false in sketch.js.
  if (
    !keyIsDown(CONTROL) &&
    !keyIsDown(ALT) &&
    !keyIsDown(91) &&
    !keyIsDown(93) &&
    typeof key === "string" &&
    key.length === 1 &&
    key.charCodeAt(0) >= 32 &&
    key.charCodeAt(0) !== 127
  ) {
    if (dbNamingDefaultSelected) {
      dbNewDeckName = "";
      dbNamingDefaultSelected = false;
    }
    if (dbNewDeckName.length < 28) {
      dbNewDeckName += key;
      dbNamingError = "";
    }
  }

  return false;
}

// Text input is processed in keyPressed to avoid duplicate letters.
function dbHandleNamingModalTyped() {
  return false;
}


// =====================================================
// SAVED DECK ACTIONS
// =====================================================

function dbConfirmDiscard() {
  if (!dbDirty) return true;

  return confirm(
    "Discard unsaved deck changes?"
  );
}

function dbLoadSavedDeck(deck) {
  if (dbDeck.id === deck.id) return;

  if (!dbConfirmDiscard()) return;

  dbDeck = dbClone(deck);

  dbDirty = false;
  dbListScroll = 0;
  dbCollectionScroll = 0;
  dbPageTurn = null;

  dbSetMessage(
    `Loaded "${dbDeck.name}".`
  );
}

function dbNewDeck() {

  if (
    dbSavedDecks.length >=
    DECK_BUILDER_RULES.maxSavedDecks
  ) {
    dbSetMessage("Maximum 10 saved decks.", true);
    return;
  }

  // Protect changes to the current deck.
  if (dbDirty) {
    dbSetMessage(
      "Save or discard your current changes before creating another deck.",
      true
    );
    return;
  }

  dbOpenNamingModal();
}

// =====================================================
// CUSTOM RENAME DECK WINDOW
// =====================================================

function dbRenameCurrentDeck() {
  dbRenameModalOpen = true;
  dbRenameDeckName = dbDeck.name;
  dbRenameDefaultSelected = true;
  dbRenameError = "";
  dbHoverCard = null;
  dbPreviousHoverId = null;
}

function dbCloseRenameModal() {
  dbRenameModalOpen = false;
  dbRenameDeckName = "";
  dbRenameDefaultSelected = false;
  dbRenameError = "";
}

function dbConfirmRenameDeck() {
  const name = dbRenameDeckName.trim();
  if (!name) {
    dbRenameError = "Please enter a deck name.";
    return false;
  }
  if (name.length > 28) {
    dbRenameError = "Deck names cannot exceed 28 characters.";
    return false;
  }
  if (name !== dbDeck.name) {
    dbDeck.name = name;
    dbDirty = true;
    dbSetMessage("Deck renamed. Click Save to keep it.");
  }
  dbCloseRenameModal();
  return false;
}

function dbDrawRenameModal() {
  if (!dbRenameModalOpen) return;
  const x = 260, y = 180, w = 480, h = 290;
  push();
  noStroke();
  fill(7, 4, 14, 220);
  rect(0, 0, DB_WIDTH, DB_HEIGHT);
  drawingContext.shadowColor = "rgba(160, 85, 230, 0.7)";
  drawingContext.shadowBlur = 25;
  stroke("#d8b66d");
  strokeWeight(2);
  fill("#251a36");
  rect(x, y, w, h, 16);
  drawingContext.shadowBlur = 0;
  noStroke();
  fill("#f2d598");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(28);
  text("Rename Your Deck", x + w / 2, y + 43);
  fill("#c8b2d6");
  textStyle(NORMAL);
  textSize(15);
  text("Give your adventure a new name.", x + w / 2, y + 84);
  stroke("#a782d0");
  strokeWeight(1.5);
  fill("#140f20");
  rect(x + 45, y + 115, w - 90, 50, 8);
  noStroke();
  fill("#ffe6a6");
  textAlign(LEFT, CENTER);
  textSize(19);
  text(dbRenameDeckName + (frameCount % 60 < 30 ? "|" : ""),
       x + 60, y + 140, w - 120);
  fill("#a993ba");
  textAlign(RIGHT, CENTER);
  textSize(11);
  text(`${dbRenameDeckName.length}/28`, x + w - 48, y + 179);
  if (dbRenameError) {
    fill("#ff9cae");
    textAlign(CENTER, CENTER);
    textSize(12);
    text(dbRenameError, x + w / 2, y + 201);
  }
  dbButton("CANCEL", x + 45, y + 222, 175, 43);
  dbButton("RENAME DECK", x + 260, y + 222, 175, 43);
  pop();
}

function dbHandleRenameModalClick() {
  if (!dbRenameModalOpen) return false;
  const x = 260, y = 180;
  if (dbHit(x + 45, y + 222, 175, 43)) {
    dbCloseRenameModal();
  } else if (dbHit(x + 260, y + 222, 175, 43)) {
    dbConfirmRenameDeck();
  }
  return false;
}

function dbHandleRenameModalKey() {
  if (!dbRenameModalOpen) return true;
  if (keyCode === ESCAPE) {
    dbCloseRenameModal();
    return false;
  }
  if (keyCode === ENTER) {
    dbConfirmRenameDeck();
    return false;
  }
  if (keyCode === BACKSPACE) {
    if (dbRenameDefaultSelected) {
      dbRenameDeckName = "";
      dbRenameDefaultSelected = false;
    } else {
      dbRenameDeckName = dbRenameDeckName.slice(0, -1);
    }
    dbRenameError = "";
    return false;
  }
  if (!keyIsDown(CONTROL) && !keyIsDown(ALT) &&
      !keyIsDown(91) && !keyIsDown(93) &&
      typeof key === "string" && key.length === 1 &&
      key.charCodeAt(0) >= 32 && key.charCodeAt(0) !== 127) {
    if (dbRenameDefaultSelected) {
      dbRenameDeckName = "";
      dbRenameDefaultSelected = false;
    }
    if (dbRenameDeckName.length < 28) {
      dbRenameDeckName += key;
      dbRenameError = "";
    }
  }
  return false;
}

function dbSaveCurrentDeck() {
  const result =
    saveDeckToLibrary(
      dbDeck,
      DB_TEST_ACHIEVEMENTS
    );

  if (result.success) {
    dbSavedDecks =
      loadSavedDecks();

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
    dbDeck.id ===
    dbEquippedDeckId
  ) {
    dbSetMessage(
      "This deck is already equipped."
    );

    return;
  }

  const result =
    equipSavedDeck(
      dbDeck.id,
      DB_TEST_ACHIEVEMENTS
    );

  if (result.success) {
    dbEquippedDeckId =
      dbDeck.id;
  }

  dbSetMessage(
    result.message,
    !result.success
  );
}

function dbDeleteCurrentDeck() {
  dbDeleteModalOpen = true;
  dbDeleteHoldStartedAt = null;
  dbHoverCard = null;
  dbPreviousHoverId = null;
}

function dbCloseDeleteModal() {
  dbDeleteModalOpen = false;
  dbDeleteHoldStartedAt = null;
}

function dbConfirmDeleteDeck() {
  dbCloseDeleteModal();

  const wasSaved =
    dbSavedDecks.some(
      deck =>
        deck.id === dbDeck.id
    );

  if (
    wasSaved &&
    !deleteSavedDeck(dbDeck.id)
  ) {
    dbSetMessage(
      "Could not delete deck.",
      true
    );

    return;
  }

  dbSavedDecks =
    loadSavedDecks();

  dbEquippedDeckId =
    getEquippedDeckId();

  if (dbSavedDecks.length > 0) {
    dbDeck =
      dbClone(dbSavedDecks[0]);

    dbDirty = false;
  } else {
    dbDeck =
      createStarterBearDeck();

    dbDirty = true;
  }

  dbEnsureEquippedDeck();

  dbListScroll = 0;
  dbSavedScroll = 0;
  dbCollectionScroll = 0;
  dbPageTurn = null;

  dbSetMessage(
    "Deck deleted."
  );
}

// =====================================================
// CUSTOM DELETE DECK CONFIRMATION
// =====================================================

// Hold the red button for 1.6 seconds to permanently delete.
// Releasing or moving off the button resets the fill immediately.
function dbDeleteHoldProgress() {
  if (!dbDeleteModalOpen) return 0;

  const x = 520, y = 397, w = 175, h = 43;
  const holding = mouseIsPressed && dbHit(x, y, w, h);

  if (!holding) {
    dbDeleteHoldStartedAt = null;
    return 0;
  }

  if (dbDeleteHoldStartedAt === null) {
    dbDeleteHoldStartedAt = millis();
  }

  const progress = constrain(
    (millis() - dbDeleteHoldStartedAt) / DB_DELETE_HOLD_MS,
    0,
    1
  );

  if (progress >= 1) {
    // Reset first; deletion may change the active deck and modal state.
    dbDeleteHoldStartedAt = null;
    dbConfirmDeleteDeck();
    return 1;
  }

  return progress;
}

function dbDrawDeleteModal() {
  if (!dbDeleteModalOpen) return;

  const x = 260, y = 190, w = 480, h = 270;
  const progress = dbDeleteHoldProgress();
  if (!dbDeleteModalOpen) return;

  push();
  noStroke();
  fill(7, 4, 14, 225);
  rect(0, 0, DB_WIDTH, DB_HEIGHT);

  drawingContext.shadowColor = "rgba(200, 70, 115, 0.65)";
  drawingContext.shadowBlur = 25;
  stroke("#d6a0ac");
  strokeWeight(2);
  fill("#251a36");
  rect(x, y, w, h, 16);
  drawingContext.shadowBlur = 0;

  noStroke();
  fill("#ffbdc9");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(28);
  text("Delete This Deck?", x + w / 2, y + 43);

  fill("#f2d598");
  textSize(17);
  text(dbDeck.name, x + 30, y + 95, w - 60);

  fill("#d8c3e7");
  textStyle(NORMAL);
  textSize(14);
  text("This deck will be permanently removed.", x + w / 2, y + 144);
  text("Hold DELETE DECK until the button fills red.", x + w / 2, y + 168);

  dbButton("CANCEL", x + 45, y + 207, 175, 43);

  // Custom red hold-to-delete button, matching profile deletion behavior.
  const bx = x + 260, by = y + 207, bw = 175, bh = 43;
  stroke(progress > 0 ? "#ff9b9b" : "#bc687a");
  strokeWeight(2);
  fill("#4a2434");
  rect(bx, by, bw, bh, 6);

  // Red fill moves from left to right while held.
  if (progress > 0) {
    noStroke();
    fill("#d83242");
    rect(bx + 2, by + 2, (bw - 4) * progress, bh - 4, 4);
  }

  noStroke();
  fill("#fff0f0");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(12);
  text("DELETE DECK", bx + bw / 2, by + bh / 2);
  pop();
}

function dbHandleDeleteModalClick() {
  if (!dbDeleteModalOpen) return false;
  const x = 260, y = 190;

  if (dbHit(x + 45, y + 207, 175, 43)) {
    dbCloseDeleteModal();
  }

  // Clicking DELETE DECK does not delete immediately.
  // Holding is tracked in dbDrawDeleteModal() via mouseIsPressed.
  return false;
}

function dbHandleDeleteModalKey() {
  if (!dbDeleteModalOpen) return true;
  if (keyCode === ESCAPE) dbCloseDeleteModal();
  return false;
}

// =====================================================
// LEAVING THE DECK BUILDER
// =====================================================

function dbLeaveToMainMenu() {

  // No changes: leave immediately.
  if (!dbDirty) {
    return dbFinishLeaving();
  }

  // Unsaved changes: show our custom menu.
  dbOpenExitModal();

  return false;
}



/**
 * Check whether the current deck has a saved copy.
 */
function dbHasSavedVersion() {
  return dbSavedDecks.some(
    deck => deck.id === dbDeck.id
  );
}

/**
 * Open the custom exit confirmation.
 */
function dbOpenExitModal() {
  dbExitModalOpen = true;
  dbHoverCard = null;
  dbPreviousHoverId = null;
}

/**
 * Close the confirmation without leaving.
 */
function dbCloseExitModal() {
  dbExitModalOpen = false;
}

/**
 * Return to the main menu after resolving changes.
 */
function dbFinishLeaving() {
  dbExitModalOpen = false;

  dbHoverCard = null;
  dbPreviousHoverId = null;
  dbCursorParticles = [];
  dbPageTurn = null;

  gameState = "mainMenu";
  cursor(ARROW);

  return false;
}

/**
 * Save the current deck before leaving.
 * Invalid decks are never saved.
 */
function dbSaveAndLeave() {
  const validation = validateFullDeck(
    dbDeck,
    DB_TEST_ACHIEVEMENTS
  );

  if (!validation.valid) {
    dbSetMessage(
      validation.errors[0] || "Deck is incomplete.",
      true
    );
    return false;
  }

  dbSaveCurrentDeck();

  // dbSaveCurrentDeck clears this flag on success.
  if (!dbDirty) {
    return dbFinishLeaving();
  }

  return false;
}

/**
 * Discard the working copy and leave.
 */
function dbDiscardAndLeave() {
  const saved = dbSavedDecks.find(
    deck => deck.id === dbDeck.id
  );

  const validation = validateFullDeck(
    dbDeck,
    DB_TEST_ACHIEVEMENTS
  );

  // A new incomplete deck has no valid saved
  // version to return to.
  if (!saved && !validation.valid) {
    dbSetMessage(
      "Complete the new deck before leaving.",
      true
    );
    return false;
  }

  if (saved) {
    dbDeck = dbClone(saved);
  }

  dbDirty = false;

  return dbFinishLeaving();
}

/**
 * Draw the custom exit modal.
 */
function dbDrawExitModal() {
  if (!dbExitModalOpen) return;

  const validation = validateFullDeck(
    dbDeck,
    DB_TEST_ACHIEVEMENTS
  );

  const valid = validation.valid;
  const hasSaved = dbHasSavedVersion();

  const x = 245;
  const y = 175;
  const w = 510;
  const h = 300;

  push();

  // Darken the rest of the Deck Builder.
  noStroke();
  fill(7, 4, 14, 220);
  rect(0, 0, DB_WIDTH, DB_HEIGHT);

  // Purple glow.
  drawingContext.shadowColor =
    "rgba(150, 70, 220, 0.65)";
  drawingContext.shadowBlur = 24;

  stroke(valid ? "#d6ac65" : "#b46a85");
  strokeWeight(2);
  fill("#251a36");

  rect(x, y, w, h, 16);

  drawingContext.shadowBlur = 0;

  textAlign(CENTER, CENTER);
  noStroke();

  fill(valid ? "#f2d598" : "#f0b5c5");
  textStyle(BOLD);
  textSize(27);

  text(
    valid ? "Unsaved Changes" : "Incomplete Deck",
    x + w / 2,
    y + 43
  );

  fill("#d8c3e7");
  textStyle(NORMAL);
  textSize(15);

  if (valid) {
    text(
      "Would you like to save your changes",
      x + w / 2,
      y + 94
    );

    text(
      "before returning to the main menu?",
      x + w / 2,
      y + 119
    );
  } else {
    fill("#ffb4bd");

    text(
      `${dbDeck.cards.length}/40 cards`,
      x + w / 2,
      y + 88
    );

    fill("#d8c3e7");
    textSize(13);

    text(
      validation.errors[0] || "Deck requirements not met.",
      x + 35,
      y + 112,
      w - 70,
      43
    );

    textSize(13);

    text(
      hasSaved
        ? "Discard to restore your last saved deck."
        : "Complete this new deck before leaving.",
      x + w / 2,
      y + 163
    );
  }

  const buttonY = y + 225;

  // Save is only available for valid decks.
  dbButton(
    "SAVE & LEAVE",
    x + 22,
    buttonY,
    145,
    43,
    valid
  );

  dbButton(
    "KEEP EDITING",
    x + 182,
    buttonY,
    145,
    43
  );

  // Discard is allowed if a saved version exists,
  // or if this new deck is valid.
  dbButton(
    "DISCARD",
    x + 342,
    buttonY,
    145,
    43,
    hasSaved || valid
  );

  pop();
}

/**
 * Handle clicks while the exit modal is open.
 */
function dbHandleExitModalClick() {
  if (!dbExitModalOpen) return false;

  const validation = validateFullDeck(
    dbDeck,
    DB_TEST_ACHIEVEMENTS
  );

  const valid = validation.valid;
  const canDiscard = dbHasSavedVersion() || valid;

  const x = 245;
  const y = 175;
  const buttonY = y + 225;

  if (dbHit(x + 22, buttonY, 145, 43)) {
    if (valid) {
      dbSaveAndLeave();
    }
    return false;
  }

  if (dbHit(x + 182, buttonY, 145, 43)) {
    dbCloseExitModal();
    return false;
  }

  if (dbHit(x + 342, buttonY, 145, 43)) {
    if (canDiscard) {
      dbDiscardAndLeave();
    }
    return false;
  }

  return false;
}

// =====================================================
// MOUSE CLICKS
// =====================================================

function dbMousePressed() {
  const saved =
    DB_LAYOUT.saved;

  const collection =
    DB_LAYOUT.collection;

  const deck =
    DB_LAYOUT.deck;

  if (dbNamingModalOpen) {
    return dbHandleNamingModalClick();
  }

  if (dbRenameModalOpen) {
    return dbHandleRenameModalClick();
  }

  if (dbDeleteModalOpen) {
    return dbHandleDeleteModalClick();
  }

  if (dbExitModalOpen) {
    return dbHandleExitModalClick();
  }
  // BACK
  if (
    dbHit(
      14,
      19,
      100,
      34
    )
  ) {
    return dbLeaveToMainMenu();
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
    const x =
      saved.x + 9;

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
      dbDeck.id !==
      dbEquippedDeckId
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
    if (dbPageTurn) return false;

    dbTab = "combat";
    dbCollectionScroll = 0;

    dbHoverCard = null;
    dbPreviousHoverId = null;

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
    if (dbPageTurn) return false;

    dbTab = "energy";
    dbCollectionScroll = 0;

    dbHoverCard = null;
    dbPreviousHoverId = null;

    return false;
  }

  // PAGE NAVIGATION
  if (
    dbHandlePageButtonClick()
  ) {
    return false;
  }

  // Prevent card interaction
  // while a page is turning.
  if (dbPageTurn) {
    return false;
  }

  // ADD CARD
  const cards =
    dbCollectionCards();

  const visibleCards =
    cards.slice(
      dbCollectionScroll,
      dbCollectionScroll +
        DB_VISIBLE_CARDS
    );

  for (
    let i = 0;
    i < visibleCards.length;
    i++
  ) {
    const card =
      visibleCards[i];

    const position =
      dbCollectionPosition(
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
      if (
        dbIsCardLocked(card)
      ) {
        dbSetMessage(
          dbAchievementRequirement(card),
          true
        );

        return false;
      }

      const result =
        addCardToDeck(
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
  const entries =
    dbDeckEntries();

  const listX =
    deck.x + 10;

  const listY =
    deck.y + 143;

  for (
    let i = 0;
    i < 12;
    i++
  ) {
    const entry =
      entries[
        i + dbListScroll
      ];

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
// MOUSE WHEEL
// =====================================================

function dbMouseWheel(event) {
  const saved =
    DB_LAYOUT.saved;

  const collection =
    DB_LAYOUT.collection;

  const deck =
    DB_LAYOUT.deck;

  const direction =
    event.delta > 0
      ? 1
      : -1;


  if (dbNamingModelOpen) {
    return false;
  }
  
  if (dbExitModalOpen) {
    return false;
  }

  // SAVED DECKS
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

  // COLLECTION PAGE TURNING
  if (
    dbHit(
      collection.x,
      collection.y + 82,
      collection.w,
      415
    )
  ) {
    dbChangePage(
      dbCurrentPage() + direction
    );

    return false;
  }

  // CURRENT DECK
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
    const p =
      dbCursorParticles[i];

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

  const ctx =
    drawingContext;

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
// DISABLE RIGHT CLICK ON GAME CANVAS
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
