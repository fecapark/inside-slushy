import { Guide, GuideInfo } from "./Guide.js";

class BallGuide extends Guide {
  constructor($canvas, ctx, app) {
    super($canvas, ctx, app);

    this.text = "Touch background";

    // Parameters
    this.radiusScale = 1.7;
    this.ballGuides = this.createBallGuides();
    this.guideDuration = 2.5;

    super.setGuideInfos(this.ballGuides);
  }

  update() {
    const guideManager = this.app.getModules().guideManager;
    const ballManager = this.app.getModules().ballManager;

    if (!this.onExitState) {
      this.fadeInGuide(() => {
        this.guideDurationTimeout = setTimeout(() => {
          this.onExitState = true;
        }, this.guideDuration * 1000);

        ballManager.stopBallMovements = true;
        ballManager.createBallsOnStart();
      });
    } else if (this.onExitState) {
      this.fadeOutGuide(() => {
        this.clearGuideDurationTimeout();

        ballManager.stopBallMovements = false;
        guideManager.startNextGuide();
      });
    }
  }

  resize(stageWidth, stageHeight, scaleRatio) {
    super.resize(stageWidth, stageHeight);

    for (const ballGuide of this.ballGuides) {
      ballGuide.pos.x *= stageWidth / this.app.previousWidth;
      ballGuide.pos.y *= stageHeight / this.app.previousHeight;
    }
  }

  createBallGuides() {
    const ballGuides = [];
    const ballManager = this.app.getModules().ballManager;

    const ballInfos = ballManager.getFirstBallInfos(
      this.getMetrices(this.text),
      this.radiusScale
    );

    for (const ballInfo of ballInfos) {
      ballGuides.push(
        new GuideInfo(
          this.text,
          ballInfo.pos.x,
          ballInfo.pos.y,
          ballInfo.maxRadius * this.radiusScale
        )
      );
    }

    return ballGuides;
  }
}

export default BallGuide;
