<template>
  <q-table
    :data="filteredUsers"
    :columns="columns"
    row-key="id"
    selection="multiple"
    :selected.sync="selected"
    @selection="$emit('user-selected', $event)"
    flat
  >
    <template #body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-checkbox class="q-ml-sm" dense v-model="props.selected" />
        </q-td>
        <q-td key='name' :props="props">
          <div class="editable">
            {{props.row.name}}
            <q-popup-edit
              v-if="tempUsers[props.row.id]"
              v-model="tempUsers[props.row.id].name"
              buttons
              @save="updateUser(props.row.id, 'name')"
            >
              <q-input v-model="tempUsers[props.row.id].name" dense autofocus />
            </q-popup-edit>
            <q-btn icon="edit" rounded flat dense :class="!loading[`${props.row.id}-name`] ? 'edit' : ''" :loading="loading[`${props.row.id}-name`]" />
          </div>
        </q-td>
        <q-td key='email' :props="props">
          <div class="editable">
            {{props.row.email}}
            <q-popup-edit
              v-if="tempUsers[props.row.id]"
              v-model="tempUsers[props.row.id].email"
              buttons
              @save="updateUser(props.row.id, 'email')"
            >
              <q-input v-model="tempUsers[props.row.id].email" dense autofocus />
            </q-popup-edit>
            <q-btn icon="edit" rounded flat dense :class="!loading[`${props.row.id}-email`] ? 'edit' : ''" :loading="loading[`${props.row.id}-email`]" />
          </div>
        </q-td>
        <q-td key='role' :props="props">
          <div class="editable">
            {{props.row.role}}
            <q-popup-edit
              v-if="tempUsers[props.row.id]"
              v-model="tempUsers[props.row.id].roleId"
              buttons
              @save="updateUser(props.row.id, 'roleId')"
            >
              <role-select
                v-model="tempUsers[props.row.id].roleId"
                autofocus
                :hide-bottom-space="true"
              />
            </q-popup-edit>
            <q-btn icon="edit" rounded flat dense :class="!loading[`${props.row.id}-roleId`] ? 'edit' : ''" :loading="loading[`${props.row.id}-roleId`]" />
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import { mapGetters } from 'vuex'
import { get } from 'lodash'
import RoleSelect from '../inputs/RoleSelect'
import { notifySuccess, notifyFailure } from 'src/utils'

export default {
  name: 'UsersTable',
  components: {
    'role-select': RoleSelect
  },
  data () {
    return {
      selected: [],
      columns: [
        { name: 'name', align: 'left', label: 'Name', field: 'name', sortable: true },
        { name: 'email', align: 'center', label: 'Email', field: 'email', sortable: true },
        { name: 'role', align: 'center', label: 'Role', field: 'role', sortable: true }
      ],
      loading: {},
      tempUsers: {}
    }
  },
  computed: {
    ...mapGetters({
      users: 'users/list',
      userRoles: 'settings/userRoles',
      security: 'settings/security'
    }),
    filteredUsers () {
      return this.filterUsers(this.users)
    }
  },
  mounted () {
    this.setEditableUsers(this.users)
  },
  watch: {
    users: function (value) {
      this.setEditableUsers(value)
    },
    security: function () {
      this.setEditableUsers(this.users)
    }
  },
  methods: {
    filterUsers (users) {
      return users
        .filter(u => this.$permissionResolver.canViewUser(u))
        .map(u => ({
          ...u,
          role: get(this.userRoles.find(ur => ur.id === u.roleId), 'text', 'N/A')
        }))
    },
    setEditableUsers (users) {
      const tempUsers = {}
      this.filterUsers(users).forEach(user => { tempUsers[user.id] = { ...user } })
      this.tempUsers = tempUsers
    },
    async updateUser (userId, field) {
      this.$set(this.loading, `${userId}-${field}`, true)
      try {
        await this.$firebase.cfApi('user')({
          ...this.tempUsers[userId],
          action: 'update'
        })
        notifySuccess('The user is updated successfully')
      } catch (error) {
        notifyFailure(error.message)
      }
      this.$set(this.loading, `${userId}-${field}`, false)
    }
  }
}
</script>

<style>

</style>
