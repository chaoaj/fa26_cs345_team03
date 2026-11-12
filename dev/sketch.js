/**
 * WHIMSY & WOE
 * Main Game Controller
 *
 * Handles:
 * - Startup screen
 * - Profile selection
 * - Main menu
 * - Class selection
 * - Deck builder
 * - Custom deck naming window
 * - Unsaved deck confirmation
 *
 * Canvas: 1000 x 650
 */

// =====================================================
// GAME STATE
// =====================================================

let gameState = "startup";

// Remembers which screen opened profile selection.
let profileReturnState = "startup";

// Background images.
let forestBackground;
let mmBackground;

// =====================================================
// PROFILE NAVIGATION
// =====================================================

/**
 * Opens profile selection while remembering
 * which screen the player came from.
 */
function openProfileSelection(fromState = gameState) {
  profileReturnState =
    fromState === "mainMenu"
      ? "mainMenu"
      : "startup";

  gameState = "profileSelection";
}

/**
 * Returns to the screen that originally
 * opened profile selection.
 */
function returnFromProfileSelection() {
  gameState = profileReturnState;
  cursor(ARROW);
}

// =====================================================
// PRELOAD
// =====================================================

function preload() {
  // Startup background.
  forestBackground = loadImage(
    "assets/corrupted-forest-background.png"
  );

  // Main menu background.
  mmBackground = loadImage(
    "assets/main-menu-background.png"
  );

  // Deck builder artwork.
  dbPreload();
}

// =====================================================
// SETUP
// =====================================================

function setup() {
  // One shared canvas for the entire game.
  createCanvas(1000, 650);

  // Load saved player profiles.
  loadProfiles();

  // Initialize main menu particles.
  mmSetup();

  // Deck builder setup runs when entering that screen.
}

// =====================================================
// MAIN GAME LOOP
// =====================================================

function draw() {
  switch (gameState) {
    case "startup":
      drawStartupScreen();
      break;

    case "profileSelection":
      drawProfileSelection();
      break;

    case "mainMenu":
      mmDraw();
      break;

    case "deckBuilder":
      dbDraw();
      break;

    case "classSelection":
      csDraw();
      break;

    default:
      console.warn("Unknown game state:", gameState);
      gameState = "startup";
      break;
  }
}

// =====================================================
// KEYBOARD NAVIGATION
// =====================================================

function keyPressed() {
  // Profile creation input takes priority.
  if (
    gameState === "profileSelection" &&
    creatingProfile
  ) {
    return handleCreateProfileKey();
  }

  // Deck builder modals take priority over navigation.
  if (gameState === "deckBuilder") {
    // This handler processes ordinary characters as well
    // as Enter, Escape and Backspace in the updated
    // deckBuilderScreen.js.
    if (dbNamingModalOpen) {
      return dbHandleNamingModalKey();
    }

    if (dbRenameModalOpen) {
      return dbHandleRenameModalKey();
    }

    if (dbDeleteModalOpen) {
      return dbHandleDeleteModalKey();
    }

    // Unsaved changes confirmation.
    if (dbExitModalOpen) {
      if (keyCode === ESCAPE) {
        dbCloseExitModal();
      }
      return false;
    }

    // Leave only when no other modal is open.
    if (keyCode === ESCAPE) {
      return dbLeaveToMainMenu();
    }
  }

  // Startup -> Profile Selection.
  if (
    gameState === "startup" &&
    keyCode === ENTER
  ) {
    openProfileSelection("startup");
    return false;
  }

  // Profile Selection -> Previous Screen.
  if (
    gameState === "profileSelection" &&
    keyCode === ESCAPE
  ) {
    if (deletingProfile) {
      closeDeleteProfile();
      return false;
    }

    returnFromProfileSelection();
    return false;
  }

  // Class Selection -> Main Menu.
  if (
    gameState === "classSelection" &&
    keyCode === ESCAPE
  ) {
    gameState = "mainMenu";
    return false;
  }

  return true;
}

// =====================================================
// MOUSE CLICKS
// =====================================================

function mousePressed() {
  switch (gameState) {
    case "startup":
      if (isMouseOverPlay()) {
        openProfileSelection("startup");
      }
      return false;

    case "profileSelection":
      return handleProfileClick();

    case "mainMenu":
      return mmMousePressed();

    case "deckBuilder":
      // Deck builder handles its own modal click routing.
      return dbMousePressed();

    case "classSelection":
      return csMousePressed();

    default:
      return false;
  }
}

// =====================================================
// MOUSE WHEEL
// =====================================================

function mouseWheel(event) {
  if (gameState === "deckBuilder") {
    // Never scroll the deck builder behind a modal.
    if (dbNamingModalOpen || dbRenameModalOpen || dbDeleteModalOpen || dbExitModalOpen) {
      return false;
    }

    return dbMouseWheel(event);
  }

  return true;
}

// =====================================================
// KEYBOARD TEXT INPUT
// =====================================================

function keyTyped() {
  // Profile naming still uses keyTyped().
  if (
    gameState === "profileSelection" &&
    creatingProfile
  ) {
    handleCreateProfileTyped();
    return false;
  }

  // Deck naming is processed by keyPressed(), so do not
  // append the same character a second time here.
  if (
    gameState === "deckBuilder" &&
    (dbNamingModalOpen || dbRenameModalOpen || dbDeleteModalOpen)
  ) {
    return false;
  }

  // Block typing while the exit confirmation is visible.
  if (
    gameState === "deckBuilder" &&
    dbExitModalOpen
  ) {
    return false;
  }

  return true;
}
