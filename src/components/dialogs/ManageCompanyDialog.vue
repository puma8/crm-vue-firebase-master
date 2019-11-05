<template>
  <q-dialog v-model="openModal" persistent>
    <q-card v-if="openModal" class="dialog-md-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium">Create company</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-input
          label="Company name"
          v-model="name"
          dense
          autofocus
          @input="delayTouch($v.name, $options.touchMap)"
          :error="$v.name.$error"
          :hide-bottom-space="!$v.name.$error"
        />
        <q-input
          label="Website"
          v-model="website"
          dense
          @input="delayTouch($v.website, $options.touchMap)"
          :error="$v.website.$error"
          :hide-bottom-space="!$v.website.$error"
        />
        <q-input label="Address" v-model="address" dense :hide-bottom-space="true" />
        <addable-select
          v-model="designationId"
          :options="personSettings.designations"
          option-label="text"
          option-value="id"
          label="Designation"
          dense
          :add-func="addDesignation"
          @input="selectDesignation"
          :error="$v.designationId.$error"
          :hide-bottom-space="!$v.designationId.$error"
        />
        <addable-select
          v-model="roleId"
          :options="roleOptions"
          option-label="text"
          option-value="id"
          label="Role"
          dense
          :add-func="addRole"
          @input="selectRole"
          :disable-add="!designationId"
          :error="$v.roleId.$error"
          :hide-bottom-space="!$v.roleId.$error"
        />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div>Phone numbers</div>
        <phone-numbers-input v-model="phoneNumbers" />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div>Emails</div>
        <emails-input v-model="emails" />
      </q-card-section>
      <q-separator />
      <q-card-section class="row justify-end q-gutter-x-md">
        <q-btn color="primary" label="Cancel" outline @click="cancel" />
        <q-btn
          color="primary"
          label="Create"
          :loading="loading"
          @click="manageCompany('create')"
          v-if="!isEditing"
        />
        <q-btn
          color="primary"
          label="Update"
          :loading="loading"
          @click="manageCompany('edit')"
          v-if="isEditing"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { required, url } from 'vuelidate/lib/validators'
import { delayTouch, notifySuccess, notifyFailure } from 'src/utils'
import AddableSelect from '../inputs/AddableSelect'
import PhoneNumbersInput from '../inputs/PhoneNumbersInput'
import EmailsInput from '../inputs/EmailsInput'

export default {
  name: 'ManagePeopleDialog',
  components: {
    'addable-select': AddableSelect,
    'phone-numbers-input': PhoneNumbersInput,
    'emails-input': EmailsInput
  },
  touchMap: new WeakMap(),
  computed: {
    ...mapGetters({
      personSettings: 'settings/person',
      generalSettings: 'settings/general'
    }),
    roleOptions () {
      return (this.personSettings.roles || []).filter(
        role => this.designationId === role.designationId
      )
    }
  },
  data () {
    return {
      openModal: false,
      name: '',
      website: '',
      address: '',
      designationId: '',
      roleId: '',
      cachedRoleId: {},
      phoneNumbers: [],
      emails: [],
      isEditing: false,
      loading: false,
      company: null,
      callback: null
    }
  },
  validations: {
    name: { required },
    designationId: { required },
    roleId: { required },
    website: {
      isUrl (value) {
        if (value === '') return true
        if (value.startsWith('https://') || value.startsWith('http://')) {
          return url(value)
        } else {
          return url(`http://${value}`)
        }
      }
    }
  },
  methods: {
    open (company, callback) {
      this.reset(company)
      this.openModal = true
      this.callback = callback
    },
    cancel () {
      this.openModal = false
    },
    selectDesignation () {
      this.roleId = this.cachedRoleId[this.designationId] || ''
      this.cachedRoleId[this.designationId] = this.roleId
    },
    selectRole () {
      this.cachedRoleId[this.designationId] = this.roleId
    },
    addDesignation (value) {
      return this.$firebase.setting.person.designation.create({ text: value })
    },
    addRole (value) {
      return this.$firebase.setting.person.role.create({
        designationId: this.designationId,
        text: value
      })
    },
    async manageCompany (type) {
      this.loading = true
      this.validateForm()

      const {
        name,
        website,
        address,
        designationId,
        roleId,
        phoneNumbers,
        emails
      } = this

      try {
        if (type === 'create') {
          const companyId = await this.$firebase.company.create({
            name,
            website,
            address,
            designationId,
            roleId,
            phoneNumbers,
            emails
          })
          notifySuccess('The company is created successfully')
          if (this.callback) {
            this.callback(companyId)
          }
        } else if (type === 'edit') {
          await this.$firebase.company.update({
            ...this.company,
            name,
            website,
            address,
            designationId,
            roleId,
            phoneNumbers,
            emails
          })
          notifySuccess('The company is updated successfully')
        }
        this.openModal = false
      } catch (error) {
        notifyFailure(error.message)
      }
      this.loading = false
    },
    validateForm () {
      if (
        this.$v.name.$invalid ||
        this.$v.website.$invalid ||
        this.$v.designationId.$invalid ||
        this.$v.roleId.$invalid
      ) {
        this.$v.name.$touch()
        this.$v.website.$touch()
        this.$v.designationId.$touch()
        this.$v.roleId.$touch()
        notifyFailure('You have some errors in the form')
        setTimeout(() => {
          this.loading = false
        }, 1000)
        throw new Error('You have some errors in the form')
      }
    },
    reset (company) {
      const _company = company || {
        name: '',
        website: '',
        address: '',
        designationId: '',
        roleId: '',
        phoneNumbers: [],
        emails: []
      }

      this.name = _company.name
      this.$v.name.$reset()
      this.website = _company.website
      this.$v.website.$reset()
      this.designationId = _company.designationId
      this.$v.designationId.$reset()
      this.roleId = _company.roleId
      this.$v.roleId.$reset()
      this.cachedRoleId[this.designationId] = this.roleId

      this.address = _company.address
      this.emails = _company.emails
      this.phoneNumbers = _company.phoneNumbers

      this.isEditing = Boolean(_company.id)
      this.company = company
    },
    delayTouch
  }
}
</script>

<style>
</style>
