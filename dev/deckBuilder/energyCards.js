
/**
 * Whimsy & Woe - Energy Cards
 *
 * All classes can use any unlocked Energy card.
 * Achievement cards are unlocked through class progression.
 *
 * Energy cards cost 0 Energy to play.
 */

const ENERGY_CARDS = {};

// --------------------------------------------------
// CARD CREATION
// --------------------------------------------------

function addEnergyCard({
  id,
  name,
  rarity,
  energyProvided,
  image,
  unlockedByDefault = false,
  achievementId = null,
  effect = null
}) {

  ENERGY_CARDS[id] = {
    id,
    name,
    type: "energy",
    rarity,

    energyCost: 0,
    energyProvided,

    unlockedByDefault,
    achievementId,

    effect,
    image,

    // Energy copy limits based on rarity.
    maxCopies:
      rarity === "epic" || rarity === "legendary"
        ? 3
        : 5
  };
}

// --------------------------------------------------
// BASIC ENERGY CARDS
// --------------------------------------------------

addEnergyCard({
  id: "basicEnergy",
  name: "Basic Energy",
  rarity: "common",
  energyProvided: 1,
  image: "assets/cards/energy/Basic/basic_energy.png",
  unlockedByDefault: true
});

addEnergyCard({
  id: "doubleEnergy",
  name: "Double Energy",
  rarity: "common",
  energyProvided: 2,
  image: "assets/cards/energy/Basic/double_energy.png",
  unlockedByDefault: true
});

addEnergyCard({
  id: "vitalEnergy",
  name: "Vital Energy",
  rarity: "common",
  energyProvided: 1,
  image: "assets/cards/energy/Basic/vital_energy.png",
  unlockedByDefault: true,
  effect: {
    type: "restoreSanity",
    amount: 2
  }
});

addEnergyCard({
  id: "recoveryEnergy",
  name: "Recovery Energy",
  rarity: "rare",
  energyProvided: 1,
  image: "assets/cards/energy/Basic/recovery_energy.png",
  unlockedByDefault: true,
  effect: {
    type: "restoreSanity",
    amount: 5
  }
});

addEnergyCard({
  id: "fierceEnergy",
  name: "Fierce Energy",
  rarity: "rare",
  energyProvided: 1,
  image: "assets/cards/energy/Basic/fierce_energy.png",
  unlockedByDefault: true,
  effect: {
    type: "nextAttackDamage",
    amount: 5
  }
});

addEnergyCard({
  id: "protectiveEnergy",
  name: "Protective Energy",
  rarity: "epic",
  energyProvided: 2,
  image: "assets/cards/energy/Basic/protective_energy.png",
  unlockedByDefault: true,
  effect: {
    type: "reduceNextEnemyAttack",
    amount: 8
  }
});

// --------------------------------------------------
// BEAR ENERGY CARDS
// --------------------------------------------------

addEnergyCard({
  id: "steadyEnergy",
  name: "Steady Energy",
  rarity: "common",
  energyProvided: 1,
  image: "assets/cards/energy/Bear/steady_energy_bear.png",
  achievementId: "bear_steady_energy",
  effect: {
    type: "gainArmor",
    amount: 2
  }
});

addEnergyCard({
  id: "sturdyEnergy",
  name: "Sturdy Energy",
  rarity: "common",
  energyProvided: 1,
  image: "assets/cards/energy/Bear/sturdy_energy_bear.png",
  achievementId: "bear_sturdy_energy",
  effect: {
    type: "conditionalArmor",
    amount: 5,
    condition: {
      type: "sanityBelow",
      value: 50
    }
  }
});

addEnergyCard({
  id: "bleedingEnergy",
  name: "Bleeding Energy",
  rarity: "rare",
  energyProvided: 1,
  image: "assets/cards/energy/Bear/bleeding_energy_bear.png",
  achievementId: "bear_bleeding_energy",
  effect: {
    type: "nextBleedBonus",
    amount: 2
  }
});

addEnergyCard({
  id: "fortifiedEnergy",
  name: "Fortified Energy",
  rarity: "rare",
  energyProvided: 1,
  image: "assets/cards/energy/Bear/fortified_energy_bear.png",
  achievementId: "bear_fortified_energy",
  effect: {
    type: "gainArmor",
    amount: 8
  }
});

addEnergyCard({
  id: "ironResolve",
  name: "Iron Resolve",
  rarity: "epic",
  energyProvided: 2,
  image: "assets/cards/energy/Bear/iron_resolve_bear.png",
  achievementId: "bear_iron_resolve",
  effect: {
    type: "gainArmor",
    amount: 15
  }
});

// --------------------------------------------------
// BUNNY ENERGY CARDS
// --------------------------------------------------

addEnergyCard({
  id: "quickEnergy",
  name: "Quick Energy",
  rarity: "common",
  energyProvided: 1,
  image: "assets/cards/energy/Bunny/quick_energy_bunny.png",
  achievementId: "bunny_quick_energy",
  effect: {
    type: "nextAttackDamage",
    amount: 3
  }
});

addEnergyCard({
  id: "venomEnergy",
  name: "Venom Energy",
  rarity: "common",
  energyProvided: 1,
  image: "assets/cards/energy/Bunny/venom_energy_bunny.png",
  achievementId: "bunny_venom_energy",
  effect: {
    type: "nextPoisonBonus",
    amount: 2
  }
});

addEnergyCard({
  id: "toxicSurge",
  name: "Toxic Surge",
  rarity: "rare",
  energyProvided: 1,
  image: "assets/cards/energy/Bunny/toxic_surge_bunny.png",
  achievementId: "bunny_toxic_surge",
  effect: {
    type: "applyPoison",
    amount: 2
  }
});

addEnergyCard({
  id: "rapidEnergy",
  name: "Rapid Energy",
  rarity: "rare",
  energyProvided: 1,
  image: "assets/cards/energy/Bunny/rapid_energy_bunny.png",
  achievementId: "bunny_rapid_energy",
  effect: {
    type: "reduceNextCombatCost",
    amount: 1,
    minimum: 0
  }
});

addEnergyCard({
  id: "venomousBloom",
  name: "Venomous Bloom",
  rarity: "epic",
  energyProvided: 2,
  image: "assets/cards/energy/Bunny/venomous_bloom_bunny.png",
  achievementId: "bunny_venomous_bloom",
  effect: {
    type: "applyPoison",
    amount: 5
  }
});

// --------------------------------------------------
// OWL ENERGY CARDS
// --------------------------------------------------

addEnergyCard({
  id: "reserveEnergy",
  name: "Reserve Energy",
  rarity: "common",
  energyProvided: 1,
  image: "assets/cards/energy/Owl/reserve_energy_owl.png",
  achievementId: "owl_reserve_energy",
  effect: {
    type: "carryEnergy",
    amount: 1
  }
});

addEnergyCard({
  id: "heavyEnergy",
  name: "Heavy Energy",
  rarity: "common",
  energyProvided: 2,
  image: "assets/cards/energy/Owl/heavy_energy_owl.png",
  achievementId: "owl_heavy_energy",
  effect: {
    type: "nextAttackDamage",
    amount: -3
  }
});

addEnergyCard({
  id: "patientEnergy",
  name: "Patient Energy",
  rarity: "rare",
  energyProvided: 1,
  image: "assets/cards/energy/Owl/patient_energy_owl.png",
  achievementId: "owl_patient_energy",
  effect: {
    type: "nextRoundEnergy",
    amount: 1
  }
});

addEnergyCard({
  id: "hunterEnergy",
  name: "Hunter Energy",
  rarity: "rare",
  energyProvided: 1,
  image: "assets/cards/energy/Owl/hunter_energy_owl.png",
  achievementId: "owl_hunter_energy",
  effect: {
    type: "conditionalNextAttackDamage",
    amount: 8,
    condition: {
      type: "minimumEnergyCost",
      value: 2
    }
  }
});

addEnergyCard({
  id: "ancientInstinct",
  name: "Ancient Instinct",
  rarity: "legendary",
  energyProvided: 3,
  image: "assets/cards/energy/Owl/ancient_instinct_owl.png",
  achievementId: "owl_ancient_instinct",
  effect: {
    type: "reduceNextCombatCost",
    amount: 1,
    minimum: 0
  }
});

// --------------------------------------------------
// WOLF ENERGY CARDS
// --------------------------------------------------

addEnergyCard({
  id: "packInstinct",
  name: "Pack Instinct",
  rarity: "common",
  energyProvided: 1,
  image: "assets/cards/energy/Wolf/pack_instinct_wolf.png",
  achievementId: "wolf_pack_instinct",
  effect: {
    type: "nextAttackPackmateChance",
    chance: 0.10
  }
});

addEnergyCard({
  id: "predatoryFocus",
  name: "Predatory Focus",
  rarity: "rare",
  energyProvided: 1,
  image: "assets/cards/energy/Wolf/predatory_focus_wolf.png",
  achievementId: "wolf_predatory_focus",
  effect: {
    type: "nextAttackPackmateChance",
    chance: 0.25
  }
});

addEnergyCard({
  id: "howlingMomentum",
  name: "Howling Momentum",
  rarity: "rare",
  energyProvided: 2,
  image: "assets/cards/energy/Wolf/howling_momentum_wolf.png",
  achievementId: "wolf_howling_momentum",
  effect: {
    type: "nextPackmateDamage",
    amount: 5
  }
});

addEnergyCard({
  id: "callOfThePack",
  name: "Call of the Pack",
  rarity: "epic",
  energyProvided: 2,
  image: "assets/cards/energy/Wolf/call_of_the_pack_wolf.png",
  achievementId: "wolf_call_of_the_pack",
  effect: {
    type: "additionalPackmate",
    amount: 1
  }
});

addEnergyCard({
  id: "alphasBlessing",
  name: "Alpha's Blessing",
  rarity: "legendary",
  energyProvided: 3,
  image: "assets/cards/energy/Wolf/alphas_blessing_wolf.png",
  achievementId: "wolf_alphas_blessing",
  effect: {
    type: "guaranteedPackmate",
    amount: 1
  }
});

// --------------------------------------------------
// LOOKUP FUNCTIONS
// --------------------------------------------------

function getEnergyCard(id) {
  return ENERGY_CARDS[id] ?? null;
}

/**
 * Returns every Energy card unlocked by the player.
 *
 * completedAchievements is an array of achievement IDs.
 */
function getAvailableEnergyCards(
  completedAchievements = []
) {

  return Object.values(ENERGY_CARDS).filter(card => {
    return (
      card.unlockedByDefault ||
      completedAchievements.includes(card.achievementId)
    );
  });
}

/**
 * Returns whether a player has unlocked an Energy card.
 */
function isEnergyCardUnlocked(
  cardId,
  completedAchievements = []
) {

  const card = getEnergyCard(cardId);

  if (!card) {
    return false;
  }

  return (
    card.unlockedByDefault ||
    completedAchievements.includes(card.achievementId)
  );
}

/**
 * Checks whether another copy can be added to a deck.
 *
 * currentCopies is the number of copies already in the deck.
 */
function canAddEnergyCard(
  cardId,
  currentCopies,
  completedAchievements = []
) {

  const card = getEnergyCard(cardId);

  if (!card) {
    return false;
  }

  if (!isEnergyCardUnlocked(cardId, completedAchievements)) {
    return false;
  }

  return currentCopies < card.maxCopies;
}
