/**
 * Whimsy & Woe - Class Selection Screen
 */
const CS_NEXT_STATE = "mainMenu";
 
const CS_NUM_CARDS = 3;
const CS_CARD_W = 220;
const CS_CARD_H = 280;
const CS_GAP = 40;
const CS_CARD_Y = 90;
const CS_DESC_H = 110;
const CS_DESC_GAP = 16;
const CS_DONE = { w: 200, h: 52, y: 545 };
 
//Replace with real names/descriptions later.
const CS_CARDS = [
  { name: "[card name]", description: "[description]", color: [236, 120, 170] },
  { name: "[card name]", description: "[description]", color: [110, 200, 150] },
  { name: "[card name]", description: "[description]", color: [110, 150, 230] }
];
 
let csSelected = -1;
 
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
 
//A card is "active" (not grayed out) when hovered or selected.
function csActive(i) {
  return csSelected === i || csHovered(i);
}
 
function csDraw() {
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
 
  //Title
  noStroke();
  fill("#ffe0a0");
  textSize(34);
  text("Select Your Card", width / 2, 45);
 
  for (let i = 0; i < CS_NUM_CARDS; i++) {
    csDrawCard(i);
    csDrawDescription(i);
  }
 
  csDrawDone();
 
  pop();
  cursor(ARROW);
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
 
  // Placeholder art circle
  noStroke();
  fill(255, 255, 255, active ? 60 : 25);
  ellipse(x + CS_CARD_W / 2, y + 100, 110, 110);
 
  // Card name
  fill(active ? color(40, 25, 60) : color(135));
  textSize(24);
  textAlign(CENTER, CENTER);
  text(c.name, x + CS_CARD_W / 2, y + 220);
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
 
  noStroke();
  fill(active ? color(235) : color(120));
  textSize(18);
  textAlign(CENTER, CENTER);
  text(c.description, x + 10, y + 10, CS_CARD_W - 20, CS_DESC_H - 20);
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