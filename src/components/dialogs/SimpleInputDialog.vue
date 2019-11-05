<template>
  <q-dialog v-model="openModal">
    <q-card v-if="openModal" class="dialog-sm-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium">{{title}}</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-input
          :label="label"
          v-model="text"
          dense
          autofocus
          :error="$v.text.$error"
          :hide-bottom-space="!$v.text.$error"
        />
      </q-card-section>
      <q-card-section class="row justify-end">
        <q-btn color="primary" label="Set" :loading="loading" @click="set" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'SimpleInputDialog',
  data () {
    return {
      openModal: false,
      text: '',
      title: '',
      label: '',
      loading: false,
      action: null,
      callback: () => {}
    }
  },
  validations: {
    text: { required }
  },
  methods: {
    open (info = {}, action, callback) {
      this.reset(info)
      this.action = action
      this.callback = callback
      this.openModal = true
    },
    set () {
      this.validate()

      if (this.action) {
        this.loading = true
        this.action(this.text)
          .then(result => {
            this.loading = false
            this.openModal = false
            this.callback(result)
          })
          .catch(error => {
            this.loading = false
            this.callback(null, error)
          })
      } else {
        this.openModal = false
        this.callback(this.text)
      }
    },
    validate () {
      if (this.$v.text.$invalid) {
        this.$v.text.$touch()
        throw new Error('You have an error in the form')
      }
    },
    reset (info = {}) {
      this.title = info.title || ''
      this.label = info.label || ''
      this.text = info.initialValue || ''
      this.$v.text.$reset()
    }
  }
}
</script>

<style>
</style>
