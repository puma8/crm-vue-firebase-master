<template>
  <div class="flex-1">
    <q-scroll-area class="full-height primary-bg-color q-pa-sm">
      <q-timeline color="secondary">
        <div v-for="dayEvents in groupByDate" :key="dayEvents.date">
          <q-timeline-entry heading>{{dayEvents.date}}</q-timeline-entry>
          <q-timeline-entry
            :title="event.eventName"
            :subtitle="event.createdAt"
            v-for="event in dayEvents.events"
            :key="event.id"
          >
            <div v-if="event.html" v-html="event.description"></div>
            <div v-else>{{event.description}}</div>
          </q-timeline-entry>
        </div>
      </q-timeline>
    </q-scroll-area>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'History',
  props: ['containerId', 'containerType'],
  data () {
    return {
      historicalEvents: []
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
      userById: 'users/userById',
      dealById: 'deals/dealById',
      projectById: 'projects/projectById'
    }),
    groupByDate () {
      const events = _.groupBy(this.historicalEvents, event =>
        moment(event.createdAt.toDate()).startOf('d')
      )
      const result = _.keys(events).map(key => ({
        date: moment(key).format('MMMM DD, YYYY'),
        events: events[key].map(event => {
          const eventInterpret = {}
          eventInterpret.createdAt = moment(event.createdAt.toDate()).format(
            'HH:mm'
          )
          const actor = this.userById(event.actor)

          if (event.target === 'deal') {
            const deal = this.dealById(event.meta.id)
            if (event.action === 'create') {
              eventInterpret.eventName = `Deal "${deal.name}" is created by ${actor.name}`
              eventInterpret.html = true
            } else if (event.action === 'delete') {
              eventInterpret.eventName = `Deal is deleted by ${actor.name}`
              eventInterpret.description = `Deal "${event.meta.data.name}" is deleted`
            } else if (event.action === 'archive') {
              eventInterpret.eventName = `Deal is archived by ${actor.name}`
              eventInterpret.description = `Deal "${deal.name}" is archived`
            } else if (event.action === 'unarchive') {
              eventInterpret.eventName = `Deal is unarchived by ${actor.name}`
              eventInterpret.description = `Deal "${deal.name}" is unarchived`
            }
          } else if (event.target === 'project') {
            const project = this.projectById(event.id)
            if (event.action === 'create') {
              eventInterpret.eventName = `Project is created by ${actor.name}`
              eventInterpret.html = true
              eventInterpret.description = `
                <div>Name: ${project.name}</div>
                <div>Description: ${project.description}</div>
              `
            } else if (event.action === 'delete') {
              eventInterpret.eventName = `Project is deleted by ${actor.name}`
              eventInterpret.description = `Project "${event.meta.data.name}" is deleted`
            } else if (event.action === 'archive') {
              eventInterpret.eventName = `Project is archived by ${actor.name}`
              eventInterpret.description = `Project "${project.name}" is archived`
            } else if (event.action === 'unarchive') {
              eventInterpret.eventName = `Project is unarchived by ${actor.name}`
              eventInterpret.description = `Project "${project.name}" is unarchived`
            }
          } else if (event.target === 'task') {
            if (event.action === 'create') {
              eventInterpret.eventName = `Task is created by ${actor.name}`
              eventInterpret.html = true
              eventInterpret.description = `
                <div>Name: ${event.meta.name}</div>
                <div>Description: ${event.meta.description}</div>
              `
            } else {
              eventInterpret.eventName = `Task is marked ${event.action} by ${actor.name}`
              eventInterpret.description = event.meta.name
            }
          } else if (event.target === 'subtask') {
            if (event.action === 'create') {
              eventInterpret.eventName = `Subtask is created by ${actor.name}`
              eventInterpret.description = event.meta.name
            } else {
              eventInterpret.eventName = `Subtask is marked ${event.action} by ${actor.name}`
              eventInterpret.description = event.meta.name
            }
          } else if (event.target === 'comment') {
            eventInterpret.eventName = `Comment is added by ${actor.name}`
            eventInterpret.description = event.meta.text
          }
          return eventInterpret
        })
      }))
      return result
    }
  },
  watch: {
    currentUser: function (val) {
      this.bind(val.orgId)
    }
  },
  mounted () {
    this.bind(this.currentUser.orgId)
  },
  methods: {
    bind (orgId) {
      if (!orgId) return
      this.$bind(
        'historicalEvents',
        this.$firebase.db
          .collection('history')
          .where('orgId', '==', orgId)
          .where('meta.containerType', '==', this.containerType)
          .where('meta.containerId', '==', this.containerId)
          .orderBy('createdAt', 'desc')
      )
    }
  }
}
</script>

<style>
</style>
