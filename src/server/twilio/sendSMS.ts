import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
// const client = twilio(accountSid, authToken)

export const sendSMS = (phoneNumber: string, message: string) => {
  // client.messages.create({
  //   body: message,
  //   from: '+17262009472',
  //   to: phoneNumber
  // })
}