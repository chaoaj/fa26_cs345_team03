// cursor.js
// Hand-drawn medieval cursors: a sword normally,
// and a bronze armored gauntlet pointing when over something you can click or drag.

// mode is "normal", "hover" (over something clickable), or "drag"
function drawGameCursor(mode) {
// Don't draw it when the mouse is outside the canvas
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;

    if (mode === "normal") {
        drawSword();
    } else {
        drawGauntlet(mode === "drag");
    }
}

// A small sword. Its tip is exactly at the mouse.
function drawSword() {
    push();
    translate(mouseX, mouseY);
    rotate(-QUARTER_PI); // point it up-left like an arrow

    stroke(20);
    strokeWeight(1.2);

    // Blade
    fill(215, 220, 230);
    beginShape();
    vertex(0, 0);
    vertex(3.5, 7);
    vertex(3.5, 20);
    vertex(-3.5, 20);
    vertex(-3.5, 7);
    endShape(CLOSE);
    stroke(140, 145, 160);
    line(0, 6, 0, 19); // groove down the middle

    // Crossguard
    stroke(20);
    fill(205, 160, 55);
    rect(-8, 20, 16, 3.5, 1.5);

    // Leather grip
    fill(105, 62, 35);
    rect(-1.8, 23.5, 3.6, 7);

    // Pommel (the knob at the end)
    fill(205, 160, 55);
    circle(0, 32.5, 5);

    pop();
}

    // A bronze armored gauntlet, back of the hand facing you, pointing with its index finger.
    // The fingertip is exactly at the mouse.
    // pressing = true while dragging, so the hand pushes in a little.
function drawGauntlet(pressing) {
    push();
    translate(mouseX, mouseY);
    rotate(-0.35);                 // tilt it slightly, like a real pointing hand
    scale(pressing ? 0.95 : 1.1);  // shrink a bit while dragging
    strokeJoin(ROUND);

    const ink = color(45, 25, 10);      // dark brown outlines
    const metal = color(214, 160, 92);  // bronze
    const shade = color(150, 95, 48);   // darker bronze for shadows
    const gold = color(255, 214, 90);   // gold accents
    const cuff = color(120, 70, 35);    // leather cuff

    stroke(ink);
    strokeWeight(1.5);

    // --- Thumb, mostly hidden behind the hand ---
    fill(shade);
    beginShape();
    curveVertex(-4, 18); curveVertex(-4, 18);
    curveVertex(-7, 21); curveVertex(-7.5, 25.5); curveVertex(-4.5, 27);
    curveVertex(-4, 18); curveVertex(-4, 18);
    endShape();

    // --- Fist (back of the hand) ---
    fill(metal);
    beginShape();
    curveVertex(-3.8, 16); curveVertex(-3.8, 16);
    curveVertex(3, 13.8);
    curveVertex(10, 13.6);
    curveVertex(15.2, 16);
    curveVertex(16.6, 22);
    curveVertex(14.4, 28.6);
    curveVertex(5, 30.4);
    curveVertex(-3, 28.8);
    curveVertex(-4.8, 22);
    curveVertex(-3.8, 16); curveVertex(-3.8, 16);
    endShape();

    // soft shadow along the bottom of the fist
    noStroke();
    fill(shade);
    beginShape();
    curveVertex(-4.3, 25); curveVertex(-4.3, 25);
    curveVertex(4, 29.2); curveVertex(14.8, 26.5);
    curveVertex(14, 28.4); curveVertex(5, 30); curveVertex(-2.8, 28.5);
    curveVertex(-4.3, 25); curveVertex(-4.3, 25);
    endShape();

    // curled finger plates across the top
    stroke(ink);
    strokeWeight(1.1);
    fill(metal);
    rect(3.2, 13.2, 4, 6.4, 2);
    rect(7.2, 13.4, 4, 6.4, 2);
    rect(11.2, 14.4, 3.8, 6, 2);
    // gold knuckle studs
    noStroke();
    fill(gold);
    circle(5.2, 15, 1.4);
    circle(9.2, 15.2, 1.4);
    circle(13.1, 16.2, 1.3);

    // --- Index finger, tip at (0, 0) ---
    stroke(ink);
    strokeWeight(1.5);
    fill(metal);
    beginShape();
    vertex(-2.7, 3);
    bezierVertex(-2.7, -1, 2.7, -1, 2.7, 3); // rounded tip
    vertex(3.3, 17.5);
    vertex(-3.6, 17.5);
    endShape(CLOSE);
    // curved plate joints in gold
    noFill();
    stroke(gold);
    strokeWeight(0.9);
    arc(0, 6.2, 5.8, 2.2, 0, PI);
    arc(0, 11.6, 6.6, 2.4, 0, PI);
    // highlight down the finger
    noStroke();
    fill(255, 255, 255, 170);
    rect(-1.7, 1.8, 1.1, 13.5, 0.6);

    // --- Back-of-hand armor plates (curved bands) ---
    noFill();
    stroke(ink);
    strokeWeight(1.1);
    arc(6, 18, 22, 7, 0.15, PI - 0.25);
    arc(6, 22.5, 22, 7, 0.1, PI - 0.15);
    noStroke();
    fill(255, 255, 255, 120);
    ellipse(2, 24.5, 6, 1.4);

    // shine on the back of the hand
    fill(255, 255, 255, 120);
    ellipse(11.5, 23.5, 5, 1.6);

    // --- Flared cuff ---
    stroke(ink);
    strokeWeight(1.5);
    fill(cuff);
    quad(-3.2, 29, 14.6, 29, 16.8, 36.5, -5.4, 36.5);
    fill(gold);
    quad(-3.4, 28.6, 14.8, 28.6, 15.2, 30.4, -3.8, 30.4);   // top trim
    quad(-5.1, 35.2, 16.5, 35.2, 16.9, 37, -5.5, 37);       // bottom trim
    quad(5.7, 31.2, 7.5, 32.9, 5.7, 34.6, 3.9, 32.9);       // center gem setting
    noStroke();
    fill(255, 255, 255, 90);
    quad(-2.6, 31, 1.5, 31, 0.5, 34.5, -4, 34.5);           // cuff shine

    pop();
}