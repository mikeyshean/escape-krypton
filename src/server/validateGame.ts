
function isValidGame(game: {
    id: string
    startedAt: Date
    endedAt: Date | null
    sessionId: string
    score: number | null
  },
  gameStartedAt: number,
  gameEndedAt: number,
  stepCount: number
): boolean {
  return hasValidStartAndEndTimes(game, gameStartedAt, gameEndedAt) &&
        hasValidStepCount(game, gameStartedAt, gameEndedAt, stepCount) &&
        hasValidScore(game, stepCount)
}

function hasValidStartAndEndTimes(game: {
    id: string
    startedAt: Date
    endedAt: Date | null
    sessionId: string
    score: number | null
  },
  gameStartedAt: number,
  gameEndedAt: number
): boolean {
  // Validate whether client start/end times coincide with server records of start/end entries
  
  const acceptableGameSubmissionDelay = 2000  // 2000ms / 1000ms/s = 2 seconds 
  if (!game.endedAt ||
    game.endedAt.getTime() - gameEndedAt > acceptableGameSubmissionDelay ||
    game.startedAt.getTime() - gameStartedAt > acceptableGameSubmissionDelay) { 
      return false
  }
  return true
}

function hasValidStepCount(game: {
    id: string
    startedAt: Date
    endedAt: Date | null
    sessionId: string
    score: number | null
  },
  gameStartedAt: number,
  gameEndedAt: number,
  stepCount: number
): boolean {
  // Try tp validate client game step count based on game duration

  const gameDuration = gameEndedAt - gameStartedAt
  let estimatedStepsInGame = gameDuration / (1000/60)
  const stepCountDiff = estimatedStepsInGame / stepCount
  const marginOfError = .06
  if (1 - stepCountDiff > marginOfError) {
    return false
  }
  return true
}

function hasValidScore(game: {
    id: string
    startedAt: Date
    endedAt: Date | null
    sessionId: string
    score: number | null
  },
  stepCount: number
): boolean {
  // Try to estimate a valid score based on number of game steps rendered

  if (game.score == null) {
    return false
  }

  let estimatedScore
  const distancePerKryptonite = 400
  const gapWidth = 40
  const supermanWidth = 33
  const stepDistance = 2.6
  const distanceToFirstScore = distancePerKryptonite + gapWidth + supermanWidth
  const stepsToFirstScore = distanceToFirstScore / stepDistance
  const stepsPerKryptoniteScore = distancePerKryptonite / stepDistance

  // First score requires maximum distanceToFirstScore; each subsequent kryptonite requires distancePerKryptonite(400px)
  if (stepCount > stepsToFirstScore) {
    estimatedScore = ((stepCount - stepsToFirstScore)/stepsPerKryptoniteScore) + 1
  } else {
    estimatedScore = 0
  }

  return game.score <= estimatedScore
}

export default isValidGame