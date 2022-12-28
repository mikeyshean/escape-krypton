import Bird from './Bird'
import Kryptonite from './Kryptonite';
import $ from "jquery";


class Game {
    bird: Bird
    allObjects: (Bird|Kryptonite)[]
    height = 400;
    width = 800;
    currentCount = 0;
    bestCount = 0;
    goingUp = true
    paused = false
    gameOver = false

    GRAVITY = .2;

    ctx: CanvasRenderingContext2D
    constructor(ctx: CanvasRenderingContext2D) {
      this.ctx = ctx
      this.bird = new Bird(ctx=this.ctx, this.GRAVITY)
      this.allObjects = [this.bird]
    }

    draw(blankCount: boolean): void {
      this.ctx.clearRect(0, 0, 800, 400);
      
      this.allObjects.forEach(function (object) {
      
        object.draw();
      })
      this.drawCount(blankCount);
    };

    drawMenu() {
      const ctx = this.ctx
      ctx.clearRect(0, 0, 800, 400);
      this.floatBird();

      ctx.fillStyle = "#2AE249";
      ctx.strokeStyle = "#00CC00";
      ctx.lineJoin = "miter";
      ctx.lineWidth = 1;
      ctx.font = "28px 'Press Start 2P'"
      ctx.fillText("Escape from Krypton", 135, 75);
      ctx.strokeText("Escape from Krypton", 135, 75);

      ctx.font = "16px 'Press Start 2P'"
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#2e5280";
      ctx.fillText("Press 'space', 'up', or 'click' to fly", 95, 320);
      ctx.strokeText("Press 'space', 'up', or 'click' to fly", 95, 320);
      ctx.fillText("Don't hit the", 197, 355);
      ctx.strokeText("Don't hit the", 197, 355);

      ctx.fillStyle = "#2AE249";
      ctx.strokeStyle = "#00CC00";
      ctx.fillText("Kryptonite!", 421, 355);
      ctx.strokeText("Kryptonite!", 421, 355);
      this.bird.draw();
    };

    step() {
      this.moveObjects();
      this.removeKryptonite()
      this.checkCollisions();
      this.checkGameOver();
      this.tryAddKryptonite();
    };

    floatBird() {
      const birdVel = this.bird.yVelocity
      if (this.goingUp) {
        this.bird.move(1, true)
      } else {
        this.bird.move(0, true)
      }

      if (birdVel < -1) {
        this.goingUp = false
      } else if (birdVel > 2) {
        this.goingUp = true;
      }
    };

    addKryptonite() {
      this.allObjects.push(new Kryptonite(this.ctx, this.height, this.width))
    };

    togglePause() {
      this.paused = !this.paused
    };

    checkCollisions() {
      this.allObjects.forEach((object) => {
        if (object instanceof Bird) { return; }

        if (this.isCollision(object)) {
          this.gameOver = true;
        }
      })
    };

    isCollision(kryptonite: Kryptonite): boolean {
      return false
    }

    bindKeys() {
      $(document).off("keydown")
      $("#canvas").off("click");
      $(document).on("keydown", (e: JQuery.Event) => {

        switch (e.which) {
          case 38: // up
            e.preventDefault();
            this.bird.move(6.5, false)
            break;

          case 32: // up
            e.preventDefault();
            this.bird.move(6.5, false)
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
        this.bird.move(6.5, false)
      })
    };

    moveObjects() {
      this.allObjects.forEach((object) => {
        object.step();
      })
    };

    removeKryptonite() {
      const firstKryptonite = this.allObjects[1]
      if (firstKryptonite?.isOffScreen()) {
        this.allObjects.splice(1, 1)
      }
    };

    drawCount(blankCount: boolean) {
      const text = (blankCount) ? "" : String(this.currentCount)

      this.ctx.fillStyle = "#EA1821"
      this.ctx.strokeStyle = "#2e5280"
      this.ctx.font = "28px 'Press Start 2P'"
      this.ctx.fillText(text, 390, 60);
      this.ctx.strokeText(text, 390, 60);
    };

    tryAddKryptonite() {
      const lastKryptonite = this.allObjects[this.allObjects.length - 1];
      if (lastKryptonite && lastKryptonite.xTopPosition < (this.width / 2)) {
        this.addKryptonite();
        this.currentCount++
      }
  };

  checkGameOver(): void {
    this.gameOver || (this.gameOver = this.bird.isGone())
  };

  reset() {
    this.bird.reset();
    this.bindKeys()
    this.allObjects = [this.bird];
    this.gameOver = false;
    this.currentCount = 0;
  };

  highestScore() {
    if (this.currentCount - 1 > this.bestCount) {
      this.bestCount = this.currentCount - 1
    }

    return this.bestCount;
  }
};

export default Game;
