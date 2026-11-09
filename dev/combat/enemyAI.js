class EnemyAI {
	// The project supplies the health fraction below which the boss may heal.
	constructor({ healThreshold }) {
		this.healThreshold = healThreshold;
	}

	chooseAction(currentHealth, maxHealth) {
		// Always attack above the threshold; below it, randomize the heal chance each turn.
		if (currentHealth / maxHealth >= this.healThreshold) return "attack";
		const healChance = Math.random();
		return Math.random() < healChance ? "heal" : "attack";
	}
}
