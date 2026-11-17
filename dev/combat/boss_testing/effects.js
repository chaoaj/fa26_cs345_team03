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
    // Your attacks are golden firefly light; the enemy's are pink shadow magic
    const fromEnemy = this.from.side === "enemy";
    const trailC = fromEnemy ? [220, 60, 200] : [255, 170, 60];
    const outerC = fromEnemy ? [200, 40, 190] : [255, 150, 40];
    const coreC = fromEnemy ? [255, 170, 245] : [255, 230, 140];

    push();
    noStroke();
    for (let i = 0; i < this.trail.length; i++) {
      fill(trailC[0], trailC[1], trailC[2], map(i, 0, this.trail.length, 20, 160));
      circle(this.trail[i].x, this.trail[i].y, 6 + i * 1.5);
    }
    const p = this.currentPos();
    fill(outerC[0], outerC[1], outerC[2], 90);
    circle(p.x, p.y, 40);
    fill(coreC);
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

class CardShatter {
  constructor(card, targetX, targetY, rgb, onFinish = () => {}) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.rgb = rgb;
    this.fillColor = card.baseColor;
    this.frames = 0;
    this.burstFrames = 14;
    this.length = 55;
    this.done = false;
    this.onFinish = onFinish;

    // The card's edges
    const left = card.x - card.w / 2;
    const right = card.x + card.w / 2;
    const top = card.y - card.h / 2;
    const bottom = card.y + card.h / 2;

    // Break point: near the middle, a little random so every shatter looks different
    const bx = card.x + random(-card.w * 0.15, card.w * 0.15);
    const by = card.y + random(-card.h * 0.15, card.h * 0.15);

    // Points around the outside, in order: the 4 corners...
    const outside = [
      { x: left, y: top },
      { x: right, y: top },
      { x: right, y: bottom },
      { x: left, y: bottom },
    ];
    // ...plus 1 extra point somewhere on a random edge (makes 5 points = 5 triangles)
    const edge = floor(random(4));
    const a = outside[edge];
    const b = outside[(edge + 1) % 4];
    const k = random(0.3, 0.7);
    outside.splice(edge + 1, 0, { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });

    // Each triangle = break point + two neighboring outside points
    this.pieces = [];
    for (let i = 0; i < outside.length; i++) {
      const p1 = outside[i];
      const p2 = outside[(i + 1) % outside.length]; // % wraps the last one back to the first
      // The triangle's center: average of its 3 corners
      const gx = (bx + p1.x + p2.x) / 3;
      const gy = (by + p1.y + p2.y) / 3;
      this.pieces.push({
        x: gx,
        y: gy,
        // Corners stored relative to the center, so the piece can spin around its middle
        pts: [
          [bx - gx, by - gy],
          [p1.x - gx, p1.y - gy],
          [p2.x - gx, p2.y - gy],
        ],
        vx: (gx - card.x) * 0.15 + random(-1.5, 1.5),
        vy: (gy - card.y) * 0.15 + random(-2.5, 0.5),
        rot: 0,
        spin: random(-0.2, 0.2),
        delay: random(0, 10),
      });
    }
  }
  update() {
    if (this.done) {
      return;
    }
    this.frames++;
    for (const p of this.pieces) {
      if (this.frames < this.burstFrames) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.88;
        p.vy *= 0.88;
      } else if (this.frames > this.burstFrames + p.delay) {
        p.x = lerp(p.x, this.targetX, 0.14);
        p.y = lerp(p.y, this.targetY, 0.14);
      }
      p.rot += p.spin;
    }
    if (this.frames >= this.length) {
      this.done = true;
      this.onFinish();
    }
  }

  draw() {
    const shrink = this.frames < this.burstFrames ? 1 : map(this.frames, this.burstFrames, this.length, 1, 0.25);
    const s = shrink;

    push();
    for (const p of this.pieces) {
      push();
      translate(p.x, p.y);
      rotate(p.rot);

      const x0 = p.pts[0][0] * s, y0 = p.pts[0][1] * s; // break point
      const x1 = p.pts[1][0] * s, y1 = p.pts[1][1] * s;
      const x2 = p.pts[2][0] * s, y2 = p.pts[2][1] * s;

      // The piece itself: card color with the normal dark outline
      drawingContext.shadowBlur = 0;
      stroke(INK);
      strokeWeight(1.5);
      fill(this.fillColor);
      triangle(x0, y0, x1, y1, x2, y2);

      pop();
    }
    pop();
  }
}


class CrystalShatter {
  constructor(x, y) {
    this.frames = 0;
    this.length = 35;
    this.done = false;
    this.pieces = [];

    for (let i = 0; i < 7; i++) {
      this.pieces.push({
        x: x,
        y: y,
        vx: random(-2.5, 2.5),
        vy: random(-3, 1),
        size: random(3, 7),
      });
    }
  }

  update() {
    this.frames++;

    for (const p of this.pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
    }

    if (this.frames >= this.length) {
      this.done = true;
    }
  }

  draw() {
    const alpha = map(this.frames, 0, this.length, 255, 0);

    push();
    noStroke();

    for (const p of this.pieces) {
      fill(170, 120, 255, alpha);

      triangle(
        p.x, p.y - p.size,
        p.x + p.size, p.y + p.size,
        p.x - p.size, p.y + p.size,
      );
    }

    pop();
  }
}

class FloatingText {
  constructor(message, x, y, rgb = [255, 220, 120], fontSize = 16) {
    this.message = message;
    this.x = x;
    this.y = y;
    this.frames = 0;
    this.length = 60;
    this.done = false;
    this.rgb = rgb;
    this.fontSize = fontSize;
  }

  update() {
    this.frames++;
    this.y -= 0.7;

    if (this.frames >= this.length) {
      this.done = true;
    }
  }

  draw() {
    const alpha = map(this.frames, 0, this.length, 255, 0);

    push();
    textAlign(CENTER, CENTER);
    textSize(this.fontSize);
    textStyle(BOLD);

    stroke(35, 20, 15, alpha);
    strokeWeight(3);
    fill(this.rgb[0], this.rgb[1], this.rgb[2], alpha);

    text(this.message, this.x, this.y);
    pop();
  }
}