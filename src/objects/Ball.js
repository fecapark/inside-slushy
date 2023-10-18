import Vector2 from "../lib/Vector.js";
import { Bezier } from "../lib/bezier.js";

class Ball {
  constructor(ctx, app, stageWidth, stageHeight, x, y, maxRadius) {
    this.ctx = ctx;
    this.app = app;

    // Sizes
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;
    this.radius = 0;
    this.maxRadius = maxRadius;

    // Positions
    this.pos = new Vector2(x, y);
    this.dir = this.getInitedDir();
    this.rotatedBallPos = new Vector2(0, 0);

    // Parameters
    this.radiusSpeed = 0;
    this.frictionValue = 0.985;
    this.maxSpeed = 24;
    this.minSpeed = 7;
    this.speed = this.maxSpeed;
    this.opacity = 0;
    this.shadowOpacity = 0.4;

    // States
    this.appears = false;
    this.isAcceling = true;
    this.promiseDead = false;
    this.isDead = true;

    // Animators
    this.growthAnimator = null;
    this.shrinkAnimator = null;
  }

  resize(stageWidth, stageHeight, previousWidth, previousHeight) {
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;
    this.pos.x *= stageWidth / previousWidth;
    this.pos.y *= stageHeight / previousHeight;
    // this.speed *= 1 / this.app.scaleRatio;
  }

  update(stopMovement) {
    if (this.promiseDead) {
      this.animateShrink();
      return;
    }

    if (!this.appears) {
      this.animateGrowth();
      this.preventGettingOut();
      return;
    }

    if (stopMovement) return;

    this.bounceOnSpinner();
    this.bounceOnFrame();

    this.friction();

    this.pos = this.pos.add(this.dir.mul(this.speed));
  }

  draw() {
    this.ctx.beginPath();
    this.drawShadow();
    this.ctx.fillStyle = `rgba(250, 185, 63, ${this.opacity})`;
    this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawShadow() {
    if (this.appears) {
      this.shadowOpacity -= 0.025;
      this.shadowOpacity = Math.max(this.shadowOpacity, 0);
    }
    this.ctx.shadowColor = `rgba(0, 0, 0, ${this.shadowOpacity})`;
    this.ctx.shadowBlur = 5;
    this.ctx.shadowOffsetX = 4;
    this.ctx.shadowOffsetY = 4;
  }

  fenceValueAsPosition(value, limit) {
    return Math.min(
      Math.max(value, this.maxRadius + 1),
      limit - this.maxRadius - 1
    );
  }

  preventGettingOut() {
    if (this.stageWidth > this.stageHeight) {
      this.pos.x = Math.min(
        Math.max(this.pos.x, this.radius + 1),
        this.stageWidth - this.radius - 1
      );
    } else {
      this.pos.y = Math.min(
        Math.max(this.pos.y, this.radius + 1),
        this.stageHeight - this.radius - 1
      );
    }
  }

  animateGrowth() {
    if (!this.growthAnimator)
      this.growthAnimator = this.getRadiusAnimator(
        this.radius,
        this.opacity,
        0.5
      );
    const isEnd = this.growthAnimator();

    if (isEnd) {
      this.appears = true;
      this.growthAnimator = null;
    }
  }

  animateShrink() {
    if (!this.shrinkAnimator)
      this.shrinkAnimator = this.getRadiusAnimator(
        this.radius,
        this.opacity,
        0.3,
        true
      );
    const isEnd = this.shrinkAnimator();

    if (isEnd) {
      this.shrinkAnimator = null;
      this.isDead = true;
    }
  }

  getRadiusAnimator(startRadius, startOpacity, duration, shrink = false) {
    const beziers = {
      growth: [0.3, 2, 0.65, 1],
      shrink: [0.6, -0.28, 0.73, 0.05],
    };

    let startTime = null;
    const bezier = Bezier(...(shrink ? beziers.shrink : beziers.growth));

    const animator = () => {
      // Get time ratio
      if (!startTime) startTime = new Date();
      const elapsed = (new Date() - startTime) / 1000;
      const timeRatio = Math.min(elapsed / duration, 1);

      // Get bezier ratio
      const bezierRatio = bezier(timeRatio);

      // Animate
      if (!shrink) {
        this.radius =
          (this.maxRadius - startRadius) * bezierRatio + startRadius;
        this.opacity = (1 - startOpacity) * bezierRatio + startOpacity;
      } else {
        this.radius = startRadius * (1 - bezierRatio);
        this.opacity = startOpacity * (1 - bezierRatio);
      }

      return bezierRatio === 1;
    };

    return animator;
  }

  getInitedDir() {
    const dirs = [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ];
    const randIdx = Math.floor(Math.random() * 4);

    return new Vector2(dirs[randIdx][0], dirs[randIdx][1]);
  }

  friction() {
    this.speed *= this.frictionValue;
    this.speed = Math.min(Math.max(this.speed, this.minSpeed), this.maxSpeed);
  }

  bounceOnFrame() {
    if (this.stageWidth > this.stageHeight) {
      if (
        this.pos.x <= this.radius ||
        this.pos.x >= this.app.stageWidth - this.radius
      ) {
        this.dir.x *= -1;
        this.pos.x += this.dir.x * this.speed;
      }

      if (this.dir.y < 0 && this.pos.y < -this.radius * 1.1) {
        this.pos.y = this.stageHeight + this.radius * 1.1;
        this.speed = this.maxSpeed;
      }

      if (this.dir.y > 0 && this.pos.y > this.stageHeight + this.radius * 1.1) {
        this.pos.y = -this.radius * 1.1;
        this.speed = this.maxSpeed;
      }
    } else {
      if (
        this.pos.y <= this.radius ||
        this.pos.y >= this.app.stageHeight - this.radius
      ) {
        this.dir.y *= -1;
        this.pos.y += this.dir.y * this.speed;
      } else if (this.dir.x < 0 && this.pos.x < -this.radius * 1.1) {
        this.pos.x = this.stageWidth + this.radius * 1.1;
        this.speed = this.maxSpeed;
      } else if (
        this.dir.x > 0 &&
        this.pos.x > this.stageWidth + this.radius * 1.1
      ) {
        this.pos.x = -this.radius * 1.1;
        this.speed = this.maxSpeed;
      }
    }
  }

  bounceOnSpinner() {
    const calculateRotatedPosition = (pos, refPos, radian) => {
      const x =
        Math.cos(-radian) * (pos.x - refPos.x) -
        Math.sin(-radian) * (pos.y - refPos.y) +
        refPos.x;
      const y =
        Math.sin(-radian) * (pos.x - refPos.x) +
        Math.cos(-radian) * (pos.y - refPos.y) +
        refPos.y;

      return new Vector2(x, y);
    };

    const getNearestPosition = (rotatedballPos, topLeft, width, height) => {
      const nearestPos = new Vector2(0, 0);

      // Get X position
      if (rotatedballPos.x <= topLeft.x) {
        nearestPos.x = topLeft.x;
      } else if (rotatedballPos.x >= topLeft.x + width) {
        nearestPos.x = topLeft.x + width;
      } else {
        nearestPos.x = rotatedballPos.x;
      }

      // Get Y position
      if (rotatedballPos.y <= topLeft.y) {
        nearestPos.y = topLeft.y;
      } else if (rotatedballPos.y >= topLeft.y + height) {
        nearestPos.y = topLeft.y + height;
      } else {
        nearestPos.y = rotatedballPos.y;
      }

      return nearestPos;
    };

    const isCollide = (radius, rotatedBallPos, nearestPos) => {
      return nearestPos.dist(rotatedBallPos) <= radius;
    };

    const getNextDirection = (ballPos, nearestPos, radian) => {
      const spinner = this.app.getModules().spinner;
      const hitPosition = calculateRotatedPosition(
        nearestPos,
        spinner.pos,
        -radian
      );

      const perpendicularVector = ballPos.sub(hitPosition).normalize();

      return this.dir.add(perpendicularVector).normalize();
    };

    const spinner = this.app.getModules().spinner;

    // Calculate rotated ball pos
    const rotatedBallPos = calculateRotatedPosition(
      this.pos,
      spinner.pos,
      spinner.rotate
    );
    this.rotatedBallPos = rotatedBallPos;

    // Find nearest point
    const nearestPos = getNearestPosition(
      rotatedBallPos,
      spinner.topLeft,
      spinner.width,
      spinner.height
    );

    // Check collide!
    if (isCollide(this.radius, rotatedBallPos, nearestPos)) {
      this.isAcceling = true;
      this.dir = getNextDirection(this.pos, nearestPos, spinner.rotate);
      // this.speed = this.maxSpeed * 0.5;
      this.pos.x += this.dir.x * this.speed * 2;
      this.pos.y += this.dir.y * this.speed * 2;
    }
  }
}

export default Ball;
