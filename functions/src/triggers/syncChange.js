import * as functions from 'firebase-functions'
import syncContacts from '../app/frontapp/syncContacts'
import syncChannels from '../app/slack/syncChannels'

export const syncOnCreate = functions.firestore
  .document('sync/{orgId}')
  .onCreate(async (snap, context) => {
    const sync = snap.data()
    const frontContacts = sync.frontContacts
    if (frontContacts && frontContacts.status === 'start') {
      try {
        await syncContacts(context.params.orgId)
      } catch (error) {
        console.log('sync front contacts error', error)
      }
    }

    const slackChannels = sync.slackChannels
    if (slackChannels && slackChannels.status === 'start') {
      try {
        await syncChannels(context.params.orgId)
      } catch (error) {
        console.log('sync slack channels error', error)
      }
    }
  })

export const syncOnUpdate = functions.firestore
  .document('sync/{orgId}')
  .onUpdate(async (change, context) => {
    const newVal = change.after.data()

    const frontContacts = newVal.frontContacts
    if (frontContacts && frontContacts.status === 'syncing') {
      try {
        await syncContacts(context.params.orgId)
      } catch (error) {
        console.log('sync front contacts error', error)
      }
    }

    const slackChannels = newVal.slackChannels
    if (slackChannels && (slackChannels.status === 'start' || slackChannels.status === 'syncing')) {
      try {
        await syncChannels(context.params.orgId)
      } catch (error) {
        console.log('sync front contacts error', error)
      }
    }
  })
