

export default class ScoreService {
  private game

  constructor(game: { id: string, score: number | null, sessionId: string }) {
    this.game = game
  }

  // TODO:
  createSmsRecipients() {
    return true
  }
  
}