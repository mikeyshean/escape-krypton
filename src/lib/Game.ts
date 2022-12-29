import Superman from './Superman'
import Kryptonite from './Kryptonite';
import $ from "jquery";


class Game {
    superman: Superman
    gamePieces: (Superman|Kryptonite)[]
    height = 400;
    width = 800;
    kryptonitesCreated = 0;
    bestCount = 0;
    goingUp = true
    paused = false
    gameOver = false
    GRAVITY = .2;

    canvas: CanvasRenderingContext2D
    constructor(canvas: CanvasRenderingContext2D) {
      this.canvas = canvas
      this.superman = new Superman(this.canvas, this.GRAVITY)
      this.gamePieces = [this.superman]
    }

    draw(): void {
      // Main drawing of entire game state for each step
      this.canvas.clearRect(0, 0, 800, 400);
      
      this.gamePieces.forEach(function (object) {
        object.draw();
      })
      if (this.gameOver) {
        this.hideScoreCounter()
      } else {
        this.showScoreCounter();
      }
    };

    showScoreCounter() {
      const text = String(this.getCurrentScore())
      this.drawCounter(text)
    };

    hideScoreCounter() {
      const text = ""
      this.drawCounter(text)
    };

    drawMenu() {
      const canvas = this.canvas
      canvas.clearRect(0, 0, 800, 400);
      this.floatSuperman();

      canvas.fillStyle = "#2AE249";
      canvas.strokeStyle = "#00CC00";
      canvas.lineJoin = "miter";
      canvas.lineWidth = 1;
      canvas.font = "28px 'Press Start 2P'"
      canvas.fillText("Escape from Krypton", 135, 75);
      canvas.strokeText("Escape from Krypton", 135, 75);

      canvas.font = "16px 'Press Start 2P'"
      canvas.fillStyle = "#fff";
      canvas.strokeStyle = "#2e5280";
      canvas.fillText("Press 'space', 'up', or 'click' to fly", 95, 320);
      canvas.strokeText("Press 'space', 'up', or 'click' to fly", 95, 320);
      canvas.fillText("Don't hit the", 197, 355);
      canvas.strokeText("Don't hit the", 197, 355);

      canvas.fillStyle = "#2AE249";
      canvas.strokeStyle = "#00CC00";
      canvas.fillText("Kryptonite!", 421, 355);
      canvas.strokeText("Kryptonite!", 421, 355);
      this.superman.draw();
    };

    step() {
      this.moveObjects();
      this.removeKryptonite()
      this.checkCollisions();
      this.checkGameOver();
      this.tryAddKryptonite();
    };

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
        this.goingUp = true;
      }
    };

    addKryptonite() {
      this.gamePieces.push(new Kryptonite(this.canvas, this.height, this.width))
      this.kryptonitesCreated++
    };

    togglePause() {
      this.paused = !this.paused
    };

    checkCollisions() {
      // TODO: This is unecessarily checking extra kryptonite
      this.gamePieces.forEach((object) => {
        if (object instanceof Superman) { return; }

        const kryptonite = object as Kryptonite
        if (this.isSideCollision(kryptonite) ||
            this.gapCollision(kryptonite) ||
            this.trigCollision(kryptonite)
        ) {
          this.gameOver = true;
        }
      })
    };

    // See main ReadME for visuals of what types of collision scenarios these cover
    private isSideCollision(kryptonite: Kryptonite) {
      // Must be that the left edge is in between superman's hit box
      // and he is either crossing above or below the gap boundaries
      // Note: Top left of canvas is [0, 0]
      
      return (this.superman.rightEdge() > kryptonite.leftEdge()) &&
            (this.superman.leftEdge() <= kryptonite.leftEdge()) &&
            (this.superman.topEdge() < kryptonite.topKryptoniteBottomEdge() ||
              this.superman.yBackEdge() > kryptonite.bottomKryptoniteTopEdge())
    }
    
    private gapCollision(kryptonite: Kryptonite) {
      return (this.superman.rightEdge() < kryptonite.rightEdge()) &&
              (this.superman.rightEdge() > kryptonite.leftEdge()) &&
              (this.superman.topEdge() < kryptonite.topKryptoniteBottomEdge() ||
              this.superman.yBottomRight() > kryptonite.bottomKryptoniteTopEdge())
    };

    private trigCollision(kryptonite: Kryptonite) {
      return (this.superman.rightEdge() > kryptonite.rightEdge()) &&
              (this.superman.leftEdge() < kryptonite.rightEdge()) &&
              (this.superman.yBackEdge() > kryptonite.bottomKryptoniteTopEdge() ||
              (kryptonite.rightEdge() - this.superman.leftEdge()) > (this.superman.yBackEdge() - kryptonite.topKryptoniteBottomEdge()))
    };


    bindKeys() {
      $(document).off("keydown")
      $("#canvas").off("click");
      $(document).on("keydown", (e: JQuery.Event) => {

        switch (e.which) {
          case 38: // up
            e.preventDefault();
            this.superman.move(6.5, false)
            break;

          case 32: // up
            e.preventDefault();
            this.superman.move(6.5, false)
            break;

          case 80: // pause
            e.preventDefault();
            this.togglePause();
            break;

          default:
            return;
        }
      })

      $("#canvas").on("click", (e:JQuery.Event) => {
        e.preventDefault();
        this.superman.move(6.5, false)
      })
    };

    moveObjects() {
      this.gamePieces.forEach((object) => {
        object.step();
      })
    };

    removeKryptonite() {
      const firstKryptonite = this.gamePieces[1]
      if (firstKryptonite?.isOffScreen()) {
        this.gamePieces.splice(1, 1)
      }
    };

    drawCounter(text: string) {
      this.canvas.fillStyle = "#EA1821"
      this.canvas.strokeStyle = "#2e5280"
      this.canvas.font = "28px 'Press Start 2P'"
      this.canvas.fillText(text, 390, 60);
      this.canvas.strokeText(text, 390, 60);
    }

    tryAddKryptonite() {
      // Adds next kryptonite when current one is halfway through game space
      const lastKryptonite = this.gamePieces[this.gamePieces.length - 1];
      if (lastKryptonite && lastKryptonite.xTopPosition < (this.width / 2)) {
        this.addKryptonite();
      }
  };

  checkGameOver(): void {
    this.gameOver || (this.gameOver = this.superman.isGone())
  };

  reset() {
    this.superman.reset();
    this.bindKeys()
    this.gamePieces = [this.superman];
    this.gameOver = false;
    this.kryptonitesCreated = 0;
  };

  highestScore() {
    if (this.kryptonitesCreated - 1 > this.bestCount) {
      this.bestCount = this.kryptonitesCreated - 1
    }

    return this.bestCount;
  }

  getCurrentScore() {
    return this.kryptonitesCreated - 1
  }

  getFinalScore() {
    // We need this because the currentScore is calculated as new kryptonites are created
    // A new one is created as superman PASSES through the previous one which is ambiguous for scoring
    // You may have noticed the score counter during the game is updated as superman enters the gap without
    // fully clearing. This is barely noticeable, but because of it we need to -1 here for the final score
    return this.getCurrentScore() - 1
  }
};

export default Game;
