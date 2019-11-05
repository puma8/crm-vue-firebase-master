<template>
  <div :class="[
    'full-width best-rounded best-hover row items-center', task.completed ? 'bg-grey-2' : 'bg-white'
  ]">
    <div class="row justify-center items-center" style="width: 60px">
      <q-checkbox
        toggle-indeterminate
        :value="!task.completed && task.status === 'in-progress' ? null : task.completed"
        @input="completeTask($event)"
        v-if="!loading"
      />
      <q-spinner color="primary" size="2.5em" v-else />
    </div>
    <q-separator vertical />
    <div class="q-pa-sm cursor-pointer relative-position flex-1" v-ripple @click="$emit('click')">
      <div class="text-subtitle1 text-weight-bold" v-if="!simplified">
        {{container.name}}
      </div>
      <div class="row justify-between">
        <div class="row items-center q-gutter-x-sm">
          <span :class="[task.completed ? 'text-strike' : '', 'text-subtitle2 text-weight-medium']">{{task.name}}</span>
          <span class="text-caption" v-if="!task.completed">{{task.deadline | due}}</span>
        </div>
        <div class="row q-gutter-x-sm items-center">
          <span v-if="task.commentsCount">{{task.commentsCount}}</span>
          <q-icon name="forum" size="16px" v-if="task.commentsCount" />
          <q-btn flat round dense icon="more_horiz" size="xs" />
        </div>
      </div>
      <div class="row justify-between items-center">
        <div class="row q-gutter-xs items-center">
          <span class="text-grey-6">#{{task.no}}</span>
          <span class="text-grey-6 text-caption" v-if="task.updatedAt">
            updated {{task.updatedAt | moment}}
          </span>
          <div class="row q-gutter-xs">
            <div>
              <q-badge transparent text-color="black">To Do</q-badge>
            </div>
          </div>
        </div>
        <members-avatar-list-input :value="task.members" :assignee-id="task.assigneeId" readonly="true" />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import MembersAvatarListInput from '../inputs/MembersAvatarListInput'
import { notifySuccess, notifyFailure } from 'src/utils'
import { due } from 'src/utils/filters'
import { mapGetters } from 'vuex'

export default {
  name: 'TaskCard',
  props: ['task', 'simplified'],
  components: {
    'members-avatar-list-input': MembersAvatarListInput
  },
  data () {
    return {
      loading: false,
      theModel: null
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
      dealById: 'deals/dealById',
      projectById: 'projects/projectById'
    }),
    container () {
      return this[`${this.task.containerType}ById`](this.task.containerId)
    }
  },
  filters: {
    moment: function (date) {
      return moment(date).fromNow()
    },
    due
  },
  methods: {
    async completeTask (value) {
      let completed
      if (value === true) {
        completed = null
      } else if (value === null) {
        completed = false
      } else {
        completed = true
      }
      this.loading = true
      try {
        let nextStatus
        const isCompleted = Boolean(completed)
        if (isCompleted) {
          nextStatus = 'complete'
        } else if (completed === null) {
          nextStatus = 'in-progress'
        } else {
          nextStatus = 'todo'
        }

        await this.$firebase.task.complete({
          ...this.task,
          completed: isCompleted,
          status: nextStatus,
          updatedBy: this.currentUser.id
        })

        if (isCompleted) {
          notifySuccess('The task is completed successfully')
        } else if (nextStatus === 'in-progress') {
          notifySuccess('The task is in progress')
        } else {
          notifySuccess('The task is re-opened successfully')
        }
      } catch (error) {
        notifyFailure(error.message)
      }
      this.loading = false
    }
  }
}
</script>
