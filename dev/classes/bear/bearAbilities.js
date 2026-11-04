
/**
 * Whimsy & Woe - Bear Class Abilities
 *
 * All Bear cards cost 1 energy.
 *
 * This module is independent of the combat system.
 * The combat system can call these functions later.
 */

// Helper functions

function dealBearDamage(target, amount) {
  const damage = Math.max(0, Math.floor(amount));

  // Armor absorbs damage before Sanity.
  const absorbed = Math.min(target.armor ?? 0, damage);

  target.armor = (target.armor ?? 0) - absorbed;
  target.sanity = Math.max(
    0,
    target.sanity - (damage - absorbed)
  );

  return damage;
}

function gainBearArmor(player, amount) {
  // Armor is permanent until damaged.
  player.armor = (player.armor ?? 0) + amount;
}

function healBear(player, amount) {
  player.sanity = Math.min(
    player.maxSanity,
    player.sanity + amount
  );
}

function applyBearBleed(target, amount) {
  target.bleed = (target.bleed ?? 0) + amount;
}

function bearAttack(player, target, damage) {
  let total = damage;

  // Charge adds damage to the next attack.
  if (player.nextAttackBonus > 0) {
    total += player.nextAttackBonus;
    player.nextAttackBonus = 0;
  }

  // Primal Fury strengthens the next 2 attacks.
  if (player.furyAttacks > 0) {
    total = Math.floor(total * 1.5);
    player.furyAttacks--;
  }

  return dealBearDamage(target, total);
}

// 1. Swipe
function bearSwipe(player, target) {
  return bearAttack(player, target, 8);
}

// 2. Bite
function bearBite(player, target) {
  return bearAttack(player, target, 12);
}

// 3. Thick Hide
function bearThickHide(player) {
  gainBearArmor(player, 8);
}

// 4. Roar
function bearRoar(player, target) {
  target.nextAttackMultiplier =
    (target.nextAttackMultiplier ?? 1) * 0.75;
}

// 5. Claw
function bearClaw(player, target) {
  const damage = bearAttack(player, target, 6);
  applyBearBleed(target, 3);
  return damage;
}

// 6. Bear Hug
function bearHug(player, target) {
  const damage = bearAttack(player, target, 10);
  target.nextAttackReduction =
    (target.nextAttackReduction ?? 0) + 5;
  return damage;
}

// 7. Honey Feast
function bearHoneyFeast(player) {
  healBear(player, 8);
}

// 8. Charge
function bearCharge(player, target) {
  const damage = bearAttack(player, target, 12);
  player.nextAttackBonus =
    (player.nextAttackBonus ?? 0) + 5;
  return damage;
}

// 9. Maul
function bearMaul(player, target) {
  const bonus = (target.bleed ?? 0) > 0 ? 8 : 0;
  return bearAttack(player, target, 16 + bonus);
}

// 10. Lacerate
function bearLacerate(player, target) {
  const damage = bearAttack(player, target, 10);
  applyBearBleed(target, 6);
  return damage;
}

// 11. Primal Fury
function bearPrimalFury(player) {
  player.furyAttacks = 2;
}

// 12. Winter Slumber
function bearWinterSlumber(player) {
  healBear(player, 20);
  gainBearArmor(player, 12);
  player.endCombatPhase = true;
}

// 13. Unbreakable
function bearUnbreakable(player) {
  gainBearArmor(player, 25);
  player.damageReductionMultiplier = 0.75;
  player.damageReductionRounds = 1;
}

// 14. Counter Claw
function bearCounterClaw(player) {
  gainBearArmor(player, 12);
  player.counterDamage = 20;
  player.counterReady = true;
}

// 15. Crushing Claws
function bearCrushingClaws(player, target) {
  const damage = bearAttack(player, target, 35);

  // Trigger all remaining Bleed immediately.
  const bleed = target.bleed ?? 0;
  let bonusDamage = 0;

  for (let amount = bleed; amount > 0; amount--) {
    bonusDamage += amount;
  }

  dealBearDamage(target, bonusDamage);
  target.bleed = 0;

  return damage + bonusDamage;
}

// Export abilities for the class registry.
const BearAbilities = {
  swipe: bearSwipe,
  bite: bearBite,
  thickHide: bearThickHide,
  roar: bearRoar,
  claw: bearClaw,
  bearHug: bearHug,
  honeyFeast: bearHoneyFeast,
  charge: bearCharge,
  maul: bearMaul,
  lacerate: bearLacerate,
  primalFury: bearPrimalFury,
  winterSlumber: bearWinterSlumber,
  unbreakable: bearUnbreakable,
  counterClaw: bearCounterClaw,
  crushingClaws: bearCrushingClaws
};