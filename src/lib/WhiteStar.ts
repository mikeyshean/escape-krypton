
import GameObject from './GameObject'
import { Constants } from '../constants'

const WIDTH = 16
const HEIGHT = 16

class WhiteStar implements GameObject {
  xPosition: number
  yPosition: number
  image = new Image()
  canvas: CanvasRenderingContext2D

  constructor(canvas: CanvasRenderingContext2D, game_height: number, game_width: number) {
    this.xPosition = game_width // Starts from far right of screen
    this.yPosition = Math.random() * game_height
    this.image.src = '../assets/images/white_star.png'
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
    this.xPosition -= Constants.SCROLLING_STEP_AMOUNT
  }

  isOffScreen(): boolean {
    return this.xPosition + WIDTH < 0
  }
}

export default WhiteStar