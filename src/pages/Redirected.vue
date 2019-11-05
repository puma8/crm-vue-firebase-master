<template>
  <div class="full-width window-height row justify-center items-center">
    <q-spinner class="primary" size="3rem" />
  </div>
</template>

<script>
export default {
  name: 'Redirected',
  props: ['code'],
  async created () {
    const integrationType = this.$route.params.type

    if (integrationType === 'slack') {
      await this.$firebase.cfApi('slack')({
        code: this.code,
        action: 'connect'
      })
      this.$router.push({ name: 'personal' })
    } else if (integrationType === 'nylas') {
      await this.$firebase.cfApi('nylas')({
        code: this.code,
        action: 'connect'
      })
      this.$router.push({ name: 'personal' })
    }
  }
}
</script>

<style>
</style>
