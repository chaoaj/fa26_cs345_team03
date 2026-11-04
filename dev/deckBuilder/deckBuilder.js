/** Whimsy & Woe - Deck Builder Logic */

const DECK_BUILDER_RULES = {
  minCards: 40,
  maxCards: 40,
  minCombatCards: 10,
  minEnergyCards: 10,
  maxCombatCards: 30,
  maxEnergyCards: 30,
  minUniqueCombatCards: 4,
  maxSavedDecks: 10
};

const DB_STORAGE_KEY = "ww_bear_test_decks_v2";
const DB_EQUIPPED_DECK_KEY = "ww_bear_equipped_deck_v1";

function createEmptyDeck(classId = "bear", name = "New Deck") {
  return {
    id: `deck_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    classId,
    cards: [],
    createdAt: new Date().toISOString()
  };
}

function countCards(deck) {
  return deck.cards.length;
}

function countCardCopies(deck, id) {
  return deck.cards.filter(c => c === id).length;
}

function getDeckCategoryCounts(deck) {
  return {
    combat: deck.cards.filter(
      id => getBearAbility(id) != null
    ).length,
    energy: deck.cards.filter(
      id => getEnergyCard(id) != null
    ).length
  };
}

function canAddCardToDeck(deck, cardId, achievements = []) {
  if (!deck || !Array.isArray(deck.cards)) {
    return { success: false, message: "Invalid deck." };
  }

  const ability = getBearAbility(cardId);
  const energy = getEnergyCard(cardId);

  if (!ability && !energy) {
    return { success: false, message: "Unknown card." };
  }

  if (ability && deck.classId !== "bear") {
    return { success: false, message: "Wrong class." };
  }

  if (ability && !isBearAbilityUnlocked(cardId, achievements)) {
    return {
      success: false,
      message: `${ability.name} is locked.`
    };
  }

  if (
    energy &&
    !(energy.unlockedByDefault ||
      achievements.includes(energy.achievementId))
  ) {
    return {
      success: false,
      message: `${energy.name} is locked.`
    };
  }

  const limit = ability
    ? getBearCardCopyLimit(cardId)
    : energy.maxCopies;

  if (countCardCopies(deck, cardId) >= limit) {
    return { success: false, message: "Copy limit reached." };
  }

  const { combat, energy: energyCount } =
    getDeckCategoryCounts(deck);

  if (ability && combat >= 30) {
    return {
      success: false,
      message: "Maximum 30 Combat cards allowed."
    };
  }

  if (energy && energyCount >= 30) {
    return {
      success: false,
      message: "Maximum 30 Energy cards allowed."
    };
  }

  if (deck.cards.length >= 40) {
    return {
      success: false,
      message: "Deck is full (40/40). Remove a card first."
    };
  }

  const nextCombat = combat + (ability ? 1 : 0);
  const nextEnergy = energyCount + (energy ? 1 : 0);
  const slotsLeft = 40 - (deck.cards.length + 1);

  const neededCombat = Math.max(0, 10 - nextCombat);
  const neededEnergy = Math.max(0, 10 - nextEnergy);

  if (neededCombat + neededEnergy > slotsLeft) {
    return {
      success: false,
      message: ability
        ? "Cannot add Combat. Reserve room for at least 10 Energy cards."
        : "Cannot add Energy. Reserve room for at least 10 Combat cards."
    };
  }

  return { success: true, message: "Card can be added." };
}

function addCardToDeck(deck, cardId, achievements = []) {
  const check = canAddCardToDeck(deck, cardId, achievements);

  if (!check.success) return check;

  const card = getBearAbility(cardId) || getEnergyCard(cardId);
  deck.cards.push(cardId);

  return {
    success: true,
    message: `${card.name} added.`
  };
}

// Removal is always allowed.
function removeCardFromDeck(deck, cardId) {
  const index = deck.cards.indexOf(cardId);
  if (index < 0) return false;

  deck.cards.splice(index, 1);
  return true;
}

function validateFullDeck(deck, achievements = []) {
  if (!deck || !Array.isArray(deck.cards)) {
    return { valid: false, errors: ["Invalid deck."] };
  }

  const errors = [];

  if (deck.classId !== "bear") {
    errors.push("Unsupported class.");
  }

  if (deck.cards.length !== 40) {
    errors.push(
      `Deck must contain exactly 40 cards (${deck.cards.length}/40).`
    );
  }

  const combat = deck.cards.filter(
    id => getBearAbility(id) != null
  );

  const energy = deck.cards.filter(
    id => getEnergyCard(id) != null
  );

  if (combat.length < 10) {
    errors.push(
      `Deck needs at least 10 Combat cards (${combat.length}/10).`
    );
  }

  if (energy.length < 10) {
    errors.push(
      `Deck needs at least 10 Energy cards (${energy.length}/10).`
    );
  }

  if (combat.length > 30) {
    errors.push(
      `Deck allows at most 30 Combat cards (${combat.length}/30).`
    );
  }

  if (energy.length > 30) {
    errors.push(
      `Deck allows at most 30 Energy cards (${energy.length}/30).`
    );
  }

  const uniqueCombatCards = new Set(combat).size;

  if (uniqueCombatCards < 4) {
    errors.push(
      `Deck requires at least 4 unique Combat cards (${uniqueCombatCards}/4).`
    );
  }

  const counts = {};

  for (const id of deck.cards) {
    const ability = getBearAbility(id);
    const card = ability || getEnergyCard(id);

    if (!card) continue;

    counts[id] = (counts[id] || 0) + 1;

    const unlocked = ability
      ? isBearAbilityUnlocked(id, achievements)
      : card.unlockedByDefault ||
        achievements.includes(card.achievementId);

    if (!unlocked) {
      const message = `${card.name} is locked.`;
      if (!errors.includes(message)) errors.push(message);
    }

    const limit = ability
      ? getBearCardCopyLimit(id)
      : card.maxCopies;

    if (counts[id] > limit) {
      const message = `${card.name} exceeds its copy limit.`;
      if (!errors.includes(message)) errors.push(message);
    }
  }

  if (combat.length + energy.length !== deck.cards.length) {
    errors.push("Deck contains unknown cards.");
  }

  return {
    valid: errors.length === 0,
    errors,
    totalCards: deck.cards.length,
    abilityCards: combat.length,
    energyCards: energy.length,
    uniqueCombatCards
  };
}

// Original 20 Combat / 20 Energy starter deck.
function createStarterBearDeck() {
  const deck = createEmptyDeck("bear", "Forest Guardian");

  const combat = {
    swipe: 3,
    bite: 3,
    claw: 3,
    bearHug: 3,
    thickHide: 3,
    charge: 3,
    maul: 2
  };

  for (const [id, copies] of Object.entries(combat)) {
    for (let i = 0; i < copies; i++) {
      deck.cards.push(id);
    }
  }

  for (let i = 0; i < 20; i++) {
    deck.cards.push("basicEnergy");
  }

  return deck;
}

function loadSavedDecks() {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.filter(d => d && Array.isArray(d.cards))
      : [];
  } catch (error) {
    console.error("Could not load decks:", error);
    return [];
  }
}

function persistSavedDecks(decks) {
  try {
    localStorage.setItem(
      DB_STORAGE_KEY,
      JSON.stringify(decks)
    );
    return true;
  } catch (error) {
    console.error("Could not save decks:", error);
    return false;
  }
}

function saveDeckToLibrary(deck, achievements = []) {
  const validation = validateFullDeck(deck, achievements);

  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  const decks = loadSavedDecks();
  const index = decks.findIndex(d => d.id === deck.id);

  if (index < 0 && decks.length >= 10) {
    return {
      success: false,
      errors: ["Maximum 10 saved decks."]
    };
  }

  const copy = JSON.parse(JSON.stringify(deck));

  if (index >= 0) {
    decks[index] = copy;
  } else {
    decks.push(copy);
  }

  if (!persistSavedDecks(decks)) {
    return {
      success: false,
      errors: ["Could not access browser storage."]
    };
  }

  return { success: true, deck: copy };
}

function deleteSavedDeck(deckId) {
  const decks = loadSavedDecks();
  const remaining = decks.filter(d => d.id !== deckId);

  return remaining.length !== decks.length &&
    persistSavedDecks(remaining);
}

function renameSavedDeck(deckId, newName) {
  const name = newName.trim().slice(0, 28);
  if (!name) return false;

  const decks = loadSavedDecks();
  const deck = decks.find(d => d.id === deckId);

  if (!deck) return false;

  deck.name = name;
  return persistSavedDecks(decks);
}

// Equipped deck is separate from the viewed deck.
function getEquippedDeckId() {
  try {
    const id = localStorage.getItem(DB_EQUIPPED_DECK_KEY);
    const decks = loadSavedDecks();

    return decks.some(deck => deck.id === id) ? id : null;
  } catch (error) {
    console.error("Could not load equipped deck:", error);
    return null;
  }
}

function equipSavedDeck(deckId, achievements = []) {
  const deck = loadSavedDecks().find(
    item => item.id === deckId
  );

  if (!deck) {
    return {
      success: false,
      message: "Save this deck before equipping it."
    };
  }

  const validation = validateFullDeck(deck, achievements);

  if (!validation.valid) {
    return {
      success: false,
      message: validation.errors[0]
    };
  }

  try {
    localStorage.setItem(DB_EQUIPPED_DECK_KEY, deckId);

    return {
      success: true,
      message: `${deck.name} equipped!`
    };
  } catch (error) {
    console.error("Could not equip deck:", error);

    return {
      success: false,
      message: "Could not save equipped deck."
    };
  }
}

function getEquippedDeck() {
  const id = getEquippedDeckId();

  return id
    ? loadSavedDecks().find(deck => deck.id === id) || null
    : null;
}