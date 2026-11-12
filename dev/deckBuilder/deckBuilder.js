
/**
 * WHIMSY & WOE
 * Deck Builder Logic
 *
 * Handles:
 * - Deck creation
 * - Combat and Energy card limits
 * - Achievement requirements
 * - Deck validation
 * - Starter Bear deck
 * - Saved decks
 * - Equipped decks
 */

// =====================================================
// DECK BUILDER RULES
// =====================================================

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

// =====================================================
// PROFILE-SPECIFIC DECK STORAGE
// =====================================================

function getDeckStorageKey() {
  if (!selectedProfile || !selectedProfile.id) {
    throw new Error("No player profile selected.");
  }

  return `ww_decks_profile_${selectedProfile.id}`;
}

function getEquippedDeckStorageKey() {
  if (!selectedProfile || !selectedProfile.id) {
    throw new Error("No player profile selected.");
  }

  return `ww_equipped_deck_profile_${selectedProfile.id}`;
}


// =====================================================
// CREATE EMPTY DECK
// =====================================================

function createEmptyDeck(
  classId = "bear",
  name = "New Deck"
) {
  return {
    id:
      `deck_${Date.now()}_` +
      Math.random().toString(36).slice(2, 8),

    name,
    classId,
    cards: [],
    createdAt: new Date().toISOString()
  };
}

// =====================================================
// CARD COUNTING
// =====================================================

function countCards(deck) {
  return deck.cards.length;
}

function countCardCopies(deck, id) {
  return deck.cards.filter(
    cardId => cardId === id
  ).length;
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

// =====================================================
// CARD UNLOCK CHECK
// =====================================================

function isDeckCardUnlocked(
  card,
  achievements = []
) {
  if (!card) return false;

  if (getBearAbility(card.id)) {
    return isBearAbilityUnlocked(
      card.id,
      achievements
    );
  }

  if (getEnergyCard(card.id)) {
    return (
      card.unlockedByDefault === true ||
      (
        card.achievementId != null &&
        achievements.includes(card.achievementId)
      )
    );
  }

  return false;
}

// =====================================================
// CHECK IF A CARD CAN BE ADDED
// =====================================================

function canAddCardToDeck(
  deck,
  cardId,
  achievements = []
) {
  if (
    !deck ||
    !Array.isArray(deck.cards)
  ) {
    return {
      success: false,
      message: "Invalid deck."
    };
  }

  const ability = getBearAbility(cardId);
  const energy = getEnergyCard(cardId);

  if (!ability && !energy) {
    return {
      success: false,
      message: "Unknown card."
    };
  }

  if (
    ability &&
    deck.classId !== "bear"
  ) {
    return {
      success: false,
      message: "Wrong class."
    };
  }

  const card = ability || energy;

  if (
    !isDeckCardUnlocked(
      card,
      achievements
    )
  ) {
    return {
      success: false,
      message:
        `${card.name} is locked. ` +
        "Complete its achievement to unlock it."
    };
  }

  // Check the individual card copy limit.
  const limit = ability
    ? getBearCardCopyLimit(cardId)
    : energy.maxCopies;

  if (
    countCardCopies(deck, cardId) >= limit
  ) {
    return {
      success: false,
      message:
        `${card.name} has reached its copy limit.`
    };
  }

  const {
    combat,
    energy: energyCount
  } = getDeckCategoryCounts(deck);

  // Maximum Combat cards.
  if (
    ability &&
    combat >= DECK_BUILDER_RULES.maxCombatCards
  ) {
    return {
      success: false,
      message:
        "Maximum 30 Combat cards allowed."
    };
  }

  // Maximum Energy cards.
  if (
    energy &&
    energyCount >= DECK_BUILDER_RULES.maxEnergyCards
  ) {
    return {
      success: false,
      message:
        "Maximum 30 Energy cards allowed."
    };
  }

  // Maximum total cards.
  if (
    deck.cards.length >=
    DECK_BUILDER_RULES.maxCards
  ) {
    return {
      success: false,
      message:
        "Deck is full (40/40). Remove a card first."
    };
  }

  // Reserve enough space to meet minimums.
  const nextCombat =
    combat + (ability ? 1 : 0);

  const nextEnergy =
    energyCount + (energy ? 1 : 0);

  const slotsLeft =
    DECK_BUILDER_RULES.maxCards -
    (deck.cards.length + 1);

  const neededCombat = Math.max(
    0,
    DECK_BUILDER_RULES.minCombatCards -
      nextCombat
  );

  const neededEnergy = Math.max(
    0,
    DECK_BUILDER_RULES.minEnergyCards -
      nextEnergy
  );

  if (
    neededCombat + neededEnergy >
    slotsLeft
  ) {
    return {
      success: false,
      message: ability
        ? "Reserve room for at least 10 Energy cards."
        : "Reserve room for at least 10 Combat cards."
    };
  }

  return {
    success: true,
    message: "Card can be added."
  };
}

// =====================================================
// ADD CARD
// =====================================================

function addCardToDeck(
  deck,
  cardId,
  achievements = []
) {
  const check = canAddCardToDeck(
    deck,
    cardId,
    achievements
  );

  if (!check.success) {
    return check;
  }

  const card =
    getBearAbility(cardId) ||
    getEnergyCard(cardId);

  deck.cards.push(cardId);

  return {
    success: true,
    message: `${card.name} added.`
  };
}

// =====================================================
// REMOVE CARD
// =====================================================

function removeCardFromDeck(
  deck,
  cardId
) {
  const index =
    deck.cards.indexOf(cardId);

  if (index < 0) {
    return false;
  }

  deck.cards.splice(index, 1);

  return true;
}

// =====================================================
// VALIDATE FULL DECK
// =====================================================

function validateFullDeck(
  deck,
  achievements = []
) {
  if (
    !deck ||
    !Array.isArray(deck.cards)
  ) {
    return {
      valid: false,
      errors: ["Invalid deck."]
    };
  }

  const errors = [];

  if (deck.classId !== "bear") {
    errors.push("Unsupported class.");
  }

  // Total cards.
  if (
    deck.cards.length !==
    DECK_BUILDER_RULES.maxCards
  ) {
    errors.push(
      `Deck must contain exactly 40 cards ` +
      `(${deck.cards.length}/40).`
    );
  }

  const combat = deck.cards.filter(
    id => getBearAbility(id) != null
  );

  const energy = deck.cards.filter(
    id => getEnergyCard(id) != null
  );

  // Minimum Combat.
  if (
    combat.length <
    DECK_BUILDER_RULES.minCombatCards
  ) {
    errors.push(
      `Deck needs at least 10 Combat cards ` +
      `(${combat.length}/10).`
    );
  }

  // Minimum Energy.
  if (
    energy.length <
    DECK_BUILDER_RULES.minEnergyCards
  ) {
    errors.push(
      `Deck needs at least 10 Energy cards ` +
      `(${energy.length}/10).`
    );
  }

  // Maximum Combat.
  if (
    combat.length >
    DECK_BUILDER_RULES.maxCombatCards
  ) {
    errors.push(
      `Deck allows at most 30 Combat cards ` +
      `(${combat.length}/30).`
    );
  }

  // Maximum Energy.
  if (
    energy.length >
    DECK_BUILDER_RULES.maxEnergyCards
  ) {
    errors.push(
      `Deck allows at most 30 Energy cards ` +
      `(${energy.length}/30).`
    );
  }

  // Unique Combat card requirement.
  const uniqueCombatCards =
    new Set(combat).size;

  if (
    uniqueCombatCards <
    DECK_BUILDER_RULES.minUniqueCombatCards
  ) {
    errors.push(
      `Deck requires at least 4 unique Combat cards ` +
      `(${uniqueCombatCards}/4).`
    );
  }

  // Check individual cards.
  const counts = {};

  for (const id of deck.cards) {
    const ability = getBearAbility(id);
    const card =
      ability || getEnergyCard(id);

    if (!card) continue;

    counts[id] =
      (counts[id] || 0) + 1;

    if (
      !isDeckCardUnlocked(
        card,
        achievements
      )
    ) {
      const message =
        `${card.name} is locked.`;

      if (!errors.includes(message)) {
        errors.push(message);
      }
    }

    const limit = ability
      ? getBearCardCopyLimit(id)
      : card.maxCopies;

    if (counts[id] > limit) {
      const message =
        `${card.name} exceeds its copy limit.`;

      if (!errors.includes(message)) {
        errors.push(message);
      }
    }
  }

  // Unknown card detection.
  if (
    combat.length + energy.length !==
    deck.cards.length
  ) {
    errors.push(
      "Deck contains unknown cards."
    );
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

// =====================================================
// BEAR STARTER DECK
// =====================================================

/**
 * Creates the Forest Guardian starter deck.
 *
 * 40 total cards:
 * - 20 Combat
 * - 20 Energy
 *
 * The Energy cards are distributed across
 * all six default-unlocked Energy types.
 */
function createStarterBearDeck() {
  const deck = createEmptyDeck(
    "bear",
    "Forest Guardian"
  );

  // ---------------------------------------------
  // STARTING COMBAT CARDS (20)
  // ---------------------------------------------

  const combat = {
    swipe: 3,
    bite: 3,
    claw: 3,
    bearHug: 3,
    thickHide: 3,
    charge: 3,
    maul: 2
  };

  // ---------------------------------------------
  // STARTING ENERGY CARDS (20)
  // ---------------------------------------------

  const energy = {
    basicEnergy: 5,
    doubleEnergy: 5,
    vitalEnergy: 4,
    recoveryEnergy: 3,
    fierceEnergy: 2,
    protectiveEnergy: 1
  };

  // Add Combat cards.
  for (
    const [id, copies]
    of Object.entries(combat)
  ) {
    for (
      let i = 0;
      i < copies;
      i++
    ) {
      deck.cards.push(id);
    }
  }

  // Add Energy cards.
  for (
    const [id, copies]
    of Object.entries(energy)
  ) {
    for (
      let i = 0;
      i < copies;
      i++
    ) {
      deck.cards.push(id);
    }
  }

  return deck;
}

// =====================================================
// LOAD SAVED DECKS
// =====================================================

function loadSavedDecks() {
  try {
    const raw =
      localStorage.getItem(getDeckStorageKey());

    const parsed =
      raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.filter(
          deck =>
            deck &&
            Array.isArray(deck.cards)
        )
      : [];

  } catch (error) {
    console.error(
      "Could not load decks:",
      error
    );

    return [];
  }
}

// =====================================================
// PERSIST SAVED DECKS
// =====================================================

function persistSavedDecks(decks) {
  try {
    localStorage.setItem(
      getDeckStorageKey(),
      JSON.stringify(decks)
    );

    return true;

  } catch (error) {
    console.error(
      "Could not save decks:",
      error
    );

    return false;
  }
}

// =====================================================
// SAVE DECK
// =====================================================

function saveDeckToLibrary(
  deck,
  achievements = []
) {
  const validation =
    validateFullDeck(
      deck,
      achievements
    );

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  const decks =
    loadSavedDecks();

  const index =
    decks.findIndex(
      saved =>
        saved.id === deck.id
    );

  if (
    index < 0 &&
    decks.length >=
    DECK_BUILDER_RULES.maxSavedDecks
  ) {
    return {
      success: false,
      errors: [
        "Maximum 10 saved decks."
      ]
    };
  }

  const copy =
    JSON.parse(
      JSON.stringify(deck)
    );

  if (index >= 0) {
    decks[index] = copy;
  } else {
    decks.push(copy);
  }

  if (
    !persistSavedDecks(decks)
  ) {
    return {
      success: false,
      errors: [
        "Could not access browser storage."
      ]
    };
  }

  return {
    success: true,
    deck: copy
  };
}

// =====================================================
// DELETE SAVED DECK
// =====================================================

function deleteSavedDeck(deckId) {
  const decks =
    loadSavedDecks();

  const remaining =
    decks.filter(
      deck =>
        deck.id !== deckId
    );

  return (
    remaining.length !== decks.length &&
    persistSavedDecks(remaining)
  );
}

// =====================================================
// RENAME SAVED DECK
// =====================================================

function renameSavedDeck(
  deckId,
  newName
) {
  const name =
    newName.trim().slice(0, 28);

  if (!name) {
    return false;
  }

  const decks =
    loadSavedDecks();

  const deck =
    decks.find(
      item =>
        item.id === deckId
    );

  if (!deck) {
    return false;
  }

  deck.name = name;

  return persistSavedDecks(decks);
}

// =====================================================
// EQUIPPED DECK
// =====================================================

function getEquippedDeckId() {
  try {
    const id =
      localStorage.getItem(
        getEquippedDeckStorageKey()
      );

    const decks =
      loadSavedDecks();

    return decks.some(
      deck => deck.id === id
    )
      ? id
      : null;

  } catch (error) {
    console.error(
      "Could not load equipped deck:",
      error
    );

    return null;
  }
}

// =====================================================
// EQUIP SAVED DECK
// =====================================================

function equipSavedDeck(
  deckId,
  achievements = []
) {
  const deck =
    loadSavedDecks().find(
      item =>
        item.id === deckId
    );

  if (!deck) {
    return {
      success: false,
      message:
        "Save this deck before equipping it."
    };
  }

  const validation =
    validateFullDeck(
      deck,
      achievements
    );

  if (!validation.valid) {
    return {
      success: false,
      message:
        validation.errors[0]
    };
  }

  try {
    localStorage.setItem(
      getEquippedDeckStorageKey(),
      deckId
    );

    return {
      success: true,
      message:
        `${deck.name} equipped!`
    };

  } catch (error) {
    console.error(
      "Could not equip deck:",
      error
    );

    return {
      success: false,
      message:
        "Could not save equipped deck."
    };
  }
}

// =====================================================
// GET EQUIPPED DECK
// =====================================================

function getEquippedDeck() {
  const id =
    getEquippedDeckId();

  return id
    ? loadSavedDecks().find(
        deck =>
          deck.id === id
      ) || null
    : null;
}
