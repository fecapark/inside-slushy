import Vector2 from "../lib/Vector.js";

class PointerManager {
  constructor(ctx, app) {
    this.ctx = ctx;
    this.app = app;

    // Positions
    this.offsetPos = new Vector2(0, 0);

    // States
    this.preventEvent = false;
    this.isSpinnerDown = false;
    this.isBackgroundDown = false;

    // Pointer events
    document.addEventListener("pointerdown", this.onPointerDown.bind(this));
    document.addEventListener("pointermove", this.onPointerMove.bind(this));
    document.addEventListener("pointerup", this.onPointerUp.bind(this));

    // Prevent events
    document.querySelector(".about").addEventListener("pointerdown", () => {
      this.preventEvent = true;
    });
  }

  isDowninSpinnerArea(x, y) {
    const spinner = this.app.getModules().spinner;
    return spinner.pos.dist(new Vector2(x, y)) <= spinner.interactionAreaRadius;
  }

  onPointerDown(e) {
    this.time = new Date();

    if (this.preventEvent) return;
    if (!this.app.startInteraction) return;

    const offsetPos = new Vector2(e.clientX, e.clientY);
    const scaledOffsetPos = offsetPos.div(this.app.scaleRatio);

    if (this.isDowninSpinnerArea(scaledOffsetPos.x, scaledOffsetPos.y)) {
      this.isSpinnerDown = true;
      this.offsetPos = offsetPos;
    } else {
      this.isBackgroundDown = true;
    }
  }

  onPointerMove(e) {
    const deltaTime = (new Date() - this.time) / 1000;
    this.time = new Date();

    const isClockWise = (rotateCenter) => {
      const scaleRatio = this.app.scaleRatio;
      const scaledPointerPos = new Vector2(e.clientX, e.clientY)
        .div(scaleRatio)
        .sub(rotateCenter);
      const crossValue = scaledPointerPos.cross(
        this.offsetPos.div(scaleRatio).sub(rotateCenter)
      );
      const theta = Math.asin(
        crossValue /
          (scaledPointerPos.norm() * this.offsetPos.div(scaleRatio).norm())
      );

      return theta < 0;
    };

    if (this.isSpinnerDown) {
      const factor = 0.01;
      const spinner = this.app.getModules().spinner;
      // const movePos = new Vector2(e.clientX, e.clientY).sub(
      //   this.offsetPos.mul(this.app.scaleRatio)
      // );

      const movePos = new Vector2(e.clientX, e.clientY).sub(this.offsetPos);

      console.log(movePos.norm());
      const rotateSpeed = Math.min(
        movePos.norm() * factor,
        spinner.maxRspeed * 2
      );

      if (isClockWise(spinner.pos)) {
        spinner.rotate += rotateSpeed * deltaTime * 60;
        spinner.rotateClockWise = true;
      } else {
        spinner.rotate -= rotateSpeed * deltaTime * 60;
        spinner.rotateClockWise = false;
      }

      this.offsetPos = new Vector2(e.clientX, e.clientY);
    }
  }

  onPointerUp(e) {
    const handleGuides = () => {
      const guideManager = this.app.getModules().guideManager;
      const currentGuide = guideManager.getCurrentGuide();

      if (currentGuide && currentGuide.isFadeIned) {
        currentGuide.triggerExitGuide();
      }
    };

    if (this.preventEvent) {
      this.preventEvent = false;
      return;
    }

    handleGuides();

    if (!this.app.startInteraction) return;

    if (this.isBackgroundDown) {
      const scaledOffsetPos = new Vector2(e.clientX, e.clientY).div(
        this.app.scaleRatio
      );
      this.app
        .getModules()
        .ballManager.createNewBall(scaledOffsetPos.x, scaledOffsetPos.y);
    }

    this.isSpinnerDown = false;
    this.isBackgroundDown = false;
  }
}

export default PointerManager;
