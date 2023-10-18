import { Guide, GuideInfo } from "./Guide.js";

class SpinnerGuide extends Guide {
  constructor($canvas, ctx, app) {
    super($canvas, ctx, app);

    this.spinnerGuide = new GuideInfo("Hold & Spin", 0, 0, 0);
    this.guideDuration = 2.5;

    super.setGuideInfos([this.spinnerGuide]);
  }

  update() {
    const guideManager = this.app.getModules().guideManager;

    if (!this.onExitState) {
      this.fadeInGuide(() => {
        this.guideDurationTimeout = setTimeout(() => {
          this.onExitState = true;
        }, this.guideDuration * 1000);
      });
    } else if (this.onExitState) {
      this.fadeOutGuide(() => {
        this.clearGuideDurationTimeout();

        setTimeout(() => {
          guideManager.startNextGuide();
        }, guideManager.guideInterval * 1000);
      });
    }

    this.manageSpinnerSpin();
  }

  resize(stageWidth, stageHeight, scaleRatio) {
    super.resize(stageWidth, stageHeight);

    const spinner = this.app.getModules().spinner;
    const xRatioFromLeft = 1 / 3;
    const radiusRatio = 0.9;

    this.spinnerGuide.pos.x =
      spinner.pos.x * xRatioFromLeft + spinner.topLeft.x * (1 - xRatioFromLeft);
    this.spinnerGuide.pos.y = spinner.pos.y;
    this.spinnerGuide.radius = spinner.height * radiusRatio;
  }

  manageSpinnerSpin() {
    const spinner = this.app.getModules().spinner;

    if (this.isRunning) spinner.pauseSpining = true;
    else spinner.pauseSpining = false;
  }
}

export default SpinnerGuide;
