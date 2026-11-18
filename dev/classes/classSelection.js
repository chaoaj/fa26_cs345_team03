/**
 * Whimsy & Woe - Class Selection Screen
 */
const CS_NEXT_STATE = "mainMenu";
 
const CS_NUM_CARDS = 4;
const CS_CARD_W = 215;
const CS_CARD_H = 200;
const CS_GAP = 24;
const CS_CARD_Y = 85;
const CS_DESC_H = 235;
const CS_DESC_GAP = 12;
const CS_DESC_PAD_X = 14;   // left/right padding inside the description box
const CS_DESC_PAD_Y = 12;   // top/bottom padding inside the description box
const CS_DONE = { w: 200, h: 50, y: 570 };
 
// Replace with real names/descriptions later.
const CS_CARDS = [
  {
    name: "Bear Class",
    description:
      "When the corruption reached its forest, the bear stayed, taking hit " +
      "after hit to protect its home. Each hit left it a little tougher, and " +
      "its scars became a thicker hide, an armor in which to shield itself. " +
      "The cost to call the bear is few, as it’s the bear’s nature to protect.",
    color: [120, 90, 150],
    image: "assets/cards/bear/Pixel Art Teddy Bear Sprite.png"
  },
  {
    name: "Bunny Class",
    description:
      "The bunny has always been the smallest creature in the woods, " +
      "scavenging for mushrooms and roots to use as poison to protect itself. " +
      "When the blight arrived, it didn’t matter the size of the creature; " +
      "it corrupted all. It is no cost for the bunny to fight back.",
    color: [110, 200, 150]
  },
  {
    name: "Owl Class",
    description:
      "When the corruption crept up the roots of its tree, and the bark " +
      "began to rot, the owl stopped watching and started striking. Each " +
      "devastating strike comes from its need to protect its home. Its " +
      "strikes hit harder than any creature in the woods, which is a high cost.",
    color: [110, 150, 230]
  },
  {
    name: "Wolf Class",
    description:
      "When the blight threatened to scatter its pack, the wolf leaped into " +
      "action. The wolf learned to strike fast, landing blow after blow on " +
      "the most critical spots. The wolf’s campaign to protect its pack is " +
      "a heavy cost.",
    color: [235, 190, 100]
  }
];
 
let csSelected = -1;

// This crops out the color-palette squares that sit to the right of the bear.
const CS_IMG_CROP = { x: 0.22, y: 0.03, w: 0.54, h: 0.96 };
const CS_ART_H = 135;       // height of the card artwork
let csImagesRequested = false;

// Loads each card's image the first time the screen is drawn.
function csLoadImages() {
  if (csImagesRequested) return;
  csImagesRequested = true;
  for (const c of CS_CARDS) {
    if (c.image) {
      c.img = loadImage(encodeURI(c.image));
    }
  }
}
 
function csReset() {
  csSelected = -1;
}
 
function csCardX(i) {
  const total = CS_NUM_CARDS * CS_CARD_W + (CS_NUM_CARDS - 1) * CS_GAP;
  return (width - total) / 2 + i * (CS_CARD_W + CS_GAP);
}
 
function csDoneBox() {
  return { x: (width - CS_DONE.w) / 2, y: CS_DONE.y, w: CS_DONE.w, h: CS_DONE.h };
}
 
function csInside(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}
 
// Hover area covers the card and the description under it.
function csHovered(i) {
  return csInside(
    mouseX, mouseY,
    csCardX(i), CS_CARD_Y,
    CS_CARD_W, CS_CARD_H + CS_DESC_GAP + CS_DESC_H
  );
}
 
// A card is "active" (not grayed out) when hovered or selected.
function csActive(i) {
  return csSelected === i || csHovered(i);
}

// ---------- Text fitting ----------

// Splits text into lines that are no wider than maxW at the current text size.
function csWrapLines(str, maxW) {
  const words = str.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (line && textWidth(test) > maxW) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Finds the largest text size (down to 9) where the whole description fits.
// The result is cached on the card, so this only runs once per card.
function csFitDescription(c) {
  if (c.fit) return c.fit;

  const maxW = CS_CARD_W - CS_DESC_PAD_X * 2;
  const maxH = CS_DESC_H - CS_DESC_PAD_Y * 2;

  let fit = null;
  for (let size = 16; size >= 9; size--) {
    textSize(size);
    const leading = size * 1.35;
    const lines = csWrapLines(c.description, maxW);
    fit = { size: size, leading: leading, lines: lines };
    if (lines.length * leading <= maxH) break;
  }
  c.fit = fit;
  return fit;
}
 
function csDraw() {
  csLoadImages();
  push();
 
  // Background (reuses the menu background image if it loaded).
  background(28, 20, 48);
  if (typeof mmBackground !== "undefined" && mmBackground && mmBackground.width > 1) {
    image(mmBackground, 0, 0, width, height);
  }
  noStroke();
  fill(10, 7, 22, 110);
  rect(0, 0, width, height);
 
  textFont("Georgia");
  textAlign(CENTER, CENTER);
 
  // Title
  noStroke();
  fill("#ffe0a0");
  textSize(32);
  text("Select Your Card", width / 2, 42);
 
  for (let i = 0; i < CS_NUM_CARDS; i++) {
    csDrawCard(i);
    csDrawDescription(i);
  }
 
  csDrawDone();
 
  pop();

  // Magical cursor (drawn last so it sits on top of everything).
  // drawMagicCursor() hides the normal pointer itself, so there is no cursor(ARROW) here.
  drawCursorParticles();
  drawMagicCursor();
}
 
function csDrawCard(i) {
  const c = CS_CARDS[i];
  const x = csCardX(i);
  const y = CS_CARD_Y;
  const active = csActive(i);
 
  stroke(active ? color(255, 255, 255, 140) : color(255, 255, 255, 40));
  strokeWeight(2);
  fill(active ? color(c.color[0], c.color[1], c.color[2], 235) : color(75, 75, 82, 230));
  rect(x, y, CS_CARD_W, CS_CARD_H, 14);
 
  if (c.img && c.img.width > 1) {
    // Card artwork (cropped to just the sprite). Dimmed when grayed out.
    const sx = c.img.width * CS_IMG_CROP.x;
    const sy = c.img.height * CS_IMG_CROP.y;
    const sw = c.img.width * CS_IMG_CROP.w;
    const sh = c.img.height * CS_IMG_CROP.h;
    const artW = CS_ART_H * (sw / sh);

    push();
    noSmooth(); // keep the pixel art crisp
    if (active) {
      noTint();
    } else {
      tint(110, 110, 118);
    }
    image(c.img, x + (CS_CARD_W - artW) / 2, y + 10, artW, CS_ART_H, sx, sy, sw, sh);
    pop();
  } else {
    // Placeholder art circle
    noStroke();
    fill(255, 255, 255, active ? 60 : 25);
    ellipse(x + CS_CARD_W / 2, y + 10 + CS_ART_H / 2, 90, 90);
  }
 
  // Card name
  noStroke();
  fill(active ? color(40, 25, 60) : color(135));
  textSize(22);
  textAlign(CENTER, CENTER);
  text(c.name, x + CS_CARD_W / 2, y + CS_CARD_H - 28);
}
 
function csDrawDescription(i) {
  const c = CS_CARDS[i];
  const x = csCardX(i);
  const y = CS_CARD_Y + CS_CARD_H + CS_DESC_GAP;
  const active = csActive(i);
 
  stroke(active ? color(255, 255, 255, 110) : color(255, 255, 255, 30));
  strokeWeight(1);
  fill(active ? color(15, 10, 28, 210) : color(40, 40, 46, 200));
  rect(x, y, CS_CARD_W, CS_DESC_H, 10);
 
  // Text is wrapped and sized to fit inside the box, then centered vertically.
  const fit = csFitDescription(c);
  const blockH = fit.lines.length * fit.leading;
  const startY = y + (CS_DESC_H - blockH) / 2;

  noStroke();
  fill(active ? color(235) : color(120));
  textSize(fit.size);
  textAlign(CENTER, TOP);
  for (let k = 0; k < fit.lines.length; k++) {
    text(fit.lines[k], x + CS_CARD_W / 2, startY + k * fit.leading);
  }
}
 
function csDrawDone() {
  const b = csDoneBox();
  const hovered = csInside(mouseX, mouseY, b.x, b.y, b.w, b.h);
 
  stroke(255, 255, 255, 120);
  strokeWeight(2);
  fill(hovered ? color(90, 190, 110) : color(70, 160, 90));
  rect(b.x, b.y, b.w, b.h, 10);
 
  noStroke();
  fill(255);
  textSize(22);
  textAlign(CENTER, CENTER);
  text("Done", b.x + b.w / 2, b.y + b.h / 2);
}
 
// Handle clicks on this screen.
function csMousePressed() {
  // Done button -> move on to the next screen.
  const b = csDoneBox();
  if (csInside(mouseX, mouseY, b.x, b.y, b.w, b.h)) {
    gameState = CS_NEXT_STATE;
    return false;
  }
 
  // Only one card can be selected. Clicking another card replaces the pick;
  // clicking the selected card again unselects it.
  for (let i = 0; i < CS_NUM_CARDS; i++) {
    if (csHovered(i)) {
      csSelected = (csSelected === i) ? -1 : i;
      return false;
    }
  }
 
  return false;
}