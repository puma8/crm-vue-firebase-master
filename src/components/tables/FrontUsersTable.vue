<template>
  <q-table
    :data="enhancedFrontUsers"
    :columns="columns"
    row-key="id"
    flat
  >
    <template #body="props">
      <q-tr :props="props">
        <q-td key='crmName' :props="props">
          <div>{{props.row.crmName}}</div>
        </q-td>
        <q-td key='name' :props="props">
          <div>{{props.row.firstName}} {{props.row.lastName}}</div>
        </q-td>
        <q-td key='email' :props="props">
          <div>{{props.row.email}}</div>
        </q-td>
        <q-td key='username' :props="props">
          <div>{{props.row.username}}</div>
        </q-td>
        <q-td key='action' :props="props">
          <q-btn
            :icon="linkedUser(props.row) ? 'link_off' : 'link'"
            flat
            dense
            @click="takeAction(props.row)"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'FrontUsersTable',
  data () {
    return {
      columns: [
        { name: 'crmName', align: 'left', label: 'CRM User', field: 'crmName', sortable: true },
        { name: 'name', align: 'left', label: 'Front User', field: 'name', sortable: true },
        { name: 'email', align: 'center', label: 'Front Email', field: 'email', sortable: true },
        { name: 'username', align: 'center', label: 'Front Username', field: 'username', sortable: true },
        { name: 'action', align: 'right', label: '', field: 'action', sortable: false }
      ]
    }
  },
  computed: {
    ...mapGetters({
      users: 'users/list',
      frontUsers: 'users/frontUsers'
    }),
    enhancedFrontUsers () {
      return this.frontUsers.map(frontUser => {
        const linkedUser = this.linkedUser(frontUser)
        return {
          ...frontUser,
          crmName: linkedUser ? linkedUser.name : ''
        }
      })
    }
  },
  methods: {
    linkedUser (frontUser) {
      return this.users.find(user => user.meta && user.meta.frontUserId === frontUser.id)
    },
    takeAction (frontUser) {
      const linkedUser = this.linkedUser(frontUser)
      this.$emit('manageUser', frontUser, Boolean(linkedUser), linkedUser)
    }
  }
}
</script>

<style>

</style>
