<template>
  <q-dialog v-model="openModal" persistent>
    <q-card v-if="openModal" class="dialog-md-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium">{{title}}</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <custom-field-input
          v-model="customField"
          @change="delayTouch($v.customField[$event], $options.touchMap)"
          :error="hasError"
          :error-message="errorMessage"
        />
      </q-card-section>
      <q-card-section class="row justify-end q-gutter-x-md">
        <q-btn
          color="primary"
          :label="customField.id ? 'Update' : 'Create'"
          :loading="loading"
          @click="apply('manage')"
        />
        <q-btn
          color="negative"
          label="Delete"
          outline
          @click="confirmDelete"
          v-if="isEditing && $permissionResolver.hasPermission('delete', 'dealCustomField')"
        />
        <q-btn flat label="Cancel" @click="cancel" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import CustomFieldInput from '../inputs/CustomFieldInput'
import { mapGetters } from 'vuex'
import { delayTouch, notifyFailure } from 'src/utils'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'ManageCustomFieldDialog',
  props: ['title'],
  touchMap: new WeakMap(),
  components: {
    'custom-field-input': CustomFieldInput
  },
  data () {
    return {
      customField: {
        fieldName: '',
        fieldTypeId: '',
        fieldValue: ''
      },
      orginCustomField: null,
      isEditing: true,
      action: null,
      callback: () => {},
      openModal: false,
      loading: false
    }
  },
  computed: {
    ...mapGetters({
      dealSettings: 'settings/deal'
    }),
    hasError () {
      const $customField = this.$v.customField
      return {
        fieldName: $customField.fieldName.$error,
        fieldTypeId: $customField.fieldTypeId.$error
      }
    },
    errorMessage () {
      const $customField = this.$v.customField
      return {
        fieldName: !$customField.fieldName.required
          ? 'Field name is required'
          : !$customField.fieldName.isUnique
            ? 'The field name was already taken'
            : '',
        fieldTypeId: !$customField.fieldTypeId.required
          ? 'Field type is required'
          : ''
      }
    }
  },
  validations: {
    customField: {
      fieldName: {
        required,
        isUnique (value) {
          if (!value) return true
          const customFields = this.dealSettings.customFields || []
          const customField = customFields.find(cf => cf.fieldName === value)
          if (this.isEditing) {
            return !customField || customField.id === this.orginCustomField.id
          } else {
            return !customField
          }
        }
      },
      fieldTypeId: {
        required
      }
    }
  },
  methods: {
    open (customField, action, callback) {
      this.reset(customField)
      this.action = action
      this.callback = callback
      this.openModal = true
      this.isEditing = Boolean(customField)
    },
    async apply (actionType) {
      this.validate()
      if (this.action) {
        this.loading = true
        try {
          const result = await this.action(this.customField, actionType)
          if (this.callback) {
            this.callback(result)
          }
        } catch (error) {
          if (this.callback) {
            this.callback(null, error)
          }
        }
      } else if (this.callback) {
        this.callback(this.customField)
      }
      this.loading = false
      this.openModal = false
    },
    confirmDelete () {
      this.$q
        .dialog({
          title: 'Confirm',
          message:
            'It will delete data across all deals. Do you really want to delete the custom field?',
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          this.apply('delete')
        })
    },
    cancel () {
      this.openModal = false
    },
    validate () {
      if (this.$v.customField.$invalid) {
        this.$v.customField.$touch()
        notifyFailure('You have some errors in the form')
        throw new Error('You have some errors in the form')
      }
      this.$v.customField.$reset()
    },
    reset (customField) {
      this.$v.$reset()
      this.customField = customField || {
        fieldName: '',
        fieldTypeId: '',
        fieldValue: ''
      }
      this.orginCustomField = this.customField
    },
    delayTouch
  }
}
</script>

<style>
</style>
