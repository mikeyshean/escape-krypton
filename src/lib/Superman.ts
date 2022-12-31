const DIM = 33
const MAX_VEL = -5.5
const START_POS_X = 400
const START_POS_Y = 200
const START_VEL_X = 0
const START_VEL_Y = 0

class Superman {

  xPosition = START_POS_X
  yPosition = START_POS_Y
  xTopPosition = START_POS_X
  yTopPosition = START_POS_Y - DIM
  yBackPosition = START_POS_Y
  xBackPosition = START_POS_X - DIM
  dim = DIM
  image = new Image()
  flySound = new Audio()
  xVelocity = START_VEL_X
  yVelocity = START_VEL_Y
  ctx: CanvasRenderingContext2D
  gravity: number

  constructor(ctx: CanvasRenderingContext2D, gravity: number) {
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
    this.ctx.beginPath()

    if (yVel > 4 && yVel <= 8) {
      sx = 218
      sy = 248
    } else if (yVel > 8){
      sx = 0
      sy = 214
    } else {
      sx = 0
      sy = 0
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
    )
  }

  move(dir: number, floating: boolean): void {
    if (dir) {
      if (!floating) {
        this.flySound.currentTime = 0
        this.flySound.play()
      }
      if (this.yVelocity - dir > MAX_VEL) {
        this.yVelocity -= dir
      } else {
        this.yVelocity = MAX_VEL
      }
    }
    this.step()
  }

  step(): void {
    this.yVelocity += this.gravity
    this.yPosition += this.yVelocity
    this.yTopPosition += this.yVelocity
    this.yBackPosition += this.yVelocity
  }
  
  isGone(): boolean {
    return this.yPosition > 400
  }

  reset(): void {
    this.xPosition = START_POS_X
    this.yPosition = START_POS_Y
    this.xTopPosition = START_POS_X
    this.yTopPosition = START_POS_Y - DIM
    this.yBackPosition = START_POS_Y
    this.xBackPosition = START_POS_X - DIM
    this.xVelocity = START_VEL_X
    this.yVelocity = START_VEL_Y
  }

  isOffScreen(): boolean {
    // Only used for kryptonite removal 
    return false
  }

  yBackEdge(): number {
    return this.yBackPosition
  }

  xBackEdge() {
    return this.xBackPosition
  }

  yTopEdge(): number {
    return this.yTopPosition
  }

  xRightEdge(): number {
    return this.xPosition
  }
  
  yBottomRight(): number {
    return this.yPosition
  }

}
export default Superman