export const buildSection = (text, accessory) => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text
    },
    accessory
  }
}

export const divider = {
  type: 'divider'
}

export const buildSelect = (placeholder, actionId, actions) => {
  return {
    action_id: actionId,
    type: 'static_select',
    placeholder: {
      type: 'plain_text',
      emoji: true,
      text: placeholder
    },
    options: actions.map(action => ({
      text: {
        type: 'plain_text',
        emoji: true,
        text: action.title
      },
      value: action.code
    }))
  }
}

export const buildButton = (title, code) => ({
  type: 'button',
  text: {
    type: 'plain_text',
    emoji: true,
    text: title
  },
  value: code
})

export const buildLinkButton = (title, url) => ({
  type: 'button',
  text: {
    type: 'plain_text',
    text: title
  },
  url
})

export const buildAction = actions => {
  return {
    type: 'actions',
    elements: actions
  }
}
