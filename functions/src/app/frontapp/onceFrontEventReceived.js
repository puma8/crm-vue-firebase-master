import admin from 'firebase-admin'
import handleFrontEvent from './handleFrontEvent'
import {
  getConversation
} from '../../thirdParty/frontapp'
import runPromiseSerial from '../../utils/promiseSerial'

const fStore = admin.firestore()

export default async ({
  event: eventData
}) => {
  if (eventData.type === 'tag') {
    const tagId = eventData.target.data.id
    const frontEvents = await fStore.collection('frontEvents')
      .where('conversation.id', '==', eventData.conversation.id)
      .orderBy('emitted_at')
      .get()
    const pendingEvents = []

    frontEvents.forEach(frontEventDoc => {
      const frontEvent = frontEventDoc.data()

      if ((!frontEvent.state || !frontEvent.state[tagId]) && frontEvent.type !== 'tag') {
        pendingEvents.push(frontEvent)
      }
    })

    const conversation = await getConversation(eventData.conversation.id)
    const promiseResolver = frontEvent => async () => {
      await handleFrontEvent({
        ...frontEvent,
        conversation
      }, tagId)
    }
    const promiseSerial = pendingEvents.map(pe => promiseResolver(pe))
    await runPromiseSerial(promiseSerial)
  } else {
    const conversation = await getConversation(eventData.conversation.id)
    await handleFrontEvent({
      ...eventData,
      conversation
    })
  }
}
