import { useEffect, useState } from 'react'
import Game from '../lib/Game'
import { trpc } from "../utils/trpc"
import $ from "jquery"
import { useGameSessionContext } from '../context/GameSessionContext'
import { useCanvasContext } from '../context/CanvasContext'
import Leaderboard from './Leaderboard'

const THEME_SONG_START_TIME = 46

function GameController() {
  const { gameSession, updateLocalHighScore } = useGameSessionContext()
  const { canvas } = useCanvasContext()

  let themeSong: HTMLAudioElement
  let gameOverAudio: HTMLAudioElement
  let game: Game
  let $submitScore: JQuery
  let $restart: JQuery
  let currentGameId: string
  let bestGameId = gameSession.bestGameId
  let highScore = gameSession.highScore
  
  if (typeof Audio != "undefined") { 
    themeSong = new Audio("assets/soundfx/superman_theme.mp3") as HTMLAudioElement
    gameOverAudio = new Audio("assets/soundfx/game_over.mp3")
  }

  const createGameApi = trpc.game.start.useMutation()
  const submitScoreApi = trpc.score.submit.useMutation()
  const listScoresApi = trpc.score.list.useQuery()
  const endGameApi = trpc.game.end.useMutation()

  useEffect(() => {
    // Wait for mount before querying DOM
    const $el = $(".game-wrapper")
    $submitScore = $el.find(".submit")
    $restart = $el.find(".restart")

    if (isValidGameState(canvas, $el, gameSession.id)) {
      enableThemeSongLooping()
      game = new Game(canvas)
      showMenu()
    }
  }, [])

  let scores
  if (listScoresApi.isSuccess) {
    const { data } = listScoresApi
    scores = data
  }

  return (
    <>
      {
        scores && (
          <Leaderboard scores={scores}/>
        )
      }
    </>
  )

  function isValidGameState(context: CanvasRenderingContext2D|null, $gameWrapper: JQuery, sessionId: string): boolean {
    return context !== null && $gameWrapper && sessionId.length > 0
  }

  function showMenu(): void {
    const intervalId = setInterval(() => {
      game.drawMenu()
    }, 20)
    bindKeys(intervalId)
  }

  function startGame() {
    resetEndGameMenu()
    createGameId(gameSession.id).then(
      () => { run() }
    )
  }
  
  function resetEndGameMenu() {
    $restart.hide()
    $submitScore.hide()
    $submitScore.off("click")
    $restart.off("click")
  }

  function run(): void {
    playThemeSong()

    game.reset()
    game.addKryptonite()

    canvas.lineJoin = "miter"
    canvas.lineWidth = 1
    const intervalId = setInterval(() => {
      if (!game.paused) {
        game.step()
        game.draw()
      }

      if (game.gameOver) {
        endGame(intervalId)  
      }
    }, 1000/60)
  }

  function playThemeSong() {
    if (themeSong.paused) {
      themeSong.currentTime = THEME_SONG_START_TIME
      themeSong.play()
    }
  }

  function endGame(intervalId: NodeJS.Timer) {
    game.draw() // Required to redraw without score counter visible
    
    clearInterval(intervalId)
    validateEndGame(currentGameId, game.getFinalScore()).then(
      () => {
        playEndGameAudio()
        updateHighScore(game.getFinalScore())
    
        setTimeout(() => {
          showEndGameModal()
        }, 300)
      }
    )
  }

  function playEndGameAudio() {
    themeSong.pause()
    gameOverAudio.currentTime = 0
    gameOverAudio.play()

  }

  function bindKeys(intervalId: NodeJS.Timer|undefined) {
    $(document).on("keydown", (e: JQuery.Event) => {
      switch (e.which) {
        case 38:
          e.preventDefault()
          clearInterval(intervalId)
          startGame()
          break

        case 32:
          e.preventDefault()
          clearInterval(intervalId)
          startGame()
          break
        default:
          return
      }
    })

    $("#canvas").on("click", (e: JQuery.Event) => {
      e.preventDefault()
      clearInterval(intervalId)
      startGame()
    })
  }

  async function createGameId(sessionId: string) {
    const now = new Date().toISOString()
    const newGame = await createGameApi.mutateAsync({startedAt: now, sessionId: sessionId})
    currentGameId = newGame.id
  }

  async function validateEndGame(gameId: string, score: number) {
    const now = new Date().toISOString()
    const validGame = await endGameApi.mutateAsync({id: gameId, endedAt: now, score: score, sessionId: gameSession.id})
    return validGame 
  }

  function updateHighScore(score: number) {
    if (score > highScore) {
      highScore = score
      bestGameId = currentGameId
      updateLocalHighScore(score, bestGameId)
    }
  }

  function resetHighScore() {
    bestGameId = ''
    highScore = 0
    updateLocalHighScore(0, '')
  }

  function showFinalScores() {
    canvas.fillStyle = "#2e5280"
    canvas.strokeStyle = "#2e5280"
    canvas.lineJoin = "round"
    canvas.lineWidth = 10

    // outer score box
    roundRect(250, 100, 300, 200, 10)

    canvas.fillStyle = "#B42420"
    canvas.strokeStyle = "#B42420"

    // restart button
    roundRect(270, 245, 120, 45, 10)
    roundRect(410, 245, 120, 45, 10)

    canvas.fillStyle = "#fff"
    canvas.font = "18px 'Press Start 2P'"

    
    // Centers Score in score box
    const singleDigitPosition = 393
    const doubleDigitPosition = 383
    const tripleDigitPosition = 375
    
    // Current Game Score
    const finalScore = game.getFinalScore()
    let xCoord = singleDigitPosition
    if (finalScore >= 100 ) {
      xCoord = tripleDigitPosition
    } else if (finalScore >= 10) {
      xCoord = doubleDigitPosition
    }
    const yFinalScorePosition = 165
    canvas.fillText("Score", 358, 140)
    canvas.fillText(String(finalScore), xCoord, yFinalScorePosition)

    // Best Score
    xCoord = singleDigitPosition
    if (highScore >= 100 ) {
      xCoord = tripleDigitPosition
    } else if (highScore >= 10) {
      xCoord = doubleDigitPosition
    }
    const yHighScorePosition = 225
    canvas.fillText("Best", 368, 200)
    canvas.fillText(String(highScore), xCoord, yHighScorePosition)
  }

  function submitScore(name: string|null) {
    if (name) {
      submitScoreApi.mutate({sessionId: gameSession.id, playerName: name, gameId: bestGameId}, {
        onSuccess: (data) => {
          // renderLeaderboard(leaders)
          resetHighScore()
        }
      })
    }
  }

  function showEndGameModal() {
    showFinalScores()
    $restart.show()
    $submitScore.show()

    // TODO: Check this
    bindKeys(undefined)
    $submitScore.one("click", (e) => {
      e.preventDefault()
      submitScore(prompt(`Score: ${highScore}`, "Enter your name"))
      $restart.hide()
      $submitScore.hide()
      game.reset()
      showMenu()
    })

    $restart.one("click", (e) => {
      e.preventDefault()
      startGame()
    })
  }

  function enableThemeSongLooping() {
    if (typeof themeSong.loop == 'boolean') {
      themeSong.loop = true
    } else {
      themeSong.addEventListener('ended',() => {
        themeSong.currentTime = THEME_SONG_START_TIME
        themeSong.play()
      })
    }
  }

  function roundRect(rectX: number, rectY: number, rectWidth: number, rectHeight: number, cornerRadius: number) {
    canvas.strokeRect(
      rectX+(cornerRadius/2),
      rectY+(cornerRadius/2),
      rectWidth-cornerRadius,
      rectHeight-cornerRadius
    )

    canvas.fillRect(
      rectX+(cornerRadius/2),
      rectY+(cornerRadius/2),
      rectWidth-cornerRadius,
      rectHeight-cornerRadius
    )
  }

  
}

export default GameController
