<template>
  <q-dialog v-model="openModal" persistent>
    <q-card v-if="openModal" class="dialog-md-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium">Create Deal</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <form>
          <q-input
            label="Deal name"
            v-model="name"
            dense
            autofocus
            @input="delayTouch($v.name, $options.touchMap)"
            :error="$v.name.$error"
            :hide-bottom-space="!$v.name.$error"
            :error-message="!$v.name.required ? 'Deal name is required' : !$v.name.isUnique ? 'THe deal name was already taken' : ''"
          />
          <q-select
            v-model="boardId"
            :options="dealSettings.boards"
            option-label="text"
            option-value="id"
            label="Board"
            emit-value
            map-options
            dense
            @input="changeBoard"
            :error="$v.boardId.$error"
            :hide-bottom-space="!$v.boardId.$error"
          />
          <q-select
            v-model="stageId"
            :options="stages"
            option-label="text"
            option-value="id"
            label="Stage"
            emit-value
            map-options
            dense
            @input="delayTouch($v.stageId, $options.touchMap)"
            :error="$v.stageId.$error"
            :hide-bottom-space="!$v.stageId.$error"
          />
          <q-select
            v-model="teamLeadId"
            :options="users"
            option-label="name"
            option-value="id"
            label="Team Lead"
            emit-value
            map-options
            dense
            @input="delayTouch($v.teamLeadId, $options.touchMap)"
            :error="$v.teamLeadId.$error"
            :hide-bottom-space="!$v.teamLeadId.$error"
          />
          <people-select v-model="people" />
          <members-select v-model="members" />
        </form>
      </q-card-section>
      <q-card-section class="row justify-end q-gutter-x-md">
        <q-btn color="primary" label="Cancel" outline @click="cancel" />
        <q-btn color="primary" label="Create" :loading="loading" @click="createDeal" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import { delayTouch, notifyFailure } from 'src/utils'
import MembersSelect from '../inputs/MembersSelect'
import PeopleSelect from '../inputs/PeopleSelect'

export default {
  name: 'ManageDealDialog',
  components: {
    'members-select': MembersSelect,
    'people-select': PeopleSelect
  },
  touchMap: new WeakMap(),
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
      dealSettings: 'settings/deal',
      stagesByBoardId: 'settings/stagesByBoardId',
      users: 'users/list',
      deals: 'deals/list'
    }),
    stages () {
      return this.stagesByBoardId(this.boardId)
    }
  },
  data () {
    return {
      openModal: false,
      loading: false,
      name: '',
      boardId: '',
      stageId: '',
      teamLeadId: '',
      people: [],
      members: []
    }
  },
  watch: {
    currentUser: function (val) {
      this.teamLeadId = val.id
    }
  },
  validations: {
    name: {
      required,
      isUnique (value) {
        if (this.loading) return true
        if (!value) return true
        return !this.deals.find(deal => deal.name === value)
      }
    },
    boardId: { required },
    stageId: { required },
    teamLeadId: { required }
  },
  methods: {
    open () {
      this.openModal = true
      this.reset()
    },
    changeBoard (value) {
      this.delayTouch(this.$v.boardId, this.$options.touchMap)
      this.stageId = this.stages[0].id
    },
    async createDeal () {
      this.validate()
      this.loading = true

      try {
        await this.$firebase.deal.create({
          name: this.name,
          boardId: this.boardId,
          stageId: this.stageId,
          teamLeadId: this.teamLeadId,
          people: this.people,
          members: this.members
        })
      } catch (error) {}
      this.loading = false
      this.openModal = false
    },
    validate () {
      if (
        this.$v.name.$invalid ||
        this.$v.boardId.$invalid ||
        this.$v.stageId.$invalid ||
        this.$v.teamLeadId.$invalid
      ) {
        this.$v.name.$touch()
        this.$v.boardId.$touch()
        this.$v.stageId.$touch()
        this.$v.teamLeadId.$touch()
        notifyFailure('You have some errors in the form')
        setTimeout(() => {
          this.loading = false
        }, 1000)
        throw new Error('You have some errors in the form')
      }
    },
    cancel () {
      this.openModal = false
    },
    reset () {
      this.name = ''
      this.boardId = ''
      this.stageId = ''
      this.teamLeadId = this.currentUser.id
      this.members = []
      this.people = []
      this.$v.name.$reset()
      this.$v.boardId.$reset()
      this.$v.stageId.$reset()
      this.$v.teamLeadId.$reset()
    },
    delayTouch
  }
}
</script>

<style>
</style>
