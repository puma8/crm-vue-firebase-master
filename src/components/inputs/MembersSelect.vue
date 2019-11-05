<template>
  <fragment>
    <q-select
      v-bind="$attrs"
      :value="currentValue"
      @input="handleInput"
      @remove="handleRemove"
      @filter="filterFn"
      :options="filterOptions"
      option-value="id"
      option-label="name"
      :label="label"
      :use-chips="multiple"
      :multiple="multiple"
      input-debounce="0"
      dense
      use-input
      emit-value
      map-options
    />
    <q-markup-table separator="none" flat v-if="showDetails">
      <thead v-if="selectedUsers.length">
        <tr>
          <th class="text-left">Name</th>
          <th class="text-left">Role</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(member, index) in selectedUsers" :key="index">
          <td class="text-left">{{member.name}}</td>
          <td class="text-left">{{member.role}}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </fragment>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'MemberSelect',
  inheritAttrs: false,
  props: {
    value: [String, Array],
    multiple: {
      default: true,
      type: Boolean
    },
    label: {
      default: 'Member',
      type: String
    },
    selectableUsers: Array,
    showDetails: {
      default: true,
      type: Boolean
    }
  },
  data () {
    return {
      filterOptions: []
    }
  },
  mounted () {
    this.filterOptions = this.userOptions
  },
  computed: {
    ...mapGetters({
      users: 'users/list'
    }),
    userOptions () {
      if (!this.selectableUsers) {
        return this.users
      } else {
        return this.users.filter(({ id }) => this.selectableUsers.indexOf(id) !== -1)
      }
    },
    selectedUsers () {
      if (this.multiple) {
        return this.users.filter(({ id }) => this.value.indexOf(id) !== -1)
      } else {
        return this.users.filter(({ id }) => this.value === id)
      }
    },
    currentValue () {
      if (this.multiple) {
        return this.value.map(uid => {
          if (this.filterOptions.find(u => u.id === uid)) {
            return uid
          } else {
            const user = this.userOptions.find(u => u.id === uid) || {}
            return user.name
          }
        })
      } else {
        if (this.filterOptions.find(u => u.id === this.value)) {
          return this.value
        } else {
          const user = this.userOptions.find(u => u.id === this.value) || {}
          return user.name
        }
      }
    }
  },
  methods: {
    handleInput (value) {
      if (this.multiple) {
        if (this.value.length < value.length) {
          this.$emit('input', [
            ...this.value,
            ...value.slice(this.value.length)
          ])
        }
      } else {
        this.$emit('input', value)
      }
    },
    handleRemove (details) {
      if (this.multiple) {
        this.$emit('input', this.value.filter((_, index) => index !== details.index))
      }
    },
    filterFn (val, update) {
      update(() => {
        if (val === '') {
          this.filterOptions = this.userOptions
        } else {
          const needle = val.toLowerCase()
          this.filterOptions = this.userOptions.filter(
            u => u.name.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    }
  }
}
</script>

<style>

</style>
