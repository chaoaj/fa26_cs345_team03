
let gameState = "startup";
let forestBackground;

// Load background
function preload() {
  forestBackground = loadImage(
    "assets/corrupted-forest-background.png"
  );
}

// Create canvas and load saved profiles
function setup() {
  createCanvas(1000, 650);
  loadProfiles();
}

// Main game loop
function draw() {
  if (gameState === "startup") {

    drawStartupScreen();

  } else if (gameState === "profileSelection") {

    drawProfileSelection();

  } else if (gameState === "classSelection") {

    // Temporary placeholder for our next screen
    cursor(ARROW);
    background(25, 20, 35);

    fill(245, 215, 165);
    textAlign(CENTER, CENTER);
    textSize(36);
    text("CLASS SELECTION", width / 2, height / 2);

    textSize(18);
    text("Coming next!", width / 2, height / 2 + 55);
  }
}

// ENTER remains a hidden shortcut
function keyPressed() {

  // Handle typing controls in the profile creation window
  if (gameState === "profileSelection" && creatingProfile) {
    return handleCreateProfileKey();
  }

  // ENTER remains a hidden shortcut on startup
  if (gameState === "startup" && keyCode === ENTER) {
    gameState = "profileSelection";
    return false;
  }

  // ESC returns from class selection
  else if (
    gameState === "classSelection" &&
    keyCode === ESCAPE
  ) {
    gameState = "profileSelection";
  }
}

// Handle mouse interactions
function mousePressed() {
  if (gameState === "startup") {

    if (isMouseOverPlay()) {
      gameState = "profileSelection";
    }

  } else if (gameState === "profileSelection") {

    handleProfileClick();
  }
}


// Capture typed characters for profile names
function keyTyped() {
  if (gameState === "profileSelection" && creatingProfile) {
    handleCreateProfileTyped();
    return false;
  }
}