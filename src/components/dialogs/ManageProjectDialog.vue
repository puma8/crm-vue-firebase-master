<template>
  <q-dialog v-model="openModal" persistent>
    <q-card v-if="openModal" class="dialog-md-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium">Create Project</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <form>
          <q-input
            label="Project name"
            v-model="name"
            dense
            autofocus
            @input="delayTouch($v.name, $options.touchMap)"
            :error="$v.name.$error"
            :hide-bottom-space="!$v.name.$error"
            :error-message="!$v.name.required ? 'Project name is required' : !$v.name.isUnique ? 'THe project name was already taken' : ''"
          />
          <addable-select
            v-model="sectionId"
            :options="projectSettings.sections"
            option-label="text"
            option-value="id"
            label="Section"
            dense
            :add-func="addSection"
            :error="$v.sectionId.$error"
            :hide-bottom-space="!$v.sectionId.$error"
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
        <q-btn color="primary" label="Create" :loading="loading" @click="createProject" />
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
import AddableSelect from '../inputs/AddableSelect'

export default {
  name: 'ManageProjectDialog',
  components: {
    'addable-select': AddableSelect,
    'members-select': MembersSelect,
    'people-select': PeopleSelect
  },
  touchMap: new WeakMap(),
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
      projectSettings: 'settings/project',
      users: 'users/list',
      projects: 'projects/list'
    })
  },
  data () {
    return {
      openModal: false,
      loading: false,
      name: '',
      sectionId: '',
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
        return !this.projects.find(project => project.name === value)
      }
    },
    sectionId: { required },
    teamLeadId: { required }
  },
  methods: {
    open () {
      this.openModal = true
      this.reset()
    },
    addSection (value) {
      return this.$firebase.setting.project.section.create({ text: value })
    },
    async createProject () {
      this.validate()
      this.loading = true

      try {
        await this.$firebase.project.create({
          name: this.name,
          sectionId: this.sectionId,
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
        this.$v.sectionId.$invalid ||
        this.$v.teamLeadId.$invalid
      ) {
        this.$v.name.$touch()
        this.$v.sectionId.$touch()
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
      this.sectionId = ''
      this.teamLeadId = this.currentUser.id
      this.$v.name.$reset()
      this.$v.sectionId.$reset()
      this.$v.teamLeadId.$reset()
    },
    delayTouch
  }
}
</script>

<style>
</style>
