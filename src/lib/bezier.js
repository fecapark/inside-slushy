import Vector2 from "./Vector.js";

function Bezier(x1, y1, x2, y2) {
  function calculate(t) {
    t = Math.max(0, Math.min(1, t)); // t: Range [0, 1]
    const s = 1 - t;

    // Base points
    const A = new Vector2(0, 0);
    const B = new Vector2(x1, y1);
    const C = new Vector2(x2, y2);
    const D = new Vector2(1, 1);

    // For linear bezier curve
    const linearA = A.mul(s).add(B.mul(t));
    const linearB = B.mul(s).add(C.mul(t));
    const linearC = C.mul(s).add(D.mul(t));

    // For quadratic bezier curve
    const quadA = linearA.mul(s).add(linearB.mul(t));
    const quadB = linearB.mul(s).add(linearC.mul(t));

    // For cubic bezier curve
    const cubicBezierPos = quadA.mul(s).add(quadB.mul(t));

    return cubicBezierPos.y;
  }

  return calculate;
}

export { Bezier };
