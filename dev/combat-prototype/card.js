// card.js
// One card: its sanity and how it is drawn.

const MAX_SANITY = 100;
const FLASH_FRAMES = 18; // about 0.3 seconds at 60 fps

class Card {
  constructor(name, x, y, baseColor) {
    this.name = name;
    this.x = x; // center of the card
    this.y = y;
    this.w = 150;
    this.h = 200;
    this.baseColor = baseColor;

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

  update() {
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

    stroke(30);
    strokeWeight(3);
    fill(bodyColor);
    rect(this.x, this.y, this.w, this.h, 12);

    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text(this.name, this.x, this.y);
    pop();

    this.drawSanityBar();
  }

  drawSanityBar() {
    const barW = this.w;
    const barH = 16;
    const left = this.x - barW / 2;
    const top = this.y - this.h / 2 - 30;
    const pct = constrain(this.displaySanity / MAX_SANITY, 0, 1);

    push();
    stroke(20);
    strokeWeight(2);
    fill(60);
    rect(left, top, barW, barH, 4);

    noStroke();
    fill(60, 200, 90);
    rect(left, top, barW * pct, barH, 4);

    // "Sanity" label above the bar
    fill(240);
    textAlign(CENTER, BOTTOM);
    textSize(14);
    text("Sanity", this.x, top - 4);
    pop();
  }
}
