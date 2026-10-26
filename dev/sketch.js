
let gameStarted = false;
let forestBackground;

// Load the forest background before the game starts
function preload() {
  forestBackground = loadImage("assets/corrupted-forest-background.png");
}

// Create the game window
function setup() {
  createCanvas(1000, 650);
}

// Runs continuously
function draw() {
  if (!gameStarted) {

    // Draw the startup screen and its animations
    drawStartupScreen();

  } else {

    // Temporary screen after pressing Enter
    background(50, 150, 100);

    fill("white");
    textAlign(CENTER, CENTER);
    textSize(40);
    text("GAME STARTED!", width / 2, height / 2);
  }
}

// Start the game when Enter is pressed
function keyPressed() {
  if (keyCode === ENTER) {
    gameStarted = true;
  }
}
