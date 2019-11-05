<template>
  <div>
    <div class="row q-gutter-y-md">
      <div class="col-12 row items-center editable">
        <div class="col-11 row">
          <div class="col-5">Website</div>
          <div class="col-7">
            {{company.website}}
          </div>
        </div>
        <div class="col-1">
          <q-btn icon="edit" rounded flat dense :class="!loading.website ? 'edit' : ''" :loading="loading.website" />
        </div>
        <q-popup-edit v-model="newWebsite" buttons @save="updateWebsite">
          <q-input v-model="newWebsite" dense autofocus />
        </q-popup-edit>
      </div>
      <div class="col-12 row items-center editable">
        <div class="col-11 row">
          <div class="col-5">Address</div>
          <div class="col-7 wrapped-text">
            {{company.address}}
          </div>
        </div>
        <div class="col-1">
          <q-btn icon="edit" rounded flat dense :class="!loading.address ? 'edit' : ''" :loading="loading.address" />
        </div>
        <q-popup-edit v-model="newAddress" buttons @save="updateAddress">
          <q-input v-model="newAddress" dense autofocus />
        </q-popup-edit>
      </div>
      <div class="col-12 row editable items-start">
        <div class="q-gutter-y-md col-11">
          <div class="row items-center">
            <div class="col-5">Designation</div>
            <div class="col-7">{{designationById(company.designationId).text || 'N/A'}}</div>
          </div>
          <div class="row items-center">
            <div class="col-5">Role</div>
            <div class="col-7">{{roleById(company.roleId).text || 'N/A'}}</div>
          </div>
        </div>
        <div class="col-1">
          <q-btn icon="edit" rounded flat dense :class="!loading.designationAndRole ? 'edit' : ''" :loading="loading.designationAndRole" />
        </div>
        <q-popup-edit v-model="newDesignationAndRole" buttons @save="updateDesignationAndRole">
          <addable-select
            v-model="newDesignationAndRole.designationId"
            :options="personSettings.designations"
            option-label="text"
            option-value="id"
            label="Designation"
            dense
            :add-func="addDesignation"
          />
          <addable-select
            v-model="newDesignationAndRole.roleId"
            :options="roleOptions"
            option-label="text"
            option-value="id"
            label="Role"
            dense
            :add-func="addRole"
            :disable-add="!newDesignationAndRole.designationId"
          />
        </q-popup-edit>
      </div>
    </div>
    <q-separator spaced class="col-12" />
    <div class="q-py-sm text-subtitle1 text-weight-medium">Phone numbers</div>
    <div class="col-12 row editable items-start q-mb-md">
      <div class="q-gutter-y-md col-11" v-if="hasPhoneNumber">
        <div class="row items-center" v-for="(phoneNumber, index) in company.phoneNumbers" :key="`phone${index}`">
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
        <div class="row items-center" v-for="(email, index) in company.emails" :key="`email${index}`">
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
    <q-separator />
    <div v-for="person in companyPeople" :key="person.id">
      <div class="row q-gutter-x-md items-center q-py-md">
        <q-icon name="account_box" size="24px" />
        <span>{{person.name}}</span>
      </div>
      <q-separator />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { notifySuccess, notifyFailure } from 'src/utils'
import AddableSelect from 'components/inputs/AddableSelect'
import PhoneNumbersInput from 'components/inputs/PhoneNumbersInput'
import EmailsInput from 'components/inputs/EmailsInput'

export default {
  name: 'CompanyMain',
  components: {
    'addable-select': AddableSelect,
    'phone-numbers-input': PhoneNumbersInput,
    'emails-input': EmailsInput
  },
  data () {
    return {
      newWebsite: '',
      newAddress: '',
      newDesignationAndRole: {},
      newPhones: [],
      newEmails: [],
      loading: {}
    }
  },
  computed: {
    ...mapGetters({
      companyById: 'companies/companyById',
      designationById: 'settings/designationById',
      roleById: 'settings/roleById',
      emailTypeById: 'settings/emailTypeById',
      phoneTypeById: 'settings/phoneTypeById',
      personSettings: 'settings/person',
      people: 'people/list'
    }),
    company () {
      return this.companyById(this.$route.params.id)
    },
    roleOptions () {
      return (this.personSettings.roles || []).filter(role => this.newDesignationAndRole.designationId === role.designationId)
    },
    companyPeople () {
      return this.people.filter(person => person.companyId === this.$route.params.id)
    },
    hasPhoneNumber () {
      return (this.company.phoneNumbers || []).length > 0
    },
    hasEmail () {
      return (this.company.emails || []).length > 0
    }
  },
  watch: {
    company: function (val) {
      this.setData(val)
    },
    'newDesignationAndRole.designationId': function (val) {
      this.$set(this.newDesignationAndRole, 'roleId', this.newDesignationAndRole.history[val])
    },
    'newDesignationAndRole.roleId': function (val) {
      this.newDesignationAndRole.history[this.newDesignationAndRole.designationId] = val
    }
  },
  created () {
    this.setData(this.company)
  },
  methods: {
    setData (val) {
      this.newWebsite = val.website
      this.newAddress = val.address
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
      this.$set(this, 'newDesignationAndRole', {
        designationId: val.designationId,
        history: {
          [val.designationId]: val.roleId
        }
      })
    },
    updateWebsite (value) {
      this.updateCompany({ ...this.company, website: value }, 'website')
    },
    updateAddress (value) {
      this.updateCompany({ ...this.company, address: value }, 'address')
    },
    addDesignation (value) {
      return this.$firebase.setting.person.designation.create({ text: value })
    },
    addRole (value) {
      return this.$firebase.setting.person.role.create({
        designationId: this.newDesignationAndRole.designationId,
        text: value
      })
    },
    updateDesignationAndRole (value) {
      this.updateCompany({ ...this.company, ...value }, 'designationAndRole')
    },
    updatePhone () {
      this.updateCompany({ ...this.company, phoneNumbers: this.newPhones }, 'phoneNumbers')
    },
    updateEmail (updatedIndex) {
      this.updateCompany({ ...this.company, emails: this.newEmails }, 'emails')
    },
    updateCompany (updatedCompany, field) {
      this.$set(this.loading, field, true)
      this.$firebase.company.update(updatedCompany)
        .then(() => {
          this.$set(this.loading, field, false)
          notifySuccess('The company is updated successfully')
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
