import Ball from "../objects/Ball.js";
import Vector2 from "../lib/Vector.js";

class BallManager {
  constructor(ctx, app) {
    this.ctx = ctx;
    this.app = app;

    // Instances
    this.balls = [];
    this.willDeadBalls = [];

    // Informations
    this.firstBallInfos = null;

    // States
    this.stopBallMovements = false;
    this.createdWhenStart = false;

    // Parameters
    this.maxBallNum = 20;
    this.initBallNum = 2;
  }

  getFirstBallInfos(metrics, guideRadiusScale) {
    // this.initBallNum이 반드시 2 일때만 작동하는 코드임.
    // 개선의 여지가 있음... => 굳이?

    // fontSize가 14로 고정되어 있음.
    // 동적으로 받아올 수 있는 방법이 있을까? => 이거도 굳이?

    const pickAreas = (areas) => {
      const pick = Math.floor(Math.random() * 2);

      if (pick === 0) return [areas[0], areas[3]];
      return [areas[1], areas[2]];
    };

    const getGuideOuterRadius = (maxRadius) => {
      const margin = fontSize * 0.5;
      const guideRaidus = maxRadius * guideRadiusScale;
      return Math.max(guideRaidus, margin + metrics.width / 2);
    };

    const getRandomPositionInArea = (area, maxRadius) => {
      const guideOuterRadius = getGuideOuterRadius(maxRadius);
      const guideRadius = maxRadius * guideRadiusScale;

      const randX =
        area.x +
        Math.random() * (this.stageWidth / 2 - 2 * guideOuterRadius) +
        guideOuterRadius;
      const randY =
        area.y +
        Math.random() * (this.stageHeight / 2 - 2 * (guideRadius + fontSize)) +
        guideRadius;

      return new Vector2(randX, randY);
    };

    if (this.firstBallInfos) return this.firstBallInfos;

    const fontSize = 14;

    // 1. Pick areas to create ball
    const areas = [
      new Vector2(0, 0), // top-left area
      new Vector2(this.stageWidth / 2, 0), // top-right area
      new Vector2(0, this.stageHeight / 2), // bottom-left area
      new Vector2(this.stageWidth / 2, this.stageHeight / 2), // bottom-right area
    ];
    const pickedAreas = pickAreas(areas);

    // 2. ?
    this.firstBallInfos = [];
    for (let i = 0; i < this.initBallNum; i++) {
      this.firstBallInfos.push({
        pos: null,
        maxRadius: this.getNewBallMaxRadius(),
      });
    }

    for (let i = 0; i < this.firstBallInfos.length; i++) {
      const ballInfo = this.firstBallInfos[i];

      ballInfo.pos = getRandomPositionInArea(
        pickedAreas[i],
        ballInfo.maxRadius
      );
    }

    return this.firstBallInfos;
  }

  draw() {
    for (const ball of [...this.balls, ...this.willDeadBalls]) {
      ball.draw();
    }
  }

  update() {
    this.bounceOnBalls();
    for (const ball of [...this.balls, ...this.willDeadBalls]) {
      ball.update(this.stopBallMovements);
    }
  }

  resize(stageWidth, stageHeight, previousWidth, previousHeight) {
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;

    for (const ball of [...this.balls, ...this.willDeadBalls]) {
      ball.resize(stageWidth, stageHeight, previousWidth, previousHeight);
    }

    if (this.firstBallInfos) {
      for (const ballInfo of this.firstBallInfos) {
        ballInfo.pos.x *= stageWidth / previousWidth;
        ballInfo.pos.y *= stageHeight / previousHeight;
      }
    }
  }

  getNewBallMaxRadius() {
    const { scaleRatio, stageWidth, stageHeight } = this.app;

    if (scaleRatio < 1) {
      return Math.random() * 40 + 40;
    }

    const maxSize = Math.max(stageWidth, stageHeight);
    const maxScalingSize = 2400;
    const ratio = Math.max(maxSize / maxScalingSize, 1);

    return (Math.random() * 60 + 60) * ratio;
  }

  createBallsOnStart() {
    // Ensure executing only once
    if (this.createdWhenStart) return;
    else this.createdWhenStart = true;

    for (let i = 0; i < this.initBallNum; i++) {
      this.createNewBall(
        this.firstBallInfos[i].pos.x,
        this.firstBallInfos[i].pos.y,
        this.firstBallInfos[i].maxRadius
      );
    }
  }

  createNewBall(x, y, maxRadius) {
    const checkOldBalls = () => {
      for (let i = this.balls.length - this.maxBallNum - 1; i >= 0; i--) {
        const ball = this.balls[i];

        if (!ball.promiseDead) {
          ball.promiseDead = true;
          this.balls.splice(i, 1);
          this.willDeadBalls.push(ball);
        }
      }
    };

    const newBall = new Ball(
      this.ctx,
      this.app,
      this.stageWidth,
      this.stageHeight,
      x,
      y,
      maxRadius ? maxRadius : this.getNewBallMaxRadius()
    );

    this.balls.push(newBall);
    checkOldBalls();
  }

  checkDeadBalls() {
    for (let i = this.willDeadBalls.length - 1; i >= 0; i--) {
      const willDeadBall = this.willDeadBalls[i];

      if (willDeadBall.isDead) {
        this.willDeadBalls[i].splice(i, 1);
      }
    }
  }

  fenceValueAsPosition(value, limit, maxRadius) {
    return Math.min(Math.max(value, maxRadius + 1), limit - maxRadius - 1);
  }

  bounceOnBalls() {
    const goBackWhenCollide = (c1, c2) => {
      const dist = c1.pos.dist(c2.pos);
      const elapsedSize = c1.radius + c2.radius - dist;

      const repulsiveDirectionC1 = c1.pos
        .sub(c2.pos)
        .normalize()
        .mul(elapsedSize / 2);
      const repulsiveDirectionC2 = c1.pos
        .sub(c2.pos)
        .normalize()
        .mul(-elapsedSize / 2);

      c1.pos = c1.pos.add(repulsiveDirectionC1);
      c2.pos = c2.pos.add(repulsiveDirectionC2);
    };

    const elasticCollision = (c1, c2) => {
      const n = c2.pos.sub(c1.pos).div(c2.pos.dist(c1.pos));
      const p = (2 * (c1.dir.dot(n) - c2.dir.dot(n))) / (c1.radius + c2.radius);

      c1.dir = c1.dir.sub(n.mul(c1.radius).mul(p)).normalize();
      c2.dir = c2.dir.add(n.mul(c2.radius).mul(p)).normalize();
    };

    for (let i = 0; i < this.balls.length - 1; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const one = this.balls[i];
        const other = this.balls[j];

        if (one.pos.dist(other.pos) <= one.radius + other.radius) {
          goBackWhenCollide(one, other);
          elasticCollision(one, other);
        }
      }
    }
  }
}

export default BallManager;
