<template>
  <div class="column flex-1">
    <div class="row flex-1">
      <company-info class="col-4" />
      <company-activity class="col-8" />
    </div>
  </div>
</template>

<script>
import CompanyInfo from './CompanyInfo'
import CompanyActivity from './CompanyActivity'

export default {
  name: 'CompanyDetail',
  components: {
    'company-info': CompanyInfo,
    'company-activity': CompanyActivity
  }
}
</script>
