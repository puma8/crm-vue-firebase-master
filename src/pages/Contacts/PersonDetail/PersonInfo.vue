<template>
  <div class="right-border">
    <person-header />
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
      <q-tab name="deals" label="Deals" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="main">
        <person-main />
      </q-tab-panel>

      <q-tab-panel name="deals">
        <person-deals />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import PersonHeader from './PersonHeader'
import PersonMain from './PersonMain'
import PersonDeals from './PersonDeals'

export default {
  name: 'PersonInfo',
  components: {
    'person-header': PersonHeader,
    'person-main': PersonMain,
    'person-deals': PersonDeals
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
