import sgMail from '@sendgrid/mail'
import config from '../../utils/config'

sgMail.setApiKey(config.sendgrid.api_key)

export default ({
  from,
  to,
  subject,
  html
}) => {
  const msg = {
    to,
    from,
    subject,
    html
  }
  console.log('mailer', msg, config.sendgrid.api_key)
  return sgMail.send(msg)
}
