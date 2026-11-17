// button.js
// A clickable button drawn on the canvas.

class Button {
  constructor(label, owner, action, x, y) {
    this.label = label;
    this.owner = owner;   // the Card this button belongs to
    this.action = action; // "attack" or "heal"
    this.x = x;           // top-left corner
    this.y = y;
    this.w = 70;
    this.h = 34;
  }

  contains(mx, my) {
    return mx >= this.x && mx <= this.x + this.w &&
           my >= this.y && my <= this.y + this.h;
  }

  draw(enabled) {
    push();
    let bg;
    if (!enabled) bg = color(70, 55, 80);                  // dull purple-gray
    else if (this.action === "attack") bg = color(205, 85, 50); // ember orange
    else if (this.action === "heal") bg = color(90, 150, 70);   // moss green
    else bg = color(175, 120, 50);                              // other buttons (Restart): wood gold

    stroke(INK);
    strokeWeight(2);
    fill(bg);
    rect(this.x, this.y, this.w, this.h, 8);

    noStroke();
    fill(enabled ? color(CREAM) : color(150, 135, 160));
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(15);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);
    pop();
  }
}
