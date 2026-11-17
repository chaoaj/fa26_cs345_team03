// pile.js
// A stack of cards sitting on the table: the deck (face down) or the discard pile (face up).
// For now it is only drawn. Later, drawing and discarding cards will change `count`.

const PILE_W = 80;          // same size as a card in your hand
const PILE_H = 105;
const PILE_MAX_LAYERS = 6;  // most card edges shown, so a big pile doesn't get huge

// Small fixed tilts so the discard pile looks tossed, not perfectly stacked.
// Fixed numbers (not random()) so the pile doesn't jitter every frame.
const DISCARD_TILTS = [0.06, -0.09, 0.12, -0.04, 0.1, -0.11];

class Pile {
  constructor(label, x, y, faceDown) {
    this.label = label;
    this.x = x;               // center of the top card
    this.y = y;
    this.faceDown = faceDown; // true = deck (card backs), false = discard (card fronts)
    this.count = 0;           // how many cards are in the pile
    this.showCount = true;    // draw the number badge on the corner?
  }

  draw() {
    push();
    rectMode(CENTER);

    // Label above the pile
    stroke(INK);
    strokeWeight(3);
    fill(GOLD);
    textAlign(CENTER, BOTTOM);
    textSize(14);
    textStyle(BOLD);
    text(this.label, this.x, this.y - PILE_H / 2 - 12);

    // Empty pile: just a dashed slot where cards will go
    if (this.count === 0) {
      noFill();
      stroke(110);
      strokeWeight(2);
      drawingContext.setLineDash([6, 5]);
      rect(this.x, this.y, PILE_W, PILE_H, 8);
      drawingContext.setLineDash([]);
      pop();
      return;
    }

    // Draw from the bottom card up to the top card.
    // Lower cards sit a little lower and to the side, so you see their edges.
    const layers = min(this.count, PILE_MAX_LAYERS);
    for (let i = layers - 1; i >= 0; i--) {
      const cx = this.x + (this.faceDown ? i * 1.5 : 0);
      const cy = this.y + i * 2.5;
      const isTop = i === 0;

      push();
      translate(cx, cy);
      if (!this.faceDown) rotate(DISCARD_TILTS[i]);
      if (this.faceDown) this.drawBack(isTop);
      else this.drawFront(isTop);
      pop();
    }

    if (this.showCount) this.drawCountBadge();
    pop();
  }

  // Back of a card: deep forest green with a gold border and emblem
  drawBack(isTop) {
    stroke(INK);
    strokeWeight(2);
    fill(isTop ? color(52, 78, 44) : color(34, 52, 30));
    rect(0, 0, PILE_W, PILE_H, 8);

    if (!isTop) return; // only the top card needs the details

    noFill();
    stroke(205, 160, 55);
    strokeWeight(2);
    rect(0, 0, PILE_W - 14, PILE_H - 14, 5);

    // Gold diamond emblem in the middle
    noStroke();
    fill(205, 160, 55);
    quad(0, -20, 15, 0, 0, 20, -15, 0);
    fill(52, 78, 44);
    quad(0, -10, 7, 0, 0, 10, -7, 0);
    fill(255, 214, 90);
    circle(0, 0, 4);
  }

  // Front of a used card: same wood color as your cards, but faded
  drawFront(isTop) {
    stroke(INK);
    strokeWeight(2);
    fill(isTop ? color(130, 85, 52) : color(95, 60, 38));
    rect(0, 0, PILE_W, PILE_H, 8);

    if (!isTop) return;

    // A faint inner frame so it reads as a card face
    noFill();
    stroke(255, 255, 255, 60);
    strokeWeight(1.5);
    rect(0, 0, PILE_W - 14, PILE_H - 14, 5);
  }

  // Number of cards in the pile, in a gold circle on the top-right corner
  drawCountBadge() {
    const bx = this.x + PILE_W / 2 - 4;
    const by = this.y - PILE_H / 2 + 4;
    stroke(45, 25, 10);
    strokeWeight(2);
    fill(205, 160, 55);
    circle(bx, by, 26);

    noStroke();
    fill(30);
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(BOLD);
    text(this.count, bx, by + 1);
  }
}
