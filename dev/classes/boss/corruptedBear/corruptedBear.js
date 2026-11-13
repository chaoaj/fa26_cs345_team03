/** Whimsy & Woe - Corrupted Bear boss definition. Load before combat integration. */
const CORRUPTED_BEAR_CLASS = {
  id: "corruptedBear",
  name: "The Ruined Guardian",
  type: "boss",
  playable: false,
  description: "A guardian consumed by Decay. It cannot generate Armor or restore Sanity.",
  image: "assets/cards/class/Corrupted_Bear_Class.png",
  stats: { maxSanity: 500, startingSanity: 500, startingArmor: 0 },
  combatRules: {
    handSize: 7,
    maxAttacksPerTurn: 1,
    energyResetsEachTurn: true,
    canGainArmor: false,
    canHeal: false,
    decayDamagePerStack: 1,
    decayNaturallyDecreases: false
  },
  deckRules: { totalCards: 40, combatCards: 20, energyCards: 20 },
  // Replace image filenames below if your uploaded PNG filenames differ.
  abilities: [
    { id: "rottingSwipe", name: "Rotting Swipe", rarity: "common", copies: 3, energyCost: 1, image: "assets/cards/boss/corrupted_bear_combat/01_Rotting_Swipe.png", effect: "Deal 4 damage and apply 1 Decay." },
    { id: "infectedBite", name: "Infected Bite", rarity: "common", copies: 3, energyCost: 1, image: "assets/cards/boss/corrupted_bear_combat/02_Infected_Bite.png", effect: "Deal 7 damage, or 10 if the target has at least 3 Decay." },
    { id: "festeringClaws", name: "Festering Claws", rarity: "common", copies: 3, energyCost: 1, image: "assets/cards/boss/corrupted_bear_combat/03_Festering_Claws.png", effect: "Deal 2 damage and apply 2 Decay." },
    { id: "maddeningRoar", name: "Maddening Roar", rarity: "rare", copies: 2, energyCost: 1, image: "assets/cards/boss/corrupted_bear_combat/04_Maddening_Roar.png", effect: "Deal 3 damage; target's next damaging attack deals 25% less damage." },
    { id: "ravagingCharge", name: "Ravaging Charge", rarity: "rare", copies: 2, energyCost: 2, image: "assets/cards/boss/corrupted_bear_combat/05_Ravaging_Charge.png", effect: "Deal 8 damage; target's next Armor-generating card grants 50% less Armor." },
    { id: "crushingEmbrace", name: "Crushing Embrace", rarity: "rare", copies: 2, energyCost: 2, image: "assets/cards/boss/corrupted_bear_combat/06_Crushing_Embrace.png", effect: "Deal 8 damage and apply 1 Decay." },
    { id: "witheringMaul", name: "Withering Maul", rarity: "epic", copies: 2, energyCost: 2, image: "assets/cards/boss/corrupted_bear_combat/07_Withering_Maul.png", effect: "Deal 6 damage; target restores 50% less Sanity for its next 2 turns." },
    { id: "spreadingRot", name: "Spreading Rot", rarity: "epic", copies: 1, energyCost: 2, image: "assets/cards/boss/corrupted_bear_combat/08_Spreading_Rot.png", effect: "Apply 2 Decay, or 3 if the target already has at least 5 Decay." },
    { id: "corruptionEruption", name: "Corruption Eruption", rarity: "legendary", copies: 1, energyCost: 3, image: "assets/cards/boss/corrupted_bear_combat/09_Corruption_Eruption.png", effect: "Deal 12 damage plus 1 per 3 Decay stacks on the target." },
    { id: "guardiansLastStand", name: "Guardian's Last Stand", rarity: "legendary", copies: 1, energyCost: 3, image: "assets/cards/boss/corrupted_bear_combat/10_Guardians_Last_Stand.png", effect: "At 25% Sanity or below, deal 16 damage and apply 2 Decay." }
  ]
};

function getCorruptedBearAbility(id) {
  return CORRUPTED_BEAR_CLASS.abilities.find(card => card.id === id) ?? null;
}

function getCorruptedBearCombatDeck() {
  return CORRUPTED_BEAR_CLASS.abilities.flatMap(card => Array(card.copies).fill(card.id));
}

function createCorruptedBearCharacter() {
  return {
    classId: CORRUPTED_BEAR_CLASS.id,
    name: CORRUPTED_BEAR_CLASS.name,
    isBoss: true,
    maxSanity: 500,
    sanity: 500,
    armor: 0,
    bleed: 0,
    decay: 0,
    energy: 0,
    attacksUsedThisTurn: 0,
    nextAttackMultiplier: 1,
    nextAttackReduction: 0,
    nextArmorMultiplier: 1,
    healingReductionMultiplier: 1,
    healingReductionTurns: 0,
    combatDeck: getCorruptedBearCombatDeck(),
    // Energy cards will be added when their exact effects and copy counts are finalized.
    energyDeck: []
  };
}
