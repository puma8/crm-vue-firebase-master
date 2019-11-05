<template>
  <q-card>
    <q-card-section class="row">
      <img src="~assets/google.svg" class="q-ma-lg" style="width:10vw;max-width:272px;" />
      <div class="column justify-center q-gutter-y-md">
        <div>
          <q-btn
            color="primary"
            label="Connect now"
            @click="connectGDrive"
            :loading="loading.gdrive"
            :disable="!!gDriveIntegration.idToken"
          />
        </div>
        <div
          v-if="!gDriveIntegration.idToken"
        >Your account is currently not connected to any Google accounts</div>
      </div>
    </q-card-section>
    <q-card-section v-if="gDriveIntegration.idToken" class="row items-center q-gutter-x-lg">
      <div class="q-pl-lg">
        <img src="~assets/g-drive.svg" style="width:2vw;" />
      </div>
      <div class="flex-1">
        <div>Google Drive {{gDriveIntegration.email}}</div>
        <q-separator />
        <div>{{gDriveIntegration.email}} added {{gDriveIntegration.createdAt | stringifyDate}}</div>
      </div>
      <!-- <div class="q-gutter-x-md">
        <q-btn color="primary" label="Reconnect" />
        <q-btn color="primary" label="Disconnect" />
      </div>-->
    </q-card-section>
    <shared-drive-picker-dialog ref="SharedDrivePickerDialog" />
  </q-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { notifySuccess, notifyFailure } from 'src/utils'
import { stringifyDate } from 'src/utils/filters'
import SharedDrivePickerDialog from '../dialogs/SharedDrivePickerDialog'

export default {
  name: 'GoogleDriveIntegration',
  components: {
    'shared-drive-picker-dialog': SharedDrivePickerDialog
  },
  data () {
    return {
      loading: {},
      needToPickSharedDrive: false
    }
  },
  computed: {
    ...mapGetters({
      gDriveIntegration: 'integration/gDrive',
      currentUser: 'auth/user'
    })
  },
  watch: {
    gDriveIntegration (val) {
      if (val && this.needToPickSharedDrive) {
        if (this.$permissionResolver.hasPermission('create', 'orgGDrive')) {
          try {
            this.$gPicker.show('folder', async data => {
              const folderId = data.docs[0].id
              await this.$firebase.cfApi('googleDrive')({
                folderId,
                action: 'setOrgDrive'
              })
              notifySuccess(
                'The google folder is selected as a root drive for the organization usage'
              )
            })
          } catch (error) {
            alert(error)
          }
        }
        this.needToPickSharedDrive = false
      }
    }
  },
  filters: { stringifyDate },
  methods: {
    async connectGDrive () {
      this.$set(this.loading, 'gdrive', true)
      try {
        const authCode = await this.$gAuth.getAuthCode()

        try {
          this.needToPickSharedDrive = true
          await this.$firebase.cfApi('googleDrive')({
            authCode,
            action: 'connect'
          })
          notifySuccess('You have successfully connected to Google Drive')
        } catch (error) {
          notifyFailure(error.message)
        }
        this.$set(this.loading, 'gdrive', false)
      } catch (error) {
        this.$set(this.loading, 'gdrive', false)
        if (error.error !== 'popup_closed_by_user') {
          notifyFailure(error.error)
        }
      }
    }
  }
}
</script>

<style>
</style>
