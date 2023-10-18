import SpinnerGuide from "../guides/SpinnerGuide.js";
import BallGuide from "../guides/BallGuide.js";

class GuideManager {
  constructor(app, $guideCanvas) {
    this.app = app;

    // About guide canvas
    this.$canvas = $guideCanvas;
    this.ctx = $guideCanvas.getContext("2d");

    // Guides
    this.currentGuideIndex = -1;
    this.guides = [];

    // Parameters
    this.guideInterval = 1;
  }

  setGuide() {
    this.currentGuideIndex = 0;
    this.guides = [
      new SpinnerGuide(this.$canvas, this.ctx, this.app),
      new BallGuide(this.$canvas, this.ctx, this.app),
    ];
    this.resize(this.app.stageWidth, this.app.stageHeight, this.app.scaleRatio);
  }

  startNextGuide(jump = 1) {
    this.currentGuideIndex += jump;
  }

  getCurrentGuide() {
    if (this.isGuideNotStart() || this.isAllGuideEnd()) return null;
    return this.guides[this.currentGuideIndex];
  }

  draw() {
    if (this.isGuideNotStart() || this.isAllGuideEnd()) return;
    this.getCurrentGuide().draw();
  }

  update() {
    if (this.isGuideNotStart() || this.isAllGuideEnd()) return;
    this.getCurrentGuide().update();
  }

  resize(stageWidth, stageHeight, scaleRatio, pixelRatio) {
    this.$canvas.width = stageWidth;
    this.$canvas.height = stageHeight;
    this.ctx.scale(pixelRatio, pixelRatio);

    if (this.isGuideNotStart()) return;

    for (const guide of this.guides) {
      guide.resize(stageWidth, stageHeight, scaleRatio);
    }
  }

  isGuideNotStart() {
    return this.currentGuideIndex < 0;
  }

  isAllGuideEnd() {
    return this.currentGuideIndex >= this.guides.length;
  }
}

export default GuideManager;
