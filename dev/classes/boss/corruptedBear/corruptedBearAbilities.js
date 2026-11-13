/** Whimsy & Woe - Corrupted Bear combat effects.
 * Standalone effects; the future combat engine handles drawing, spending energy,
 * the one-attack-per-turn restriction, and turn/status timing.
 */
function corruptedBearDealDamage(target, amount) {
  let damage = Math.max(0, Math.floor(amount));
  // Respect the next-attack modifiers applied by the Bear's debuffs.
  damage = Math.max(0, Math.floor(damage * (target.damageReductionMultiplier ?? 1)));
  const absorbed = Math.min(Math.max(0, target.armor ?? 0), damage);
  target.armor = Math.max(0, (target.armor ?? 0) - absorbed);
  target.sanity = Math.max(0, (target.sanity ?? 0) - (damage - absorbed));
  return damage;
}
function corruptedBearApplyDecay(target, stacks) {
  target.decay = Math.max(0, target.decay ?? 0) + Math.max(0, Math.floor(stacks));
}
function corruptedBearRottingSwipe(boss, target) {
  const damage = corruptedBearDealDamage(target, 4);
  corruptedBearApplyDecay(target, 1);
  return damage;
}
function corruptedBearInfectedBite(boss, target) {
  return corruptedBearDealDamage(target, (target.decay ?? 0) >= 3 ? 10 : 7);
}
function corruptedBearFesteringClaws(boss, target) {
  const damage = corruptedBearDealDamage(target, 2);
  corruptedBearApplyDecay(target, 2);
  return damage;
}
function corruptedBearMaddeningRoar(boss, target) {
  const damage = corruptedBearDealDamage(target, 3);
  target.nextAttackMultiplier = (target.nextAttackMultiplier ?? 1) * 0.75;
  return damage;
}
function corruptedBearRavagingCharge(boss, target) {
  const damage = corruptedBearDealDamage(target, 8);
  target.nextArmorMultiplier = (target.nextArmorMultiplier ?? 1) * 0.5;
  return damage;
}
function corruptedBearCrushingEmbrace(boss, target) {
  const damage = corruptedBearDealDamage(target, 8);
  corruptedBearApplyDecay(target, 1);
  return damage;
}
function corruptedBearWitheringMaul(boss, target) {
  const damage = corruptedBearDealDamage(target, 6);
  target.healingReductionMultiplier = 0.5;
  target.healingReductionTurns = Math.max(target.healingReductionTurns ?? 0, 2);
  return damage;
}
function corruptedBearSpreadingRot(boss, target) {
  corruptedBearApplyDecay(target, (target.decay ?? 0) >= 5 ? 3 : 2);
  return 0;
}
function corruptedBearCorruptionEruption(boss, target) {
  return corruptedBearDealDamage(target, 12 + Math.floor((target.decay ?? 0) / 3));
}
function corruptedBearGuardiansLastStand(boss, target) {
  if ((boss.sanity ?? 0) > (boss.maxSanity ?? 500) * 0.25) return 0;
  const damage = corruptedBearDealDamage(target, 16);
  corruptedBearApplyDecay(target, 2);
  return damage;
}

const CorruptedBearAbilities = {
  rottingSwipe: corruptedBearRottingSwipe,
  infectedBite: corruptedBearInfectedBite,
  festeringClaws: corruptedBearFesteringClaws,
  maddeningRoar: corruptedBearMaddeningRoar,
  ravagingCharge: corruptedBearRavagingCharge,
  crushingEmbrace: corruptedBearCrushingEmbrace,
  witheringMaul: corruptedBearWitheringMaul,
  spreadingRot: corruptedBearSpreadingRot,
  corruptionEruption: corruptedBearCorruptionEruption,
  guardiansLastStand: corruptedBearGuardiansLastStand
};

// Call once at the end of the affected character's round. Decay never falls off.
function resolveCorruptedDecay(target) {
  return corruptedBearDealDamage(target, target.decay ?? 0);
}
