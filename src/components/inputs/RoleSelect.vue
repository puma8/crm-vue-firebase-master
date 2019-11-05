<template>
  <q-select
    v-bind="$attrs"
    :value="value"
    :options="roleOptions"
    option-label="text"
    option-value="id"
    label="Role"
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
  name: 'RoleSelect',
  props: ['value'],
  computed: {
    ...mapGetters({
      security: 'settings/security'
    }),
    roleOptions () {
      return this.security.roles.filter(r => this.$permissionResolver.isNotHigherThan(r.id, 'role'))
    }
  }
}
</script>

<style>

</style>
