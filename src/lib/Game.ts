import Superman from './Superman'
import Kryptonite from './Kryptonite'
import $ from "jquery"


class Game {
    superman: Superman
    gamePieces: (Superman|Kryptonite)[]
    height = 400
    width = 800
    goingUp = true
    paused = false
    gameOver = false
    GRAVITY = .2
    nextKryptoniteId = 1
    kryptoniteScore = new Set<number>()
    stepCount = 0

    canvas: CanvasRenderingContext2D
    constructor(canvas: CanvasRenderingContext2D) {
      this.canvas = canvas
      this.superman = new Superman(this.canvas, this.GRAVITY)
      this.gamePieces = [this.superman]
    }

    draw(): void {
      // Main drawing of entire game state for each step
      this.canvas.clearRect(0, 0, 800, 400)
      
      this.gamePieces.forEach(function (object) {
        object.draw()
      })
      if (this.gameOver) {
        this.hideScoreCounter()
      } else {
        this.showScoreCounter()
      }
    }

    showScoreCounter() {
      const text = String(this.currentScore())
      this.drawCounter(text)
    }

    hideScoreCounter() {
      const text = ""
      this.drawCounter(text)
    }

    drawMenu() {
      const canvas = this.canvas
      canvas.clearRect(0, 0, 800, 400)
      this.floatSuperman()

      canvas.fillStyle = "#2AE249"
      canvas.strokeStyle = "#00CC00"
      canvas.lineJoin = "miter"
      canvas.lineWidth = 1
      canvas.font = "28px 'Press Start 2P'"
      canvas.strokeText("Escape Krypton", 200, 75)
      canvas.fillText("Escape Krypton", 205, 75)

      canvas.font = "16px 'Press Start 2P'"
      canvas.fillStyle = "#fff"
      canvas.strokeStyle = "#2e5280"
      canvas.fillText("Press 'space', 'up', or 'click' to fly", 95, 320)
      canvas.strokeText("Press 'space', 'up', or 'click' to fly", 95, 320)
      canvas.fillText("Don't hit the", 197, 355)
      canvas.strokeText("Don't hit the", 197, 355)

      canvas.fillStyle = "#2AE249"
      canvas.strokeStyle = "#00CC00"
      canvas.fillText("Kryptonite!", 421, 355)
      canvas.strokeText("Kryptonite!", 421, 355)
      this.superman.draw()
    }

    step() {
      this.moveObjects()
      this.removeKryptonite()
      this.checkCollisions()
      this.checkGameOver()
      this.tryAddKryptonite()
      this.updateScore()
      this.stepCount++
    }

    floatSuperman() {
      const supermanVelocity = this.superman.yVelocity
      if (this.goingUp) {
        this.superman.move(1, true)
      } else {
        this.superman.move(0, true)
      }

      if (supermanVelocity < -1) {
        this.goingUp = false
      } else if (supermanVelocity > 2) {
        this.goingUp = true
      }
    }

    togglePause() {
      this.paused = !this.paused
    }

    checkCollisions() {
      this.gamePieces.forEach((object) => {
        if (object instanceof Superman) { return }

        const kryptonite = object as Kryptonite
        if (this.isSideCollision(kryptonite) ||
            this.gapCollision(kryptonite) ||
            this.trigCollision(kryptonite)
        ) {
          this.gameOver = true
        }
      })
    }

    updateScore() {
      this.gamePieces.forEach((object) => {
        if (object instanceof Superman) { return }

        const kryptonite = object as Kryptonite
        if (this.isScoredKryptonite(kryptonite)) {
          this.kryptoniteScore.add(kryptonite.id)
        }
      })
    }

    isScoredKryptonite(kryptonite: Kryptonite) {
      return this.superman.xBackEdge() > kryptonite.rightEdge()
    }

    // See main README for visuals of what types of collision scenarios these cover
    private isSideCollision(kryptonite: Kryptonite) {
      // 1-2:  Check if the left edge of the kryptonite (x-coord) is between Superman's hitbox
      //   AND
      // (
      //   3: Top of superman is above the top kryptonite's bottom edge
      //   OR
      //   4. Bottom of superman is below top edge of bottom kryptonite
      // )
      
      return (this.superman.xRightEdge() > kryptonite.leftEdge()) &&
            (this.superman.xBackEdge() < kryptonite.leftEdge()) &&
            (this.superman.yTopEdge() < kryptonite.topKryptoniteBottomEdge() ||
              this.superman.yBottomRight() > kryptonite.bottomKryptoniteTopEdge())
    }
    
    private gapCollision(kryptonite: Kryptonite) {
      // 1-2:  Check if Superman is inside the gap (x-axis)
      //   AND
      // (
      //   3: Top of superman is above the top kryptonite's bottom edge
      //   OR
      //   4. Bottom of superman is below top edge of bottom kryptonite
      // )
      return this.superman.xRightEdge() < kryptonite.rightEdge() &&
              this.superman.xRightEdge() > kryptonite.leftEdge() &&
              (this.superman.yTopEdge() < kryptonite.topKryptoniteBottomEdge() ||
              this.superman.yBottomRight() > kryptonite.bottomKryptoniteTopEdge())
    }

    private trigCollision(kryptonite: Kryptonite) {
      // 1-2:  Check if the right edge of the kryptonite (x-coord) is between Superman's hitbox
      //   AND
      // (
      //   3: Bottom of superman is below top edge of bottom kryptonite
      //   OR
      //   4. Distance between kryptonite's right edge and superman's left edge (along x-axis) > 
      //      Distance between superman's bottom edge and bottom edge of top kryptonite (y-axis)
      //        (This calculation relies on the pythagoreum theorum applied to an isosceles right triangle)
      // )
      return this.superman.xRightEdge() > kryptonite.rightEdge() &&
              this.superman.xBackEdge() < kryptonite.rightEdge() &&
              (this.superman.yBottomRight() > kryptonite.bottomKryptoniteTopEdge() ||
              (kryptonite.rightEdge() - this.superman.xBackEdge() > this.superman.yBottomRight() - kryptonite.topKryptoniteBottomEdge()))
    }


    bindKeys() {
      $(document).off("keydown")
      $("#canvas").off("click")
      $(document).on("keydown", (e: JQuery.Event) => {

        switch (e.which) {
          case 38: // up
            e.preventDefault()
            this.superman.move(6.5, false)
            break

          case 32: // up
            e.preventDefault()
            this.superman.move(6.5, false)
            break

          case 80: // pause
            e.preventDefault()
            this.togglePause()
            break

          default:
            return
        }
      })

      $("#canvas").on("click", (e:JQuery.Event) => {
        e.preventDefault()
        this.superman.move(6.5, false)
      })
    }

    moveObjects() {
      this.gamePieces.forEach((object) => {
        object.step()
      })
    }

    removeKryptonite() {
      const firstKryptonite = this.gamePieces[1]
      if (firstKryptonite?.isOffScreen()) {
        this.gamePieces.splice(1, 1)
      }
    }

    drawCounter(text: string) {
      this.canvas.fillStyle = "#EA1821"
      this.canvas.strokeStyle = "#2e5280"
      this.canvas.font = "28px 'Press Start 2P'"
      this.canvas.fillText(text, 390, 60)
      this.canvas.strokeText(text, 390, 60)
    }

    tryAddKryptonite() {
      // Adds next kryptonite when current one is halfway through game space
      const lastKryptonite = this.gamePieces[this.gamePieces.length - 1]
      if (lastKryptonite && 
        this.isKryptonite(lastKryptonite) && 
        lastKryptonite.leftEdge() < (this.width / 2)
      ) {
        this.addKryptonite()
      }
  }

  isKryptonite(object: Superman | Kryptonite): object is Kryptonite {
    return object instanceof Kryptonite
  }

  addKryptonite() {
    this.gamePieces.push(new Kryptonite(this.nextKryptoniteId, this.canvas, this.height, this.width))
    this.nextKryptoniteId++
  }

  checkGameOver(): void {
    this.gameOver || (this.gameOver = this.superman.isGone())
  }

  reset() {
    this.superman.reset()
    this.bindKeys()
    this.gamePieces = [this.superman]
    this.gameOver = false
    this.nextKryptoniteId = 1
    this.kryptoniteScore.clear()
    this.stepCount = 0
  }

  currentScore() {
    return this.kryptoniteScore.size
  }
}

export default Game
