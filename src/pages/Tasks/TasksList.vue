<template>
  <div class="column flex-1">
    <div class="row items-center q-gutter-x-md q-pa-xs">
      <q-btn outline label="New Task" @click="createTask" />
      <q-space />
      <q-select
        v-model="sortBy"
        :options="sortOptions"
        dense
      >
        <template #after>
          <q-btn flat dense icon="arrow_upward" />
        </template>
      </q-select>
      <q-btn-toggle
        v-model="viewMode"
        unelevated
        rounded
        size="sm"
        :options="[
          {value: 'list', slot: 'list'},
          {value: 'kanban', slot: 'kanban'}
        ]"
      >
        <template #list>
          <q-btn flat round dense icon="view_week" size="sm" @click="viewMode='list'" />
        </template>
        <template #kanban>
          <q-btn flat round dense icon="menu" size="sm" @click="viewMode='menu'" />
        </template>
      </q-btn-toggle>
    </div>
    <unpadded-container>
      <template #content v-if="tasks.length > 0">
        <h6 class="label-separator"><span>OPEN</span></h6>
        <div class="column q-gutter-y-md q-px-md" v-if="activeTasks.length > 0">
          <task-card
            v-for="(task, index) in activeTasks"
            :key="index"
            :task="task"
            :simplified="true"
            @click="$router.push({name: `${containerType}-task`, params: {taskId: task.id}})"
          />
        </div>
        <div v-else class="text-center text-subtitle1 q-pt-md">
          You have no opened tasks
        </div>
        <h6 class="label-separator"><span>COMPLETED</span></h6>
        <div class="column q-gutter-y-md q-px-md" v-if="completedTasks.length > 0">
          <task-card
            v-for="(task, index) in completedTasks"
            :key="index"
            :task="task"
            :simplified="true"
            @click="$router.push({name: `${containerType}-task`, params: {taskId: task.id}})"
          />
        </div>
        <div v-else class="text-center text-subtitle1 q-pt-md">
          You have no completed tasks
        </div>
      </template>
      <template #content v-else>
        <div class="text-center text-subtitle1 q-pt-md">You have no tasks</div>
      </template>
    </unpadded-container>
    <add-new-task-dialog ref="AddNewTaskDialog" />
  </div>
</template>

<script>
import firebase from 'firebase/app'
import { mapGetters } from 'vuex'
import { notifySuccess, notifyFailure } from 'src/utils'
import PaddedContainer from 'components/layouts/UnpaddedContainer'
import TaskCard from 'components/cards/TaskCard'
import AddNewTaskDialog from 'components/dialogs/AddNewTaskDialog'

export default {
  name: 'TaskPanel',
  props: ['containerId', 'containerType'],
  components: {
    'unpadded-container': PaddedContainer,
    'task-card': TaskCard,
    'add-new-task-dialog': AddNewTaskDialog
  },
  data () {
    return {
      viewMode: 'list',
      sortBy: 'Last updated',
      sortOptions: ['Last updated', 'Recent updated'],
      tasks: []
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
      dealById: 'deals/dealById',
      projectById: 'projects/projectById'
    }),
    activeTasks () {
      return this.tasks.filter(task => !task.completed)
    },
    completedTasks () {
      return this.tasks.filter(task => task.completed)
    },
    container () {
      if (this.containerType === 'deal') {
        return this.dealById(this.containerId)
      } else if (this.containerType === 'project') {
        return this.projectById(this.containerId)
      }

      return {}
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
        'tasks',
        firebase.firestore().collection('tasks')
          .where('orgId', '==', orgId)
          .where('containerId', '==', this.containerId)
      )
    },
    createTask () {
      this.$refs.AddNewTaskDialog.open(this.container, newTask => {
        return this.$firebase.task.create({
          containerId: this.containerId,
          containerType: this.containerType,
          ...newTask
        })
      }, (_, error) => {
        !error ? notifySuccess('The task is created successfully') : notifyFailure(error.message)
      })
    }
  }
}
</script>

<style>
</style>
