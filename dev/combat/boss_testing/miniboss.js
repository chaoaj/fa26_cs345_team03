const MINIBOSS_TYPES = Object.freeze([
  Object.freeze({
    id: "cardThief",
    name: "Card Thief",
    ability: "stealCard",
    description: "At low sanity, steals a card from your hand.",
    selectionChance: 0.15
  }),
  Object.freeze({
    id: "attackNullifier",
    name: "Attack Nullifier",
    ability: "nullifyAttack",
    description: "At low sanity, nullifies your next attack.",
    selectionChance: 0.15
  }),
  Object.freeze({
    id: "minionCaller",
    name: "Minion Caller",
    ability: "summonMinion",
    description: "At low sanity, summons a minion that attacks with it.",
    selectionChance: 0.15
  }),
  Object.freeze({
    id: "criticalStriker",
    name: "Critical Striker",
    ability: "criticalAttack",
    description: "Has a 20% chance to deal double damage.",
    selectionChance: 0.15
  }),
  Object.freeze({
    id: "boostNullifier",
    name: "Boost Nullifier",
    ability: "nullifyStatBoost",
    description: "At low sanity, nullifies your next Heal.",
    selectionChance: 0.15
  })
]);

class MinibossAI {
  constructor({
    sanityThreshold = 0.25,
    criticalChance = 0.2,
    criticalMultiplier = 2,
    random = Math.random
  } = {}) {
    if (sanityThreshold < 0 || sanityThreshold > 1) {
      throw new RangeError("sanityThreshold must be between 0 and 1.");
    }
    if (criticalChance < 0 || criticalChance > 1) {
      throw new RangeError("criticalChance must be between 0 and 1.");
    }
    if (criticalMultiplier < 1) {
      throw new RangeError("criticalMultiplier must be at least 1.");
    }
    if (typeof random !== "function") {
      throw new TypeError("random must be a function.");
    }

    this.sanityThreshold = sanityThreshold;
    this.criticalChance = criticalChance;
    this.criticalMultiplier = criticalMultiplier;
    this.random = random;
  }

  chooseMiniboss() {
    const roll = this.random();
    let cumulativeChance = 0;
    for (const miniboss of MINIBOSS_TYPES) {
      cumulativeChance += miniboss.selectionChance;
      if (roll < cumulativeChance) return miniboss;
    }
    return null;
  }

  shouldUseAbility(currentSanity, maxSanity, threshold = this.sanityThreshold) {
    if (maxSanity <= 0) throw new RangeError("maxSanity must be greater than 0.");
    if (threshold < 0 || threshold > 1) {
      throw new RangeError("threshold must be between 0 and 1.");
    }
    return currentSanity / maxSanity <= threshold;
  }

  stealCard(playerCards, minibossCards) {
    if (!Array.isArray(playerCards) || !Array.isArray(minibossCards)) {
      throw new TypeError("Both card collections must be arrays.");
    }
    if (playerCards.length === 0) return null;

    const index = Math.floor(this.random() * playerCards.length);
    const [card] = playerCards.splice(index, 1);
    minibossCards.push(card);
    return card;
  }

  nullifyAttack(attack) {
    if (!attack || typeof attack !== "object") {
      throw new TypeError("attack must be an object.");
    }
    return { ...attack, damage: 0, nullified: true };
  }

  summonMinion(minions, minion = { name: "Minion", sanity: 50, maxSanity: 50 }) {
    if (!Array.isArray(minions)) throw new TypeError("minions must be an array.");
    const summonedMinion = { ...minion };
    minions.push(summonedMinion);
    return summonedMinion;
  }

  criticalAttack(damage) {
    const critical = this.random() < this.criticalChance;
    return {
      damage: Math.floor(damage * (critical ? this.criticalMultiplier : 1)),
      critical
    };
  }

  nullifyStatBoost(statBoost) {
    if (!statBoost || typeof statBoost !== "object") {
      throw new TypeError("statBoost must be an object.");
    }
    return { ...statBoost, amount: 0, nullified: true };
  }
}
