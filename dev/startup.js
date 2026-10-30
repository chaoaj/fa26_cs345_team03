function drawStartupScreen() {
  push();

  // Forest background
  image(forestBackground, 0, 0, width, height);

  // Animated corrupted eyes and shadow-fire
  drawShadowFire();

  // Ground corruption appears behind the title
  drawGroundCorruption();

  // Subtle particles rising from the corrupted ground
  drawGroundEmbers();

  // Animated magical title.
  drawMagicTitle();

  // Interactive PLAY button
  drawPlayButton();

  // Custom magical cursor (drawn last)
  drawCursorParticles();
  drawMagicCursor();

  pop();
}

// Approximate positions of the corrupted eyes
// Based on a 1000 x 650 canvas


// Exact eye coordinates for all 7 corrupted animals
const corruptedAnimals = [
  {
    name: "Owl",
    eyes: [{x:229,y:227}, {x:248,y:227}],
    size: 1
  },
  {
    name: "Spiky Beast",
    eyes: [{x:300,y:316}, {x:322,y:317}],
    size: 1
  },
  {
    name: "Deer",
    eyes: [{x:463,y:271}, {x:481,y:271}],
    size: 1.2
  },
  {
    name: "Small Beast",
    eyes: [{x:552,y:363}, {x:577,y:363}],
    size: 1
  },
  {
    name: "Rabbit",
    eyes: [{x:682,y:325}, {x:701,y:325}],
    size: 1
  },
  {
    name: "Bear",
    eyes: [{x:791,y:254}, {x:816,y:252}],
    size: 1.2
  },
  {
    name: "Main Villain",
    eyes: [{x:538,y:119}, {x:581,y:124}],
    size: 2,
    villain: true
  }
];


function drawShadowFire() {
  const time = millis() * 0.001;

  push();
  noStroke();

  for (const animal of corruptedAnimals) {
    const villain = animal.villain === true;

    for (const eye of animal.eyes) {
      const pulse =
        0.5 + 0.5 * sin(time * 2.8 + eye.x * 0.03);

      // Dark purple magical aura
      fill(85, 15, 145, 20 + pulse * 25);
      ellipse(
        eye.x, eye.y,
        villain ? 40 : 28,
        villain ? 30 : 20
      );

      // Supernatural fire made from moving particles
      const particleCount = villain ? 32 : 20;
      const rise = villain ? 38 : 23;

      for (let i = 0; i < particleCount; i++) {
        const seed = i * 17.37 + eye.x * 0.41;

        // Continuous particle lifecycle
        const progress =
          (time * (0.25 + (i % 5) * 0.035)
          + i / particleCount) % 1;

        // Start near the eye
        const startX =
          eye.x + sin(seed) * (villain ? 12 : 7);

        const startY =
          eye.y + cos(seed * 1.7) * 4;

        // Determine which direction the energy should spill
const centerX =
  (animal.eyes[0].x + animal.eyes[1].x) / 2;

const side = eye.x < centerX ? -1 : 1;

// More dramatic outward flow for the main villain
const outwardForce = villain ? 24 : 15;

// Irregular movement, like magical fire in the wind
const turbulence =
  sin(time * 2.8 + seed) * 3 +
  sin(progress * 10 + seed) * 4;

// Energy rises and spills outward
const x =
  startX +
  side * outwardForce * pow(progress, 1.3) +
  turbulence * progress;

const y =
  startY -
  progress * rise +
  sin(time * 3 + seed) * 2 * progress;

        // Fade smoothly over the lifetime
        const fade = sin(progress * PI);

        // Particle shrinks as it rises
        const size =
          (1 - progress) * (villain ? 4.5 : 3.2) + 0.5;

        // Dark outer smoke
        fill(65, 10, 110, fade * 65);
        circle(x, y, size * 3.2);

        // Purple flame energy
        fill(160, 45, 215, fade * 115);
        circle(x, y, size * 1.4);

        // Occasional bright ember
        if (i % 5 === 0) {
          fill(245, 115, 255, fade * 180);
          circle(x, y, size * 0.5);
        }
      }

      // Bright glowing eyes
      fill(170, 35, 225, 30 + pulse * 50);
      ellipse(
        eye.x, eye.y,
        villain ? 25 : 18,
        villain ? 17 : 12
      );

      fill(235, 75, 255, 65 + pulse * 75);
      ellipse(
        eye.x, eye.y,
        villain ? 16 : 12,
        villain ? 11 : 8
      );

      fill(255, 165, 255, 120 + pulse * 130);
      ellipse(
        eye.x, eye.y,
        villain ? 8 : 5,
        villain ? 6 : 4
      );
    }
  }

  pop();
}



let titleTime = 0;
let titleFlames = [];
let titleMask = null;

// Create a mask so flames spawn on actual letters.
function createTitleMask() {
  titleMask = createGraphics(width, height);
  titleMask.pixelDensity(1);

  titleMask.clear();
  titleMask.textAlign(CENTER, CENTER);
  titleMask.textStyle(BOLD);
  titleMask.textSize(65);
  titleMask.noStroke();
  titleMask.fill(255);

  titleMask.text("Whimsy & Woe", width / 2, 505);
  titleMask.loadPixels();
}

// Check whether a position is inside the title.
function isTitlePixel(x, y) {
  if (!titleMask) return false;

  x = Math.floor(x);
  y = Math.floor(y);

  if (x < 0 || x >= width || y < 0 || y >= height) {
    return false;
  }

  const index = 4 * (y * width + x) + 3;
  return titleMask.pixels[index] > 100;
}

function drawMagicTitle() {
  push();

  titleTime += Math.min(deltaTime, 50) * 0.001;

  const titleX = width / 2;
  const titleY = 505;
  const titleSize = 65;
  const ctx = drawingContext;

  // Generate the text mask once.
  if (!titleMask) {
    createTitleMask();
  }

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(titleSize);

  // Multiple moving waves of corruption.
  const wave1 = Math.sin(titleTime * 0.9) * 85;
  const wave2 = Math.sin(titleTime * 1.4) * 35;

  const gradient = ctx.createLinearGradient(
    titleX - 270 + wave1,
    titleY - 35 + wave2,
    titleX + 270 + wave1,
    titleY + 35 - wave2
  );

  gradient.addColorStop(0.00, "#180B24");
  gradient.addColorStop(0.18, "#56316A");
  gradient.addColorStop(0.35, "#B07AC0");
  gradient.addColorStop(0.48, "#2A103B");
  gradient.addColorStop(0.65, "#86529B");
  gradient.addColorStop(0.82, "#381847");
  gradient.addColorStop(1.00, "#1A0B25");

  // Irregular magical flickering.
  const flicker = noise(titleTime * 3.5);
  const glow = 14 + flicker * 12;

  // Draw the primary title.
  ctx.save();

  ctx.globalAlpha = 0.94;
  ctx.shadowColor = "rgba(125, 45, 175, 0.75)";
  ctx.shadowBlur = 0;

  ctx.fillStyle = gradient;
  ctx.strokeStyle = "rgba(170, 105, 195, 0.8)";
  ctx.lineWidth = 1.4;

  ctx.strokeText("Whimsy & Woe", titleX, titleY);
  ctx.fillText("Whimsy & Woe", titleX, titleY);

  ctx.restore();

  pop();

  // Draw corrupted flames attached to letters.
  updateTitleFlames();
}


function updateTitleFlames() {
  if (!titleMask) return;

  // More consistent spawning
  if (frameCount % 3 === 0 && titleFlames.length < 32) {

    for (let attempt = 0; attempt < 100; attempt++) {
      const x = floor(random(width / 2 - 250,
                             width / 2 + 250));

      const y = floor(random(475, 530));

      // Spawn near the upper edges of letters
      if (isTitlePixel(x, y) &&
          !isTitlePixel(x, y - 4)) {

        titleFlames.push({
          x: x,
          y: y,
          vx: random(-0.45, 0.45),
          vy: random(-1.5, -0.7),
          size: random(2, 4.5),
          life: 130,
          maxLife: 130,
          decay: random(2, 3.5),
          phase: random(TWO_PI)
        });

        break;
      }
    }
  }

  push();
  noStroke();

  for (let i = titleFlames.length - 1; i >= 0; i--) {
    const p = titleFlames[i];

    p.x += p.vx +
      sin(titleTime * 4 + p.phase) * 0.4;

    p.y += p.vy;
    p.life -= p.decay;

    const fade = constrain(p.life / p.maxLife, 0, 1);

    // Outer dark magical glow
    fill(100, 30, 145, fade * 65);
    ellipse(
      p.x,
      p.y,
      p.size * 3,
      p.size * 4
    );

    // Purple flame
    fill(155, 65, 205, fade * 130);
    ellipse(
      p.x,
      p.y,
      p.size,
      p.size * 2.5
    );

    // Bright center
    fill(215, 125, 235, fade * 160);
    ellipse(
      p.x,
      p.y,
      p.size * 0.4,
      p.size
    );

    if (p.life <= 0) {
      titleFlames.splice(i, 1);
    }
  }

  pop();
}

function drawGroundCorruption() {
  push();
  noStroke();

  const time = millis() * 0.001;

  // Slowly spread the corruption across the grass
  const growth = constrain(millis() / 5000, 0, 1);
  const pulse = 1 + sin(time * 0.7) * 0.035;

  // Separate patches prevent a straight horizontal band
  const patches = [
    { x: 365, y: 531, rx: 75, ry: 24, seed: 10 },
    { x: 445, y: 544, rx: 90, ry: 36, seed: 25 },
    { x: 520, y: 525, rx: 65, ry: 20, seed: 40 },
    { x: 585, y: 550, rx: 85, ry: 34, seed: 55 },
    { x: 660, y: 532, rx: 75, ry: 25, seed: 70 }
  ];

  for (const patch of patches) {

    // Multiple soft layers for each patch
    for (let layer = 2; layer >= 0; layer--) {

      const scale = (0.5 + growth * 0.5) * pulse;

      const radiusX = patch.rx * scale * (1 + layer * 0.18);
      const radiusY = patch.ry * scale * (1 + layer * 0.20);

      fill(
        95 + layer * 8,
        25,
        150 + layer * 8,
        22 - layer * 5
      );

      beginShape();

      for (let i = 0; i < 80; i++) {
        const angle = i / 80 * TWO_PI;

        const nx = cos(angle);
        const ny = sin(angle);

        const n = noise(
          patch.seed + nx * 2.2,
          patch.seed + ny * 2.2,
          time * 0.12
        );

        // Uneven boundaries
        const distortion = map(n, 0, 1, 0.35, 1.65);

        const x =
          patch.x + nx * radiusX * distortion;

        const y =
          patch.y + ny * radiusY * distortion;

        vertex(x, y);
      }

      endShape(CLOSE);
    }
  }

  pop();
}

let groundEmbers = [];
function drawGroundEmbers() {

  const time = millis() * 0.001;
  const growth = min(1, millis() / 8000);

  // Create occasional particles
  if (
    frameCount % 10 === 0 &&
    groundEmbers.length < 18
  ) {

    // Spawn within the corrupted area
    const angle = random(TWO_PI);
    const distance = sqrt(random());

    const spreadX = 230 * growth;
    const spreadY = 50 * growth;

    groundEmbers.push({

      x: width / 2 +
        cos(angle) * distance * spreadX,

      y: 525 +
        sin(angle) * distance * spreadY,

      vx: random(-0.2, 0.2),
      vy: random(-0.65, -0.2),

      size: random(1, 2.5),

      life: 100,
      decay: random(1.2, 2.5),

      phase: random(TWO_PI)
    });
  }

  push();
  noStroke();

  for (
    let i = groundEmbers.length - 1;
    i >= 0;
    i--
  ) {

    const p = groundEmbers[i];

    // Gentle floating movement
    p.x +=
      p.vx +
      sin(time * 1.8 + p.phase) * 0.15;

    p.y += p.vy;

    p.life -= p.decay;

    // Soft outer glow
    fill(100, 35, 150, p.life * 0.22);
    circle(p.x, p.y, p.size * 3);

    // Small glowing center
    fill(185, 95, 220, p.life * 0.7);
    circle(p.x, p.y, p.size);

    // Remove expired particles
    if (p.life <= 0) {
      groundEmbers.splice(i, 1);
    }
  }

  pop();
}



let cursorParticles = [];

// ==========================================
// CUSTOM MAGICAL MOUSE CURSOR
// ==========================================

function drawMagicCursor() {
  push();

  // Hide the normal mouse pointer
  noCursor();

  const time = millis() * 0.001;
  const x = mouseX;
  const y = mouseY;

  // Gentle pulsing effect
  const pulse = sin(time * 3) * 0.5 + 0.5;

  noStroke();

  // Soft golden aura
  fill(255, 210, 110, 30 + pulse * 15);
  circle(x, y, 36 + pulse * 6);

  // Warm middle glow
  fill(255, 225, 155, 80 + pulse * 25);
  circle(x, y, 22 + pulse * 3);

  // Bright golden center
  fill(255, 235, 175, 220);
  circle(x, y, 11);

  // Tiny ivory core
  fill(255, 255, 240);
  circle(x, y, 4);

  pop();
}


// ==========================================
// MAGICAL PARTICLE TRAIL
// ==========================================

function drawCursorParticles() {

  // Only spawn particles while moving
  const moving =
    abs(mouseX - pmouseX) +
    abs(mouseY - pmouseY) > 1;

  if (
    moving &&
    frameCount % 3 === 0 &&
    cursorParticles.length < 18
  ) {
    cursorParticles.push({
      x: mouseX + random(-5, 5),
      y: mouseY + random(-5, 5),
      vx: random(-0.4, 0.4),
      vy: random(-0.8, -0.2),
      size: random(1.5, 3.5),
      life: 100
    });
  }

  push();
  noStroke();

  for (let i = cursorParticles.length - 1; i >= 0; i--) {
    const p = cursorParticles[i];

    // Drift upward
    p.x += p.vx;
    p.y += p.vy;

    // Slowly disappear
    p.life -= 3;

    // Outer purple glow
    fill(255, 205, 110, p.life * 0.35);
    circle(p.x, p.y, p.size * 3);

    // Bright particle center
    fill(255, 240, 175, p.life * 1.5);
    circle(p.x, p.y, p.size);

    // Remove expired particles
    if (p.life <= 0) {
      cursorParticles.splice(i, 1);
    }
  }

  pop();
}


// ==========================================
// PLAY BUTTON
// ==========================================

const playButton = {
  x: 500,
  y: 575,
  w: 170,
  h: 48
};

// Check whether the mouse is over PLAY
function isMouseOverPlay() {
  return (
    mouseX >= playButton.x - playButton.w / 2 &&
    mouseX <= playButton.x + playButton.w / 2 &&
    mouseY >= playButton.y - playButton.h / 2 &&
    mouseY <= playButton.y + playButton.h / 2
  );
}

// Draw the PLAY button


let playPurification = 0;

// Where the golden restoration originates
let purificationX = 500;
let purificationY = 575;

function drawPlayButton() {
  push();

  const hovered = isMouseOverPlay();
  const time = millis() * 0.001;

  const x = playButton.x;
  const y = playButton.y;
  const w = playButton.w;
  const h = playButton.h;

  // ========================================
  // SLOW PURIFICATION
  // ========================================

  if (hovered) {
    // Record where the player is touching
    purificationX = mouseX;
    purificationY = mouseY;

    // Slowly restore the button
    playPurification = min(1, playPurification + 0.003);
  } else {
    // Corruption slowly returns
    playPurification = max(0, playPurification - 0.0015);
  }

  const purity = playPurification;
  const pulse = sin(time * 2.5) * 0.5 + 0.5;

  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  const ctx = drawingContext;

  // ========================================
  // OUTER PURPLE GLOW
  // ========================================

  noStroke();
  fill(105, 35, 150, 25 + pulse * 12);
  rect(x, y, w + 12, h + 12, 15);

  // ========================================
  // CORRUPTED BASE
  // ========================================

  stroke(155, 85, 185, 180);
  strokeWeight(2);
  fill(52, 25, 70, 240);
  rect(x, y, w, h, 12);

  // ========================================
  // LOCALIZED GOLDEN RESTORATION
  // ========================================

  ctx.save();

  // Keep golden energy inside the button
  ctx.beginPath();
  ctx.roundRect(
    x - w / 2,
    y - h / 2,
    w,
    h,
    12
  );
  ctx.clip();

  // Gold starts at the mouse and spreads outward
  const radius = purity * 190;

  if (radius > 0) {
    const gradient = ctx.createRadialGradient(
      purificationX,
      purificationY,
      0,
      purificationX,
      purificationY,
      radius
    );

    gradient.addColorStop(
      0,
      "rgba(255, 225, 140, 0.95)"
    );

    gradient.addColorStop(
      0.45,
      "rgba(215, 155, 75, 0.8)"
    );

    gradient.addColorStop(
      0.8,
      "rgba(130, 80, 90, 0.45)"
    );

    gradient.addColorStop(
      1,
      "rgba(85, 40, 110, 0)"
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(
      x - w / 2,
      y - h / 2,
      w,
      h
    );
  }

  ctx.restore();

  // ========================================
  // RESTORATION BORDER
  // ========================================

  noFill();

  stroke(
    lerpColor(
      color(155, 85, 185),
      color(255, 225, 150),
      purity
    )
  );

  strokeWeight(1.5 + purity);
  rect(x, y, w, h, 12);

  // ========================================
  // PLAY TEXT
  // ========================================

  noStroke();

  fill(
    lerpColor(
      color(225, 190, 220),
      color(255, 245, 200),
      purity
    )
  );

  textStyle(BOLD);
  textSize(23);
  text("PLAY", x, y);

  pop();
}
