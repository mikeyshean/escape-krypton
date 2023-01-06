import { useEffect, useRef, useState } from 'react'
import Game from '../lib/Game'
import { trpc } from "../utils/trpc"
import $ from "jquery"
import { useGameSessionContext } from '../context/GameSessionContext'
import { useCanvasContext } from '../context/CanvasContext'
import Leaderboard from './Leaderboard'
import { Constants } from '../constants'

const THEME_SONG_START_TIME = 46
const FRAMES_PER_SECOND = 60

type Scores = {
  id: string;
  score: number;
  playerName: string;
  rank: number;
}[]


function GameController() {
  const { gameSession, updateLocalHighScore } = useGameSessionContext()
  const { canvas } = useCanvasContext()
  const scores = useRef<Scores>()
  const utils = trpc.useContext();

  let themeSong: HTMLAudioElement
  let gameOverAudio: HTMLAudioElement
  const game = useRef<Game|null>(null)
  const $submitScore = useRef<JQuery|null>(null)
  const $submitScoreForm = useRef<JQuery|null>(null)
  const $restart = useRef<JQuery|null>(null)
  const $formCancel = useRef<JQuery|null>(null)
  const $formSubmit = useRef<JQuery|null>(null)
  const $taunt1 = useRef<JQuery|null>(null)
  const $taunt2 = useRef<JQuery|null>(null)
  const $taunt3 = useRef<JQuery|null>(null)
  const $phoneInput = useRef<JQuery|null>(null)
  const $nameInput = useRef<JQuery|null>(null)

  let currentGameId: string
  let bestGameId = gameSession.bestGameId
  let highScore = gameSession.highScore
  let gameStartedAt: number
  let gameEndedAt: number
  
  if (typeof Audio != "undefined") { 
    themeSong = new Audio("assets/soundfx/superman_theme.mp3") as HTMLAudioElement
    gameOverAudio = new Audio("assets/soundfx/game_over.mp3")
  }
  
  const createGameApi = trpc.game.start.useMutation()
  const submitScoreApi = trpc.score.submit.useMutation()
  trpc.score.top10.useQuery(undefined, { 
    refetchInterval: 7000, 
    refetchIntervalInBackground: false,
    onSuccess: (data) => {
      scores.current = data
    }

  })
  const endGameApi = trpc.game.end.useMutation()
  

  useEffect(() => {
    // Wait for mount before querying DOM
    const $el = $(".game-wrapper")
    $submitScore.current = $el.find(".submit")
    $restart.current = $el.find(".restart")
    $submitScoreForm.current = $el.find("#score-form")
    $formCancel.current = $el.find(".form-cancel")
    $formSubmit.current = $el.find(".form-submit")
    $taunt1.current = $el.find(".taunt-1")
    $taunt2.current = $el.find(".taunt-2")
    $taunt3.current = $el.find(".taunt-3")
    $phoneInput.current = $el.find("#phone")
    $nameInput.current = $el.find(".name")
    
    if (isValidGameState(canvas, $el, gameSession.id) && !game.current) {
      enableThemeSongLooping()
      game.current = new Game(canvas)
      showMenu()
    }
  }, [])


/******//******//******//******//******//******//******//******//******//******//******//******//*                                                                                
             ,---.   ,--.                   ,--.       ,----.                             
            '   .-',-'  '-. ,--,--.,--.--.,-'  '-.    '  .-./    ,--,--.,--,--,--. ,---.  
            `.  `-.'-.  .-'' ,-.  ||  .--''-.  .-'    |  | .---.' ,-.  ||        || .-. : 
            .-'    | |  |  \ '-'  ||  |     |  |      '  '--'  |\ '-'  ||  |  |  |\   --. 
            `-----'  `--'   `--`--'`--'     `--'       `------'  `--`--'`--`--`--' `----' 
 /******//******//******//******//******//******//******//******//******//******//******//******/                                                                              
  

  function showMenu(): void {
    resetEndGameMenu()
    game.current?.reset()
    const intervalId = setInterval(() => {
      game.current?.drawMenu()
    }, 20)
    bindKeys(intervalId)
  }

  function startGame() {
    resetEndGameMenu()
    createGameId(gameSession.id).then(
      () => { run() }
    )
  }

  function run(): void {
    playThemeSong()

    game.current?.reset()
    game.current?.addKryptonite()

    canvas.lineJoin = "miter"
    canvas.lineWidth = 1
    gameStartedAt = Date.now()

    const intervalId = setInterval(() => {
      if (!game.current?.paused) {
        game.current?.step()
        game.current?.draw()
      }

      if (game.current?.gameOver) {
        gameEndedAt = Date.now()
        endGame(intervalId)  
      }
    }, 1000/FRAMES_PER_SECOND)
  }
  
  
  

 /******//******//******//******//******//******//******//******//******//******//******//******//*
                                                                                    
                      ,------.           ,--.     ,----.                             
                      |  .---',--,--,  ,-|  |    '  .-./    ,--,--.,--,--,--. ,---.  
                      |  `--, |      \' .-. |    |  | .---.' ,-.  ||        || .-. : 
                      |  `---.|  ||  |\ `-' |    '  '--'  |\ '-'  ||  |  |  |\   --. 
                      `------'`--''--' `---'      `------'  `--`--'`--`--`--' `----' 
                                                                                    
  /******//******//******//******//******//******//******//******//******//******//******//******/

  function endGame(intervalId: NodeJS.Timer) {
    game.current?.draw() // Required to redraw without score counter visible
    
    clearInterval(intervalId)
    validateEndGame(currentGameId, game.current!.currentScore(), gameStartedAt, gameEndedAt).then(
      () => {
        playEndGameAudio()
        updateHighScore(game.current!.currentScore())
    
        setTimeout(() => {
          showEndGameModal()
        }, 300)
      }
    )
  }

  function showEndGameModal() {
    showEndGameScores()
    $restart.current?.show()
    
    if (highScore > 0) {
      $submitScore.current?.show()
      $submitScore.current?.one("click", (e) => {
        e.preventDefault()
        resetEndGameMenu()
        showSubmitScoreForm()
      })
    }

    bindKeys(undefined, false)
    $restart.current?.one("click", (e) => {
      e.preventDefault()
      startGame()
    })
    
    
  
  function showEndGameScores() {
    canvas.fillStyle = Constants.GAME_BLUE
    canvas.strokeStyle = Constants.GAME_BLUE
    canvas.lineJoin = "round"
    canvas.lineWidth = 10

    // outer score box
    roundRect(250, 100, 300, 200, 10)

    canvas.fillStyle = Constants.GAME_RED
    canvas.strokeStyle = Constants.GAME_RED

    // restart button
    
    if (highScore > 0) {
      roundRect(410, 245, 120, 45, 10)
      roundRect(270, 245, 120, 45, 10)
    } else {
      $restart.current?.addClass("center")
      roundRect(340, 245, 120, 45, 10)
    }

    canvas.fillStyle = Constants.GAME_WHITE
    canvas.font = "18px 'Press Start 2P'"

    
    // Centers Score in score box
    const singleDigitPosition = 393
    const doubleDigitPosition = 383
    const tripleDigitPosition = 375
    
    // Current Game Score
    const currentScore = game.current!.currentScore()
    let xCoord = singleDigitPosition
    if (currentScore >= 100 ) {
      xCoord = tripleDigitPosition
    } else if (currentScore >= 10) {
      xCoord = doubleDigitPosition
    }
    const ycurrentScorePosition = 165
    canvas.fillText("Score", 358, 140)
    canvas.fillText(String(currentScore), xCoord, ycurrentScorePosition)

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

  

    
  }

/******//******//******//******//******//******//******//******//******//******//******//******//******//******//******//******//******//******//*
           ,---.                                 ,------.                           ,--.  ,--.                   ,--.,--.,--.                
          '   .-'  ,---. ,---. ,--.--. ,---.     |  .---',---. ,--.--.,--,--,--.    |  '--'  | ,--,--.,--,--,  ,-|  ||  |`--',--,--,  ,---.  
          `.  `-. | .--'| .-. ||  .--'| .-. :    |  `--,| .-. ||  .--'|        |    |  .--.  |' ,-.  ||      \' .-. ||  |,--.|      \| .-. | 
          .-'    |\ `--.' '-' '|  |   \   --.    |  |`  ' '-' '|  |   |  |  |  |    |  |  |  |\ '-'  ||  ||  |\ `-' ||  ||  ||  ||  |' '-' ' 
          `-----'  `---' `---' `--'    `----'    `--'    `---' `--'   `--`--`--'    `--'  `--' `--`--'`--''--' `---' `--'`--'`--''--'.`-  /  
                                                                                                                                    `---'  
  /******//******//******//******//******//******//******//******//******//******//******//******//******//******//******//******//******//******/


  function showSubmitScoreForm() {
    drawScoreForm()
    attachFormEventHandlers()
  }

  function drawScoreForm() {
    $submitScoreForm.current?.children().show()
    $formCancel.current?.show()
    $formSubmit.current?.show()
    $taunt1.current?.show()
    $taunt2.current?.show()
    $taunt3.current?.show()

    canvas.fillStyle = Constants.GAME_BLUE
    canvas.strokeStyle = Constants.GAME_BLUE
    canvas.lineJoin = "round"
    canvas.lineWidth = 10

    // outer score box
    roundRect(200, 50, 400, 300, 10)

    canvas.fillStyle = Constants.GAME_RED
    canvas.strokeStyle = Constants.GAME_RED

    // cancel/submit button
    roundRect(260, 280, 120, 45, 10)
    roundRect(420, 280, 120, 45, 10)

    canvas.fillStyle = Constants.GAME_WHITE
    canvas.font = "14px 'Press Start 2P'"


    // Name Input
    canvas.fillText("Name", 230, 110)
    roundRect(225, 120, 170, 35, 10)

    // Phone #
    canvas.fillText("Phone No.", 415, 110)
    roundRect(410, 120, 170, 35, 10)

    // Taunt Buttons
    canvas.fillText("Choose Taunt", 230, 200)
    drawTauntBox(1)
    drawTauntBox(2)
    drawTauntBox(3)
  }
  
  const attachFormEventHandlers = () => {
    $formSubmit.current?.one("click", (e) => {
      e.preventDefault()
      const name = String($nameInput.current?.val())
      const phoneNumber = stripPhoneNumber(String($phoneInput.current?.val()))
      const tauntId = $("#score-form").find(".taunt.selected").attr("data-id")

      submitScore(name, phoneNumber, tauntId)
      showMenu()
    })

    $formCancel.current?.one("click", (e) => {
      e.preventDefault()
      resetEndGameMenu()
      showMenu()
    })

    $phoneInput.current?.on('keypress', function(e) {
      e.preventDefault()
      
      const key = e.key
      let stripped = stripPhoneNumber(String($phoneInput.current?.val()))
      
      // Handle Backspace
      if ( key == "Backspace") {
        stripped = stripped.substring(0, stripped.length - 1)
      } else {
        stripped += key
      }
      
      // Format and update input val
      const dashed = addDashes(stripped)
      $phoneInput.current?.val(dashed)
    });

    $taunt1.current?.on("click", (e) => {
      e.preventDefault()
      toggleTaunts(e)
    })

    $taunt2.current?.on("click", (e) => {
      e.preventDefault()
      toggleTaunts(e)
    })

    $taunt3.current?.on("click", (e) => {
      e.preventDefault()
      toggleTaunts(e)
    })

    function toggleTaunts(e: JQuery.TriggeredEvent) {
      canvas.fillStyle = Constants.GAME_RED
      const id = e.currentTarget.getAttribute('id')

      switch(id) {
        
        case 'taunt-1':
          drawTauntBox(1)
          $taunt1.current?.addClass("selected")
          canvas.fillStyle = Constants.GAME_WHITE
          drawTauntBox(2)
          drawTauntBox(3)
          $taunt2.current?.removeClass("selected")
          $taunt3.current?.removeClass("selected")
          break
        case 'taunt-2':
          drawTauntBox(2)
          $taunt2.current?.addClass("selected")
          canvas.fillStyle = Constants.GAME_WHITE
          drawTauntBox(1)
          drawTauntBox(3)
          $taunt1.current?.removeClass("selected")
          $taunt3.current?.removeClass("selected")
          break
        case 'taunt-3':
          drawTauntBox(3)
          $taunt3.current?.addClass("selected")
          canvas.fillStyle = Constants.GAME_WHITE
          drawTauntBox(1)
          drawTauntBox(2)
          $taunt1.current?.removeClass("selected")
          $taunt2.current?.removeClass("selected")
          break
      }
    }

  }

  function addDashes(phoneNumber: string) {
    const npa = phoneNumber.substring(0, 3)
    const nxx = phoneNumber.substring(3, 6)
    const last4 = phoneNumber.substring(6, 10)
    const length = phoneNumber.length

    let formattedNumber = ''
    if (length > 6) {
      formattedNumber = '(' + npa + ') ' + nxx + '-' + last4
    } else if (length > 3) {
      formattedNumber = '(' + npa + ') ' + nxx
    } else {
      formattedNumber = '(' + npa + ') '
    }

    return formattedNumber
  }




  /******//******//******//******//******//******//******//******//******//******//******//******//*
                                        ,---.  ,------. ,--. 
                                       /  O  \ |  .--. '|  | 
                                      |  .-.  ||  '--' ||  | 
                                      |  | |  ||  | --' |  | 
                                      `--' `--'`--'     `--' 
  /******//******//******//******//******//******//******//******//******//******//******//******/

  async function createGameId(sessionId: string) {
    const newGame = await createGameApi.mutateAsync({sessionId: sessionId})
    currentGameId = newGame.id
  }
  

  async function validateEndGame(gameId: string, score: number, gameStartedAt: number, gameEndedAt: number) {
    const validGame = await endGameApi.mutateAsync({
      id: gameId, 
      score: score, 
      sessionId: gameSession.id,
      gameEndedAt: gameEndedAt, 
      gameStartedAt: gameStartedAt, 
      stepCount: game.current!.stepCount
    })
    return validGame 
  }

  function submitScore(name: string|null, phoneNumber: string|null = null, tauntId: string|null = null) {
    if (name) {
      submitScoreApi.mutate({
        sessionId: gameSession.id,
        playerName: name,
        gameId: bestGameId,
        tauntId: tauntId,
        phoneNumber: phoneNumber
      }, {
        onSuccess: () => {
          utils.score.invalidate()
          resetHighScore()
        }
      })
    }
  }
  
  /******//******//******//******//******//******//******//******//******//*
                      ,---.             ,--.,--.        
                     /  O  \ ,--.,--. ,-|  |`--' ,---.  
                    |  .-.  ||  ||  |' .-. |,--.| .-. | 
                    |  | |  |'  ''  '\ `-' ||  |' '-' ' 
                    `--' `--' `----'  `---' `--' `---'  
                                    
  /******//******//******//******//******//******//******//******//******/

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

  function playEndGameAudio() {
    themeSong.pause()
    gameOverAudio.currentTime = 0
    gameOverAudio.play()
  }

  function playThemeSong() {
    if (themeSong.paused) {
      themeSong.currentTime = THEME_SONG_START_TIME
      themeSong.play()
    }
  }

/******//******//******//******//******//******//******//******//******//*
            ,--. ,--.  ,--.  ,--.,--.,--.  ,--.            
            |  | |  |,-'  '-.`--'|  |`--',-'  '-.,--. ,--. 
            |  | |  |'-.  .-',--.|  |,--.'-.  .-' \  '  /  
            '  '-'  '  |  |  |  ||  ||  |  |  |    \   '   
             `-----'   `--'  `--'`--'`--'  `--'  .-'  /    
                                                 `---' 
/******//******//******//******//******//******//******//******//******/

  function resetEndGameMenu() {
    unbindKeys()
    $restart.current?.hide().removeClass("center")
    $submitScore.current?.hide()
    $submitScore.current?.off("click")
    $restart.current?.off("click")
    
    // Leader Form
    $submitScoreForm.current?.children().hide()
    $formSubmit.current?.hide()
    $formCancel.current?.hide()
    $formSubmit.current?.off("click")
    $formCancel.current?.off("click")
    $phoneInput.current?.off("keypress")
    $taunt1.current?.hide().removeClass("selected").off("click")
    $taunt2.current?.hide().removeClass("selected").off("click")
    $taunt3.current?.hide().removeClass("selected").off("click")
  }

  function bindKeys(intervalId: NodeJS.Timer|undefined, withClick = true) {
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

    if (withClick) {
      $("#canvas").on("click", (e: JQuery.Event) => {
        e.preventDefault()
        clearInterval(intervalId)
        startGame()
      })
    }

  }

  function unbindKeys() {
    $(document).off("keydown")
    $("#canvas").off("click")
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

  function isValidGameState(context: CanvasRenderingContext2D|null, $gameWrapper: JQuery, sessionId: string): boolean {
    return context !== null && $gameWrapper && sessionId.length > 0
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

  function drawTauntBox(id: number) {
    switch(id) {
      case 1:
        roundRect(225, 215, 116, 45, 10)
        break
      case 2:
        roundRect(341, 215, 116, 45, 10)
        break
      case 3:
        roundRect(457, 215, 116, 45, 10)
        break
    }
  }

  /** Use this helper for:
   * - Removing non numerical values from strings
   **/
  function stripPhoneNumber(phoneNumber: string) {
    const r = /(\D+)/g
    return phoneNumber.replace(r, '')
  }

  return (
    <>
      {
        scores.current && (
          <>
            <Leaderboard scores={scores.current}/>
          </>
        )
      }
    </>
  )
  
}

export default GameController