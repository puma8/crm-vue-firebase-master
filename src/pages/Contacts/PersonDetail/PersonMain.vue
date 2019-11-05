<template>
  <div>
    <div class="row q-gutter-y-md">
      <div class="col-12 row items-start">
        <div class="q-gutter-y-md col-11">
          <div class="row items-center">
            <div class="col-5">Designation</div>
            <div class="col-7">{{enhancedPerson.designation}}</div>
          </div>
          <div class="row items-center">
            <div class="col-5">Role</div>
            <div class="col-7">{{enhancedPerson.role}}</div>
          </div>
        </div>
        <div class="col-1" />
      </div>
      <div class="col-12 row items-center editable">
        <div class="col-11 row">
          <div class="col-5">Position</div>
          <div class="col-7">{{person.position}}</div>
        </div>
        <div class="col-1">
          <q-btn icon="edit" rounded flat dense :class="!loading.position ? 'edit' : ''" :loading="loading.position" />
        </div>
        <q-popup-edit v-model="newPosition" buttons @save="updatePosition">
          <q-input v-model="newPosition" dense />
        </q-popup-edit>
      </div>
    </div>
    <q-separator />
    <div class="q-py-sm text-subtitle1 text-weight-medium">Phone numbers</div>
    <div class="col-12 row editable items-start q-mb-md">
      <div class="q-gutter-y-md col-11" v-if="hasPhoneNumber">
        <div class="row items-center" v-for="(phoneNumber, index) in person.phoneNumbers" :key="`phone${index}`">
          <span class="col-5">{{phoneTypeById(phoneNumber.type).text || 'N/A'}}</span>
          <span class="col-7">{{phoneNumber.text}}</span>
        </div>
      </div>
      <div class="col-11" v-else>
        No phone numbers
      </div>
      <div class="col-1">
        <q-btn v-if="hasPhoneNumber" icon="edit" rounded flat dense :class="!loading.phoneNumbers ? 'edit' : ''" :loading="loading.phoneNumbers" />
        <q-btn v-else icon="add_circle_outline" rounded flat dense />
      </div>
      <q-popup-edit v-model="newPhones" buttons @save="updatePhone">
        <phone-numbers-input v-model="newPhones" />
      </q-popup-edit>
    </div>
    <q-separator />
    <div class="q-py-sm text-subtitle1 text-weight-medium">Emails</div>
    <div class="col-12 row editable items-start q-mb-md">
      <div class="q-gutter-y-md col-11" v-if="hasEmail">
        <div class="row items-center" v-for="(email, index) in person.emails" :key="`email${index}`">
          <span class="col-5">{{emailTypeById(email.type).text || 'N/A'}}</span>
          <span class="col-7">{{email.text}}</span>
        </div>
      </div>
      <div class="col-11" v-else>
        No emails
      </div>
      <div class="col-1">
        <q-btn v-if="hasEmail" icon="edit" rounded flat dense :class="!loading.emails ? 'edit' : ''" :loading="loading.emails" />
        <q-btn v-else icon="add_circle_outline" rounded flat dense />
      </div>
      <q-popup-edit v-model="newEmails" buttons @save="updateEmail">
        <emails-input v-model="newEmails" />
      </q-popup-edit>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { notifySuccess, notifyFailure } from 'src/utils'
import PhoneNumbersInput from 'components/inputs/PhoneNumbersInput'
import EmailsInput from 'components/inputs/EmailsInput'

export default {
  name: 'PersonMain',
  components: {
    'phone-numbers-input': PhoneNumbersInput,
    'emails-input': EmailsInput
  },
  data () {
    return {
      newPosition: '',
      newPhones: [],
      newEmails: [],
      loading: {}
    }
  },
  computed: {
    ...mapGetters({
      personById: 'people/personById',
      companyById: 'companies/companyById',
      designationById: 'settings/designationById',
      roleById: 'settings/roleById',
      emailTypeById: 'settings/emailTypeById',
      phoneTypeById: 'settings/phoneTypeById'
    }),
    person () {
      return this.personById(this.$route.params.id)
    },
    enhancedPerson () {
      const person = this.personById(this.$route.params.id)
      const company = this.companyById(person.companyId)

      return {
        ...person,
        designation: this.designationById(company.designationId).text || 'N/A',
        role: this.roleById(company.roleId).text || 'N/A'
      }
    },
    hasPhoneNumber () {
      return (this.person.phoneNumbers || []).length > 0
    },
    hasEmail () {
      return (this.person.emails || []).length > 0
    }
  },
  watch: {
    person: function (val, oldVal) {
      this.initData(val)
    }
  },
  created () {
    this.initData(this.person)
  },
  methods: {
    initData (val) {
      this.newPosition = val.position
      this.newPhones = []
      this.newEmails = []
      const phones = val.phoneNumbers || []
      const emails = val.emails || []
      phones.forEach(ph => this.newPhones.push({ ...ph }))
      emails.forEach(ph => this.newEmails.push({ ...ph }))
      if (this.newPhones.length === 0) {
        this.newPhones = [{ type: '', text: '' }]
      }
      if (this.newEmails.length === 0) {
        this.newEmails = [{ type: '', text: '' }]
      }
    },
    updatePosition (value) {
      this.updatePerson({ ...this.person, position: value }, 'position')
    },
    updatePhone () {
      this.updatePerson({ ...this.person, phoneNumbers: this.newPhones }, 'phoneNumbers')
    },
    updateEmail (updatedIndex) {
      this.updatePerson({ ...this.person, emails: this.newEmails }, 'emails')
    },
    updatePerson (updatedPerson, field) {
      this.$set(this.loading, field, true)
      this.$firebase.people.update(updatedPerson)
        .then(() => {
          this.$set(this.loading, field, false)
          notifySuccess('The person is updated successfully')
        })
        .catch(error => {
          this.$set(this.loading, field, false)
          notifyFailure(error.message)
        })
    }
  }
}
</script>

<style>
</style>
