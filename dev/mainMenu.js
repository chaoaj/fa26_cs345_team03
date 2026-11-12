
/**
 * WHIMSY & WOE
 * Main Menu Screen
 *
 * Canvas: 1000 x 650
 */

// =====================================================
// MAIN MENU STATE
// =====================================================

let mmParticles = [];

const MM_BUTTONS = [
  {
    label: "Continue Adventure",
    state: "classSelection"
  },
  {
    label: "Deck Builder",
    state: "deckBuilder"
  },
  {
    label: "Choose Class",
    state: "classSelection"
  },
  {
    label: "Achievements",
    state: null
  },
  {
    label: "Profiles",
    state: "profileSelection"
  },
  {
    label: "Settings",
    state: null
  }
];

// =====================================================
// SETUP
// =====================================================

function mmSetup() {

  mmParticles = [];

  for (let i = 0; i < 65; i++) {

    mmParticles.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.15, 0.6),
      phase: random(TWO_PI),
      golden: random() < 0.5
    });
  }
}

// =====================================================
// BUTTON LAYOUT
// =====================================================

function mmButtonBox(index) {

  return {
    x: 365,
    y: 275 + index * 53,
    w: 280,
    h: 43
  };
}

// =====================================================
// HIT DETECTION
// =====================================================

function mmHit(button) {

  return (
    mouseX >= button.x &&
    mouseX <= button.x + button.w &&
    mouseY >= button.y &&
    mouseY <= button.y + button.h
  );
}

// =====================================================
// DRAW MAIN MENU
// =====================================================

function mmDraw() {

  background(18, 12, 32);

  // ---------------------------------------------
  // BACKGROUND IMAGE
  // ---------------------------------------------

  if (
    mmBackground &&
    mmBackground.width > 1
  ) {

    image(
      mmBackground,
      0,
      0,
      width,
      height
    );
  }

  // Dark overlay for readability.
  noStroke();
  fill(10, 7, 22, 65);

  rect(
    0,
    0,
    width,
    height
  );

  // ---------------------------------------------
  // MAGICAL FLOATING PARTICLES
  // ---------------------------------------------

  for (const p of mmParticles) {

    p.y -= p.speed;

    const drift =
      sin(
        frameCount * 0.01 +
        p.phase
      ) * 5;

    if (p.y < -5) {
      p.y = height + 5;
      p.x = random(width);
    }

    const alpha =
      100 +
      sin(
        frameCount * 0.04 +
        p.phase
      ) * 55;

    if (p.golden) {
      fill(255, 210, 110, alpha);
    } else {
      fill(185, 95, 255, alpha);
    }

    circle(
      p.x + drift,
      p.y,
      p.size
    );
  }

  // ---------------------------------------------
  // CORRUPTION PULSE
  // ---------------------------------------------

  const pulse =
    12 +
    sin(frameCount * 0.025) * 8;

  noStroke();

  fill(
    145,
    35,
    220,
    pulse
  );

  rect(
    width * 0.82,
    0,
    width * 0.18,
    height
  );

  // ---------------------------------------------
  // MAIN TITLE
  // ---------------------------------------------

  push();

  textFont("Georgia");
  textAlign(CENTER, CENTER);

  drawingContext.shadowBlur = 18;
  drawingContext.shadowColor = "#d99645";

  stroke(45, 21, 45);
  strokeWeight(4);

  fill("#ffe0a0");
  textSize(48);

  text(
    "Whimsy & Woe",
    width / 2,
    95
  );

  drawingContext.shadowBlur = 0;

  noStroke();

  fill("#d6b5e5");
  textSize(13);

  text(
    "THE ENCHANTED FOREST",
    width / 2,
    142
  );

  // ---------------------------------------------
  // MAIN MENU BUTTONS
  // ---------------------------------------------

  MM_BUTTONS.forEach((item, index) => {

    const button =
      mmButtonBox(index);

    const hovered =
      mmHit(button);

    drawingContext.shadowBlur =
      hovered ? 18 : 3;

    drawingContext.shadowColor =
      hovered
        ? "#ffd071"
        : "#3a1a5b";

    stroke(
      hovered
        ? "#ffdb84"
        : "#a779bb"
    );

    strokeWeight(
      hovered ? 2.6 : 1.3
    );

    fill(
      hovered
        ? "#654122"
        : "#21162e"
    );

    rect(
      button.x,
      button.y,
      button.w,
      button.h,
      9
    );

    drawingContext.shadowBlur = 0;

    noStroke();

    fill(
      hovered
        ? "#fff1bf"
        : "#f3e0ff"
    );

    textSize(20);

    text(
      item.label,
      button.x + button.w / 2,
      button.y + button.h / 2
    );
  });

  pop();

  // Normal cursor for main menu.
  cursor(ARROW);
}

// =====================================================
// HANDLE MAIN MENU CLICKS
// =====================================================

function mmMousePressed() {

  for (
    let i = 0;
    i < MM_BUTTONS.length;
    i++
  ) {

    const button =
      mmButtonBox(i);

    if (!mmHit(button)) {
      continue;
    }

    const item =
      MM_BUTTONS[i];

    // Placeholder buttons.
    if (!item.state) {
      return false;
    }

    // -----------------------------------------
    // PROFILE SELECTION
    // -----------------------------------------

    if (
      item.state ===
      "profileSelection"
    ) {

      // Remember that the player entered
      // Profiles from the main menu.
      openProfileSelection("mainMenu");

      return false;
    }

    // -----------------------------------------
    // OTHER MAIN MENU BUTTONS
    // -----------------------------------------

    gameState = item.state;

    return false;
  }

  return false;
}
