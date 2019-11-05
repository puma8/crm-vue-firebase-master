<template>
  <div class="right-border column">
    <deal-header />
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
        <deal-main />
      </q-tab-panel>

      <q-tab-panel name="files">
        <deal-files />
      </q-tab-panel>

      <q-tab-panel name="stats">
        <deal-stats />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import DealHeader from './DealHeader'
import DealMain from './DealMain'
import DealFiles from './DealFiles'
import DealStats from './DealStats'

export default {
  name: 'DealInfo',
  components: {
    'deal-header': DealHeader,
    'deal-main': DealMain,
    'deal-files': DealFiles,
    'deal-stats': DealStats
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
