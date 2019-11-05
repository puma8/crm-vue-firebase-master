<template>
  <q-scroll-area class="full-height primary-bg-color">
    <padded-container>
      <template #header-title>
        <div class="text-h6 text-weight-bold">Team</div>
      </template>
      <template #content>
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <q-input class="flex-1" label="Team Name" v-model="teamName" @blur="updateTeam" />
              <q-spinner v-if="loading.orgName" />
            </div>
          </q-card-section>
        </q-card>
      </template>
    </padded-container>
    <padded-container>
      <template #header-title>
        <div class="text-h6 text-weight-bold">Users</div>
      </template>
      <template #header-actions>
        <div class="q-gutter-x-sm">
          <q-btn
            color="primary self-center"
            label="Delete User(s)"
            @click="confirmDelete"
            v-if="selectedUsers.length > 0"
            :loading="loading.deleting"
          />
          <q-btn
            color="primary self-center"
            label="Edit User"
            @click="editUser"
            v-if="selectedUsers.length === 1"
          />
          <q-btn
            color="primary self-center"
            label="Add User"
            @click="addUser"
          />
        </div>
      </template>
      <template #content>
        <q-card>
          <q-card-section class="q-pa-none">
            <users-table @user-selected="selectUser" />
          </q-card-section>
        </q-card>
        <manage-user-dialog ref="ManageUserDialog" />
      </template>
    </padded-container>
    <padded-container v-if="$permissionResolver.isOwner()">
      <template #header-title>
        <div class="text-h6 text-weight-bold">Slack Users</div>
      </template>
      <template #content>
        <q-card>
          <q-card-section class="q-pa-none">
            <slack-users-table @manageUser="(slackUser, isLinked, linkedUser) => manageExternalUser('slack', slackUser, isLinked, linkedUser)" />
          </q-card-section>
        </q-card>
      </template>
    </padded-container>
    <padded-container v-if="$permissionResolver.isOwner()">
      <template #header-title>
        <div class="text-h6 text-weight-bold">Front Users</div>
      </template>
      <template #content>
        <q-card>
          <q-card-section class="q-pa-none">
            <front-users-table @manageUser="(frontUser, isLinked, linkedUser) => manageExternalUser('front', frontUser, isLinked, linkedUser)" />
          </q-card-section>
        </q-card>
      </template>
    </padded-container>
    <link-external-user-dialog ref="LinkExternalUserDialog" />
  </q-scroll-area>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PaddedContainer from 'components/layouts/PaddedContainer'
import UsersTable from 'components/tables/UsersTable'
import SlackUsersTable from 'components/tables/SlackUsersTable'
import FrontUsersTable from 'components/tables/FrontUsersTable'
import ManageUserDialog from 'components/dialogs/ManageUserDialog'
import LinkExternalUserDialog from 'components/dialogs/LinkExternalUserDialog'
import { notifySuccess, notifyFailure } from 'src/utils'

export default {
  name: 'Users',
  components: {
    'padded-container': PaddedContainer,
    'users-table': UsersTable,
    'slack-users-table': SlackUsersTable,
    'front-users-table': FrontUsersTable,
    'manage-user-dialog': ManageUserDialog,
    'link-external-user-dialog': LinkExternalUserDialog
  },
  data () {
    return {
      selectedUsers: [],
      loading: {},
      teamName: ''
    }
  },
  computed: {
    ...mapGetters({
      orgData: 'organization/data',
      userById: 'users/userById'
    })
  },
  created () {
    this.teamName = this.orgData.name
    this.$firebase.cfApi('slack')({ action: 'getUsers' }).then(response => {
      const slackUsers = response.data
      this.setSlackUsers(slackUsers)
    })
    this.$firebase.cfApi('frontapp')({ action: 'getUsers' }).then(response => {
      const frontUsers = response.data
      this.setFrontUsers(frontUsers)
    })
  },
  watch: {
    orgData: function (val) {
      this.teamName = val.name
    }
  },
  methods: {
    ...mapActions({
      setSlackUsers: 'users/setSlackUsers',
      setFrontUsers: 'users/setFrontUsers'
    }),
    editUser () {
      this.$refs.ManageUserDialog.open(this.selectedUsers[0])
    },
    addUser () {
      this.$refs.ManageUserDialog.open()
    },
    manageExternalUser (externalType, externalUser, isLinked, linkedUser) {
      if (!isLinked) {
        this.$refs.LinkExternalUserDialog.open(externalType, externalUser, async selectedUserId => {
          try {
            await this.$firebase.cfApi('user')({
              id: selectedUserId,
              externalType,
              externalUserId: externalUser.id,
              action: 'link'
            })
            notifySuccess('The linking is successful')
          } catch (error) {
            notifyFailure(error.message)
          }
        }, actionCode => {
          if (actionCode === 'linkWithNewUser') {
            this.$refs.ManageUserDialog.open(null, {
              name: externalUser.name,
              email: externalUser.email,
              meta: {
                [`${externalType}UserId`]: externalUser.id
              }
            })
          }
        })
      } else {
        this.$q.dialog({
          title: 'Confirm',
          message: 'Do you really want to unlink the user?',
          cancel: true,
          persistent: true
        }).onOk(async () => {
          try {
            await this.$firebase.cfApi('user')({
              id: linkedUser.id,
              externalType,
              action: 'unlink'
            })
            notifySuccess('The un-linking is successful')
          } catch (error) {
            notifyFailure(error.message)
          }
        })
      }
    },
    async updateTeam (event) {
      const newTeamName = event.target.value

      if (!newTeamName) {
        this.teamName = this.orgData.name
        return
      }

      this.$set(this.loading, 'orgName', true)
      await this.$firebase.organization.update({ name: newTeamName })
      this.$set(this.loading, 'orgName', false)
    },
    selectUser (selection) {
      if (selection.added) {
        this.selectedUsers = this.selectedUsers.concat(selection.keys)
      } else {
        this.selectedUsers = this.selectedUsers.filter(id => selection.keys.indexOf(id) === -1)
      }
    },
    confirmDelete () {
      this.$q.dialog({
        title: 'Confirm',
        message: 'Do you really want to delete the user(s)?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.$set(this.loading, 'deleting', true)
        this.deleting = true
        this.$firebase.cfApi('user')({
          users: this.selectedUsers,
          action: 'delete'
        })
          .then(result => {
            this.$set(this.loading, 'deleting', false)
            notifySuccess('The user is deleted successfully.')
            this.selectedUsers = []
          })
          .catch(error => {
            notifyFailure(error.message)
            this.$set(this.loading, 'deleting', false)
            throw new Error(error.message)
          })
      })
    }
  }
}
</script>
