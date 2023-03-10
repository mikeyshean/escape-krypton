import { Constants } from '../constants'
import GameObject from './GameObject'

// All these constants are not necessary anymore, but I distinctly remember how helpful they were during development to 
// quickly test different settings until I got the gameplay to feel just right.
const MAX_HEIGHT = 240
const MIN_HEIGHT = 30
const GAP_BETWEEN_KRYPTONITE = 88

// This extra "collision" padding is added to edges when we draw on canvas.
// Later when we calculate for collision detection we use the instance's original edge dimensions.
// This results in less strict detection.
const KRYPTONITE_WIDTH = 40
const COLLISION_PADDING = 3 
const PADDED_KRYPTONITE_WIDTH = KRYPTONITE_WIDTH + COLLISION_PADDING

class Kryptonite implements GameObject {
  /*
    This class is a bit unusual in that each instance is responsible for TWO kryptonite, the top and bottom one.
    Because the top and bottom kryptonite share their X coord as it moves across the screen and they share 
    a relationship in reference to the position of the GAP created between them, it helps to keep their properties
    and functionality together.
  */

  topKryptoniteHeight = Math.random() * MAX_HEIGHT + MIN_HEIGHT
  bottomKryptoniteHeight: number
  xBottomPosition: number
  yBottomPosition: number
  xTopPosition: number
  yTopPosition: number
  image = new Image()
  canvas: CanvasRenderingContext2D
  id: number

  constructor(id: number, canvas: CanvasRenderingContext2D) {
    this.id = id
    // game_height and game_width are used as inital reference points to know where to start 
    // our first stroke onto the canvas to enter the game.  Allows for potentially exploring
    // different canvas sizes

    // Top kryptonite's position on the canvas
    this.xTopPosition = Constants.GAME_WIDTH
    this.yTopPosition = 0

    // Bottoms kryptonite's position on the canvas + height
    this.xBottomPosition = Constants.GAME_WIDTH
    this.yBottomPosition = this.topKryptoniteHeight + GAP_BETWEEN_KRYPTONITE
    this.bottomKryptoniteHeight =  Constants.GAME_HEIGHT - this.topKryptoniteHeight - GAP_BETWEEN_KRYPTONITE

    this.image.src = '../assets/images/kryptonite.png'
    this.canvas = canvas
  }

  draw(): void {
    // Draws top kryptonite
    this.canvas.drawImage(
      this.image,
      0, // The x-axis coordinate of the top left corner of the sub-rectangle of the source image
      400 - this.topKryptoniteHeight - COLLISION_PADDING, // The y-axis coordinate of the top left corner of the sub-rectangle of the source image
      50, // The width of the sub-rectangle of the source image
      this.topKryptoniteHeight + COLLISION_PADDING, // The height of the sub-rectangle of the source image
      this.xTopPosition, // The x-axis coordinate in the destination canvas at which to place the top-left corner of the source image.
      this.yTopPosition, // The y-axis coordinate in the destination canvas at which to place the top-left corner of the source image.
      PADDED_KRYPTONITE_WIDTH, // The width to draw the image in the destination canvas.
      this.topKryptoniteHeight + COLLISION_PADDING //The height to draw the image in the destination canvas.
    )

    // Draws bottom kryptonite
    // this.canvas.strokeRect(this.xBottomPosition, this.yBottomPosition, this.width, this.bottomKryptoniteHeight)
    this.canvas.drawImage(
      this.image,
      65, // source position
      38, // source position
      50, // source position
      this.bottomKryptoniteHeight + COLLISION_PADDING, // target position
      this.xBottomPosition, // target position
      this.yBottomPosition - COLLISION_PADDING, // target position
      PADDED_KRYPTONITE_WIDTH, // width
      this.bottomKryptoniteHeight + COLLISION_PADDING // height
    )
  }

  step() {
    this.xTopPosition -= Constants.SCROLLING_STEP_AMOUNT
    this.xBottomPosition -= Constants.SCROLLING_STEP_AMOUNT
  }
  
  isOffScreen(): boolean {
    // Used to garbage collect
    return this.xTopPosition + KRYPTONITE_WIDTH < 0
  }

  bottomKryptoniteTopEdge(): number {
    return this.topKryptoniteHeight + GAP_BETWEEN_KRYPTONITE
  }

  topKryptoniteBottomEdge(): number {
    return this.topKryptoniteHeight
  }

  leftEdge() {
    return this.xTopPosition
  }
  
  rightEdge() {
    return this.xTopPosition + KRYPTONITE_WIDTH
  }
}

export default Kryptonite