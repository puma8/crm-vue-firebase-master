<template>
  <fragment>
    <q-table
      :data="enhancedSlackUsers"
      :columns="columns"
      row-key="id"
      flat
      v-if="organization.slack"
    >
      <template #body="props">
        <q-tr :props="props">
          <q-td key='crmName' :props="props">
            <div>{{props.row.crmName}}</div>
          </q-td>
          <q-td key='name' :props="props">
            <div>{{props.row.name}}</div>
          </q-td>
          <q-td key='email' :props="props">
            <div>{{props.row.email}}</div>
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
    <div v-else>
      <slack-integration flat />
    </div>
  </fragment>
</template>

<script>
import { mapGetters } from 'vuex'
import SlackIntegration from '../widgets/SlackIntegration'

export default {
  name: 'SlackUsersTable',
  components: {
    'slack-integration': SlackIntegration
  },
  data () {
    return {
      columns: [
        { name: 'crmName', align: 'left', label: 'CRM User', field: 'crmName', sortable: true },
        { name: 'name', align: 'left', label: 'Slack User', field: 'name', sortable: true },
        { name: 'email', align: 'center', label: 'Slack Email', field: 'email', sortable: true },
        { name: 'action', align: 'right', label: '', field: 'action', sortable: false }
      ]
    }
  },
  computed: {
    ...mapGetters({
      users: 'users/list',
      slackUsers: 'users/slackUsers',
      organization: 'organization/data'
    }),
    enhancedSlackUsers () {
      return this.slackUsers.map(slackUser => {
        const linkedUser = this.linkedUser(slackUser)
        return {
          ...slackUser,
          crmName: linkedUser ? linkedUser.name : ''
        }
      })
    }
  },
  methods: {
    linkedUser (slackUser) {
      return this.users.find(user => user.meta && user.meta.slackUserId === slackUser.id)
    },
    takeAction (slackUser) {
      const linkedUser = this.linkedUser(slackUser)
      this.$emit('manageUser', slackUser, Boolean(linkedUser), linkedUser)
    }
  }
}
</script>

<style>

</style>
