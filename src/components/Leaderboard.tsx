
function ScoreBoard({ scores }: { scores: { id: string; playerName: string; score: number, rank: number }[]}) {
  let currentRank: number
  let showRank = true

  return (
    <div className="leaderboard">
      <span className="leaderboard-title">Leaderboard</span>
      <ul id="leaderboard-list" className="leaderboard-list">
        {
          
          scores && scores.map((score, idx) => {
            let displayRank = ''
            showRank = false
            if (score.rank != currentRank) {
              showRank = true
              currentRank = score.rank
              displayRank = `${score.rank}.`
            }
            const classes: string[] = []
            if (!showRank) classes.push("tied-rank")
            if (showRank && score.rank < 10) classes.push("padding")

            return (
              <li key={idx} className="group">
                <span className={classes.join(" ")}>{displayRank} {score.playerName ?? "???"}</span>
                <span>{score.score ?? "???"}</span>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

export default ScoreBoard