<template>
  <div
    :class="[
    'full-width best-rounded best-hover row items-center', subtask.completed ? 'bg-grey-2' : 'bg-white'
  ]"
  >
    <div class="row justify-center items-center" style="width: 60px">
      <q-checkbox v-model="completed" @input="complete" :disable="loading" />
    </div>
    <div class="q-pa-xs flex-1">
      <div class="text-subtitle1 text-weight-bold" v-if="!simplified">{{container.name}}</div>
      <div class="text-subtitle2 text-weight-medium" v-if="!simplified">{{task.name}}</div>
      <div class="row">
        <div class="row items-center">
          <span
            :class="[subtask.completed ? 'text-strike' : '', 'text-caption text-weight-medium']"
          >{{subtask.name}}</span>
          <q-badge class="q-ml-sm" color="warning" v-if="!subtask.completed">
            <span>{{subtask.deadline | due}}</span>
          </q-badge>
        </div>
        <q-space />
        <members-avatar-list-input :assignee-id="subtask.assigneeId" readonly="true" />
        <q-btn class="q-ml-lg" icon="edit" rounded flat dense @click="update" v-if="editable" />
      </div>
    </div>
    <manage-subtask-dialog ref="ManageSubtaskDialog" />
  </div>
</template>

<script>
import { notifySuccess, notifyFailure } from 'src/utils'
import { due } from 'src/utils/filters'
import MembersAvatarListInput from 'components/inputs/MembersAvatarListInput'
import ManageSubtaskDialog from 'components/dialogs/ManageSubtaskDialog'
import { mapGetters } from 'vuex'

export default {
  name: 'SubtaskCard',
  props: ['task', 'subtask', 'editable', 'simplified'],
  components: {
    'manage-subtask-dialog': ManageSubtaskDialog,
    'members-avatar-list-input': MembersAvatarListInput
  },
  data () {
    return {
      loading: false,
      completed: this.subtask.completed
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
  watch: {
    subtask (val) {
      this.completed = val.completed
    }
  },
  filters: {
    due
  },
  methods: {
    async complete () {
      this.loading = true
      try {
        await this.$firebase.task.subtask.update({
          ...this.subtask,
          completed: this.completed,
          statusChangedAt: this.$firebase.serverTimestamp(),
          statusChangedBy: this.currentUser.id
        })
        notifySuccess('The subtask is updated successfully')
      } catch (error) {
        notifyFailure(error.message)
      }
      this.loading = false
    },
    async update () {
      this.$refs.ManageSubtaskDialog.open(this.task, this.subtask, subtask => {
        return this.$firebase.task.subtask.update(subtask)
      })
    }
  }
}
</script>

<style>
</style>
