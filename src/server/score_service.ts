import { Prisma } from "@prisma/client"
import { createContextInner } from "./trpc/context"
import { scoreRouter } from "./trpc/router/score"
import { tauntRouter } from "./trpc/router/taunt"
import { smsRouter } from "./trpc/router/sms"
import { sendSMS } from '../server/twilio/sendSMS'

type RecipientData = {
  taunt: string
  playerName: string
  newHighScore: number
  beatenScore: number
  beatenPlayer: string
  messageId: number
}

const NEW_LEADER_MESSAGE_ID = 1

export default class ScoreService {
  private highScore
  private scoreRouter = scoreRouter
  private tauntRouter = tauntRouter
  private smsRouter = smsRouter

  constructor(highScore: { id: string, score: number, playerName: string, phoneNumber: string|null}) {
    this.highScore = highScore
  }


  async sendSmsNotifications(tauntId: string|null) {
    if (this.highScore.score == null) return
  
    const top10 = await this.getTop10WithPhoneNumbers()
    
    // Potential SMS recipients
    const lowerScores = top10.filter((score) => {
      return (score.rank == 2 &&
        score.phoneNumber &&
        score.score < this.highScore.score! && 
        score.phoneNumber != this.highScore.phoneNumber
        )
      })

    // No previous #1 spots we can notify
    if (lowerScores.length == 0) {
      return
    }
    
    const taunt = await this.getTaunt(tauntId)
    const smsRecipients: { [phoneNumber: string]: {phoneNumber: string, fields: RecipientData}} = {}
    
    lowerScores.forEach((score) => {
      if (score.phoneNumber == null || score.phoneNumber in smsRecipients) return
      
      smsRecipients[score.phoneNumber] = {
        phoneNumber: score.phoneNumber,
        fields: {
          taunt: taunt?.text || "",
          playerName: this.highScore.playerName,
          newHighScore: this.highScore.score,
          beatenScore: score.score,
          beatenPlayer: score.playerName,
          messageId: NEW_LEADER_MESSAGE_ID
        }
      }
    })

    if (Object.keys(smsRecipients).length === 0) return
    
    await this.saveSms(smsRecipients).then(() => {
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
      const newHighScore = fieldsObject['newHighScore']
      const beatenScore = fieldsObject['beatenScore']
      const beatenPlayer = fieldsObject['beatenPlayer']
      const taunt = fieldsObject['taunt']
      const tauntMsg = taunt ? `${playerName} says, ${taunt}` : ''
      let message = ''
      
      if (messageId == NEW_LEADER_MESSAGE_ID) {
          message = `🪐Krypton Alert🪐\nHey, ${beatenPlayer}! Your TOP Score of ${beatenScore}, was just beaten by ${playerName} who scored ${newHighScore}! ${tauntMsg}`
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

    return await smsCaller.update({id: id, dateFailed: dateFailed})
  }

  async getTop10WithPhoneNumbers() {
    const ctx = await createContextInner({})
    const scoreCaller = this.scoreRouter.createCaller(ctx)

    return await scoreCaller.top10WithPhoneNumbers()
  }

  async getTaunt(id: string|null) {
    if (!id) return
    const ctx = await createContextInner({})
    const tauntCaller = this.tauntRouter.createCaller(ctx)

    return await tauntCaller.get({id: id})
  }
}