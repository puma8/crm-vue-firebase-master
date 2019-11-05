<template>
  <q-dialog v-model="openModal" persistent>
    <q-card v-if="openModal" class="dialog-md-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium">{{!currentEvent.id ? 'Create' : 'Update'}} event</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-gutter-md">
        <q-input
          v-model="title"
          label="Title"
          dense
          autofocus
          @input="delayTouch($v.title, $options.touchMap)"
          :error="$v.title.$error"
          :hide-bottom-space="!$v.title.$error"
        />
        <q-input v-model="description" label="Description" dense :hide-bottom-space="true" />
        <q-checkbox v-model="allDay" label="All-Day event?"></q-checkbox>
        <date-input
          v-if="allDay"
          v-model="dateTimeStart"
          label="Enter date"
          mask="####-##-##"
          filled
          :map-firestore="true"
        />
        <div v-else class="q-gutter-sm">
          <date-time-input
            filled
            v-model="dateTimeStart"
            label="Enter start date and time"
            input-mask="####-##-## ##:##"
            date-mask="YYYY-MM-DD HH:mm"
            :map-firestore="true"
            :date-options="dateTimeStartDateOptions"
            :time-options="dateTimeStartTimeOptions"
          />
          <date-time-input
            filled
            v-model="dateTimeEnd"
            @input="dateTimeEndSeleted=true"
            label="Enter end date and time"
            input-mask="####-##-## ##:##"
            date-mask="YYYY-MM-DD HH:mm"
            :map-firestore="true"
            :date-options="dateTimeEndDateOptions"
            :time-options="dateTimeEndTimeOptions"
            :error="$v.dateTimeEnd.$error"
            :hide-bottom-space="!$v.dateTimeEnd.$error"
            :error-message="!$v.dateTimeEnd.mustGreaterThanTimeStart ? 'THe end date must be greater than time start' : ''"
          />
        </div>
        <!-- <q-input filled v-model="bgcolor">
          <template #prepend>
            <div :style="colorStyle(bgcolor)" />
          </template>
          <template #append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy>
                <q-color v-model="bgcolor"></q-color>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>-->
      </q-card-section>
      <q-separator />
      <q-card-section class="row justify-end q-gutter-x-md">
        <q-btn color="primary" label="Cancel" outline @click="cancel" />
        <q-btn
          color="primary"
          label="Create"
          :loading="loading"
          @click="manageEvent('create')"
          v-if="!currentEvent.id"
        />
        <q-btn
          color="primary"
          label="Update"
          :loading="loading"
          @click="manageEvent('edit')"
          v-if="currentEvent.id"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import moment from 'moment'
import DateInput from 'components/inputs/DateInput'
import DateTimeInput from 'components/inputs/DateTimeInput'
import { required } from 'vuelidate/lib/validators'
import { delayTouch, notifySuccess, notifyFailure } from 'src/utils'
import { stringifiedDate, padTime } from 'src/utils/formatters'

export default {
  name: 'ManageEventDialog',
  components: {
    'date-input': DateInput,
    'date-time-input': DateTimeInput
  },
  touchMap: new WeakMap(),
  data () {
    return {
      openModal: false,
      loading: false,
      currentEvent: null,
      containerType: '',
      containerId: '',
      title: '',
      description: '',
      allDay: true,
      dateTimeStart: this.$firebase.Timestamp.now(),
      dateTimeEnd: this.$firebase.Timestamp.now(),
      bgcolor: '#0000FF',
      dateTimeEndSeleted: false
    }
  },
  validations: {
    title: { required },
    dateTimeEnd: {
      mustGreaterThanTimeStart (value) {
        if (!value) return true
        if (this.allDay) return true
        return moment(value.toDate()).isSameOrAfter(
          moment(this.dateTimeStart.toDate())
        )
      }
    }
  },
  methods: {
    open (containerType, containerId, event) {
      this.openModal = true
      this.containerType = containerType
      this.containerId = containerId
      this.reset(event)
    },
    dateTimeStartDateOptions (date) {
      return this.dateTimeEndSeleted
        ? date <= stringifiedDate(this.dateTimeEnd)
        : true
    },
    dateTimeStartTimeOptions (hr, min, sec) {
      return this.dateTimeEndSeleted
        ? padTime(hr, min, sec) <= stringifiedDate(this.dateTimeEnd, 'HH:mm:ss')
        : true
    },
    dateTimeEndDateOptions (date) {
      return date >= stringifiedDate(this.dateTimeStart)
    },
    dateTimeEndTimeOptions (hr, min, sec) {
      if (
        stringifiedDate(this.dateTimeStart) < stringifiedDate(this.dateTimeEnd)
      ) {
        return true
      }
      return (
        padTime(hr, min, sec) >= stringifiedDate(this.dateTimeStart, 'HH:mm:ss')
      )
    },
    async manageEvent (type) {
      this.loading = true
      this.validateForm()

      try {
        const event = {
          title: this.title,
          description: this.description || '',
          allDay: this.allDay,
          dateTimeStart: this.dateTimeStart,
          dateTimeEnd: this.dateTimeEnd,
          bgcolor: this.bgcolor,
          date: moment(this.dateTimeStart.toDate()).format('YYYY-MM-DD')
        }

        if (!event.allDay) {
          event.time = moment(this.dateTimeStart.toDate()).format('HH:mm')
          event.duration = moment(this.dateTimeEnd.toDate()).diff(
            this.dateTimeStart.toDate(),
            'minute'
          )
        }

        if (type === 'create') {
          await this.$firebase.event.create({
            event,
            containerType: this.containerType,
            containerId: this.containerId
          })

          notifySuccess('The event is created successfully')
        } else if (type === 'edit') {
          await this.$firebase.event.update({
            ...this.currentEvent,
            ...event
          })

          notifySuccess('The event is updated successfully')
        }
      } catch (error) {
        notifyFailure(error.message)
      }
      this.loading = false
      this.openModal = false
    },
    cancel () {
      this.openModal = false
    },
    validateForm () {
      if (this.$v.title.$invalid || this.$v.dateTimeEnd.$invalid) {
        this.$v.title.$touch()
        this.$v.dateTimeEnd.$touch()
        notifyFailure('You have some errors in the form')
        setTimeout(() => {
          this.loading = false
        }, 1000)
        throw new Error('You have some errors in the form')
      }
    },
    reset (event) {
      this.$v.title.$reset()
      this.title = event.title

      this.description = event.description
      this.allDay = event.allDay
      this.dateTimeStart = event.dateTimeStart || this.$firebase.Timestamp.now()
      if (event.dateTimeEnd) {
        this.dateTimeEndSeleted = true
      }
      this.dateTimeEnd = event.dateTimeEnd || event.dateTimeStart
      this.bgcolor = event.bgcolor
      this.currentEvent = event
    },
    delayTouch,
    stringifiedDate,
    padTime,
    colorStyle (color) {
      return {
        'background-color': color,
        width: '24px',
        height: '24px',
        'border-radius': '12px'
      }
    }
  }
}
</script>

<style>
</style>
