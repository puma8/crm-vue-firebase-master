<template>
  <q-dialog v-model="openModal">
    <q-card v-if="event">
      <q-toolbar :class="displayClasses" :style="displayStyles" style="min-width: 400px;">
        <q-toolbar-title>{{ event.title }}</q-toolbar-title>
        <!-- <q-btn flat round color="white" icon="delete" v-close-popup @click="deleteEvent(event)"></q-btn> -->
        <q-btn flat round color="white" icon="edit" v-close-popup @click="editEvent(event)"></q-btn>
        <q-btn flat round color="white" icon="cancel" v-close-popup></q-btn>
      </q-toolbar>
      <q-card-section class="inset-shadow">
        <div v-if="event.allDay" class="text-caption">{{ getEventDate }}</div>
        {{ event.description }}
        <div v-if="event.time" class="text-caption">
          <pre>
            Start Time: {{ event.time }}
            End Time:   {{ getEndTime }}
            Duration:   {{ event.duration }}
          </pre>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" @click="openModal=false" v-close-popup></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { colors } from 'quasar'
import moment from 'moment'

export default {
  name: 'EventDetailDialog',
  data () {
    return {
      openModal: false,
      event: null,
      editEvent: () => {},
      deleteEvent: () => {}
    }
  },
  computed: {
    displayClasses () {
      const event = this.event
      return {
        [`bg-${event.bgcolor}`]: !event.bgcolor,
        'text-white': !event.bgcolor
      }
    },
    displayStyles () {
      const event = this.event
      let s = {}
      if (event.bgcolor) {
        s['background-color'] = event.bgcolor
        s['color'] = colors.luminosity(event.bgcolor) > 0.5 ? 'black' : 'white'
      }
      return s
    },
    getEventDate () {
      return moment(this.event.dateTimeStart.toDate()).format('YYYY-MM-DD')
    },
    getEndTime () {
      return moment(this.event.dateTimeEnd.toDate()).format('HH:mm')
    }
  },
  methods: {
    open (event, editEvent, deleteEvent) {
      this.event = event
      this.openModal = true
      this.deleteEvent = deleteEvent
      this.editEvent = editEvent
    }
  }
}
</script>

<style>
</style>
