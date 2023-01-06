import twilio from 'twilio'
import { env } from "../../env/server.mjs";

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = twilio(accountSid, authToken)

export const sendSMS = (phoneNumber: string, message: string) => {
  client.messages.create({
    body: message,
    from: '+17262009472',
    to: phoneNumber
  })
}