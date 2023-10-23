// // Todo
// 1. BallGuide - BallManager간 radius, position 코드 최적화 (완료)
// 2. BallGuide resize시 위치 resize안되는 버그 수정 (완료)
// 3. globalComposite <- 이거 적용된 위치는 색깔이 약간 빛바래는 버그 수정 (완료)
// 4. guide 실행시 화면 터치하면 바로 가이드 끝내는 코드 추가 (완료)
// 5. ball creation 위치 조정 (완료)
// 6. 문서 작성!

import Spinner from "./objects/Spinner.js";
import BallManager from "./managers/BallManager.js";
import PointerManager from "./managers/pointerManager.js";
import GuideManager from "./managers/GuideManager.js";

class App {
  constructor($target) {
    this.$canvas = $target;

    this.ctx = this.$canvas.getContext("2d");
    this.prevFrameTime = performance.now();

    // States
    this.startSpinner = false;
    this.startInteraction = false;

    // Sizes
    this.stageWidth = 0;
    this.stageHeight = 0;
    this.previousWidth = document.body.clientWidth;
    this.previousHeight = document.body.clientHeight;

    // Game instances
    this.spinner = new Spinner(this.ctx, this);
    this.ballManager = new BallManager(this.ctx, this);

    // Manage guides
    this.guideManager = new GuideManager(
      this,
      document.getElementById("guide-canvas")
    );

    // About resize
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();

    // About animations
    this.animate();
    this.initTransitions();

    // Manage pointer events
    this.pointerManager = new PointerManager(this.ctx, this);
  }

  resize() {
    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;

    // For canvas resizing
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.$canvas.width = this.stageWidth * this.pixelRatio;
    this.$canvas.height = this.stageHeight * this.pixelRatio;

    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    // For object resizing
    const resizeMinWidth = 650;
    const resizeMinHeight = 650;
    const [scaleRatio, scaledType] = this.getScaleRatio(
      resizeMinWidth,
      resizeMinHeight
    );

    this.setStageSizeByScaledType(scaledType, resizeMinWidth, resizeMinHeight);
    this.setResizedStageSize(scaleRatio);

    this.spinner.resize(this.stageWidth, this.stageHeight);

    this.ballManager.resize(
      this.stageWidth,
      this.stageHeight,
      this.previousWidth,
      this.previousHeight
    );

    this.guideManager.resize(
      this.stageWidth,
      this.stageHeight,
      this.scaleRatio,
      this.pixelRatio
    );

    this.previousWidth = this.stageWidth;
    this.previousHeight = this.stageHeight;
  }

  animate() {
    const makeBackground = () => {
      this.ctx.beginPath();
      this.ctx.fillStyle = "#0ebbaa";
      this.ctx.fillRect(0, 0, this.$canvas.width, this.$canvas.height);
    };

    const animateSpinner = () => {
      if (!this.startSpinner) return;

      if (canUpdate) this.spinner.update(this.stageWidth);
      this.spinner.draw();
    };

    const animateBalls = () => {
      if (canUpdate) this.ballManager.update();
      this.ballManager.draw();
    };

    requestAnimationFrame(this.animate.bind(this));

    // Throttle FPS
    let canUpdate = false;
    const interval = 1000 / 65;

    if (performance.now() - this.prevFrameTime > interval) {
      canUpdate = true;
      this.prevFrameTime = performance.now();
    }

    this.ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);

    // Make background color
    makeBackground();

    // About guides
    if (this.guideManager.isGuideNotStart() && this.spinner.appears) {
      this.guideManager.setGuide();
    }

    if (!this.guideManager.isAllGuideEnd()) {
      if (canUpdate) this.guideManager.update();
      this.guideManager.draw();
    } else {
      document.querySelector(".about").style.display = "block";
      document.querySelector(
        ".about"
      ).innerHTML = `Copyright &copy; ${new Date().getFullYear()} Sanghyeok Park. All rights reserved.`;
      document.querySelector(".logo").style.display = "flex";
      this.startInteraction = true;
    }

    // About spinner
    animateSpinner();

    // About balls
    animateBalls();
  }

  getScaleRatio(resizeMinWidth, resizeMinHeight) {
    const widthRatio = Math.min(this.stageWidth / resizeMinWidth, 1);
    const heightRatio = Math.min(this.stageHeight / resizeMinHeight, 1);

    this.scaleRatio = Math.min(widthRatio, heightRatio);

    return [this.scaleRatio, widthRatio < heightRatio ? "width" : "height"];
  }

  setStageSizeByScaledType(scaledType, resizeMinWidth, resizeMinHeight) {
    if (scaledType === "width") {
      // 아래가 빔
      this.stageWidth = Math.max(this.stageWidth, resizeMinWidth);
      this.stageHeight = Math.max(
        this.stageHeight / this.scaleRatio,
        resizeMinHeight
      );
    } else if (scaledType === "height") {
      this.stageWidth = Math.max(
        this.stageWidth / this.scaleRatio,
        resizeMinWidth
      );
      this.stageHeight = Math.max(this.stageHeight, resizeMinHeight);
    }
  }

  setResizedStageSize(scaleRatio) {
    this.$canvas.width = this.stageWidth;
    this.$canvas.height = this.stageHeight;

    const wrapper = document.querySelector(".app-view");
    wrapper.style.width = `${this.$canvas.width}px`;
    wrapper.style.height = `${this.$canvas.height}px`;
    wrapper.style.transform = `scale(${scaleRatio})`;
  }

  initTransitions() {
    document.body.style.animation = `darker linear 1s`;

    const transitionInterval = 100;
    const masks = document.querySelectorAll(".mask");
    for (let i = 0; i < masks.length; i++) {
      (function (x) {
        setTimeout(function () {
          masks[i].classList.add("animate");
        }, x * transitionInterval);
      })(i);
    }

    setTimeout(() => {
      this.$canvas.classList.add("animate");
    }, transitionInterval * masks.length);

    this.startSpinner = true;
  }

  getModules() {
    return {
      spinner: this.spinner,
      ballManager: this.ballManager,
      pointerManager: this.pointerManager,
      guideManager: this.guideManager,
    };
  }
}

export default App;
