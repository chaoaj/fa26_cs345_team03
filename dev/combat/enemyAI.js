class EnemyAI {
	constructor({ healThreshold, healChance }) {
		this.healThreshold = healThreshold;
		this.healChance = healChance;
	}

	chooseAction(currentHealth, maxHealth) {
		if (currentHealth / maxHealth >= this.healThreshold) return "attack";
		return Math.random() < this.healChance ? "heal" : "attack";
	}
}
