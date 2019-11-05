<template>
  <q-dialog v-model="openModal" persistent>
    <q-card v-if="openModal" class="dialog-md-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium">{{!isEditing ? 'Create' : 'Update'}} person</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-input
          label="Name"
          v-model="name"
          dense
          autofocus
          @input="delayTouch($v.name, $options.touchMap)"
          :error="$v.name.$error"
          :hide-bottom-space="!$v.name.$error"
        />
        <company-select
          v-model="companyId"
          :error="$v.companyId.$error"
          :hide-bottom-space="!$v.companyId.$error"
        />
        <q-input
          label="Position"
          v-model="position"
          dense
          @input="delayTouch($v.position, $options.touchMap)"
          :error="$v.position.$error"
          :hide-bottom-space="!$v.position.$error"
        />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div>Phone numbers</div>
        <div
          class="row q-pl-md items-center q-gutter-x-md"
          v-for="(phoneNumber, index) in phoneNumbers"
          :key="`phone${index}`"
        >
          <addable-select
            class="col-4"
            v-model="phoneNumber.type"
            :options="generalSettings.phoneTypes"
            option-label="text"
            option-value="id"
            dense
            entityName="Phone Type"
            :add-func="addPhoneType"
          />
          <q-input class="col-6" v-model="phoneNumber.text" dense :hide-bottom-space="true" />
          <q-btn round flat dense icon="clear" @click="removePhone(index)" />
        </div>
        <q-btn
          class="q-mt-md"
          color="primary"
          flat
          dense
          size="sm"
          label="+Add one more"
          @click="addMorePhone"
        />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div>Emails</div>
        <div
          class="row q-pl-md items-center q-gutter-x-md"
          v-for="(email, index) in emails"
          :key="`email${index}`"
        >
          <addable-select
            class="col-4"
            v-model="email.type"
            :options="generalSettings.emailTypes"
            option-label="text"
            option-value="id"
            dense
            entityName="Email Type"
            :add-func="addEmailType"
          />
          <q-input class="col-6" v-model="email.text" dense :hide-bottom-space="true" />
          <q-btn round flat dense icon="clear" @click="removeEmail(index)" />
        </div>
        <q-btn
          class="q-mt-md"
          color="primary"
          flat
          dense
          size="sm"
          label="+Add one more"
          @click="addMoreEmail"
        />
      </q-card-section>
      <q-separator />
      <q-card-section class="row justify-end q-gutter-x-md">
        <q-btn color="primary" label="Cancel" outline @click="cancel" />
        <q-btn
          color="primary"
          label="Create"
          :loading="loading"
          @click="managePerson('create')"
          v-if="!isEditing"
        />
        <q-btn
          color="primary"
          label="Update"
          :loading="loading"
          @click="managePerson('edit')"
          v-if="isEditing"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import { delayTouch, notifySuccess, notifyFailure } from 'src/utils'
import AddableSelect from 'components/inputs/AddableSelect'
import CompanySelect from 'components/inputs/CompanySelect'

export default {
  name: 'ManagePeopleDialog',
  components: {
    'addable-select': AddableSelect,
    'company-select': CompanySelect
  },
  touchMap: new WeakMap(),
  computed: {
    ...mapGetters({
      personSettings: 'settings/person',
      generalSettings: 'settings/general'
    })
  },
  data () {
    return {
      openModal: false,
      name: '',
      companyId: '',
      position: '',
      phoneNumbers: [],
      emails: [],
      isEditing: false,
      loading: false,
      contact: null,
      callback: null
    }
  },
  validations: {
    name: { required },
    companyId: { required },
    position: { required }
  },
  methods: {
    open (contact, callback) {
      this.reset(contact)
      this.openModal = true
      this.callback = callback
    },
    cancel () {
      this.reset()
      this.openModal = false
    },
    addPhoneType (value) {
      return this.$firebase.setting.general.phoneType.create({ text: value })
    },
    addEmailType (value) {
      return this.$firebase.setting.general.emailType.create({ text: value })
    },
    addMorePhone () {
      this.phoneNumbers.push({ text: '' })
    },
    addMoreEmail () {
      this.emails.push({ text: '' })
    },
    removePhone (index) {
      this.phoneNumbers.splice(index, 1)
    },
    removeEmail (index) {
      this.emails.splice(index, 1)
    },
    async managePerson (type) {
      this.loading = true
      this.validateForm()

      const { name, companyId, position, phoneNumbers, emails } = this

      try {
        if (type === 'create') {
          const contactId = await this.$firebase.people.create({
            name,
            companyId,
            position,
            phoneNumbers,
            emails
          })

          notifySuccess('The contact is created successfully')
          if (this.callback) {
            this.callback(contactId)
          }
        } else if (type === 'edit') {
          await this.$firebase.people.update({
            ...this.contact,
            name,
            companyId,
            position,
            phoneNumbers,
            emails
          })

          notifySuccess('The contact is update successfully')
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
        this.$v.companyId.$invalid ||
        this.$v.position.$invalid
      ) {
        this.$v.name.$touch()
        this.$v.companyId.$touch()
        this.$v.position.$touch()
        notifyFailure('You have some errors in the form')
        setTimeout(() => {
          this.loading = false
        }, 1000)
        throw new Error('You have some errors in the form')
      }
    },
    reset (contact) {
      const _contact = contact || {
        name: '',
        companyId: '',
        position: '',
        emails: [],
        phoneNumbers: []
      }

      this.name = _contact.name
      this.$v.name.$reset()
      this.companyId = _contact.companyId
      this.$v.companyId.$reset()
      this.position = _contact.position
      this.$v.position.$reset()

      this.emails = _contact.emails
      this.phoneNumbers = _contact.phoneNumbers

      this.isEditing = Boolean(_contact.id)
      this.contact = contact
    },
    delayTouch
  }
}
</script>

<style>
</style>
