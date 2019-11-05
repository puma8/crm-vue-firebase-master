<template>
  <layout>
    <template #header>
      <fragment>
        <span class="text-subtitle1" style="width: 80px">To-Do List</span>
        <q-tabs shrink v-model="$route.params.status">
          <q-route-tab name="todo" :label="`To Do (${pendingTasksCount})`" :to="{
            name: 'todos',
            query: { status: 'pending' }
          }" />
          <q-route-tab name="done" :label="`Done (${doneTasksCount})`" :to="{
            name: 'todos',
            query: { status: 'done' }
          }" />
        </q-tabs>
        <q-space />
      </fragment>
    </template>
    <template #content>
      <list :status="status" :allTasks="allTasks" :allSubTasks="allSubTasks" />
    </template>
  </layout>
</template>

<script>
import Layout from 'layouts/PrimaryPageLayout'
import List from './List'
import { mapGetters } from 'vuex'

export default {
  name: 'ToDos',
  props: ['status'],
  components: {
    'layout': Layout,
    'list': List
  },
  data () {
    return {
      allTasks: [],
      allSubTasks: []
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user'
    }),
    pendingTasksCount () {
      return this.allTasks.filter(task => !task.completed).length
    },
    doneTasksCount () {
      return this.allTasks.filter(task => task.completed).length
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
        'allTasks',
        this.$firebase.db.collection('tasks')
          .where('orgId', '==', orgId)
      )

      this.$bind(
        'allSubTasks',
        this.$firebase.db.collectionGroup('subtasks')
          .where('orgId', '==', orgId)
      )
    }
  }
}
</script>

<style>

</style>
