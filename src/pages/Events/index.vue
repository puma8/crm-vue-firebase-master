<template>
  <div class="flex-1">
    <div class="q-pa-sm primary-bg-color">
      <q-btn flat dense label="Today" class="q-mx-md" @click="setToday"></q-btn>
      <q-btn flat dense round icon="keyboard_arrow_left" @click="onPrev"></q-btn>
      <q-btn flat dense round icon="keyboard_arrow_right" @click="onNext"></q-btn>
      <span class="q-mr-xl q-toolbar__title nowrap">{{ currentMonth }}</span>
    </div>
    <q-scroll-area class="full-height primary-bg-color">
      <q-calendar
        ref="calendar"
        v-touch-swipe.mouse.left.right="handleSwipe"
        v-model="selectedDate"
        view="month"
        locale="en-us"
        :day-style="modifiedStyle"
        animated
        transition-prev="slide-right"
        transition-next="slide-left"
        :drag-over-func="onDragOver"
        :drop-func="onDrop"
        :short-month-label="true"
        :short-weekday-label="true"
        @change="onChanged"
        @moved="onMoved"
        @click:date="onDateChanged"
        @click:interval="addEventMenu"
        @click:time="addEventMenu"
        @click:day="addEventMenu"
        @click:week="addEventMenu"
        dayPadding="35px 2px"
      >
        <template #day="{ date }">
          <template v-for="(event, index) in getEvents(date)">
            <q-badge
              :key="index"
              style="width: 100%; cursor: pointer; height: 14px; max-height: 14px"
              class="ellipsis"
              :class="badgeClasses(event, 'day')"
              :style="badgeStyles(event, 'day')"
              @click.stop.prevent="showEvent(event)"
              :draggable="true"
              @dragstart.native="(e) => onDragStart(e, event)"
              @dragend.native="(e) => onDragEnd(e, event)"
              @dragenter.native="(e) => onDragEnter(e, event)"
              @touchmove.native="(e) => {}"
            >
              <q-icon v-if="event.icon" :name="event.icon" class="q-mr-xs"></q-icon>
              <span class="ellipsis">{{ event.title }}</span>
            </q-badge>
          </template>
        </template>
      </q-calendar>
    </q-scroll-area>
    <manage-event-dialog ref="ManageEventDialog" />
    <event-detail-dialog ref="EventDetailDialog" />
  </div>
</template>

<script>
import moment from 'moment'
import { colors, Platform } from 'quasar'
import ManageEventDialog from 'components/dialogs/ManageEventDialog'
import EventDetailDialog from 'components/dialogs/EventDetailDialog'
import * as formatters from 'src/utils/formatters'
import { mapGetters } from 'vuex'
import { stop, prevent, stopAndPrevent } from 'quasar/src/utils/event'

export default {
  name: 'Events',
  props: ['containerType', 'containerId'],
  components: {
    'manage-event-dialog': ManageEventDialog,
    'event-detail-dialog': EventDetailDialog
  },
  data () {
    return {
      selectedDate: moment().format('YYYY-MM-DD'),
      dealEvents: [],
      dragging: false,
      ignoreNextSwipe: false,
      draggedEvent: null
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user'
    }),
    currentMonth () {
      return moment(this.selectedDate).format('MMMM YYYY')
    }
  },
  watch: {
    currentUser: function (val) {
      this.bind(val.orgId)
    },
    dealEvents (val) {}
  },
  mounted () {
    this.bind(this.currentUser.orgId)
  },
  methods: {
    bind (orgId) {
      if (!orgId) return

      this.$bind(
        'dealEvents',
        this.$firebase.db
          .collection('events')
          .where('orgId', '==', orgId)
          .where('containerType', '==', this.containerType)
          .where('containerId', '==', this.containerId)
      )
    },
    setToday () {
      this.selectedDate = moment().format('YYYY-MM-DD')
    },
    onPrev () {
      this.$refs.calendar.prev()
    },
    onNext () {
      this.$refs.calendar.next()
    },
    getEvents (dt) {
      let events = []
      this.dealEvents.forEach(event => {
        let added = false
        if (event.date === dt) {
          if (event.time) {
            if (events.length > 0) {
              const startTime = moment(event.dateTimeStart.toDate())
              const endTime = moment(event.dateTimeEnd.toDate())
              for (let j = 0; j < events.length; ++j) {
                const slotEvent = events[j]
                const startTime2 = moment(slotEvent.dateTimeStart.toDate())
                const endTime2 = moment(slotEvent.dateTimeEnd.toDate())
                if (
                  (startTime.isAfter(startTime2) &&
                    startTime.isBefore(endTime2)) ||
                  (startTime2.isAfter(startTime) &&
                    startTime2.isBefore(endTime))
                ) {
                  slotEvent.side = 'left'
                  events.push({
                    ...event,
                    side: 'right'
                  })
                  added = true
                  break
                }
              }
            }
          }
          if (!added) {
            events.push({
              ...event,
              side: void 0
            })
          }
        }
      })
      return events
    },
    handleSwipe ({ evt, ...info }) {
      if (this.dragging === false) {
        if (info.duration >= 30 && this.ignoreNextSwipe === false) {
          if (info.direction === 'right') {
            this.onPrev()
          } else if (info.direction === 'left') {
            this.onNext()
          }
        } else {
          this.ignoreNextSwipe = false
        }
      }
      stopAndPrevent(evt)
    },
    modifiedStyle (scope) {
      if (scope.disabled === true) {
        return {
          backgroundColor: '#efefef!important'
        }
      }
      return {}
    },
    onDragOver (ev, day, type) {
      stopAndPrevent(ev)
      return this.draggedEvent.date !== day.date
    },
    onDrop (ev, day, type) {
      ev.preventDefault()
      ev.stopPropagation()
      this.draggedEvent.date = day.date
      this.draggedEvent.side = void 0
    },
    onDragEnter (ev) {
      prevent(ev)
    },
    onDragEnd (ev, event) {
      stopAndPrevent(ev)
      this.resetDrag()
    },
    onDragStart (ev, event) {
      this.dragging = true
      this.draggedEvent = event
      stop(ev)
    },
    resetDrag () {
      this.draggedEvent = void 0
      this.dragging = false
      if (Platform.is.desktop) {
        this.ignoreNextSwipe = true
      }
    },
    onChanged () {},
    onMoved () {},
    onDateChanged () {},
    addEventMenu (day) {
      if (day.disabled === true) return
      const dateTimeStart = this.$firebase.Timestamp.fromDate(
        formatters.toDate(day.date)
      )
      this.$refs.ManageEventDialog.open(this.containerType, this.containerId, {
        dateTimeStart,
        allDay: !day.hasTime,
        bgcolor: '#0000FF'
      })
    },
    editEvent (event) {
      const { side, ..._event } = event
      this.$refs.ManageEventDialog.open(
        this.containerType,
        this.containerId,
        _event
      )
    },
    deleteEvent (event) {},
    showEvent (event) {
      this.$refs.EventDetailDialog.open(event, this.editEvent, this.deleteEvent)
    },
    badgeClasses (event, type) {
      const isHeader = type === 'header'
      return {
        [`text-white bg-${event.bgcolor}`]: !event.bgcolor,
        'full-width': !isHeader && (!event.side || event.side === 'full'),
        'left-side': !isHeader && event.side === 'left',
        'right-side': !isHeader && event.side === 'right'
      }
    },
    badgeStyles (event, type, timeStartPos, timeDurationHeight) {
      let s = {}
      if (event.bgcolor) {
        s['background-color'] = moment().isAfter(
          moment(event.dateTimeEnd.toDate())
        )
          ? colors.lighten(event.bgcolor, 50)
          : event.bgcolor
        s['color'] = colors.luminosity(event.bgcolor) > 0.5 ? 'black' : 'white'
      }
      if (timeStartPos) {
        s['top'] = timeStartPos(event.time) + 'px'
      }
      if (timeDurationHeight) {
        s['height'] = timeDurationHeight(event.duration) + 'px'
      }
      s['align-items'] = 'flex-start'
      return s
    }
  }
}
</script>

<style lang='stylus'>
.full-width {
  left: 0;
  width: 100%;
}

.left-side {
  left: 0;
  width: 49.75%;
}

.right-side {
  left: 50.25%;
  width: 49.75%;
}
</style>
