<template>
  <q-select
    v-bind="$attrs"
    :value="value"
    :options="userOptions"
    option-label="name"
    option-value="id"
    label="Select User"
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
  props: ['value', 'slackUnlinkedOnly', 'frontUnlinkedOnly'],
  computed: {
    ...mapGetters({
      users: 'users/list',
      slackUsers: 'users/slackUsers',
      frontUsers: 'users/frontUsers'
    }),
    userOptions () {
      let users = this.users
      if (!this.slackUnlinkedOnly && !this.frontUnlinkedOnly) return users
      if (this.slackUnlinkedOnly) {
        users = users.filter(user => !user.meta || !this.slackUsers.find(su => su.id === user.meta.slackUserId))
      }
      if (this.frontUnlinkedOnly) {
        users = users.filter(user => !user.meta || !this.frontUsers.find(fu => fu.id === user.meta.frontUserId))
      }
      return users
    }
  }
}
</script>

<style>

</style>
