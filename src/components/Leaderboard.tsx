
function ScoreBoard({ scores }: { scores: { id: string; playerName: string; score: number}[]}) {

  return (
    <div className="leaderboard">
      <span className="leaderboard-title">Leaderboard</span>
      <ul id="leaderboard-list" className="leaderboard-list">
        {
          scores && scores.map((score, idx) => {
            const rank = idx + 1
            return (
              <li key={idx} className="group">
                <span className={rank < 10 ? "padding" : ""}>{10-idx}. {score.playerName ?? "???"}</span>
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