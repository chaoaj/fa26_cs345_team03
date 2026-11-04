
/**
 * Whimsy & Woe - Energy Cards
 *
 * Defines the Energy cards available to every class.
 * Special Energy cards can be added later.
 */

const ENERGY_CARDS = {
  basicEnergy: {
    id: "basicEnergy",
    name: "Basic Energy",
    type: "energy",
    rarity: "common",

    unlockedByDefault: true,

    // Playing this card grants 1 energy.
    energyProvided: 1,

    // Basic Energy has no special effect.
    effect: null,

    // Artwork can be added later.
    image: null,

    // No copy limit on Basic Energy.
    maxCopies: Infinity
  }
};

function getEnergyCard(id) {
  return ENERGY_CARDS[id] ?? null;
}

function getAvailableEnergyCards(
  completedAchievements = []
) {
  return Object.values(ENERGY_CARDS).filter(
    card =>
      card.unlockedByDefault ||
      completedAchievements.includes(
        card.achievementId
      )
  );
}
