// effects.js
// Attack and heal animations. Each has update(), draw(), and a `done` flag.

// Orb that arcs from attacker to target. onHit runs when it arrives.
class AttackProjectile {
  constructor(from, to, onHit) {
    this.from = from;
    this.to = to;
    this.onHit = onHit;
    this.t = 0;          // 0 = start, 1 = hit
    this.speed = 1 / 28; // ~28 frames to travel
    this.trail = [];
    this.done = false;
  }

  currentPos() {
    // Cards are stacked vertically, so the orb arcs out to the side
    const x = lerp(this.from.x, this.to.x, this.t) + sin(this.t * PI) * 70;
    const y = lerp(this.from.y, this.to.y, this.t);
    return { x, y };
  }

  update() {
    this.t += this.speed;
    this.trail.push(this.currentPos());
    if (this.trail.length > 10) this.trail.shift();

    if (this.t >= 1) {
      this.done = true;
      this.onHit();
    }
  }

  draw() {
    push();
    noStroke();
    for (let i = 0; i < this.trail.length; i++) {
      fill(255, 120, 40, map(i, 0, this.trail.length, 20, 160));
      circle(this.trail[i].x, this.trail[i].y, 6 + i * 1.5);
    }
    const p = this.currentPos();
    fill(255, 90, 30, 90);
    circle(p.x, p.y, 40);
    fill(255, 200, 80);
    circle(p.x, p.y, 20);
    pop();
  }
}

// Green "+" shapes rising off the card being healed. onFinish runs at the end.
class HealBurst {
  constructor(card, onFinish) {
    this.onFinish = onFinish;
    this.frames = 0;
    this.length = 32;
    this.done = false;
    this.particles = [];
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: card.x + random(-card.w / 2, card.w / 2),
        y: card.y + random(0, card.h / 2),
        vy: random(-3, -1.5),
        size: random(12, 22),
      });
    }
  }

  update() {
    this.frames++;
    for (const p of this.particles) p.y += p.vy;
    if (this.frames >= this.length) {
      this.done = true;
      this.onFinish();
    }
  }

  draw() {
    push();
    const alpha = this.frames < this.length / 2
      ? 255
      : map(this.frames, this.length / 2, this.length, 255, 0);
    rectMode(CENTER);
    stroke(20, 90, 40, alpha);
    strokeWeight(1.5);
    fill(110, 255, 140, alpha);
    for (const p of this.particles) {
      const thick = p.size / 3;
      rect(p.x, p.y, p.size, thick, 2);
      rect(p.x, p.y, thick, p.size, 2);
    }
    pop();
  }
}
