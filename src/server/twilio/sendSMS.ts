const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

export const sendSMS = (name: string, yourScore: number, newScore: number, phoneNumber: string) => {
  client.messages
  .create({
    body: `Krypton Alert: Your Top Score of ${yourScore}, was just beaten by ${name} with a score of ${newScore}!`,
    from: '+17262009472',
    to: phoneNumber
  })
}