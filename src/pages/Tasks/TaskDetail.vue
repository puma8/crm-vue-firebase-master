<template>
  <div class="column flex-1">
    <div class="row items-center q-px-sm q-pt-sm">
      <q-btn
        style="width: 30px;"
        flat
        dense
        icon="keyboard_arrow_left"
        @click="$router.push({name: `${containerType}-tasks`})"
      />
      <div class="editable" v-if="task">
        <span class="text-subtitle1 text-weight-bold">{{task.name}}</span>
        <q-popup-edit v-model="task.name" buttons @save="updateName">
          <q-input v-model="task.name" dense />
        </q-popup-edit>
        <q-btn
          icon="edit"
          rounded
          flat
          dense
          :class="!loading.name ? 'edit' : ''"
          :loading="loading.name"
        />
      </div>
      <q-space />
      <q-btn flat round dense icon="more_horiz" />
      <q-btn
        outline
        label="Re-Open"
        v-if="isCompleted"
        @click="doTaskAction('todo')"
        :loading="loading.action"
      />
      <q-btn-dropdown outline label="Mark" :loading="loading.action" v-else>
        <q-list v-if="isToDo">
          <q-item clickable v-close-popup @click="doTaskAction('in-progress')">
            <q-item-section>
              <q-item-label>In Progress</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="doTaskAction('complete')">
            <q-item-section>
              <q-item-label>Complete</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-list v-if="isInProgress">
          <q-item clickable v-close-popup @click="doTaskAction('todo')">
            <q-item-section>
              <q-item-label>ToDo</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="doTaskAction('complete')">
            <q-item-section>
              <q-item-label>Complete</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
    <div class="flex-1">
      <q-scroll-area class="full-height primary-bg-color">
        <div class="column bg-white q-pa-sm shadow-2">
          <div style="padding-left: 30px;">
            <div class="row items-center editable" v-if="task">
              <div class="task-attribute-title text-weight-medium">Deadline:</div>
              <div>{{task.deadline | stringifyDate}}</div>
              <q-popup-edit v-model="task.deadline" buttons @save="updateDeadline">
                <date-input
                  v-model="task.deadline"
                  label="Deadline"
                  :options="date => date >= currentDate"
                  :map-firestore="true"
                  :hide-bottom-space="true"
                />
              </q-popup-edit>
              <q-btn
                icon="edit"
                rounded
                flat
                dense
                :class="!loading.deadline ? 'edit' : ''"
                :loading="loading.deadline"
              />
            </div>
            <div class="row items-center editable" v-if="task">
              <div class="task-attribute-title text-weight-medium">Description:</div>
              <div v-html="task.description" />
              <q-popup-edit v-model="task.description" buttons @save="updateDescription">
                <q-field
                  v-if="task"
                  borderless
                  :value="task.description"
                  label="Write description"
                  stack-label
                  :hide-bottom-space="true"
                >
                  <q-editor
                    v-model="task.description"
                    @keyup.enter.stop
                    min-height="5rem"
                    content-class="description"
                    class="flex-1 q-mb-md"
                  />
                </q-field>
              </q-popup-edit>
              <q-btn
                icon="edit"
                rounded
                flat
                dense
                :class="!loading.description ? 'edit' : ''"
                :loading="loading.description"
              />
            </div>
            <div class="row items-center editable" v-if="task">
              <div class="task-attribute-title text-weight-medium">Assignee:</div>
              <avatar
                :username="taskAssignee.name"
                :src="taskAssignee.photoUrl"
                :size="24"
                v-if="taskAssignee"
              />
              <div v-else>N/A</div>
              <q-popup-edit v-model="task.assigneeId" buttons @save="updateAssignee">
                <members-select v-model="task.assigneeId" :multiple="false" />
              </q-popup-edit>
              <q-btn
                icon="edit"
                rounded
                flat
                dense
                :class="!loading.assigneeId ? 'edit' : ''"
                :loading="loading.assigneeId"
              />
            </div>
            <div class="row items-center editable" v-if="task">
              <div class="task-attribute-title text-weight-medium">Followers:</div>
              <members-avatar-list-input
                :value="task.members"
                :selectable-users="selectableMembers"
                :actionFunc="updateMembers"
                :loading="loading.members"
                v-if="task"
              />
            </div>
            <div class="q-my-sm">
              <q-separator />
            </div>
            <div class="row items-center">
              <div class="flex-1 text-weight-medium">Subtasks</div>
              <q-space />
              <q-btn
                flat
                dense
                :label="hideCompletedItems ? 'Show all items' : 'Hide completed items'"
                @click="hideCompletedItems=!hideCompletedItems"
                v-if="enhancedSubtasks.length"
              />
              <q-btn
                flat
                round
                dense
                :icon="showSubtasks ? 'expand_less' : 'expand_more'"
                @click="showSubtasks=!showSubtasks"
                v-if="enhancedSubtasks.length"
              />
            </div>
            <q-slide-transition>
              <div v-show="showSubtasks">
                <subtask
                  :task="task"
                  :subtask="subtask"
                  :editable="true"
                  :simplified="true"
                  v-for="(subtask, index) in filteredSubtasks"
                  :key="index"
                />
              </div>
            </q-slide-transition>
            <div>
              <span class="q-mr-sm" v-if="!enhancedSubtasks.length">You don't have any subtasks.</span>
              <q-btn color="primary" flat dense size="sm" label="Add an Item" @click="addSubtask" />
            </div>
          </div>
        </div>
        <comment-thread
          class="q-ma-md"
          :comments="comments"
          @post-comment="postComment"
          :loading="loading.comment"
        />
      </q-scroll-area>
    </div>
    <manage-subtask-dialog ref="ManageSubtaskDialog" />
  </div>
</template>

<script>
import firebase from 'firebase/app'
import { mapGetters } from 'vuex'
import Avatar from 'vue-avatar'
import { notifySuccess, notifyFailure } from 'src/utils'
import { due, stringifyDate } from 'src/utils/filters'
import * as formatters from 'src/utils/formatters'
import DateInput from 'components/inputs/DateInput'
import CommentThread from 'components/widgets/CommentThread'
import ManageSubtaskDialog from 'components/dialogs/ManageSubtaskDialog'
import SubtaskCard from 'components/cards/SubtaskCard'
import MembersAvatarListInput from 'components/inputs/MembersAvatarListInput'
import MembersSelect from 'components/inputs/MembersSelect'

export default {
  name: 'TaskDetail',
  props: ['containerId', 'containerType', 'taskId'],
  components: {
    'date-input': DateInput,
    'comment-thread': CommentThread,
    'manage-subtask-dialog': ManageSubtaskDialog,
    subtask: SubtaskCard,
    'members-avatar-list-input': MembersAvatarListInput,
    avatar: Avatar,
    'members-select': MembersSelect
  },
  data () {
    return {
      currentDate: formatters.stringifiedDate(),
      task: {
        deadline: this.$firebase.Timestamp.now(),
        description: ''
      },
      subtasks: [],
      comments: [],
      loading: {},
      showSubtasks: true,
      hideCompletedItems: false
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
      users: 'users/list',
      userById: 'users/userById',
      dealById: 'deals/dealById',
      projectById: 'projects/projectById'
    }),
    isToDo () {
      return (
        this.task &&
        !this.task.completed &&
        (!this.task.status || this.task.status === 'todo')
      )
    },
    isInProgress () {
      return (
        this.task && !this.task.completed && this.task.status === 'in-progress'
      )
    },
    isCompleted () {
      return this.task && this.task.completed
    },
    enhancedSubtasks () {
      return this.subtasks || []
    },
    filteredSubtasks () {
      const subtasks = this.subtasks || []
      return this.hideCompletedItems
        ? subtasks.filter(subtask => !subtask.completed)
        : this.subtasks
    },
    container () {
      if (this.containerType === 'deal') {
        return this.dealById(this.containerId)
      } else if (this.containerType === 'project') {
        return this.projectById(this.containerId)
      }

      return {}
    },
    taskAssignee () {
      return this.userById(this.task.assigneeId)
    },
    selectableMembers () {
      return this.users
        .filter(id => id !== this.task.assigneeId)
        .map(user => user.id)
    }
  },
  watch: {
    currentUser: function (val) {
      this.bind(val.orgId)
    }
  },
  firestore () {
    return {
      task: firebase
        .firestore()
        .collection('tasks')
        .doc(this.taskId)
    }
  },
  filters: { due, stringifyDate },
  mounted () {
    this.bind(this.currentUser.orgId)
  },
  methods: {
    bind (orgId) {
      if (!orgId) {
        return
      }

      this.$bind(
        'subtasks',
        firebase
          .firestore()
          .collection(`tasks/${this.taskId}/subtasks`)
          .where('orgId', '==', orgId)
      )
      this.$bind(
        'comments',
        firebase
          .firestore()
          .collection(`tasks/${this.taskId}/comments`)
          .where('orgId', '==', orgId)
          .orderBy('createdAt', 'desc')
      )
    },
    addSubtask () {
      this.$refs.ManageSubtaskDialog.open(
        this.task,
        null,
        subtask => {
          return this.$firebase.task.subtask.create({
            taskId: this.task.id,
            ...subtask
          })
        },
        (_, error) => {
          if (error) {
            notifyFailure(error.message)
          }
        }
      )
    },
    updateAssignee (assigneeId) {
      this.updateTask({ ...this.task, assigneeId }, 'assigneeId')
    },
    updateMembers (members) {
      this.updateTask({ ...this.task, members }, 'members')
    },
    updateName (value) {
      this.updateTask({ ...this.task, name: value }, 'name')
    },
    updateDeadline (value) {
      this.updateTask({ ...this.task, deadline: value }, 'deadline')
    },
    updateDescription (value) {
      this.updateTask({ ...this.task, description: value }, 'description')
    },
    doTaskAction (nextStatus) {
      this.$set(this.loading, 'action', true)
      this.$firebase.task
        .complete({
          ...this.task,
          completed: nextStatus === 'complete',
          status: nextStatus
        })
        .then(() => {
          this.$set(this.loading, 'action', false)
          if (nextStatus === 'complete') {
            notifySuccess('The task is completed successfully')
          } else if (nextStatus === 'in-progress') {
            notifySuccess('The task is in progress')
          } else {
            notifySuccess('The task is re-opened')
          }
        })
        .catch(error => {
          this.$set(this.loading, 'action', false)
          notifyFailure(error.message)
          throw new Error(error.message)
        })
    },
    updateTask (updatedTask, field) {
      this.$set(this.loading, field, true)
      this.$firebase.task
        .update(updatedTask)
        .then(() => {
          this.$set(this.loading, field, false)
          notifySuccess('The task is updated successfully')
        })
        .catch(error => {
          this.$set(this.loading, field, false)
          notifyFailure(error.message)
        })
    },
    postComment (comment) {
      this.$set(this.loading, 'comment', true)
      this.$firebase.task.comment
        .create({ taskId: this.task.id, text: comment })
        .then(() => {
          this.$set(this.loading, 'comment', false)
        })
        .catch(error => {
          this.$set(this.loading, 'comment', false)
          notifyFailure(error.message)
        })
    }
  }
}
</script>

<style lang='stylus'>
.description {
  color: rgba(0, 0, 0, 0.87);
}

.task-attribute-title {
  width: 100px;
}
</style>
