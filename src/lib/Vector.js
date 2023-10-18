class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  copy() {
    return new Vector2(this.x, this.y);
  }

  add(vec2) {
    return new Vector2(this.x + vec2.x, this.y + vec2.y);
  }

  sub(vec2) {
    return new Vector2(this.x - vec2.x, this.y - vec2.y);
  }

  mul(num) {
    return new Vector2(this.x * num, this.y * num);
  }

  div(num) {
    if (num === 0) {
      return new Vector2(0, 0);
    }

    return new Vector2(this.x / num, this.y / num);
  }

  dist(vec2) {
    return this.sub(vec2).norm();
  }

  norm() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  normalize() {
    return this.div(this.norm());
  }

  dot(vec2) {
    return this.x * vec2.x + this.y * vec2.y;
  }

  cross(vec2) {
    return this.x * vec2.y - this.y * vec2.x;
  }
}

export default Vector2;
