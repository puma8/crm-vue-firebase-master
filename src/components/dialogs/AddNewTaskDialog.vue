<template>
  <q-dialog v-model="openModal" persistent>
    <q-card v-if="openModal" class="dialog-md-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium">Create task</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-input
          label="Name"
          v-model="name"
          dense
          autofocus
          @input="delayTouch($v.name, $options.touchMap)"
          :error="$v.name.$error"
          :hide-bottom-space="!$v.name.$error"
        />
        <q-field
          borderless
          :value="description"
          label="Description"
          stack-label
          @input="delayTouch($v.description, $options.touchMap)"
          :error="$v.description.$error"
          :hide-bottom-space="!$v.description.$error"
        >
          <q-editor
            v-model="description"
            min-height="5rem"
            content-class="description"
            class="flex-1"
          />
        </q-field>
        <date-input
          v-model="deadline"
          label="Deadline"
          :options="date => date >= currentDate"
          :map-firestore="true"
          @input="delayTouch($v.deadline, $options.touchMap)"
          :error="$v.deadline.$error"
          :hide-bottom-space="!$v.deadline.$error"
        />
        <members-select v-model="assigneeId" label="Assigned To" :multiple="false" />
        <members-select v-model="members" label="Followers" />
      </q-card-section>
      <q-separator />
      <q-card-section class="row justify-end q-gutter-x-md">
        <q-btn color="primary" label="Cancel" outline @click="cancel" />
        <q-btn color="primary" label="Create" :loading="loading" @click="createTask" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import moment from 'moment'
import { required } from 'vuelidate/lib/validators'
import { delayTouch, notifyFailure } from 'src/utils'
import MembersSelect from '../inputs/MembersSelect'
import DateInput from '../inputs/DateInput'

export default {
  name: 'AddNewTaskDialog',
  components: {
    'members-select': MembersSelect,
    'date-input': DateInput
  },
  touchMap: new WeakMap(),
  data () {
    return {
      openModal: false,
      container: {},
      name: '',
      description: '',
      deadline: this.$firebase.Timestamp.now(),
      assigneeId: '',
      members: [],
      action: null,
      callback: () => {},
      loading: false
    }
  },
  computed: {
    currentDate () {
      return moment().format('YYYY/MM/DD')
    }
  },
  validations: {
    name: { required },
    description: { required },
    deadline: { required }
  },
  methods: {
    open (container, action, callback) {
      this.container = container
      this.action = action
      this.callback = callback
      this.openModal = true
      this.reset()
    },
    cancel () {
      this.openModal = false
    },
    async createTask () {
      this.validateForm()
      const { name, description, deadline, assigneeId, members } = this
      const task = { name, description, deadline, assigneeId, members }

      if (this.action) {
        this.loading = true
        try {
          const result = await this.action(task)
          if (this.callback) {
            this.callback(result)
          }
        } catch (error) {
          if (this.callback) {
            this.callback(null, error)
          }
        }
      } else if (this.callback) {
        this.callback(this.customField)
      }
      this.reset()
      this.loading = false
      this.openModal = false
    },
    validateForm () {
      if (
        this.$v.name.$invalid ||
        this.$v.description.$invalid ||
        this.$v.deadline.$invalid
      ) {
        this.$v.name.$touch()
        this.$v.description.$touch()
        this.$v.deadline.$touch()
        notifyFailure('You have some errors in the form')
        setTimeout(() => {
          this.loading = false
        }, 1000)
        throw new Error('You have some errors in the form')
      }
    },
    reset () {
      this.name = ''
      this.$v.name.$reset()
      this.description = ''
      this.$v.description.$reset()
      this.deadline = this.$firebase.Timestamp.now()
      this.$v.deadline.$reset()
    },
    delayTouch
  }
}
</script>

<style lang='stylus'>
.description {
  color: rgba(0, 0, 0, 0.87);
}
</style>
