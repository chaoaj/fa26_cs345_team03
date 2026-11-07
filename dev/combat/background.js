// background.js
// The forest scene behind the battle: a purple shadow forest at the top,
// a mossy clearing below, framing trees, mushrooms, and drifting fireflies.
// The still parts are drawn ONCE into an image (makeBackground) so the game stays fast.

// Theme colors, shared with the other files
const INK = [35, 20, 15];          // dark brown outlines, like the cartoon art
const CREAM = [245, 230, 200];     // light text
const GOLD = [235, 190, 100];      // accents
const GLOW_PINK = [255, 70, 210];  // the shadow creatures' eyes

const HORIZON_Y = 235; // where the forest meets the clearing

let bgLayer;      // the pre-drawn still background
let fireflies = [];

// Draw the still background once. Call this in setup().
function makeBackground() {
  bgLayer = createGraphics(width, height);
  const g = bgLayer;
  randomSeed(7); // same "random" trees every time

  // Sky: deep purple, a little lighter near the horizon (misty)
  for (let y = 0; y < HORIZON_Y + 20; y++) {
    const t = y / (HORIZON_Y + 20);
    g.stroke(lerpColor(color(30, 14, 48), color(78, 40, 104), t));
    g.line(0, y, width, y);
  }

  // Far row of pines (lighter purple), then near row (darker)
  drawPineRow(g, HORIZON_Y + 10, 60, 120, color(66, 34, 88));
  drawPineRow(g, HORIZON_Y + 18, 40, 85, color(40, 20, 56));

  // Glowing eyes peeking out of the dark trees (kept away from the enemy card)
  const eyes = [[150, 185], [290, 205], [700, 200], [860, 180], [400, 222], [620, 225]];
  for (const [ex, ey] of eyes) drawGlowingEyes(g, ex, ey);

  // Ground: mossy green, darker toward the bottom
  for (let y = HORIZON_Y + 15; y < height; y++) {
    const t = (y - HORIZON_Y) / (height - HORIZON_Y);
    g.stroke(lerpColor(color(62, 78, 44), color(26, 34, 22), t));
    g.line(0, y, width, y);
  }

  // Purple mist where the forest meets the grass, so the edge isn't a hard line
  for (let i = 0; i < 40; i++) {
    g.stroke(90, 50, 110, map(i, 0, 40, 90, 0));
    g.line(0, HORIZON_Y + 15 + i, width, HORIZON_Y + 15 + i);
  }

  // Soft moss patches
  g.noStroke();
  for (let i = 0; i < 40; i++) {
    g.fill(80, 105, 55, 45);
    g.ellipse(random(width), random(HORIZON_Y + 30, height), random(60, 160), random(14, 30));
  }

  // Little flowers along the edge of the forest and the bottom edges
  for (let i = 0; i < 45; i++) {
    drawFlower(g, random(width), random(HORIZON_Y + 12, HORIZON_Y + 24));
  }
  for (let i = 0; i < 18; i++) {
    drawFlower(g, random(110, 320), random(height - 30, height - 6));
    drawFlower(g, random(680, 890), random(height - 30, height - 6));
  }

  // Framing trees on the left and right edges, with leafy tops
  drawTree(g, 18, false);
  drawTree(g, width - 18, true);

  // Mushrooms near the bottom corners
  drawMushroom(g, 140, height - 22, 1);
  drawMushroom(g, 168, height - 14, 0.7);
  drawMushroom(g, width - 140, height - 22, 1);
  drawMushroom(g, width - 168, height - 14, 0.7);

  // Fireflies start at random spots
  fireflies = [];
  for (let i = 0; i < 16; i++) {
    fireflies.push({
      x: random(width),
      y: random(HORIZON_Y - 60, height),
      phase: random(TWO_PI),  // so they don't all blink together
      seed: random(1000),     // each drifts its own way
    });
  }
  randomSeed(); // back to truly random for the rest of the game
}

// Draw the pre-made background, then the moving fireflies. Call this first in draw().
function drawBackground() {
  image(bgLayer, 0, 0);

  push();
  noStroke();
  blendMode(ADD); // fireflies add light, so they glow instead of looking like dots
  for (const f of fireflies) {
    // Wander slowly using noise, and wrap around the edges
    f.x += (noise(f.seed, frameCount * 0.005) - 0.5) * 1.2;
    f.y += (noise(f.seed + 50, frameCount * 0.005) - 0.5) * 1.2;
    if (f.x < 0) f.x = width;
    if (f.x > width) f.x = 0;
    if (f.y < HORIZON_Y - 60) f.y = height;
    if (f.y > height) f.y = HORIZON_Y - 60;

    const glow = (sin(frameCount * 0.05 + f.phase) + 1) / 2; // 0..1 pulse
    fill(120, 80, 10, 40 + 80 * glow);
    circle(f.x, f.y, 18);
    fill(255, 220, 120, 150 + 105 * glow);
    circle(f.x, f.y, 4.5);
  }
  blendMode(BLEND); // back to normal drawing
  pop();
}

// ---------- Pieces of the scene ----------

function drawPineRow(g, baseY, minH, maxH, c) {
  g.noStroke();
  g.fill(c);
  for (let x = -20; x < width + 20; x += random(28, 46)) {
    const h = random(minH, maxH);
    const w = h * 0.45;
    // Three stacked triangles make a pine
    for (let k = 0; k < 3; k++) {
      const top = baseY - h + k * h * 0.25;
      const half = w * (0.55 + k * 0.25);
      g.triangle(x, top, x - half, top + h * 0.45, x + half, top + h * 0.45);
    }
  }
  g.rect(0, baseY - 6, width, 30); // fill the gaps at the base of the trees
}

function drawGlowingEyes(g, x, y) {
  g.push();
  g.noStroke();
  g.drawingContext.shadowBlur = 12;
  g.drawingContext.shadowColor = "rgba(255, 70, 210, 0.9)";
  g.fill(GLOW_PINK);
  for (const side of [-1, 1]) {
    // Angry slanted eye
    g.push();
    g.translate(x + side * 7, y);
    g.rotate(side * 0.3);
    g.ellipse(0, 0, 9, 4.5);
    g.pop();
  }
  g.pop();
}

function drawFlower(g, x, y) {
  const colors = [[240, 120, 150], [245, 150, 80], [170, 110, 220], [250, 190, 170]];
  const c = random(colors);
  g.noStroke();
  g.fill(c[0], c[1], c[2], 200);
  for (let a = 0; a < TWO_PI; a += TWO_PI / 5) {
    g.circle(x + cos(a) * 2.6, y + sin(a) * 2.6, 3.6);
  }
  g.fill(255, 220, 110);
  g.circle(x, y, 2.4);
}

// A curving trunk on the edge of the screen with a leafy top
function drawTree(g, x, flip) {
  const dir = flip ? -1 : 1; // the right tree leans the other way
  g.push();
  g.stroke(INK);
  g.strokeWeight(3);
  g.fill(122, 72, 42);
  g.beginShape();
  g.vertex(x - 45 * dir, height + 10);
  g.bezierVertex(x - 10 * dir, height * 0.6, x - 40 * dir, 200, x + 10 * dir, 40);
  g.vertex(x + 45 * dir, 40);
  g.bezierVertex(x + 5 * dir, 220, x + 30 * dir, height * 0.6, x + 25 * dir, height + 10);
  g.endShape(CLOSE);

  // Bark lines
  g.stroke(85, 48, 28);
  g.strokeWeight(2);
  g.noFill();
  for (let k = 0; k < 6; k++) {
    const yy = 120 + k * 80;
    g.line(x - 6 * dir, yy, x - 2 * dir, yy + 30);
  }

  // Leafy canopy: overlapping blobs
  g.stroke(INK);
  g.strokeWeight(2.5);
  const leaves = [[0, 10, 120], [55, -5, 100], [-30, 50, 90], [95, 30, 80]];
  for (const [lx, ly, s] of leaves) {
    g.fill(92, 118, 62);
    g.circle(x + lx * dir, ly, s);
  }
  g.noStroke();
  g.fill(120, 150, 80, 160);
  g.circle(x + 40 * dir, -5, 50);
  g.pop();
}

function drawMushroom(g, x, y, s) {
  g.push();
  g.translate(x, y);
  g.scale(s);
  g.stroke(INK);
  g.strokeWeight(2);
  g.fill(235, 215, 185);
  g.rect(-5, -16, 10, 18, 3);           // stem
  g.fill(210, 75, 70);
  g.arc(0, -15, 38, 30, PI, TWO_PI, CHORD); // cap
  g.noStroke();
  g.fill(250, 200, 190);
  g.circle(-8, -22, 6);
  g.circle(6, -25, 5);
  g.circle(11, -18, 4);
  g.pop();
}
