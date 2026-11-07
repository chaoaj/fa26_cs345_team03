// card.js
// One card: its sanity and how it is drawn.

const MAX_SANITY = 100;
const FLASH_FRAMES = 18; // about 0.3 seconds at 60 fps

class Card {
  constructor(name, x, y, baseColor, w = 150, h = 200) {
    this.name = name;
    this.x = x; // center of the card
    this.y = y;
    this.w = w;
    this.h = h;

    // Where the card is heading. update() slides it there smoothly.
    this.targetX = x;
    this.targetY = y;
    this.targetW = w;
    this.targetH = h;

    this.baseColor = baseColor;
    this.showBar = true;
    this.isShadow = false; // true for shadow creatures (the enemy): dark body, glowing edge and eyes

    this.sanity = MAX_SANITY;
    this.displaySanity = MAX_SANITY; // bar slides toward sanity

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

  contains (mx, my) {
    return mx >= this.x - this.w / 2 && mx <= this.x + this.w / 2 &&
    my >= this.y - this.h / 2 && my <= this.y + this.h / 2;
  }

  update() {
    // Glide 20% of the way toward the target each frame
    this.x = lerp(this.x, this.targetX, 0.2);
    this.y = lerp(this.y, this.targetY, 0.2);
    this.w = lerp(this.w, this.targetW, 0.2);
    this.h = lerp(this.h, this.targetH, 0.2);

    this.displaySanity = lerp(this.displaySanity, this.sanity, 0.12);
    if (this.hitTimer > 0) this.hitTimer--;
    if (this.healTimer > 0) this.healTimer--;
  }

  draw() {
    push();
    rectMode(CENTER);

    // Card turns red briefly when hit, green briefly when healed
    let bodyColor = this.baseColor;
    if (this.hitTimer > 0) {
      bodyColor = lerpColor(this.baseColor, color(230, 40, 40), this.hitTimer / FLASH_FRAMES);
    } else if (this.healTimer > 0) {
      bodyColor = lerpColor(this.baseColor, color(70, 210, 110), this.healTimer / FLASH_FRAMES);
    }

    if (this.isShadow) {
      this.drawShadowBody(bodyColor);
    } else {
      this.drawForestBody(bodyColor);
    }
    pop();

    if (this.showBar) {
      this.drawSanityBar()
    }
    
  }

  // Your cards: warm wood with a cream inner border and dark cartoon outline
  drawForestBody(bodyColor) {
    stroke(INK);
    strokeWeight(3);
    fill(bodyColor);
    rect(this.x, this.y, this.w, this.h, 12);

    noFill();
    stroke(CREAM[0], CREAM[1], CREAM[2], 110);
    strokeWeight(1.5);
    rect(this.x, this.y, this.w - 12, this.h - 12, 8);

    noStroke();
    fill(CREAM);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(min(18, this.w * 0.17)); // smaller text on smaller cards
    text(this.name, this.x, this.y);
  }

  // Shadow creatures: dark purple, glowing pink edge, angry glowing eyes
  drawShadowBody(bodyColor) {
    drawingContext.shadowBlur = 25;
    drawingContext.shadowColor = "rgba(255, 70, 210, 0.7)";
    stroke(200, 60, 190);
    strokeWeight(3);
    fill(bodyColor);
    rect(this.x, this.y, this.w, this.h, 12);

    // Eyes
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = "rgba(255, 70, 210, 1)";
    noStroke();
    fill(GLOW_PINK);
    const eyeY = this.y - this.h * 0.12;
    for (const side of [-1, 1]) {
      push();
      translate(this.x + side * this.w * 0.17, eyeY);
      rotate(side * 0.35);
      ellipse(0, 0, this.w * 0.2, this.w * 0.09);
      pop();
    }
    drawingContext.shadowBlur = 0;

    fill(235, 190, 235);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(min(18, this.w * 0.15));
    text(this.name, this.x, this.y + this.h * 0.22);
  }

  drawSanityBar() {
    const barW = this.w;
    const barH = 16;
    const left = this.x - barW / 2;
    const top = this.y - this.h / 2 - 30;
    const pct = constrain(this.displaySanity / MAX_SANITY, 0, 1);

    push();
    stroke(INK);
    strokeWeight(2);
    fill(45, 25, 55);
    rect(left, top, barW, barH, 4);

    // Fill fades green (sane) -> gold (shaken) -> purple (losing it) as sanity drops
    noStroke();
    const green = color(150, 210, 90);
    const gold = color(235, 180, 70);
    const purple = color(180, 70, 210);
    fill(pct > 0.5 ? lerpColor(gold, green, (pct - 0.5) * 2) : lerpColor(purple, gold, pct * 2));
    rect(left, top, barW * pct, barH, 4);

    // "Sanity" label above the bar
    fill(CREAM);
    stroke(INK);
    strokeWeight(3);
    textAlign(CENTER, BOTTOM);
    textSize(14);
    text("Sanity", this.x, top - 4);
    pop();
  }
}
