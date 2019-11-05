<template>
  <div class="right-border">
    <company-header />
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
        <company-main />
      </q-tab-panel>

      <q-tab-panel name="deals">
        <div />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import CompanyHeader from './CompanyHeader'
import CompanyMain from './CompanyMain'

export default {
  name: 'CompanyInfo',
  components: {
    'company-header': CompanyHeader,
    'company-main': CompanyMain
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
