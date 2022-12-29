import { useEffect } from 'react'
import Game from './Game'
import { trpc } from "../utils/trpc";
import $ from "jquery";
import { useGameSessionContext } from '../context/GameSessionContext'

function GameView() {
  const { gameSession, isGameSession } = useGameSessionContext()
  let themeSong: HTMLAudioElement
  let gameOver: HTMLAudioElement
  let game: Game
  let $leaderList: JQuery
  let $submitScore: JQuery
  let $restart: JQuery
  let ctx: CanvasRenderingContext2D
  let gameId: string
  let currentScore: number
  
  if (typeof Audio != "undefined") { 
    themeSong = new Audio("assets/soundfx/superman_theme.mp3") as HTMLAudioElement
    gameOver = new Audio("assets/soundfx/game_over.mp3")
  }

  const createGameApi = trpc.game.start.useMutation();
  const endGameApi = trpc.game.end.useMutation();

  // const prepareThemeSong() // useEffect here
  // getLeaders();


  useEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d')
    const $el = $(".game-wrapper")
    $submitScore = $el.find(".submit")
    $restart = $el.find(".restart");
    $leaderList = $(".leaderboard-list")

    if (context && $el && gameSession.id) {
      ctx = context
      game = new Game(ctx)
      showMenu()
    }
  }, [gameSession])


  function showMenu(): void {
    const intervalId = setInterval(() => {
      game.drawMenu();
    }, 20)
    bindKeys(intervalId);
  }

  function prepareThemeSong() {
    addLooping()
    
    // Must wait for user click to play song
    // https://developer.chrome.com/blog/autoplay/
    $("window").on("click", () => {
      themeSong.currentTime = 46;
      themeSong.play();
    })
  }

  function addLooping() {
    if (typeof themeSong.loop == 'boolean') {
      themeSong.loop = true;
    } else {
      themeSong.addEventListener('ended',() => {
        themeSong.currentTime = 46;
        themeSong.play();
      })
    }
  }

  function run(): void {
    if (themeSong.paused) {
      themeSong.currentTime = 46
      themeSong.play();
    }
    game.reset();
    game.addKryptonite()

    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;

    const intervalId = setInterval(() => {
      if (!game.paused) {
        game.step();
        game.draw(false);
      }

      if (game.gameOver) {
        // Todo Move more of this to game class
        currentScore = game.currentCount > 0 ? game.currentCount - 1 : game.currentCount
        updateEndGame(gameId, currentScore)
        game.draw(true)
        clearInterval(intervalId);
        themeSong.pause();
        gameOver.currentTime = 0;
        gameOver.play();

        setTimeout(() => {
          showEndGame();
        }, 300)

      }
    }, 1000/60)
  };

  function bindKeys(intervalId: NodeJS.Timer|undefined) {
    $(document).on("keydown", (e: JQuery.Event) => {
      switch (e.which) {
        case 38:
          e.preventDefault();
          clearInterval(intervalId);
          startGame();
          break;

        case 32:
          e.preventDefault();
          clearInterval(intervalId);
          startGame();
          break;
        default:
          return;
      }
    })

    $("#canvas").on("click", (e: JQuery.Event) => {
      e.preventDefault();
      clearInterval(intervalId);
      startGame();
    })
  };

  function startGame() {
    resetEndgameMenu()
    getGameId(gameSession.id)
    run();
  };
  
  function resetEndgameMenu() {
    $restart.hide();
    $submitScore.hide();
    $submitScore.off("click")
    $restart.off("click")
  }

  async function getGameId(sessionId: string) {
    const now = new Date().toISOString()
    const newGame = await createGameApi.mutateAsync({startedAt: now, sessionId: sessionId})
    gameId = newGame.id
  }

  async function updateEndGame(gameId: string, score: number) {
    const now = new Date().toISOString()
    const endedGame = await endGameApi.mutateAsync({id: gameId, endedAt: now, score: score})
  }

  function showScore() {
    ctx.fillStyle = "#2e5280"
    ctx.strokeStyle = "#2e5280"
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;

    // outer score box
    roundRect(250, 100, 300, 200, 10)

    ctx.fillStyle = "#B42420";
    ctx.strokeStyle = "#B42420";

    // restart button
    roundRect(270, 245, 120, 45, 10)
    roundRect(410, 245, 120, 45, 10)

    ctx.fillStyle = "#fff"
    ctx.font = "18px 'Press Start 2P'"

    const currentScore = game.currentCount > 0 ? game.currentCount - 1 : game.currentCount
    
    // TODO: What in the world does this do??
    let xCoord = 393
    if (currentScore >= 100 ) {
      xCoord = 375
    } else if (currentScore >= 10) {
      xCoord = 383
    }
    ctx.fillText("Score", 358, 140);
    ctx.fillText(String(currentScore), xCoord, 165);

    const bestScore = game.highestScore();
    xCoord = 393
    if (bestScore >= 100 ) {
      xCoord = 375
    } else if (bestScore >= 10) {
      xCoord = 383
    }
    ctx.fillText("Best", 368, 200);
    ctx.fillText(String(bestScore), xCoord, 225);
  };

  function submitScore(name: string|null) {
    if (name) {
      const data = {
        'name': name,
        'score': game.highestScore()
      }
      $.ajax({
        type: "POST",
        data: data,
        url:"https://ms-leaderboards.herokuapp.com/leaders",
        dataType: 'json',
        success: (leaders) => {
            // renderLeaderboard(leaders);
            game.bestCount = 0;
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
  //         renderLeaderboard(leaders);
  //     }.bind(this)
  //   });
  // };

  // renderLeaderboard(leaders) {
  //   $leaderList.empty();
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
  //     $leaderList.append($li)

  //   }
  // };

  function showEndGame() {
    showScore();
    $restart.show();
    $submitScore.show();

    // TODO: Check this
    bindKeys(undefined);
    $submitScore.one("click", (e) => {
      e.preventDefault();
      const bestScore = gameSession.highScore;
      submitScore(prompt(`Score: ${bestScore}`, "Enter your name"));
      $restart.hide();
      $submitScore.hide();
      game.reset();
      showMenu();
    })

    $restart.one("click", (e) => {
      e.preventDefault();
      startGame();
    })
  }

  function roundRect(rectX: number, rectY: number, rectWidth: number, rectHeight: number, cornerRadius: number) {
    ctx.strokeRect(
      rectX+(cornerRadius/2),
      rectY+(cornerRadius/2),
      rectWidth-cornerRadius,
      rectHeight-cornerRadius
    )

    ctx.fillRect(
      rectX+(cornerRadius/2),
      rectY+(cornerRadius/2),
      rectWidth-cornerRadius,
      rectHeight-cornerRadius
    )
  }

  return (
    <>
      <div className="game-wrapper">
        <canvas id="canvas" width="800" height="400"></canvas>
        <span className="restart">Restart</span>
        <span className="submit">Submit<br/> Score</span>
      </div>
      <div className="leaderboard">
        <span className="leaderboard-title">Leaderboard</span>
        <ul id="leaderboard-list" className="leaderboard-list">
        </ul>
      </div>
    </>
  )
}

export default GameView
