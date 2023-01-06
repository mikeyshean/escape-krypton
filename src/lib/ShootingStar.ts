
import type GameObject from './GameObject'
import { Constants } from '../constants'

const WIDTH = 20
const HEIGHT = 20

class ShootingStar implements GameObject {
  xPosition: number
  yPosition: number
  image = new Image()
  canvas: CanvasRenderingContext2D

  constructor(canvas: CanvasRenderingContext2D) {
    this.xPosition = Constants.GAME_WIDTH
    this.yPosition = Math.random() * Constants.GAME_HEIGHT
    this.image.src = '../assets/images/shooting_star.png'
    this.canvas = canvas
  }

  draw(): void {
    this.canvas.drawImage(
      this.image,
      0, // The x-axis coordinate of the top left corner of the sub-rectangle of the source image
      0, // The y-axis coordinate of the top left corner of the sub-rectangle of the source image
      WIDTH, // The width of the sub-rectangle of the source image
      HEIGHT, // The height of the sub-rectangle of the source image
      this.xPosition, // The x-axis coordinate in the destination canvas at which to place the top-left corner of the source image.
      this.yPosition, // The y-axis coordinate in the destination canvas at which to place the top-left corner of the source image.
      WIDTH, // The width to draw the image in the destination canvas.
      HEIGHT //The height to draw the image in the destination canvas.
    )
  }

  step() {
    this.xPosition -= Constants.SCROLLING_STEP_AMOUNT + 1
    this.yPosition += .5
  }

  isOffScreen(): boolean {
    return this.xPosition + WIDTH < 0
  }
}

export default ShootingStar