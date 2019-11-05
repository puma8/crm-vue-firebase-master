<template>
  <q-select
    v-bind="$attrs"
    :value="value"
    :options="userOptions"
    option-label="name"
    option-value="id"
    label="Slack User"
    emit-value
    map-options
    dense
    @input="$emit('input', $event)"
  />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  inheritAttrs: false,
  name: 'SlackUserSelect',
  props: ['value', 'unlinkedOnly'],
  computed: {
    ...mapGetters({
      users: 'users/list',
      slackUsers: 'users/slackUsers'
    }),
    userOptions () {
      if (!this.unlinkedOnly) return this.slackUsers
      return this.slackUsers.filter(slackUser => !this.users.find(user => user.meta && user.meta.slackUserId === slackUser.id))
    }
  }
}
</script>

<style>

</style>
