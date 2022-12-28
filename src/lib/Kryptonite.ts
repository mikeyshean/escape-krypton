const MAX_HEIGHT = 240;
const MIN_HEIGHT = 30;
const WIDTH = 40;
const GAP = 88;
const COLLISION_PADDING = 3;

class Kryptonite {
  

  topHeight = Math.random() * MAX_HEIGHT + MIN_HEIGHT;
  bottomHeight: number
  width = WIDTH;
  image = new Image();

  game_height: number
  game_width: number
  ctx: CanvasRenderingContext2D

  xBottomPosition: number
  yBottomPosition: number
  xTopPosition: number
  yTopPosition: number

  constructor(ctx: CanvasRenderingContext2D, game_height: number, game_width: number) {
    this.game_height = game_height
    this.game_width = game_width
    this.xTopPosition = game_width
    this.yTopPosition = 0

    this.xBottomPosition = game_width
    this.yBottomPosition = 0 + this.topHeight + GAP
    this.image.src = '../assets/images/kryptonite.png'
    this.ctx = ctx
    this.bottomHeight =  game_height - this.topHeight - GAP;

  }

 


  draw(): void {
    var padding = COLLISION_PADDING

    // Draws collision paths
    // ctx.strokeRect(this.xTopPosition, this.yTopPosition, this.width, this.topHeight)
    this.ctx.drawImage(
      this.image,
      0,
      400 - this.topHeight - padding,
      50,
      this.topHeight + padding,
      this.xTopPosition,
      this.yTopPosition,
      this.width + padding,
      this.topHeight + padding
    );

    // Draws collision paths
    // ctx.strokeRect(this.xBottomPosition, this.yBottomPosition, this.width, this.bottomHeight)
    this.ctx.drawImage(
      this.image,
      65,
      38,
      50,
      this.bottomHeight + padding,
      this.xBottomPosition,
      this.yBottomPosition - padding,
      this.width + padding,
      this.bottomHeight + padding
    );
  };

  step() {
    this.xTopPosition -= 2.6;
    this.xBottomPosition -= 2.6;
  };

  isOffScreen() {
    return this.xTopPosition + this.width < 0
  };

  // sideCollision(bird: typeof Bird) {
  //   return (this.xTopPosition < bird.pos[0]) &&
  //           (this.xTopPosition >= bird.backPos[0]) &&
  //           (bird.yTopPosition < this.topHeight ||
  //             bird.backPos[1] > this.topHeight + GAP)
  // };

  // gapCollision(bird: typeof Bird) {
  //   return (bird.pos[0] < this.xTopPosition + this.width) &&
  //           (bird.pos[0] > this.xTopPosition) &&
  //           (bird.yTopPosition < this.yTopPosition ||
  //            bird.pos[1] > this.yBottomPosition)
  // };

  // trigCollision(bird: typeof Bird) {
  //   var xRightCorner = this.xTopPosition + this.width;
  //   return (bird.pos[0] > xRightCorner) &&
  //           (bird.backPos[0] < xRightCorner) &&
  //           (bird.backPos[1] > this.yBottomPosition ||
  //           (xRightCorner - bird.backPos[0]) > (bird.backPos[1] - this.topHeight))
  // };
}

export default Kryptonite