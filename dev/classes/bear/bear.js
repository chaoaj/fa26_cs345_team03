
/**
 * Whimsy & Woe - Bear Class
 *
 * Defines Bear stats, card collection, achievements,
 * deck-building rules, and evolution.
 *
 * Combat effects are handled by bearAbilities.js.
 */

const BEAR_CLASS = {
  id: "bear",
  name: "Bear",

  description:
    "An adorable but powerful guardian of the forest. " +
    "The Bear specializes in permanent Armor, Bleed, " +
    "healing, and devastating physical attacks.",

  // Base character stats
  stats: {
    maxSanity: 100,
    startingSanity: 100,
    startingArmor: 0
  },

  // Evolution configuration
  evolution: {
    available: true,
    multiplier: 2
  },

  // Deck-building rules
  deckRules: {
    minUniqueCombatCards: 4,

    copiesByRarity: {
      common: 3,
      rare: 3,
      epic: 3,
      legendary: 3
    }
  },

  // Achievement requirements
  achievements: {
    lacerate: {
      id: "bear_bleed_150",
      description: "Deal 150 total Bleed damage.",
      target: 150
    },

    primalFury: {
      id: "bear_defeat_50",
      description: "Defeat 50 enemies.",
      target: 50
    },

    winterSlumber: {
      id: "bear_full_sanity_10",
      description: "Win 10 battles at full Sanity.",
      target: 10
    },

    unbreakable: {
      id: "bear_armor_500",
      description: "Accumulate 500 Armor.",
      target: 500
    },

    counterClaw: {
      id: "bear_armored_kills_25",
      description:
        "Defeat 25 enemies while Armor remains.",
      target: 25
    },

    crushingClaws: {
      id: "bear_bleed_boss",
      description:
        "Defeat a boss using Bleed damage.",
      target: 1
    }
  },

  // All 15 Bear abilities
  abilities: [
    // STARTING ABILITIES (9)

    {
      id: "swipe",
      name: "Swipe",
      rarity: "common",
      unlockedByDefault: true,
      energyCost: 1,
      image: "assets/cards/bear/swipe.png",
      effect: "Deal 8 damage."
    },

    {
      id: "bite",
      name: "Bite",
      rarity: "common",
      unlockedByDefault: true,
      energyCost: 1,
      image: "assets/cards/bear/bite.png",
      effect: "Deal 12 damage."
    },

    {
      id: "thickHide",
      name: "Thick Hide",
      rarity: "rare",
      unlockedByDefault: true,
      energyCost: 1,
      image: "assets/cards/bear/thick_hide.png",
      effect: "Gain 8 permanent Armor."
    },

    {
      id: "roar",
      name: "Roar",
      rarity: "rare",
      unlockedByDefault: true,
      energyCost: 1,
      image: "assets/cards/bear/roar.png",
      effect:
        "Reduce enemy's next attack damage by 25%."
    },

    {
      id: "claw",
      name: "Claw",
      rarity: "common",
      unlockedByDefault: true,
      energyCost: 1,
      image: "assets/cards/bear/claw.png",
      effect: "Deal 6 damage and apply 3 Bleed."
    },

    {
      id: "bearHug",
      name: "Bear Hug",
      rarity: "common",
      unlockedByDefault: true,
      energyCost: 1,
      image: "assets/cards/bear/bear_hug.png",
      effect:
        "Deal 10 damage; reduce enemy's next attack by 5."
    },

    {
      id: "honeyFeast",
      name: "Honey Feast",
      rarity: "epic",
      unlockedByDefault: true,
      energyCost: 1,
      image: "assets/cards/bear/honey_feast.png",
      effect: "Restore 8 Sanity."
    },

    {
      id: "charge",
      name: "Charge",
      rarity: "rare",
      unlockedByDefault: true,
      energyCost: 1,
      image: "assets/cards/bear/charge.png",
      effect:
        "Deal 12 damage; next attack gains 5 damage."
    },

    {
      id: "maul",
      name: "Maul",
      rarity: "epic",
      unlockedByDefault: true,
      energyCost: 1,
      image: "assets/cards/bear/maul.png",
      effect:
        "Deal 16 damage, plus 8 against Bleeding enemies."
    },

    // ACHIEVEMENT-LOCKED ABILITIES (6)

    {
      id: "lacerate",
      name: "Lacerate",
      rarity: "epic",
      unlockedByDefault: false,
      achievementId: "bear_bleed_150",
      energyCost: 1,
      image: "assets/cards/bear/lacerate.png",
      effect: "Deal 10 damage and apply 6 Bleed."
    },

    {
      id: "primalFury",
      name: "Primal Fury",
      rarity: "legendary",
      unlockedByDefault: false,
      achievementId: "bear_defeat_50",
      energyCost: 1,
      image: "assets/cards/bear/primal_fury.png",
      effect:
        "Next 2 attacks deal 50% more damage."
    },

    {
      id: "winterSlumber",
      name: "Winter Slumber",
      rarity: "rare",
      unlockedByDefault: false,
      achievementId: "bear_full_sanity_10",
      energyCost: 1,
      image: "assets/cards/bear/winter_slumber.png",
      effect:
        "Restore 20 Sanity, gain 12 Armor, " +
        "and end your combat phase."
    },

    {
      id: "unbreakable",
      name: "Unbreakable",
      rarity: "legendary",
      unlockedByDefault: false,
      achievementId: "bear_armor_500",
      energyCost: 1,
      image: "assets/cards/bear/unbreakable.png",
      effect:
        "Gain 25 Armor; reduce incoming " +
        "damage by 25% this round."
    },

    {
      id: "counterClaw",
      name: "Counter Claw",
      rarity: "epic",
      unlockedByDefault: false,
      achievementId: "bear_armored_kills_25",
      energyCost: 1,
      image: "assets/cards/bear/counter_claw.png",
      effect:
        "Gain 12 Armor; counter the " +
        "next attack for 20 damage."
    },

    {
      id: "crushingClaws",
      name: "Crushing Claws",
      rarity: "legendary",
      unlockedByDefault: false,
      achievementId: "bear_bleed_boss",
      energyCost: 1,
      image: "assets/cards/bear/crushing_claws.png",
      effect:
        "Deal 35 damage and trigger remaining Bleed."
    }
  ]
};

/**
 * Find a Bear ability by ID.
 */
function getBearAbility(id) {
  return BEAR_CLASS.abilities.find(
    ability => ability.id === id
  ) ?? null;
}

/**
 * Check whether an ability has been unlocked.
 *
 * completedAchievements is an array of
 * achievement IDs saved to the player's profile.
 */
function isBearAbilityUnlocked(
  abilityId,
  completedAchievements = []
) {
  const ability = getBearAbility(abilityId);

  if (!ability) return false;

  if (ability.unlockedByDefault) return true;

  return completedAchievements.includes(
    ability.achievementId
  );
}

/**
 * Return all unlocked Bear abilities.
 */
function getUnlockedBearAbilities(
  completedAchievements = []
) {
  return BEAR_CLASS.abilities.filter(
    ability => isBearAbilityUnlocked(
      ability.id,
      completedAchievements
    )
  );
}

/**
 * Return all locked Bear abilities.
 */
function getLockedBearAbilities(
  completedAchievements = []
) {
  return BEAR_CLASS.abilities.filter(
    ability => !isBearAbilityUnlocked(
      ability.id,
      completedAchievements
    )
  );
}

/**
 * Create a Bear character for combat.
 *
 * Achievements are provided by the profile system.
 */
function createBearCharacter(
  completedAchievements = []
) {
  return {
    classId: BEAR_CLASS.id,
    name: BEAR_CLASS.name,

    // Character stats
    maxSanity: BEAR_CLASS.stats.maxSanity,
    sanity: BEAR_CLASS.stats.startingSanity,
    armor: BEAR_CLASS.stats.startingArmor,

    bleed: 0,
    evolved: false,

    // Attack modifiers
    nextAttackBonus: 0,
    furyAttacks: 0,

    // Defensive modifiers
    nextAttackMultiplier: 1,
    nextAttackReduction: 0,
    damageReductionMultiplier: 1,
    damageReductionRounds: 0,

    // Counterattack state
    counterReady: false,
    counterDamage: 0,

    // Combat phase control
    endCombatPhase: false,

    // Achievement progression
    completedAchievements: [
      ...completedAchievements
    ],

    // Available abilities
    unlockedAbilities:
      getUnlockedBearAbilities(
        completedAchievements
      ).map(ability => ability.id)
  };
}

/**
 * Return the maximum allowed copies
 * of a Bear ability.
 */
function getBearCardCopyLimit(abilityId) {
  const ability = getBearAbility(abilityId);

  if (!ability) return 0;

  return BEAR_CLASS.deckRules
    .copiesByRarity[ability.rarity] ?? 0;
}

/**
 * Validate a Bear deck.
 *
 * deck is an array of ability IDs.
 * completedAchievements comes from the profile.
 */
function validateBearDeck(
  deck,
  completedAchievements = []
) {
  const errors = [];

  if (!Array.isArray(deck)) {
    return {
      valid: false,
      errors: ["Deck must be an array."]
    };
  }

  const counts = {};

  for (const abilityId of deck) {
    const ability = getBearAbility(abilityId);

    if (!ability) {
      errors.push(
        `Unknown Bear ability: ${abilityId}`
      );
      continue;
    }

    if (!isBearAbilityUnlocked(
      abilityId,
      completedAchievements
    )) {
      errors.push(
        `${ability.name} is not unlocked.`
      );
    }

    counts[abilityId] =
      (counts[abilityId] ?? 0) + 1;
  }

  // Enforce rarity copy limits
  for (const [abilityId, count] of
    Object.entries(counts)) {

    const ability = getBearAbility(abilityId);

    if (!ability) continue;

    const limit = getBearCardCopyLimit(
      abilityId
    );

    if (count > limit) {
      errors.push(
        `${ability.name} exceeds the ` +
        `${limit}-copy limit.`
      );
    }
  }

  // Cards that perform combat damage
  const combatIds = [
    "swipe",
    "bite",
    "claw",
    "bearHug",
    "charge",
    "maul",
    "lacerate",
    "counterClaw",
    "crushingClaws"
  ];

  // Count unique combat abilities in deck
  const uniqueCombatCards =
    combatIds.filter(
      id => (counts[id] ?? 0) > 0
    ).length;

  if (
    uniqueCombatCards <
    BEAR_CLASS.deckRules.minUniqueCombatCards
  ) {
    errors.push(
      "Deck requires at least 4 unique combat cards."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    cardCount: deck.length,
    uniqueCombatCards
  };
}

/**
 * Evolve the Bear.
 *
 * Evolved abilities will eventually receive
 * the 2x multiplier from the combat system.
 */
function evolveBear(player) {
  if (!player || player.classId !== "bear") {
    return false;
  }

  if (player.evolved) {
    return false;
  }

  player.evolved = true;
  return true;
}

/**
 * Retrieve Bear achievement information.
 */
function getBearAchievement(abilityId) {
  return BEAR_CLASS.achievements[abilityId] ?? null;
}

/**
 * Check whether a completed achievement
 * unlocks a Bear ability.
 */
function unlockBearAbility(
  player,
  achievementId
) {
  if (!player || player.classId !== "bear") {
    return false;
  }

  const ability = BEAR_CLASS.abilities.find(
    card => card.achievementId === achievementId
  );

  if (!ability) return false;

  if (!Array.isArray(player.completedAchievements)) {
    player.completedAchievements = [];
  }

  if (!Array.isArray(player.unlockedAbilities)) {
    player.unlockedAbilities = [];
  }

  if (!player.completedAchievements.includes(
    achievementId
  )) {
    player.completedAchievements.push(
      achievementId
    );
  }

  if (!player.unlockedAbilities.includes(
    ability.id
  )) {
    player.unlockedAbilities.push(
      ability.id
    );
  }

  return true;
}
