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
    if (!enabled) bg = color(90);
    else if (this.action === "attack") bg = color(200, 60, 55);
    else bg = color(50, 165, 90);

    stroke(20);
    strokeWeight(2);
    fill(bg);
    rect(this.x, this.y, this.w, this.h, 8);

    noStroke();
    fill(enabled ? 255 : 170);
    textAlign(CENTER, CENTER);
    textSize(15);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);
    pop();
  }
}
