import { Bezier } from "../lib/bezier.js";
import Vector2 from "../lib/Vector.js";

class GuideInfo {
  constructor(text, x, y, radius) {
    this.text = text;
    this.pos = new Vector2(x, y);
    this.radius = radius;
  }
}

class Guide {
  constructor($canvas, ctx, app) {
    this.$canvas = $canvas;
    this.app = app;
    this.ctx = ctx;

    // Guide informations
    this.guideInfos = [];

    // Sizes
    this.pixelRatio = this.app.pixelRatio;

    // Parameters
    this.fontSize = 0;
    this.opacity = 0;
    this.fadeDuration = 0.3;

    // States
    this.isRunning = false;
    this.isFadeIned = false;
    this.isFadeOuted = false;
    this.onExitState = false;

    // Animators
    this.fadeInAnimator = null;
    this.fadeOutAnimator = null;

    // Timeouts
    this.guideDurationTimeout = null;
  }

  draw() {
    const drawMask = () => {
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(0, 0, 0, 0.5)`;
      this.ctx.fillRect(0, 0, this.app.stageWidth, this.app.stageHeight);
    };

    const drawGuideArea = (aGuideInfo) => {
      this.ctx.beginPath();
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.fillStyle = "rgba(255, 255, 255, 1)";
      this.ctx.arc(
        aGuideInfo.pos.x,
        aGuideInfo.pos.y,
        aGuideInfo.radius,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    };

    const drawGuideText = (aGuideInfo) => {
      this.ctx.beginPath();
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.font = `bold ${this.fontSize}px Roboto`;
      this.ctx.fillStyle = "white";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        aGuideInfo.text,
        aGuideInfo.pos.x,
        aGuideInfo.pos.y + aGuideInfo.radius + this.fontSize * 1.5
      );
    };

    this.ctx.clearRect(0, 0, this.app.stageWidth, this.app.stageHeight);

    drawMask();

    for (const aGuideInfo of this.guideInfos) {
      drawGuideArea(aGuideInfo);
      drawGuideText(aGuideInfo);
    }

    this.$canvas.style.opacity = this.opacity;
  }

  update() {}

  setGuideInfos(guideInfos) {
    this.guideInfos = guideInfos;
  }

  clearGuideDurationTimeout() {
    clearTimeout(this.guideDurationTimeout);
    this.guideDurationTimeout = null;
  }

  getMetrices(text) {
    this.ctx.beginPath();
    this.ctx.font = `bold ${this.fontSize}px Roboto`;
    return this.ctx.measureText(text);
  }

  resize(stageWidth, stageHeight) {
    const { scaleRatio } = this.app;

    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;

    if (scaleRatio < 1) {
      this.fontSize = 14 * (0.9 / scaleRatio);
    } else {
      this.fontSize = 14;
    }
  }

  resizeFont() {
    // const maxFontSize = 14;
    // const minFontSize = 12;
    // this.fontSize = Math.min(
    //   Math.max(this.stageWidth * 0.01, minFontSize),
    //   maxFontSize
    // );
  }

  fadeInGuide(callBack = null) {
    if (this.isFadeIned) return;

    if (!this.fadeInAnimator) {
      this.isRunning = true;
      this.fadeInAnimator = this.getFadeAnimator(
        this.opacity,
        this.fadeDuration,
        true
      );
    } else {
      const [opacity, isEnd] = this.fadeInAnimator();

      this.opacity = opacity;

      if (isEnd) {
        this.isFadeIned = true;
        this.fadeInAnimator = null;

        if (callBack) callBack();
      }
    }
  }

  fadeOutGuide(callBack = null) {
    if (this.isFadeOuted) return;

    if (!this.fadeOutAnimator) {
      this.fadeOutAnimator = this.getFadeAnimator(
        this.opacity,
        this.fadeDuration
      );
    } else {
      const [opacity, isEnd] = this.fadeOutAnimator();

      this.opacity = opacity;

      if (isEnd) {
        this.isRunning = false;
        this.isFadeOuted = true;
        this.fadeOutAnimator = null;

        if (callBack) callBack();
      }
    }
  }

  getFadeAnimator(fromOpacity, duration, fadeIn = false) {
    let startTime = null;
    const bezier = Bezier(0, 0, 1, 1);

    const animator = () => {
      // Get time ratio
      if (!startTime) startTime = new Date();
      const elapsed = (new Date() - startTime) / 1000;
      const timeRatio = Math.min(elapsed / duration, 1);

      // Get bezier ratio
      const bezierRatio = bezier(timeRatio);

      // Get current opacity
      const opacity = fadeIn
        ? (1 - fromOpacity) * bezierRatio + fromOpacity
        : fromOpacity * (1 - bezierRatio);

      return [opacity, bezierRatio === 1];
    };

    return animator;
  }

  triggerExitGuide() {
    if (this.onExitState) return;
    this.onExitState = true;
  }
}

export { GuideInfo, Guide };
