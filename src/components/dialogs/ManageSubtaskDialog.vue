<template>
  <q-dialog v-model="openModal" persistent>
    <q-card v-if="openModal" class="dialog-md-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium">Subtask</div>
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
          :hide-bottom-space="true"
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
        <members-select
          v-model="assigneeId"
          :selectable-users="candidates"
          :multiple="false"
          label="Assignee To"
        />
      </q-card-section>
      <q-card-section class="row justify-end q-gutter-x-md">
        <q-btn
          color="primary"
          :label="isEditing ? 'Update' : 'Create'"
          :loading="loading"
          @click="manage"
        />
        <q-btn flat label="Cancel" @click="cancel" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import { required } from 'vuelidate/lib/validators'
import { delayTouch, notifyFailure } from 'src/utils'
import MembersSelect from '../inputs/MembersSelect'
import DateInput from '../inputs/DateInput'

export default {
  name: 'ManageSubtaskDialog',
  touchMap: new WeakMap(),
  components: {
    'members-select': MembersSelect,
    'date-input': DateInput
  },
  data () {
    return {
      openModal: false,
      task: {},
      subtask: null,
      isEditing: false,
      name: '',
      description: '',
      deadline: this.$firebase.Timestamp.now(),
      assigneeId: '',
      action: null,
      callback: () => {},
      loading: false
    }
  },
  computed: {
    ...mapGetters({
      dealById: 'deals/dealById',
      projectById: 'projects/projectById'
    }),
    candidates () {
      const containerId = this.task.containerId
      const containerType = this.task.containerType

      if (containerType === 'deal') {
        return this.dealById(containerId).members || []
      } else {
        return this.projectById(containerId).members || []
      }
    },
    currentDate () {
      return moment().format('YYYY/MM/DD')
    }
  },
  validations: {
    name: { required },
    deadline: { required }
  },
  methods: {
    open (task, subtask, action, callback) {
      this.reset(subtask)
      this.task = task
      this.action = action
      this.callback = callback
      this.openModal = true
    },
    cancel () {
      this.openModal = false
    },
    async manage () {
      this.validate()
      const subtask = {
        ...this.subtask,
        name: this.name,
        description: this.description,
        deadline: this.deadline,
        assigneeId: this.assigneeId
      }
      if (this.action) {
        this.loading = true
        try {
          const result = await this.action(subtask)
          if (this.callback) {
            this.callback(result)
          }
        } catch (error) {
          if (this.callback) {
            this.callback(null, error)
          }
        }
      } else if (this.callback) {
        this.callback(subtask)
      }
      this.loading = false
      this.openModal = false
    },
    validate () {
      if (this.$v.name.$invalid || this.$v.deadline.$invalid) {
        this.$v.name.$touch()
        this.$v.deadline.$touch()
        notifyFailure('You have some errors in the form')
        throw new Error('You have some errors in the form')
      }
      this.$v.$reset()
    },
    reset (subtask) {
      this.$v.$reset()
      this.subtask = subtask || {
        name: '',
        description: '',
        deadline: this.$firebase.Timestamp.now(),
        assigneeId: ''
      }
      this.isEditing = this.subtask.id
      this.name = this.subtask.name
      this.description = this.subtask.description
      this.deadline = this.subtask.deadline || this.$firebase.Timestamp.now()
      this.assigneeId = this.subtask.assigneeId
    },
    delayTouch
  }
}
</script>

<style>
</style>
