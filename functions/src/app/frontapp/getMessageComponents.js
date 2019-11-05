import {
  getMessage
} from '../../thirdParty/frontapp'

export default async id => {
  const frontMessage = await getMessage(id)
  let text = frontMessage.text.replace(/\n/g, '\n>')
  const quoteIndex = text.search(/On .*wrote:\n\n/g)

  if (quoteIndex !== -1) {
    text = text.substring(0, quoteIndex)
  }

  let attachments = ''
  if (frontMessage.attachments.length > 0) {
    attachments = '\n*Attachments*:'
    frontMessage.attachments.forEach(attachment => {
      attachments = attachments + `\n><${attachment.url}|${attachment.filename}>`
    })
  }

  return {
    text,
    attachments
  }
}
