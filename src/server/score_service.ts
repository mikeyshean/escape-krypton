import { Prisma } from "@prisma/client"
import { createContextInner } from "./trpc/context"
import { scoreRouter } from "./trpc/router/score"
import { tauntRouter } from "./trpc/router/taunt"
import { smsRouter } from "./trpc/router/sms"
import { sendSMS } from '../server/twilio/sendSMS'

type RecipientData = {
  taunt: string
  playerName: string
  newRank: string
  newHighScore: number
  beatenScore: number
  beatenPlayer: string
  messageId: number
}

export default class ScoreService {
  private highScore
  private scoreRouter = scoreRouter
  private tauntRouter = tauntRouter
  private smsRouter = smsRouter

  private newLeaderMessageId = 1
  private downrankedMessageId = 2
  private knockedOutMessageId = 3

  private ORDINAL_SUFFIX:{[key:number]: string} = {
    1: "st",
    2: "nd",
    3: "rd",
    4: "th",
    5: "th",
    6: "th",
    7: "th",
    8: "th",
    9: "th",
    10: "th"
  }

  constructor(highScore: { id: string, score: number, playerName: string, phoneNumber: string|null}) {
    this.highScore = highScore
  }


  async sendSmsNotifications(tauntId: string|null) {
    if (this.highScore.score == null) return
  
    const top11 = await this.getTop11Scorers()
    const taunt = await this.getTaunt(tauntId)

    const lowerScores = top11.filter((score) => {
      return score.score < this.highScore.score! && score.phoneNumber != this.highScore.phoneNumber
    })
    

    const outOfLeaderBoardRank = 11
    const smsRecipients: { [phoneNumber: string]: {phoneNumber: string, fields: RecipientData}} = {}
    lowerScores.forEach((score) => {
      if (score.phoneNumber == null || score.phoneNumber in smsRecipients) return
      smsRecipients[score.phoneNumber] = {
        phoneNumber: score.phoneNumber,
        fields: {
          taunt: taunt?.text || "",
          playerName: this.highScore.playerName,
          newRank: `${score.rank}${this.ORDINAL_SUFFIX[score.rank]}`,
          newHighScore: this.highScore.score,
          beatenScore: score.score,
          beatenPlayer: score.playerName,
          messageId: 0
        }
      }

      if (score.rank == 2) {
        smsRecipients[score.phoneNumber]!.fields!['messageId'] = this.newLeaderMessageId
      } else if (score.rank == outOfLeaderBoardRank) {
        smsRecipients[score.phoneNumber]!.fields!['messageId'] = this.knockedOutMessageId
      } else {
        smsRecipients[score.phoneNumber]!.fields!['messageId'] = this.downrankedMessageId
      }
    })

    if (Object.keys(smsRecipients).length === 0) return
    
    await this.saveSms(smsRecipients).then((data) => {
      this.sendSms()
    })
  }

  async saveSms(recipients: { [phoneNumber: string]: {phoneNumber: string, fields: RecipientData }}) {
    const recipientData = Object.values(recipients)
    const ctx = await createContextInner({})
    const smsCaller = this.smsRouter.createCaller(ctx)
    return await smsCaller.bulkCreate(recipientData)
  }

  async sendSms() {
    const pendingSms = await this.getPendingSms()

    pendingSms.forEach((sms) => {
      const fieldsObject = sms.fields as Prisma.JsonObject

      const messageId = fieldsObject['messageId']
      const playerName = fieldsObject['playerName']
      const newRank = fieldsObject['newRank']
      const newHighScore = fieldsObject['newHighScore']
      const beatenScore = fieldsObject['beatenScore']
      const beatenPlayer = fieldsObject['beatenPlayer']
      const taunt = fieldsObject['taunt']
      const tauntMsg = taunt ? `${playerName} says, ${taunt}` : ''
      let message = ''
      
      switch (messageId) {
        case this.downrankedMessageId:
          message = `🪐Krypton Alert🪐\nHey, ${beatenPlayer}! ${playerName} just made it onto the leaderboard and knocked you down to ${newRank} place! ${tauntMsg}`
          break
        case this.newLeaderMessageId:
          message = `🪐Krypton Alert🪐\nHey, ${beatenPlayer}! Your TOP Score of ${beatenScore}, was just beaten by ${playerName} who scored ${newHighScore}! ${tauntMsg}`
          break
        case this.knockedOutMessageId:
          message = `🪐Krypton Alert🪐\nHey, ${beatenPlayer}! ${playerName} just knocked you off the leaderboard with a score of ${newHighScore}! ${tauntMsg}`
          break
      }

      if (message && sms.phoneNumber) {
        sendSMS(sms.phoneNumber, message)
        this.updateDateSent(sms.id, new Date())
      } else {
        this.updateDateFailed(sms.id, new Date())
      }
    })
  }

  async getPendingSms() {
    const ctx = await createContextInner({})
    const scoreCaller = this.smsRouter.createCaller(ctx)

    return await scoreCaller.getPending()
  }

  async updateDateSent(id: string, dateSent: Date) {
    const ctx = await createContextInner({})
    const smsCaller = this.smsRouter.createCaller(ctx)

    return await smsCaller.update({id: id, dateSent: dateSent})
  }
  
  async updateDateFailed(id: string, dateFailed: Date) {
    const ctx = await createContextInner({})
    const smsCaller = this.smsRouter.createCaller(ctx)

    // return await smsCaller.update({id: id, dateFailed: dateFailed})
  }

  async getTop11Scorers() {
    const ctx = await createContextInner({})
    const scoreCaller = this.scoreRouter.createCaller(ctx)

    return await scoreCaller.top11()
  }

  async getTaunt(id: string|null) {
    if (!id) return
    const ctx = await createContextInner({})
    const tauntCaller = this.tauntRouter.createCaller(ctx)

    return await tauntCaller.get({id: id})
  }
  
}