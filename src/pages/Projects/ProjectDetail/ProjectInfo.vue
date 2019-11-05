<template>
  <div class="right-border column">
    <project-header />
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="left"
      :breakpoint="0"
      no-caps
    >
      <q-tab name="main" label="Main" />
      <q-tab name="files" label="Files" />
      <q-tab name="stats" label="Statistics" />
    </q-tabs>

    <div>
      <q-separator />
    </div>

    <q-tab-panels v-model="tab" animated class="flex-1">
      <q-tab-panel name="main" class="q-px-none">
        <project-main />
      </q-tab-panel>

      <q-tab-panel name="files">
        <project-files />
      </q-tab-panel>

      <q-tab-panel name="stats">
        <project-stats />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import ProjectHeader from './ProjectHeader'
import ProjectMain from './ProjectMain'
import ProjectFiles from './ProjectFiles'
import ProjectStats from './ProjectStats'

export default {
  name: 'ProjectInfo',
  components: {
    'project-header': ProjectHeader,
    'project-main': ProjectMain,
    'project-files': ProjectFiles,
    'project-stats': ProjectStats
  },
  data () {
    return {
      tab: 'main'
    }
  }
}
</script>
<style>
  .right-border {
    border-right: 0.5px solid #e2e2e2
  }
</style>
