<template>
  <q-scroll-area class="full-height">
    <div class="row q-gutter-y-md q-px-md q-pb-md">
      <div class="col-12 row items-center editable">
        <div class="col-11 row">
          <div class="col-5">Team lead</div>
          <div class="col-7">{{teamLeadName}}</div>
        </div>
        <div class="col-1">
          <q-btn icon="edit" rounded flat dense :class="!loading.teamLeadId ? 'edit' : ''" :loading="loading.teamLeadId" />
        </div>
        <q-popup-edit v-model="newTeamLeadId" buttons @save="updateTeamLead">
          <members-select v-model="newTeamLeadId" :multiple="false" />
        </q-popup-edit>
      </div>
      <div class="col-12 row items-center editable">
        <div class="col-11 row">
          <div class="col-5">Revenue</div>
          <div class="col-7">{{revenue}}</div>
        </div>
        <div class="col-1">
          <q-btn icon="edit" rounded flat dense :class="!loading.revenue ? 'edit' : ''" :loading="loading.revenue" />
        </div>
        <q-popup-edit v-model="newRevenue" buttons @save="updateRevenue">
          <q-input v-model="newRevenue" dense />
        </q-popup-edit>
      </div>
      <div class="col-12 row">
        <div class="col-11 row items-center">
          <div class="col-5">Members</div>
          <div class="col-7">
            <members-avatar-list-input
              v-model="members"
              :actionFunc="updateMembers"
              :loading="loading.members"
              style="margin-left: -10px"
            />
          </div>
        </div>
        <div class="col-1" />
      </div>
    </div>
    <q-separator v-if="hasCustomFields" />
    <div v-if="hasCustomFields" class="row q-gutter-y-md q-pa-md">
      <div
        class="col-12 row items-center editable"
        v-for="detail in deal.customFields"
        :key="detail.id"
      >
        <div class="col-11 row">
          <div class="col-5">{{customFieldNameById(detail.id)}}</div>
          <custom-field-value class="col-7" :custom-field="detail" />
        </div>
        <div class="col-1">
          <q-btn icon="edit" rounded flat dense class="edit" @click="editDetail(detail)" />
        </div>
      </div>
    </div>
    <div class="primary-bg-color q-pa-md deal-main__add-detail" v-if="$permissionResolver.hasPermission('create', 'dealCustomField')">
      <div class="text-weight-medium q-pb-md">Details</div>
      <div>What else do you know about the deal?</div>
      <q-btn color="primary" flat dense size="sm" label="+Add details" @click="addDetails" />
    </div>
    <div class="row q-gutter-y-md q-pa-md">
      <div class="col-12" v-for="(contactGroup, index) in dealContacts" :key="index">
        <div class="q-mb-xs">
          <span class="text-weight-medium">{{contactGroup.designation}}</span>
          <q-btn
            :icon="peopleVisible[contactGroup.designationId] ? 'arrow_drop_up' : 'arrow_drop_down'"
            dense
            flat
            size="sm"
            @click="$set(peopleVisible, contactGroup.designationId, !peopleVisible[contactGroup.designationId])"
          />
        </div>
        <q-slide-transition>
          <div class="row q-gutter-y-sm q-ml-md" v-show="!peopleVisible[contactGroup.designationId]">
            <div class="col-12 row q-gutter-x-sm" v-for="contact in contactGroup.contacts" :key="contact.id">
              <span>{{contact.name}}</span>
              <q-badge transparent text-color="black">
                <span>{{contact.role}}</span>
              </q-badge>
            </div>
          </div>
        </q-slide-transition>
      </div>
      <div class="full-width q-mt-xs">
        <q-btn color="primary" flat dense size="sm" label="+Add people" :loading="loading.people" />
        <q-popup-edit v-model="newPeople" buttons @save="updatePeople">
          <people-select v-model="newPeople" />
        </q-popup-edit>
      </div>
    </div>
    <manage-custom-field-dialog
      title='Add another detail'
      ref="ManageCustomFieldDialog"
    />
  </q-scroll-area>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'
import MembersAvatarListInput from 'components/inputs/MembersAvatarListInput'
import MembersSelect from 'components/inputs/MembersSelect'
import PeopleSelect from 'components/inputs/PeopleSelect'
import CustomFieldValue from 'components/common/CustomFieldValue'
import ManageCustomFieldDialog from 'components/dialogs/ManageCustomFieldDialog'
import { notifySuccess, notifyFailure } from 'src/utils'

export default {
  name: 'DealMainInfo',
  components: {
    'members-avatar-list-input': MembersAvatarListInput,
    'members-select': MembersSelect,
    'people-select': PeopleSelect,
    'manage-custom-field-dialog': ManageCustomFieldDialog,
    'custom-field-value': CustomFieldValue
  },
  data () {
    return {
      teamLeadName: 'N/A',
      revenue: 'N/A',
      members: [],
      dealContacts: [],
      newTeamLeadId: '',
      newRevenue: 0,
      newPeople: [],
      openMenu: {},
      peopleVisible: {},
      loading: {}
    }
  },
  computed: {
    ...mapGetters({
      dealById: 'deals/dealById',
      teamLeadById: 'deals/teamLeadById',
      people: 'people/list',
      users: 'users/list',
      designationById: 'settings/designationById',
      roleById: 'settings/roleById',
      companies: 'companies/list',
      companyById: 'companies/companyById',
      customFieldById: 'settings/customFieldById'
    }),
    deal () {
      return this.dealById(this.$route.params.id)
    },
    hasCustomFields () {
      if (!this.deal) return false
      return (this.deal.customFields || []).length > 0
    }
  },
  watch: {
    deal: function (val) {
      this.setData(val)
    },
    companies: function () {
      this.refreshContacts()
    }
  },
  mounted () {
    this.setData(this.deal)
  },
  methods: {
    setData (deal) {
      this.refreshContacts()
      this.teamLeadName = this.teamLeadById(this.$route.params.id).name
      this.revenue = deal.revenue ? `$${deal.revenue}` : 'N/A'
      this.members = deal.members || []
      this.newTeamLeadId = this.deal.teamLeadId
      this.newPeople = this.deal.people || []
    },
    customFieldNameById (id) {
      return (this.customFieldById(id) || {}).fieldName
    },
    refreshContacts () {
      const dealContacts = _.filter(this.people, ({ id }) => _.indexOf(this.deal.people, id) !== -1)
      const enhancedContacts = dealContacts.map(contact => {
        const company = this.companyById(contact.companyId) || {}
        const designation = this.designationById(company.designationId) || {}
        const role = this.roleById(company.roleId) || {}

        return { ...contact, designationId: company.designationId, roleId: company.roleId, designation: designation.text, role: role.text }
      })
      this.dealContacts = []
      _.forEach(_.groupBy(enhancedContacts, 'designationId'), (contacts, designationId) => {
        const designation = this.designationById(designationId)
        this.dealContacts.push({
          designationId,
          designation: designation.text,
          contacts
        })
      })
    },
    addDetails () {
      this.$refs.ManageCustomFieldDialog.open(null, async customField => {
        const respopnse = await this.$firebase.setting.deal.customField.create(customField)
        const id = respopnse.data
        const customFields = (this.deal.customFields || []).concat({ id, fieldValue: customField.fieldValue })
        return this.$firebase.deal.update({ ...this.deal, customFields })
      }, (_, error) => {
        error ? notifyFailure(error.message) : notifySuccess('New detail is added successfully')
      })
    },
    editDetail (detail) {
      const customField = {
        ...this.customFieldById(detail.id),
        fieldValue: detail.fieldValue
      }

      this.$refs.ManageCustomFieldDialog.open(customField, async (updatedCustomField, actionType) => {
        if (actionType === 'manage') {
          await this.$firebase.setting.deal.customField.update(updatedCustomField)

          const { id, fieldValue } = updatedCustomField
          const customFields = this.deal.customFields.map(cf => cf.id !== updatedCustomField.id ? cf : { id, fieldValue })

          return this.$firebase.deal.update({ ...this.deal, customFields })
        } else if (actionType === 'delete') {
          return this.$firebase.setting.deal.customField.delete(customField)
        }
      }, (_, error) => {
        error ? notifyFailure(error.message) : notifySuccess('The detail is updated successfully')
      })
    },
    async updateMembers (members) {
      this.updateDeal({ ...this.deal, members }, 'members')
    },
    updateTeamLead (value) {
      this.updateDeal({ ...this.deal, teamLeadId: value }, 'teamLeadId')
    },
    updateRevenue (value) {
      this.updateDeal({ ...this.deal, revenue: value }, 'revenue')
    },
    updatePeople (value) {
      this.updateDeal({ ...this.deal, people: value }, 'people')
    },
    updateDeal (updatedDeal, field) {
      this.$set(this.loading, field, true)
      this.$firebase.deal.update(updatedDeal)
        .then(() => {
          this.$set(this.loading, field, false)
          notifySuccess('The deal is updated successfully')
        })
        .catch(error => {
          this.loading[field] = false
          notifyFailure(error.message)
        })
    }
  }
}
</script>

<style lang='stylus'>
  .deal-main__add-detail
    border 1px solid $grey-4
</style>
