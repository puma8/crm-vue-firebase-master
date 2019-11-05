<template>
  <unpadded-container>
    <template #content>
      <div class="q-pa-md column">
        <div class="row justify-between q-px-md bg-white q-mb-md">
          <assignees-select
            class="col-3"
            v-model="byAssignees"
            label="Assigned to"
            :show-details="false"
            :hide-bottom-space="true"
          />
          <q-select
            class="col-1"
            v-model="byContainerType"
            :options="parentOptions"
            option-label="text"
            option-value="id"
            label="Parent"
            map-options
            emit-value
            dense
            :hide-bottom-space="true"
          />
          <q-input
            class="col-3"
            v-model="byContainerTitle"
            label="Title"
            dense
            :hide-bottom-space="true"
          />
          <q-select
            class="col-1"
            v-model="byType"
            :options="typeOptions"
            option-label="text"
            option-value="id"
            label="Type"
            map-options
            emit-value
            dense
            :hide-bottom-space="true"
          />
          <q-select
            class="col-1"
            v-model="byDue"
            :options="dueOptions"
            option-label="text"
            option-value="id"
            label="Due"
            map-options
            emit-value
            dense
            :hide-bottom-space="true"
          />
          <q-select
            class="col-1"
            v-model="byAction"
            :options="actionOptions"
            option-label="text"
            option-value="id"
            label="Action"
            map-options
            emit-value
            dense
            :hide-bottom-space="true"
          />
        </div>
        <div class="q-gutter-y-md">
          <div v-for="item in tasks" :key="item.id">
            <task-card
              v-if="isTask(item)"
              :task="item"
              @click="$router.push(`${item.containerType}s/${item.containerId}/tasks/${item.id}`)"
            />
            <subtask-card
              v-if="!isTask(item)"
              :task="getTask(item)"
              :subtask="item"
            />
          </div>
        </div>
      </div>
    </template>
  </unpadded-container>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import _ from 'lodash'
import UnpaddedContainer from 'components/layouts/UnpaddedContainer'
import TaskCard from 'components/cards/TaskCard'
import SubtaskCard from 'components/cards/SubtaskCard'
import AssigneesSelect from 'components/inputs/MembersSelect'

export default {
  name: 'AllTaskList',
  props: ['status', 'allTasks', 'allSubTasks'],
  components: {
    'unpadded-container': UnpaddedContainer,
    'task-card': TaskCard,
    'subtask-card': SubtaskCard,
    'assignees-select': AssigneesSelect
  },
  data () {
    return {
      byAssignees: [],
      byContainerType: 'all',
      byContainerTitle: '',
      byType: 'all',
      byDue: 'all',
      byAction: 'assignee',
      parentOptions: [{
        id: 'all',
        text: 'All'
      }, {
        id: 'deal',
        text: 'Deals'
      }, {
        id: 'project',
        text: 'Projects'
      }],
      typeOptions: [{
        id: 'all',
        text: 'All'
      }, {
        id: 'task',
        text: 'Tasks'
      }, {
        id: 'subtask',
        text: 'Subtasks'
      }],
      dueOptions: [{
        id: 'all',
        text: 'All'
      }, {
        id: 'today',
        text: 'Today'
      }, {
        id: 'past',
        text: 'Past Due'
      }],
      actionOptions: [{
        id: 'assignee',
        text: 'Assignee'
      }, {
        id: 'follower',
        text: 'Follower'
      }]
    }
  },
  computed: {
    ...mapGetters({
      users: 'users/list',
      currentUser: 'auth/user',
      dealById: 'deals/dealById',
      projectById: 'projects/projectById'
    }),
    tasks () {
      let tasks = this.allTasks
      if (this.byType === 'task') {
        tasks = this.allTasks
      } else if (this.byType === 'subtask') {
        tasks = this.allSubTasks
      } else {
        tasks = [...this.allTasks, ...this.allSubTasks]
      }

      if (this.byContainerType === 'deal') {
        tasks = tasks.filter(task => task.containerType === 'deal')
      } else if (this.byContainerType === 'project') {
        tasks = tasks.filter(task => task.containerType === 'project')
      }

      if (this.byContainerTitle) {
        tasks = tasks.filter(task => {
          const container = this[`${task.containerType}ById`](task.containerId)
          return container.name.indexOf(this.byContainerTitle) !== -1
        })
      }

      if (this.byDue === 'today') {
        tasks = tasks.filter(task => moment(task.deadline.toDate()).diff(moment(), 'days') === 0)
      } else if (this.byDue === 'past') {
        tasks = tasks.filter(task => moment(task.deadline.toDate()).isBefore(moment()))
      }

      if (this.byAssignees.length > 0) {
        if (this.byAction === 'assignee') {
          tasks = tasks.filter(task => this.byAssignees.includes(task.assigneeId))
        } else if (this.byAction === 'follower') {
          tasks = tasks.filter(task => {
            return _.intersection(task.members, this.byAssignees).length > 0
          })
        }
      }

      return tasks.filter(task => this.status === 'pending' ? !task.completed : task.completed)
    }
  },
  mounted () {
    this.byAssignees = [this.currentUser.id]
  },
  watch: {
    currentUser (val) {
      this.byAssignees = [val.id]
    }
  },
  methods: {
    isTask (item) {
      return !item.taskId
    },
    getTask (subtask) {
      return this.allTasks.find(task => task.id === subtask.taskId)
    }
  }
}
</script>

<style>

</style>
