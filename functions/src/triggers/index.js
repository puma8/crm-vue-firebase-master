import dailyUpdate from './dailyUpdate'
import * as dealChangeEvents from './dealChange'
import * as projectChangeEvents from './projectChange'
import * as taskChangeEvents from './taskChange'
import * as integrationChangeEvents from './integrationChange'
import * as settingsChangeEvents from './settingsChange'
import * as slackEventChangeEvents from './slackEventChange'
import * as frontEventChangeEvents from './frontEventChange'
import * as syncChangeEvents from './syncChange'
import * as gDriveEventChangeEvents from './gDriveEventChange'

export default {
  dailyUpdate,
  ...dealChangeEvents,
  ...projectChangeEvents,
  ...taskChangeEvents,
  ...integrationChangeEvents,
  ...settingsChangeEvents,
  ...slackEventChangeEvents,
  ...frontEventChangeEvents,
  ...syncChangeEvents,
  ...gDriveEventChangeEvents
}
