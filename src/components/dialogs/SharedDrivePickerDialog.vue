<template>
  <q-dialog v-model="openModal" persistent>
    <q-card v-if="openModal" class="dialog-md-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium">Select a team drive</div>
      </q-card-section>
      <q-separator />
      <q-card-section class="row q-col-gutter-sm" v-if="!loading && drives.length > 0">
        <div class="col-4" v-for="(drive, index) in drives" :key="index">
          <q-card
            v-ripple
            :class="[selected === index && 'selected', 'cursor-pointer drive']"
            @click="selected=index"
          >
            <q-card-section class="text-center">{{drive.name}}</q-card-section>
          </q-card>
        </div>
      </q-card-section>
      <q-card-section class="row justify-center items-center" v-else-if="loading">
        <q-spinner />
      </q-card-section>
      <q-card-section class="text-center" v-else>No drives available</q-card-section>
      <q-separator />
      <q-card-section class="row justify-end q-gutter-x-md">
        <q-btn color="primary" label="Cancel" outline @click="cancel" />
        <q-btn color="primary" label="Select" :loading="saving" @click="select" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { notifySuccess, notifyFailure } from 'src/utils'

export default {
  name: 'SharedDrivePickerDialog',
  data () {
    return {
      openModal: false,
      drives: [],
      selected: 0,
      loading: false,
      saving: false
    }
  },
  methods: {
    async open () {
      this.openModal = true
      this.loading = true
      const response = await this.$gDrive.getSharedDrives()
      this.drives = response.result.drives
      this.loading = false
    },
    async select () {
      const drive = this.drives[this.selected]
      this.saving = true
      try {
        await this.$firebase.cfApi('googleDrive')({
          drive,
          action: 'setOrgDrive'
        })
        notifySuccess(
          'The shared drive is selected as a root drive for the organization usage'
        )
      } catch (error) {
        notifyFailure(error.message)
      }
      this.saving = false
      this.openModal = false
    },
    cancel () {
      this.openModal = false
    }
  }
}
</script>

<style lang='stylus'>
.drive:hover {
  opacity: 0.5;
}

.selected {
  border: 1px solid $primary;
}
</style>
