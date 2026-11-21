/**
 * WHIMSY & WOE
 * General Loading Screen
 *
 * Used when changing screens and loading assets.
 */

let targetGameState = null;
let progressBar;

let tasks = [];
let completedTasks = 0;

let loadingTask = false;
let completeDisplayed = false;
let loadingError = null;

/**
 * Setup for the loading screen.
 */
function loadingSetup() {
  progressBar = new ProgressBar(25, height / 1.5, width - 50, 25);
}

/**
 * Displays the loading screen.
 */
function loadingDraw() {
  /**
  TODO: Make a loading screen background.

  if (loadingBackground && loadingBackground.width > 1) {
    image(loadingBackground, 0, 0, width, height);
  } 
  */

  background("#0A5C36");

  push();

  textFont("Georgia");
  textAlign(CENTER);
  fill("#ffe0a0");
  textSize(48);
  text("Whimsey & Woe", width / 2, height / 3);

  textAlign(LEFT);
  fill("#d996ff");
  textSize(20);
  text("LOADING...", 40, height / 1.5 - 20);

  textAlign(CENTER);
  text(Math.floor(progressBar.progress) + "%", width - 60, height / 1.5 - 20);

  pop();

  progressBar.drawProgressBar();

  if (loadingError) {
    push();
    
    fill("#000000");
    textAlign(CENTER);
    textSize(20);
    text("Something went wrong during loading.", width / 2, height / 2);

    pop();

    return;
  }

  if (completedTasks < tasks.length && !loadingTask) {
    let task = tasks[completedTasks];

    loadingTask = true;

    try {
      let result = task();

      if (result && typeof result.then === "function") {
        result.then(() => {
          completeLoadingTask();
        }).catch((error) => {
          handleLoadingError(error);
        })
      } else {
        completeLoadingTask();
      }
    } catch (error) {
      handleLoadingError(error);
    }
  }
  
  if (isLoadingComplete()) {
    if (completeDisplayed) {
      finishLoading();
    } else {
      completeDisplayed = true;
    }
  } else {
    completeDisplayed = false;
  }
}

/**
 * Starts the loading process.
 * 
 * @param {*} targetState The game state that the loading screen is switching to.
 */
function startLoading(targetState, loadingTasks = []) {
  targetGameState = targetState;
  tasks = loadingTasks;
  
  gameState = "loading";

  completedTasks = 0;
  loadingTask = false;
  completeDisplayed = false;
  loadingError = null;

  updateProgress(0);

  if (tasks.length === 0) {
    updateProgress(100);
  }
}

/**
 * Updates the loading progress so that it is visible on the progress bar.
 * 
 * @param {*} progress The updated loading progress.
 */
function updateProgress(progress) {
  progressBar.updateProgress(Math.max(0, Math.min(100, progress)));
}

/**
 * Marks a loading task as complete.
 */
function completeLoadingTask() {
  completedTasks++;

  loadingTask = false;

  let progress = (completedTasks / tasks.length) * 100;

  updateProgress(progress);
}

/**
 * Handles errors in loading.
 * 
 * @param {*} error The error that occurred.
 */
function handleLoadingError(error) {
  loadingError = error;

  loadingTask = false;

  console.error("Loading failed:", error);
}

/**
 * Checks if loading is finished.
 */
function isLoadingComplete() {
  return (
    !loadingError && 
    !loadingTask &&
    completedTasks >= tasks.length && 
    progressBar.progress >= 100
  );
}

/**
 * Finishes loading and switches screens.
 */
function finishLoading() {
  gameState = targetGameState;
  targetGameState = null;

  tasks = [];
  completedTasks = 0;

  loadingTask = false;
  completeDisplayed = false;
}