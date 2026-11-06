
/**
 * WHIMSY & WOE
 * Main Game Controller
 *
 * Handles startup, profiles, main menu,
 * class selection, and deck builder.
 */

let gameState = "startup";

let forestBackground;
let mmBackground;

// =====================================================
// PRELOAD
// =====================================================

function preload() {

  // Startup background
  forestBackground = loadImage(
    "assets/corrupted-forest-background.png"
  );

  // Main menu background
  mmBackground = loadImage(
    "assets/main-menu-background.png"
  );

  // Deck Builder artwork
  dbPreload();
}

// =====================================================
// SETUP
// =====================================================

function setup() {

  // Only create one canvas for the entire game.
  createCanvas(1000, 650);

  // Load player profiles.
  loadProfiles();

  // Initialize main menu.
  mmSetup();

  // Initialize deck builder.
  dbSetup();
}

// =====================================================
// MAIN GAME LOOP
// =====================================================

function draw() {

  if (gameState === "startup") {

    drawStartupScreen();

  } else if (gameState === "profileSelection") {

    drawProfileSelection();

  } else if (gameState === "mainMenu") {

    mmDraw();

  } else if (gameState === "deckBuilder") {

    dbDraw();

  } else if (gameState === "classSelection") {

    cursor(ARROW);
    background(25, 20, 35);

    fill(245, 215, 165);
    textAlign(CENTER, CENTER);
    textSize(36);

    text(
      "CLASS SELECTION",
      width / 2,
      height / 2
    );

    textSize(18);

    text(
      "Coming next! (ESC to return)",
      width / 2,
      height / 2 + 55
    );
  }
}

// =====================================================
// KEYBOARD NAVIGATION
// =====================================================

function keyPressed() {

  // Profile creation input.
  if (
    gameState === "profileSelection" &&
    creatingProfile
  ) {
    return handleCreateProfileKey();
  }

  // Startup -> Profile Selection
  if (
    gameState === "startup" &&
    keyCode === ENTER
  ) {
    gameState = "profileSelection";
    return false;
  }

  // Class Selection -> Main Menu
  if (
    gameState === "classSelection" &&
    keyCode === ESCAPE
  ) {
    gameState = "mainMenu";
    return false;
  }

  // Deck Builder -> Main Menu
  if (
    gameState === "deckBuilder" &&
    keyCode === ESCAPE
  ) {
    return dbLeaveToMainMenu();
  }
}

// =====================================================
// MOUSE CLICKS
// =====================================================

function mousePressed() {

  // Startup screen
  if (gameState === "startup") {

    if (isMouseOverPlay()) {
      gameState = "profileSelection";
    }

  // Profile selection
  } else if (gameState === "profileSelection") {

    handleProfileClick();

  // Main menu
  } else if (gameState === "mainMenu") {

    return mmMousePressed();

  // Deck Builder
  } else if (gameState === "deckBuilder") {

    return dbMousePressed();
  }

  return false;
}

// =====================================================
// MOUSE WHEEL
// =====================================================

function mouseWheel(event) {

  if (gameState === "deckBuilder") {
    return dbMouseWheel(event);
  }
}

// =====================================================
// PROFILE NAME INPUT
// =====================================================

function keyTyped() {

  if (
    gameState === "profileSelection" &&
    creatingProfile
  ) {
    handleCreateProfileTyped();
    return false;
  }
}
