<template>
  <q-select
    v-bind="$attrs"
    :value="value"
    :options="userOptions"
    option-label="name"
    option-value="id"
    label="Front User"
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
  name: 'FrontUserSelect',
  props: ['value'],
  computed: {
    ...mapGetters({
      users: 'users/list',
      frontUsers: 'users/frontUsers'
    }),
    userOptions () {
      const frontUsers = this.frontUsers.map(u => ({
        ...u,
        name: `${u.firstName} ${u.lastName} (${u.username})`
      }))

      if (!this.unlinkedOnly) return frontUsers
      return frontUsers.filter(frontUser => !this.users.find(user => user.meta && user.meta.frontUserId === frontUser.id))
    }
  }
}
</script>

<style>

</style>
