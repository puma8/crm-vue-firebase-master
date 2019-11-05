<template>
  <div class="column">
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
      inline-label
    >
      <q-route-tab name="history" label="History" icon="restore" :to="{name: 'project-history'}" />
      <q-route-tab name="tasks" label="Tasks" icon="toc" :to="{name: 'project-tasks'}" />
      <q-route-tab name="inbox" label="Emails" icon="inbox" :to="{name: 'project-inbox'}" />
      <q-route-tab name="event" label="Events" icon="inbox" :to="{name: 'project-events'}" />
    </q-tabs>
    <div>
      <q-separator />
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'ProjectActivity',
  data () {
    return {
      tab:
        this.$route.name === 'project-history'
          ? 'history'
          : this.$route.name === 'project-tasks'
            ? 'tasks'
            : 'inbox'
    }
  }
}
</script>

<style>
</style>
