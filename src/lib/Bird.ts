const DIM = 33;
const COLOR = "green";
const MAX_VEL = -5.5;
const START_POS_X = 400;
const START_POS_Y = 200;
const START_VEL_X = 0
const START_VEL_Y = 0

class Bird {

  xPosition = START_POS_X;
  yPosition = START_POS_Y;
  xTopPosition = START_POS_X
  yTopPosition = START_POS_Y - DIM
  backPos = [START_POS_X - DIM, START_POS_Y];
  dim = DIM;
  // i = pos[0];
  image = new Image();
  flySound = new Audio();
  xVelocity = START_VEL_X
  yVelocity = START_VEL_Y
  ctx: CanvasRenderingContext2D
  gravity: number

  constructor (ctx: CanvasRenderingContext2D, gravity: number) {
    this.image.src = 'assets/images/chubby-superman.png'
    this.flySound.src = 'assets/soundfx/fly.m4a'
    this.ctx = ctx
    this.gravity = gravity
  }


  

  draw(): void {
    const yVel = this.yVelocity
    let sx: number
    let sy: number
    // ctx.strokeStyle = "#fff"
    this.ctx.beginPath();

    if (yVel > 4 && yVel <= 8) {
      sx = 218;
      sy = 248;
    } else if (yVel > 8){
      sx = 0;
      sy = 214;
    } else {
      sx = 0;
      sy = 0;
    }
    
    this.ctx.drawImage(
      this.image,
      sx,
      sy,
      218,
      214,
      this.xPosition - DIM,
      this.yPosition - DIM,
      40,
      40
    );

    // ctx.moveTo(this.pos[0], this.pos[1]);
    // ctx.lineTo(this.topPos[0], this.topPos[1])
    // ctx.lineTo(this.backPos[0], this.backPos[1])
    // ctx.closePath();
    // ctx.stroke();
  };

  move(dir: number, floating: boolean): void {
    if (dir) {
      if (!floating) {
        this.flySound.currentTime = 0;
        this.flySound.play();
      }
      if (this.yVelocity - dir > MAX_VEL) {
        this.yVelocity -= dir
      } else {
        this.yVelocity = MAX_VEL
      }
    }
    this.step()
  };

  step(): void {
    this.yVelocity += this.gravity
    this.yPosition += this.yVelocity
    this.yTopPosition += this.yVelocity
    this.backPos[1] += this.yVelocity
  }
  

  // The game should detect collisions between its game objects
  // isCollidedWith(kryptonite): boolean {
  //   return kryptonite.sideCollision(this) ||
  //           kryptonite.gapCollision(this) ||
  //           kryptonite.trigCollision(this)
  // };

  isGone(): boolean {
    return this.yPosition > 400
  }

  reset(): void {
    this.xPosition = START_POS_X
    this.yPosition = START_POS_Y
    this.xTopPosition = START_POS_X
    this.yTopPosition = START_POS_Y - DIM
    this.backPos = [START_POS_X - DIM, START_POS_Y];
    this.xVelocity = START_VEL_X
    this.yVelocity = START_VEL_Y
  }

  isOffScreen(): boolean {
    // used for kryptonite removal 
    return false
  };
}
export default Bird