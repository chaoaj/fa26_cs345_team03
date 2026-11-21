class ProgressBar {
    
    constructor(x, y, width, height) {
        this.progress = 0;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.backgroundColor = "#a9a9a9";
        this.progressColor = "#d996ff";
    }

    updateProgress(progress) {
      this.progress = Math.max(0, Math.min(100, progress));
    }

    drawProgressBar() {
      fill(this.backgroundColor);
      rect(this.x, this.y, this.width, this.height, this.width / 2);
      
      if (this.progress > 0) {
        fill(this.progressColor);
        rect(this.x, this.y, this.width * (this.progress / 100), this.height, this.height / 2);
      }
    }
}