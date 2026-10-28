function drawStartupScreen() {

  // Forest background
  image(forestBackground, 0, 0, width, height);

  // Animated corrupted eyes and shadow-fire
  drawShadowFire();

  // Game title
  push();

  textAlign(CENTER, CENTER);
  textSize(65);
  textStyle(BOLD);

  stroke(35, 20, 50);
  strokeWeight(5);
  fill(255, 225, 160);

  text("Whimsy & Woe", width / 2, height * 0.15);

  // Start instructions
  stroke(35, 20, 50);
  strokeWeight(4);
  fill(255);
  textSize(28);

  text("Press ENTER to Start", width / 2, 530);

  pop();
}

// Approximate positions of the corrupted eyes
// Based on a 1000 x 650 canvas


// Exact eye coordinates for all 7 corrupted animals
const corruptedAnimals = [
  {
    name: "Owl",
    eyes: [{x:229,y:227}, {x:248,y:227}],
    size: 1
  },
  {
    name: "Spiky Beast",
    eyes: [{x:300,y:316}, {x:322,y:317}],
    size: 1
  },
  {
    name: "Deer",
    eyes: [{x:463,y:271}, {x:481,y:271}],
    size: 1.2
  },
  {
    name: "Small Beast",
    eyes: [{x:552,y:363}, {x:577,y:363}],
    size: 1
  },
  {
    name: "Rabbit",
    eyes: [{x:682,y:325}, {x:701,y:325}],
    size: 1
  },
  {
    name: "Bear",
    eyes: [{x:791,y:254}, {x:816,y:252}],
    size: 1.2
  },
  {
    name: "Main Villain",
    eyes: [{x:538,y:119}, {x:581,y:124}],
    size: 2,
    villain: true
  }
];





function drawShadowFire() {
  let time = millis() * 0.001;

  push();
  noStroke();

  for (let animal of corruptedAnimals) {
    let leftEye = animal.eyes[0];
    let rightEye = animal.eyes[1];

    let centerX = (leftEye.x + rightEye.x) / 2;
    let centerY = (leftEye.y + rightEye.y) / 2;

    let villain = animal.villain === true;

    // Flame settings
    let headRadius = villain ? 58 : 24;
    let flameHeight = villain ? 65 : 36;
    let particleCount = villain ? 45 : 25;

    for (let i = 0; i < particleCount; i++) {

      // Give each particle a unique movement pattern
      let seed = i * 17.23 + centerX * 0.31;

      // Each particle continuously rises and restarts
      let progress =
        (time * (0.25 + (i % 5) * 0.025) +
         i / particleCount) % 1;

      // Start near the sides of the head
      let side = i % 2 === 0 ? -1 : 1;

      let startX =
        centerX +
        side * (headRadius + sin(seed) * 5);

      let startY =
        centerY -
        8 -
        abs(sin(seed * 0.7)) * 12;

      // Rising motion with sideways flickering
      let drift =
        sin(time * 2 + seed) * 4 +
        sin(progress * 8 + seed) * 5;

      let x = startX + drift;
      let y = startY - progress * flameHeight;

      // Fade out as the particle rises
      let fade = sin(progress * PI);

      // Larger near the base, smaller near the top
      let size = (1 - progress) * 10 + 1;

      
    // Stage 1: flickering flame body
    if (progress < 0.30) {

      // Make the flame narrower as it rises
      let flameWidth = size * 0.55;
      let flameHeight = size * 1.3;

      // Animated tip movement
      let tipSway = sin(time * 3 + seed) * 3 +
                    cos(time * 1.7 + seed * 2) *3;

      // Dark outer flame
      fill(90, 15, 135, fade * 55);

      beginShape();
      vertex(x - flameWidth, y + size * 0.5);

      bezierVertex(
        x - flameWidth * 1.2, y - flameHeight * 0.3,
        x + tipSway - flameWidth * 0.4, y - flameHeight * 0.7,
        x + tipSway, y - flameHeight
      );

      bezierVertex(
        x + flameWidth * 0.3, y - flameHeight * 0.55,
        x + flameWidth, y - flameHeight * 0.2,
        x + flameWidth, y + size * 0.5
      );

      endShape(CLOSE);

      // Smaller magenta flame inside
      fill(210, 55, 255, fade * 75);

      beginShape();
      vertex(x - flameWidth * 0.35, y);

      bezierVertex(
        x - flameWidth * 0.4, y - flameHeight * 0.25,
        x + tipSway * 0.4, y - flameHeight * 0.55,
        x + tipSway * 0.5, y - flameHeight * 0.75
      );

      bezierVertex(
        x + flameWidth * 0.2, y - flameHeight * 0.4,
        x + flameWidth * 0.35, y - flameHeight * 0.15,
        x + flameWidth * 0.35, y
      );

      endShape(CLOSE);
    }


      // Stage 2: breaking into cinders
      else {

        let emberSize = size * 0.55;

        // Tiny glowing ember
        fill(220, 80, 255, fade * 100);
        circle(x, y, emberSize);

        // Smaller bright center
        fill(255, 160, 255, fade * 130);
        circle(x, y, emberSize * 0.4);
      }
    }

    // Preserve the glowing eyes
    let pulse =
      sin(time * 2 + centerX * 0.03) * 0.5 + 0.5;

    for (let eye of animal.eyes) {

      // Outer glow
      fill(180, 40, 255, 12 + pulse * 25);
      ellipse(eye.x, eye.y, 25, 19);

      // Middle glow
      fill(225, 60, 255, 25 + pulse * 50);
      ellipse(eye.x, eye.y, 14, 10);

      // Bright center
      fill(255, 130, 255, 65 + pulse * 110);
      ellipse(eye.x, eye.y, 5, 4);
    }
  }

  pop();
}
