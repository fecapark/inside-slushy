# Inside Slushy

by fecapark

Interactive project, inspired by slushy machine.

## Demo

[Project Link](https://fecapark.github.io/inside-slushy/)

<img src="https://github.com/fecapark/inside-slushy/assets/101973955/8f2e1f70-d933-48b2-9970-a5e1a41e357f" width="500" />

## Interactive behaviors

- Hold and spin the spinner.
- Create slushy balls as touch background.

## Project behind

### Physics engine

No third party physics engine.

Implements: 
- Acceleration (Movements).
- Elastic collision between circles.
    - Calculated by replacing the radius by mass.
- Solved multiple circles collision problem ([Like this](https://gamedev.stackexchange.com/questions/104042/2d-multiple-circle-collision-response))
  - By moving it back to the way it came before the collision. ([Code](https://github.com/fecapark/inside-slushy/blob/f94fd9d5e9d52c3be5bb57d01a375eab572e0233/src/managers/BallManager.js#L194C11-L194C28))
- Normal force between rotated spinner and moving balls.

### Guides

<img src="https://github.com/fecapark/inside-slushy/assets/101973955/3c16c0f9-0919-42b4-9795-821ef329c2ae" width="500" />

Spotlight guide for UX.

Using HTML5 Canvas masking.

- Apply `Context2d.globalCompositeOperation = "destination-out";`, you can get same effect.
- To get more information, refer to [my lab project](https://github.com/fecapark/masking-animation)'s code.
  
