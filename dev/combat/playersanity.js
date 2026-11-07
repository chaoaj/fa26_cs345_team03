// playersanity.js
// Your shared sanity: one big bar under the arena.
// The enemy attacks this, your Heal buttons restore it, and you lose at 0.
// It has takeDamage() and heal() like a Card, so the attack and heal effects work on it.

class PlayerSanity {
  constructor(x, y, w, h) {
    this.x = x; // center of the bar (attacks fly here)
    this.y = y;
    this.w = w;
    this.h = h;

    this.sanity = MAX_SANITY;
    this.displaySanity = MAX_SANITY; // the bar slides toward the real value

    this.hitTimer = 0;  // frames left of red flash
    this.healTimer = 0; // frames left of green flash
  }

  takeDamage(amount) {
    this.sanity = Math.max(0, this.sanity - amount);
    this.hitTimer = FLASH_FRAMES;
  }

  heal(amount) {
    this.sanity = Math.min(MAX_SANITY, this.sanity + amount);
    this.healTimer = FLASH_FRAMES;
  }

  update() {
    this.displaySanity = lerp(this.displaySanity, this.sanity, 0.12);
    if (this.hitTimer > 0) this.hitTimer--;
    if (this.healTimer > 0) this.healTimer--;
  }

  draw() {
    const left = this.x - this.w / 2;
    const top = this.y - this.h / 2;
    const pct = constrain(this.displaySanity / MAX_SANITY, 0, 1);

    push();

    // Frame flashes red when you're hit, green when you heal
    let frame = color(INK);
    if (this.hitTimer > 0) {
      frame = lerpColor(color(INK), color(230, 50, 50), this.hitTimer / FLASH_FRAMES);
    } else if (this.healTimer > 0) {
      frame = lerpColor(color(INK), color(110, 230, 120), this.healTimer / FLASH_FRAMES);
    }

    // Shake a little when hit
    const shake = this.hitTimer > 0 ? random(-3, 3) * (this.hitTimer / FLASH_FRAMES) : 0;
    translate(shake, 0);

    // Empty bar
    stroke(frame);
    strokeWeight(this.hitTimer > 0 || this.healTimer > 0 ? 4 : 3);
    fill(45, 25, 55);
    rect(left, top, this.w, this.h, 8);

    // Fill: green (sane) -> gold (shaken) -> purple (losing it)
    noStroke();
    const green = color(150, 210, 90);
    const gold = color(235, 180, 70);
    const purple = color(180, 70, 210);
    fill(pct > 0.5 ? lerpColor(gold, green, (pct - 0.5) * 2) : lerpColor(purple, gold, pct * 2));
    rect(left, top, this.w * pct, this.h, 8);

    // Soft shine along the top of the fill
    fill(255, 255, 255, 45);
    rect(left + 4, top + 3, max(0, this.w * pct - 8), this.h * 0.3, 4);

    // Text on the bar
    fill(CREAM);
    stroke(INK);
    strokeWeight(4);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(15);
    text(this.sanity + " / " + MAX_SANITY, this.x, this.y + 1);

    pop();
  }
}
