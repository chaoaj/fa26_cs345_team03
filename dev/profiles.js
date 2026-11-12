
/**
 * WHIMSY & WOE
 * Profile Selection and Management
 *
 * Supports:
 * - Three profile slots
 * - Creating and selecting profiles
 * - Browser storage
 * - Profile deletion confirmation
 * - Animated hold-to-delete button
 * - Main menu navigation
 */

const PROFILE_STORAGE_KEY = "whimsy_woe_profiles_v1";
const MAX_PROFILES = 3;

let profiles = [];
let selectedProfile = null;

let creatingProfile = false;
let creatingSlot = -1;
let newProfileName = "";
let profileError = "";

let deletingProfile = false;
let deletingSlot = -1;

let deleteCharge = 0;
let deleteLastFrame = 0;

// =====================================================
// PROFILE STORAGE
// =====================================================

function loadProfiles() {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : [];

    profiles = Array.isArray(data)
      ? data.slice(0, MAX_PROFILES)
      : [];

  } catch (error) {
    console.error("Unable to load profiles:", error);
    profiles = [];
  }
}

function saveProfiles() {
  try {
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(profiles)
    );
    return true;

  } catch (error) {
    console.error("Unable to save profiles:", error);
    return false;
  }
}

// =====================================================
// CREATE PROFILE DATA
// =====================================================

function createProfile(slot, name) {
  if (
    slot < 0 ||
    slot >= MAX_PROFILES ||
    profiles[slot]
  ) {
    return false;
  }

  const profile = {
    id: Date.now().toString(),
    name: name,
    exp: 0,
    unlockedClasses: ["mage"],
    achievements: [],
    classes: {},
    paths: {},
    savedDecks: [],
    createdAt: new Date().toISOString()
  };

  profiles[slot] = profile;

  if (!saveProfiles()) {
    delete profiles[slot];
    return false;
  }

  return true;
}

// =====================================================
// DELETE PROFILE DATA
// =====================================================

function deleteProfile(slot) {

  if (!profiles[slot]) {
    return false;
  }

  const oldProfile = profiles[slot];

  // Remove the profile from its slot.
  delete profiles[slot];

  // Save the updated profile collection.
  if (!saveProfiles()) {
    profiles[slot] = oldProfile;
    return false;
  }

  // Remove decks belonging only to this profile.
  try {
    localStorage.removeItem(
      `ww_decks_profile_${oldProfile.id}`
    );

    localStorage.removeItem(
      `ww_equipped_deck_profile_${oldProfile.id}`
    );
  } catch (error) {
    console.error(
      "Unable to remove profile deck data:",
      error
    );
  }

  // Clear the selected profile if it was deleted.
  if (
    selectedProfile &&
    selectedProfile.id === oldProfile.id
  ) {
    selectedProfile = null;
  }

  return true;
}

// =====================================================
// SHARED HELPERS
// =====================================================

function isInsideRect(mx, my, x, y, w, h) {
  return (
    mx >= x &&
    mx <= x + w &&
    my >= y &&
    my <= y + h
  );
}

// =====================================================
// ENTER MAIN MENU WITH SELECTED PROFILE
// =====================================================

function enterProfileMainMenu(profile) {

  if (!profile) {
    return false;
  }

  // Set the active profile.
  selectedProfile = profile;

  // Close profile selection windows.
  creatingProfile = false;
  deletingProfile = false;

  // Initialize the deck builder using
  // this profile's individual storage.
  dbSetup();

  console.log(
    "Entering main menu with profile:",
    selectedProfile.name
  );

  gameState = "mainMenu";

  cursor(ARROW);

  return true;
}

// =====================================================
// DRAW PROFILE SELECTION SCREEN
// =====================================================

function drawProfileSelection() {
  push();

  if (forestBackground && forestBackground.width > 1) {
    image(forestBackground, 0, 0, width, height);
  } else {
    background(20, 12, 35);
  }

  // Dark overlay
  noStroke();
  fill(12, 8, 22, 205);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);

  // Heading
  textStyle(BOLD);
  textSize(42);
  fill(245, 215, 165);
  text("Choose Your Adventure", width / 2, 95);

  // Subtitle
  textStyle(NORMAL);
  textSize(17);
  fill(195, 170, 205);

  text(
    "Select a profile or begin a new story",
    width / 2,
    145
  );

  // Draw all profile slots
  for (let i = 0; i < MAX_PROFILES; i++) {
    drawProfileSlot(i);
  }

  // Back button
  const backX = width / 2 - 70;
  const backY = 525;
  const backW = 140;
  const backH = 45;

  const backHovered = isInsideRect(
    mouseX, mouseY,
    backX, backY, backW, backH
  );

  stroke(backHovered ? "#FFE4A0" : "#94734F");
  strokeWeight(2);

  fill(backHovered ? "#58402F" : "#241B2D");
  rect(backX, backY, backW, backH, 10);

  noStroke();
  fill(255, 230, 185);

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(19);

  text(
    "BACK",
    width / 2,
    backY + backH / 2
  );

  // Draw active modal window
  if (creatingProfile) {
    drawCreateProfileWindow();

  } else if (deletingProfile) {
    drawDeleteProfileWindow();
  }

  // Preserve startup screen magic cursor
  if (typeof drawCursorParticles === "function") {
    drawCursorParticles();
  }

  if (typeof drawMagicCursor === "function") {
    drawMagicCursor();
  }

  pop();
}

// =====================================================
// DRAW PROFILE SLOT
// =====================================================

function drawProfileSlot(slot) {
  const x = 230;
  const y = 195 + slot * 105;
  const w = 540;
  const h = 82;

  const profile = profiles[slot];

  const hovered = isInsideRect(
    mouseX, mouseY, x, y, w, h
  );

  push();

  stroke(hovered ? "#F5D49C" : "#765784");
  strokeWeight(hovered ? 2.5 : 1.5);

  fill(hovered ? "#44334B" : "#251C31");
  rect(x, y, w, h, 12);

  noStroke();
  textAlign(LEFT, CENTER);

  if (profile) {
    // Profile name
    fill(245, 215, 170);
    textStyle(BOLD);
    textSize(23);

    text(profile.name, x + 25, y + 30);

    // Experience
    textStyle(NORMAL);
    textSize(15);
    fill(190, 165, 200);

    text(
      "EXP: " + (profile.exp || 0),
      x + 25,
      y + 57
    );

    // Delete button
    const deleteX = x + w - 105;
    const deleteY = y + 22;

    stroke("#A75B75");
    strokeWeight(1.5);
    fill("#4B2637");

    rect(deleteX, deleteY, 80, 38, 8);

    noStroke();
    fill("#FFD7DE");
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(15);

    text(
      "DELETE",
      deleteX + 40,
      deleteY + 19
    );

  } else {
    // Empty profile slot
    fill(230, 205, 165);
    textStyle(BOLD);
    textSize(22);

    text(
      "+ Create New Profile",
      x + 25,
      y + 40
    );
  }

  pop();
}

// =====================================================
// PROFILE SCREEN CLICK HANDLER
// =====================================================

function handleProfileClick() {
  // Creation modal takes priority
  if (creatingProfile) {
    handleCreateProfileClick();
    return false;
  }

  // Deletion modal takes priority
  if (deletingProfile) {
    handleDeleteProfileClick();
    return false;
  }

  // Back to startup
  if (
    isInsideRect(
      mouseX, mouseY,
      430, 525, 140, 45
    )
  ) {
    returnFromProfileSelection();
    return false;
  }

  // Check all three profile slots
  for (let i = 0; i < MAX_PROFILES; i++) {
    const x = 230;
    const y = 195 + i * 105;

    if (
      !isInsideRect(
        mouseX, mouseY,
        x, y, 540, 82
      )
    ) {
      continue;
    }

    const profile = profiles[i];

    // Empty slot: create profile
    if (!profile) {
      openCreateProfile(i);
      return false;
    }

    // Delete button must be checked
    // before selecting the profile
    if (
      isInsideRect(
        mouseX, mouseY,
        x + 540 - 105,
        y + 22,
        80, 38
      )
    ) {
      openDeleteProfile(i);
      return false;
    }

    // Existing profile: enter main menu
    enterProfileMainMenu(profile);
    return false;
  }

  return false;
}

// =====================================================
// PROFILE CREATION WINDOW
// =====================================================

function drawCreateProfileWindow() {
  if (!creatingProfile) return;

  push();

  // Dark overlay
  noStroke();
  fill(5, 3, 12, 190);
  rect(0, 0, width, height);

  // Window
  stroke(205, 165, 100);
  strokeWeight(2);
  fill(35, 25, 45);
  rect(280, 175, 440, 300, 18);

  textAlign(CENTER, CENTER);

  // Title
  noStroke();
  fill(245, 215, 165);
  textStyle(BOLD);
  textSize(30);
  text("Begin Your Story", 500, 225);

  // Subtitle
  textStyle(NORMAL);
  textSize(17);
  fill(200, 175, 210);
  text(
    "What shall the forest call you?",
    500, 265
  );

  // Name input
  stroke(180, 140, 90);
  strokeWeight(1.5);
  fill(20, 15, 30);
  rect(325, 300, 350, 50, 8);

  noStroke();
  textSize(20);

  if (newProfileName.length === 0) {
    fill(130, 115, 145);
    text("Enter your name...", 500, 325);

  } else {
    fill(255, 230, 185);
    text(newProfileName, 500, 325);
  }

  // Error
  if (profileError) {
    fill(255, 125, 145);
    textSize(14);
    text(profileError, 500, 365);
  }

  // Cancel button
  stroke(145, 100, 155);
  strokeWeight(1.5);
  fill(50, 35, 60);
  rect(325, 395, 155, 48, 9);

  noStroke();
  fill(225, 195, 230);
  textStyle(BOLD);
  textSize(18);
  text("CANCEL", 402, 419);

  // Create button
  stroke(245, 205, 130);
  strokeWeight(1.5);
  fill(95, 65, 40);
  rect(520, 395, 155, 48, 9);

  noStroke();
  fill(255, 230, 175);
  text("CREATE", 597, 419);

  pop();
}

// =====================================================
// OPEN / CLOSE CREATION WINDOW
// =====================================================

function openCreateProfile(slot) {
  creatingProfile = true;
  creatingSlot = slot;

  deletingProfile = false;

  newProfileName = "";
  profileError = "";
}

function closeCreateProfile() {
  creatingProfile = false;
  creatingSlot = -1;

  newProfileName = "";
  profileError = "";
}

// =====================================================
// CONFIRM PROFILE CREATION
// =====================================================

function confirmCreateProfile() {
  const name = newProfileName.trim();

  // Validate name
  if (name.length === 0 || name.length > 24) {
    profileError =
      "Name must be between 1 and 24 characters.";
    return false;
  }

  // Save the slot before closing the modal
  const slot = creatingSlot;

  if (!createProfile(slot, name)) {
    profileError = "Unable to save profile.";
    return false;
  }

  // Retrieve newly created profile
  const newProfile = profiles[slot];

  // Close creation modal
  closeCreateProfile();

  // Automatically select profile and
  // transition to the main menu
  enterProfileMainMenu(newProfile);

  return true;
}

// =====================================================
// CREATION WINDOW CLICKS
// =====================================================

function handleCreateProfileClick() {
  // Cancel
  if (
    isInsideRect(
      mouseX, mouseY,
      325, 395, 155, 48
    )
  ) {
    closeCreateProfile();
    return false;
  }

  // Create
  if (
    isInsideRect(
      mouseX, mouseY,
      520, 395, 155, 48
    )
  ) {
    confirmCreateProfile();
    return false;
  }

  return false;
}

// =====================================================
// CREATION WINDOW KEYBOARD
// =====================================================

function handleCreateProfileKey() {
  if (keyCode === ESCAPE) {
    closeCreateProfile();
    return false;
  }

  if (keyCode === ENTER) {
    confirmCreateProfile();
    return false;
  }

  if (keyCode === BACKSPACE) {
    newProfileName = newProfileName.slice(0, -1);
    return false;
  }

  return true;
}

function handleCreateProfileTyped() {
  if (!creatingProfile) return false;

  if (
    key.length === 1 &&
    newProfileName.length < 24 &&
    key.charCodeAt(0) >= 32 &&
    key.charCodeAt(0) !== 127
  ) {
    newProfileName += key;
    profileError = "";
  }

  return false;
}

// =====================================================
// DELETE PROFILE WINDOW
// =====================================================

function drawDeleteProfileWindow() {
  if (!deletingProfile) return;

  const profile = profiles[deletingSlot];
  if (!profile) return;

  push();

  // Dark overlay
  noStroke();
  fill(5, 3, 12, 200);
  rect(0, 0, width, height);

  // Confirmation window
  stroke(190, 85, 110);
  strokeWeight(2);
  fill(35, 25, 45);
  rect(280, 175, 440, 300, 18);

  textAlign(CENTER, CENTER);

  // Title
  noStroke();
  fill(255, 150, 165);
  textStyle(BOLD);
  textSize(30);
  text("Erase This Story?", 500, 225);

  // Profile name
  fill(245, 215, 165);
  textSize(23);
  text(profile.name, 500, 280);

  // Warning
  textStyle(NORMAL);
  textSize(16);
  fill(205, 180, 210);

  text(
    "All progress for this profile will be lost.",
    500, 325
  );

  text(
    "This action cannot be undone.",
    500, 355
  );

  // Cancel button
  const cancelHovered = isInsideRect(
    mouseX, mouseY,
    325, 395, 155, 48
  );

  stroke(
    cancelHovered ? "#F5D49C" : "#94734F"
  );
  strokeWeight(1.5);
  fill(
    cancelHovered ? "#58402F" : "#302438"
  );

  rect(325, 395, 155, 48, 9);

  noStroke();
  fill(255, 230, 185);
  textStyle(BOLD);
  textSize(18);
  text("CANCEL", 402, 419);

  // Delete button
  const deleteX = 520;
  const deleteY = 395;
  const deleteW = 155;
  const deleteH = 48;

  const deleteHovered = isInsideRect(
    mouseX, mouseY,
    deleteX, deleteY, deleteW, deleteH
  );

  // Charge animation timing
  const now = millis();
  const delta = constrain(
    now - deleteLastFrame, 0, 50
  );

  deleteLastFrame = now;

  if (deleteHovered) {
    // Approximately three seconds
    deleteCharge = min(
      1, deleteCharge + delta / 3000
    );
  } else {
    // Slowly drain when cursor leaves
    deleteCharge = max(
      0, deleteCharge - delta / 800
    );
  }

  const fullyCharged = deleteCharge >= 1;

  // Button background
  stroke(145, 85, 110);
  strokeWeight(1.5);
  fill(45, 30, 55);

  rect(
    deleteX, deleteY,
    deleteW, deleteH, 9
  );

  // Animated red fill
  if (deleteCharge > 0) {
    push();

    const ctx = drawingContext;
    ctx.save();

    ctx.beginPath();

    // Clip the red fill to rounded button
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(
        deleteX, deleteY,
        deleteW, deleteH, 9
      );
    } else {
      ctx.rect(
        deleteX, deleteY,
        deleteW, deleteH
      );
    }

    ctx.clip();

    noStroke();
    fill(155, 35, 60);

    rect(
      deleteX,
      deleteY,
      deleteW * deleteCharge,
      deleteH
    );

    ctx.restore();
    pop();
  }

  // Glow when ready
  if (fullyCharged) {
    push();

    drawingContext.shadowColor =
      "rgba(255, 55, 85, 0.9)";
    drawingContext.shadowBlur = 22;

    noFill();
    stroke(255, 95, 115);
    strokeWeight(2.5);

    rect(
      deleteX, deleteY,
      deleteW, deleteH, 9
    );

    pop();
  }

  // Delete button text
  noStroke();
  fill(255, 220, 225);
  textStyle(BOLD);
  textSize(18);

  text(
    "DELETE",
    deleteX + deleteW / 2,
    deleteY + deleteH / 2
  );

  pop();
}

// =====================================================
// OPEN / CLOSE DELETE WINDOW
// =====================================================

function openDeleteProfile(slot) {
  if (!profiles[slot]) return;

  deletingProfile = true;
  deletingSlot = slot;

  creatingProfile = false;

  deleteCharge = 0;
  deleteLastFrame = millis();
}

function closeDeleteProfile() {
  deletingProfile = false;
  deletingSlot = -1;

  deleteCharge = 0;
  deleteLastFrame = 0;
}

// =====================================================
// DELETE WINDOW CLICKS
// =====================================================

function handleDeleteProfileClick() {
  // Cancel immediately
  if (
    isInsideRect(
      mouseX, mouseY,
      325, 395, 155, 48
    )
  ) {
    closeDeleteProfile();
    return false;
  }

  // Delete only after charging
  if (
    isInsideRect(
      mouseX, mouseY,
      520, 395, 155, 48
    )
  ) {
    if (deleteCharge < 1) {
      return false;
    }

    const slot = deletingSlot;

    if (deleteProfile(slot)) {
      closeDeleteProfile();

      console.log(
        "Profile deleted from slot:",
        slot
      );

    } else {
      console.error(
        "Unable to delete profile."
      );
    }

    return false;
  }

  return false;
}
