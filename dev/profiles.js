
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

// Load profiles saved in the browser
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

// Save all profiles
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

// Create a new profile in an empty slot
function createProfile(slot, name) {
  if (profiles[slot]) return false;

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

// Remove a saved profile
function deleteProfile(slot) {
  if (!profiles[slot]) return false;

  const oldProfile = profiles[slot];
  delete profiles[slot];

  if (!saveProfiles()) {
    profiles[slot] = oldProfile;
    return false;
  }

  return true;
}

// Draw the profile selection screen
function drawProfileSelection() {
  push();

  image(forestBackground, 0, 0, width, height);

  // Dark overlay to improve readability
  noStroke();
  fill(12, 8, 22, 205);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);

  // Heading
  textStyle(BOLD);
  textSize(42);
  fill(245, 215, 165);
  text("Choose Your Adventure", width / 2, 95);

  textStyle(NORMAL);
  textSize(17);
  fill(195, 170, 205);
  text("Select a profile or begin a new story", width / 2, 145);

  // Profile slots
  for (let i = 0; i < MAX_PROFILES; i++) {
    drawProfileSlot(i);
  }

  // Back button
const backX = width / 2 - 70;
const backY = 525;
const backW = 140;
const backH = 45;

const backHovered = isInsideRect(
  mouseX, mouseY, backX, backY, backW, backH
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
text("BACK", width / 2, backY + backH / 2);


  // Draw the profile creation window when active
  if (creatingProfile) {
    drawCreateProfileWindow();
  }
  // Draw the profile deletion window when active
  else if (deletingProfile) {
    drawDeleteProfileWindow();
  }

  // Draw the magical cursor above everything
  drawCursorParticles();
  drawMagicCursor();

  pop();
}

// Draw one profile slot
function drawProfileSlot(slot) {
  const x = 230;
  const y = 195 + slot * 105;
  const w = 540;
  const h = 82;

  const profile = profiles[slot];

  const hovered = isInsideRect(
    mouseX, mouseY, x, y, w, h
  );

  stroke(hovered ? "#F5D49C" : "#765784");
  strokeWeight(hovered ? 2.5 : 1.5);

  fill(hovered ? "#44334B" : "#251C31");
  rect(x, y, w, h, 12);

  noStroke();
  textAlign(LEFT, CENTER);

  if (profile) {
    fill(245, 215, 170);
    textStyle(BOLD);
    textSize(23);
    text(profile.name, x + 25, y + 30);

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
    text("DELETE", deleteX + 40, deleteY + 19);

  } else {
    fill(230, 205, 165);
    textStyle(BOLD);
    textSize(22);
    text(
      "+ Create New Profile",
      x + 25,
      y + 40
    );
  }
}

// Reusable rectangle hit test
function isInsideRect(mx, my, x, y, w, h) {
  return (
    mx >= x &&
    mx <= x + w &&
    my >= y &&
    my <= y + h
  );
}

// Handle mouse clicks on profile screen
function handleProfileClick() {
  // If the creation window is open,
  // handle its buttons instead of the profile slots
  if (creatingProfile) {
    handleCreateProfileClick();
    return;
  }
  // Handle delete confirmation first
  if (deletingProfile) {
    handleDeleteProfileClick();
    return;
  }
  // Back
  if (isInsideRect(mouseX, mouseY, 430, 525, 140, 45)) {
    gameState = "startup";
    return;
  }

  for (let i = 0; i < MAX_PROFILES; i++) {
    const x = 230;
    const y = 195 + i * 105;

    if (!isInsideRect(mouseX, mouseY, x, y, 540, 82)) {
      continue;
    }

    const profile = profiles[i];

    if (!profile) {
      openCreateProfile(i);
      return;
    }

    // Delete button hit area
if (
  isInsideRect(
    mouseX, mouseY,
    x + 540 - 105,
    y + 22,
    80, 38
  )
) {
  openDeleteProfile(i);
  return;
}

    // Select existing profile
    selectedProfile = profile;

    console.log(
      "Selected profile:",
      selectedProfile
    );

    gameState = "classSelection";
    return;
  }
}



function drawCreateProfileWindow() {
  if (!creatingProfile) return;

  push();

  // Darken the background
  noStroke();
  fill(5, 3, 12, 190);
  rect(0, 0, width, height);

  // Main window
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
  text("What shall the forest call you?", 500, 265);

  // Name input background
  stroke(180, 140, 90);
  strokeWeight(1.5);
  fill(20, 15, 30);
  rect(325, 300, 350, 50, 8);

  // Player-entered name
  noStroke();
  textSize(20);

  if (newProfileName.length === 0) {
    fill(130, 115, 145);
    text("Enter your name...", 500, 325);
  } else {
    fill(255, 230, 185);
    text(newProfileName, 500, 325);
  }

  // Error message
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

function openCreateProfile(slot) {
  creatingProfile = true;
  creatingSlot = slot;
  newProfileName = "";
  profileError = "";
}

function closeCreateProfile() {
  creatingProfile = false;
  creatingSlot = -1;
  newProfileName = "";
  profileError = "";
}

function confirmCreateProfile() {
  const name = newProfileName.trim();

  if (name.length === 0 || name.length > 24) {
    profileError = "Name must be between 1 and 24 characters.";
    return;
  }

  if (createProfile(creatingSlot, name)) {
    closeCreateProfile();
  } else {
    profileError = "Unable to save profile.";
  }
}

function handleCreateProfileClick() {
  if (isInsideRect(mouseX, mouseY, 325, 395, 155, 48)) {
    closeCreateProfile();
  } else if (
    isInsideRect(mouseX, mouseY, 520, 395, 155, 48)
  ) {
    confirmCreateProfile();
  }
}

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
  if (!creatingProfile) return;

  if (
    key.length === 1 &&
    newProfileName.length < 24 &&
    key.charCodeAt(0) >= 32
  ) {
    newProfileName += key;
    profileError = "";
  }
}


// Draw custom delete confirmation window
function drawDeleteProfileWindow() {
  if (!deletingProfile) return;

  const profile = profiles[deletingSlot];

  if (!profile) return;

  push();

  // Darken the background
  noStroke();
  fill(5, 3, 12, 200);
  rect(0, 0, width, height);

  // Main confirmation window
  stroke(190, 85, 110);
  strokeWeight(2);
  fill(35, 25, 45);
  rect(280, 175, 440, 300, 18);

  textAlign(CENTER, CENTER);

  // Warning title
  noStroke();
  fill(255, 150, 165);
  textStyle(BOLD);
  textSize(30);
  text("Erase This Story?", 500, 225);

  // Profile name
  fill(245, 215, 165);
  textSize(23);
  text(profile.name, 500, 280);

  // Warning message
  textStyle(NORMAL);
  textSize(16);
  fill(205, 180, 210);
  text("All progress for this profile will be lost.", 500, 325);
  text("This action cannot be undone.", 500, 355);

  // Cancel button
  const cancelHovered = isInsideRect(
    mouseX, mouseY, 325, 395, 155, 48
  );

  stroke(cancelHovered ? "#F5D49C" : "#94734F");
  strokeWeight(1.5);
  fill(cancelHovered ? "#58402F" : "#302438");
  rect(325, 395, 155, 48, 9);

  noStroke();
  fill(255, 230, 185);
  textStyle(BOLD);
  textSize(18);
  text("CANCEL", 402, 419);

  // Final DELETE button: slowly fills with red
  const deleteX = 520;
  const deleteY = 395;
  const deleteW = 155;
  const deleteH = 48;

  const deleteHovered = isInsideRect(
    mouseX, mouseY,
    deleteX, deleteY, deleteW, deleteH
  );

  // Frame-rate-independent charge timing
  const now = millis();
  const delta = constrain(now - deleteLastFrame, 0, 50);
  deleteLastFrame = now;

  if (deleteHovered) {
    // Takes approximately 3 seconds to fill
    deleteCharge = min(1, deleteCharge + delta / 3000);
  } else {
    // Red slowly retreats when mouse leaves
    deleteCharge = max(0, deleteCharge - delta / 800);
  }

  const fullyCharged = deleteCharge >= 1;

  // Button background
  stroke(145, 85, 110);
  strokeWeight(1.5);
  fill(45, 30, 55);
  rect(deleteX, deleteY, deleteW, deleteH, 9);

  // Red spreads from left to right inside the button
  if (deleteCharge > 0) {
    push();

    const ctx = drawingContext;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(
      deleteX, deleteY, deleteW, deleteH, 9
    );
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

  // Only glow once the button is fully red
  if (fullyCharged) {
    push();

    drawingContext.shadowColor = "rgba(255, 55, 85, 0.9)";
    drawingContext.shadowBlur = 22;

    noFill();
    stroke(255, 95, 115);
    strokeWeight(2.5);
    rect(deleteX, deleteY, deleteW, deleteH, 9);

    pop();
  }

  // Button text
  noStroke();
  fill(255, 220, 225);
  textStyle(BOLD);
  textSize(18);
  text("DELETE", deleteX + deleteW / 2, deleteY + deleteH / 2);


  pop();
}

// Open the delete confirmation window
function openDeleteProfile(slot) {
  deletingProfile = true;
  deletingSlot = slot;


// Start with uncharged delete button
deleteCharge = 0;
deleteLastFrame = millis();
}


// Close the delete confirmation window
function closeDeleteProfile() {
  deletingProfile = false;
  deletingSlot = -1;

  // Reset the button for the next time
  deleteCharge = 0;
  deleteLastFrame = 0;
}


// Handle clicks inside the delete confirmation window
function handleDeleteProfileClick() {

  // CANCEL works immediately
  if (isInsideRect(mouseX, mouseY, 325, 395, 155, 48)) {
    closeDeleteProfile();
    return;
  }

  // Final DELETE button
  if (isInsideRect(mouseX, mouseY, 520, 395, 155, 48)) {

    // Cannot delete until fully charged
    if (deleteCharge < 1) {
      return;
    }

    // Only delete once the red fill is complete
    if (deleteProfile(deletingSlot)) {
      closeDeleteProfile();
    } else {
      console.error("Unable to delete profile.");
    }

    return;
  }
}



