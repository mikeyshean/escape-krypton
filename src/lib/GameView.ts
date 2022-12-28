import Game from './Game'
import $ from "jquery";

class GameView {

  
  themeSong = new Audio("assets/soundfx/superman_theme.mp3")
  currentTime = 0
  gameOver = new Audio("assets/soundfx/game_over.mp3")
  ctx: CanvasRenderingContext2D
  game: Game
  $leaderList: JQuery
  $submitScore: JQuery
  $restart: JQuery
  
  
  constructor (ctx: CanvasRenderingContext2D, $el: JQuery, $leaderList: JQuery) {
    this.ctx = ctx;
    this.game = new Game(this.ctx)
    this.$leaderList = $leaderList
    this.$submitScore = $el.find(".submit")
    this.$restart = $el.find(".restart");
    this.prepareThemeSong()
    // this.getLeaders();
  }

  showMenu(): void {
    const intervalId = setInterval(() => {
      this.game.drawMenu();
    }, 20)
    this.bindKeys(intervalId);
  }

  private prepareThemeSong() {
    this.addLooping()
    
    // Wait for user click to play song
    // https://developer.chrome.com/blog/autoplay/
    $("window").on("click", () => {
      this.themeSong.currentTime = 46;
      this.themeSong.play();
    })
  }

  private addLooping() {
    if (typeof this.themeSong.loop == 'boolean') {
      this.themeSong.loop = true;
    } else {
      this.themeSong.addEventListener('ended', function () {
        this.currentTime = 46;
        this.play();
      })
    }
  }

  run(): void {
    if (this.themeSong.paused) {
      this.themeSong.currentTime = 46
      this.themeSong.play();
    }
    const game = this.game
    game.reset();
    game.addKryptonite()

    this.ctx.lineJoin = "miter";
    this.ctx.lineWidth = 1;

    const intervalId = setInterval(() => {
      if (!game.paused) {
        game.step();
        game.draw(false);
      }

      if (game.gameOver) {
        game.draw(true)
        clearInterval(intervalId);
        this.themeSong.pause();
        this.gameOver.currentTime = 0;
        this.gameOver.play();

        setTimeout(() => {
          this.showEndGame();
        }, 300)

      }
    }, 1000/60)
  };

  bindKeys(intervalId: NodeJS.Timer|undefined) {
    $(document).on("keydown", (e: JQuery.Event) => {
      switch (e.which) {
        case 38:
          e.preventDefault();
          clearInterval(intervalId);
          this.startGame();
          break;

        case 32:
          e.preventDefault();
          clearInterval(intervalId);
          this.startGame();
          break;
        default:
          return;
      }
    })

    $("#canvas").on("click", (e: JQuery.Event) => {
      e.preventDefault();
      clearInterval(intervalId);
      this.startGame();
    })
  };

  startGame() {
    this.$restart.hide();
    this.$submitScore.hide();
    this.$submitScore.off("click")
    this.$restart.off("click")
    this.run();
  };

  showScore() {
    const ctx = this.ctx;
    ctx.fillStyle = "#2e5280"
    ctx.strokeStyle = "#2e5280"
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;

    // outer score box
    this.roundRect(250, 100, 300, 200, 10)

    ctx.fillStyle = "#B42420";
    ctx.strokeStyle = "#B42420";

    // restart button
    this.roundRect(270, 245, 120, 45, 10)
    this.roundRect(410, 245, 120, 45, 10)

    ctx.fillStyle = "#fff"
    ctx.font = "18px 'Press Start 2P'"

    const currentScore = this.game.currentCount > 0 ? this.game.currentCount - 1 : this.game.currentCount
    
    // TODO: What in the world does this do??
    let xCoord = 393
    if (currentScore >= 100 ) {
      xCoord = 375
    } else if (currentScore >= 10) {
      xCoord = 383
    }
    ctx.fillText("Score", 358, 140);
    ctx.fillText(String(currentScore), xCoord, 165);

    const bestScore = this.game.highestScore();
    xCoord = 393
    if (bestScore >= 100 ) {
      xCoord = 375
    } else if (bestScore >= 10) {
      xCoord = 383
    }
    ctx.fillText("Best", 368, 200);
    ctx.fillText(String(bestScore), xCoord, 225);
  };

  submitScore(name: string|null) {
    if (name) {
      const data = {
        'name': name,
        'score': this.game.highestScore()
      }
      $.ajax({
        type: "POST",
        data: data,
        url:"https://ms-leaderboards.herokuapp.com/leaders",
        dataType: 'json',
        success: (leaders) => {
            // this.renderLeaderboard(leaders);
            this.game.bestCount = 0;
        }
      });
    }
  };

  // getLeaders() {

  //   $.ajax({
  //     type: "GET",
  //     url:"https://ms-leaderboards.herokuapp.com/leaders",
  //     dataType: 'json',
  //     success:function(leaders){
  //         this.renderLeaderboard(leaders);
  //     }.bind(this)
  //   });
  // };

  // renderLeaderboard(leaders) {
  //   this.$leaderList.empty();
  //   const name, score, rank, leader;

  //   for (const i = 0; i < 10; i++) {
  //     leader = leaders[i];
  //     rank = i + 1
  //     const $li = $("<li>").addClass("group")
  //     if (leader) {
  //       name = leader["name"];
  //       score = leader["score"];
  //     } else {
  //       name = "???"
  //       score = "???"
  //     }
  //     const $nameSpan = $("<span>" + rank + ".  " + name + "</span>");
  //     const $scoreSpan = $("<span>" + score + "</span>");
  //     (rank < 10) ? $nameSpan.addClass("padding") : ""
  //     $li.append($nameSpan).append($scoreSpan)
  //     this.$leaderList.append($li)

  //   }
  // };

  showEndGame() {
    this.showScore();
    this.$restart.show();
    this.$submitScore.show();
    const that = this;

    // TODO: Check this
    this.bindKeys(undefined);
    this.$submitScore.one("click", function (e) {
      e.preventDefault();
      const bestScore = that.game.highestScore();
      that.submitScore(prompt(`Score: ${bestScore}`, "Enter your name"));
      that.$restart.hide();
      that.$submitScore.hide();
      that.game.reset();
      that.showMenu();
    })

    this.$restart.one("click", function (e) {
      e.preventDefault();
      that.startGame();
    })
  }

  private roundRect(rectX: number, rectY: number, rectWidth: number, rectHeight: number, cornerRadius: number) {
    this.ctx.strokeRect(
      rectX+(cornerRadius/2),
      rectY+(cornerRadius/2),
      rectWidth-cornerRadius,
      rectHeight-cornerRadius
    )

    this.ctx.fillRect(
      rectX+(cornerRadius/2),
      rectY+(cornerRadius/2),
      rectWidth-cornerRadius,
      rectHeight-cornerRadius
    )
  }
}

export default GameView
