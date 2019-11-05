<template>
  <div class="column q-px-sm q-py-md bg-grey-3">
    <div class="row items-center">
      <q-btn
        class="col-1"
        flat
        dense
        icon="keyboard_arrow_left"
        @click="$router.push({
          name: 'projects'
        })"
      />
      <div class="col-10 row items-center text-h6 editable">
        {{project.name}}
        <q-popup-edit v-model="newName" buttons @save="updateName">
          <q-input v-model="newName" dense />
        </q-popup-edit>
        <q-btn icon="edit" rounded flat dense :class="!loading.name ? 'edit' : ''" :loading="loading.name" />
      </div>
      <q-btn
        class="col-1"
        flat
        round
        dense
        icon="more_horiz"
        :loading="loading.more"
      >
        <q-menu>
          <q-list>
            <q-item clickable v-close-popup @click="deleteProject">
              <q-item-section>Delete</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="archiveProject">
              <q-item-section>{{project.archived ? 'Unarchive' : 'Archive'}}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <div class="q-px-sm q-pt-sm" v-if="project.archived">
      <q-badge color="warning">
        Archived
      </q-badge>
    </div>
    <div class="row q-pt-sm items-center">
      <div class="col-11 q-px-sm">
        <tags-list :tags="project.tags" containerType="project" :containerId="project.id" />
      </div>
      <q-btn
        class="col-1"
        dense
        flat
        icon="local_offer"
        @click="openTagDialog"
      />
    </div>
    <div class="text-subtitle1 q-px-sm editable">
      {{sectionText}}
      <q-popup-edit v-model="newSectionId" buttons @save="updateSection">
        <addable-select
          v-model="newSectionId"
          :options="projectSettings.sections"
          option-label="text"
          option-value="id"
          label="Section"
          dense
          :add-func="addSection"
          :hide-bottom-space="true"
        />
      </q-popup-edit>
      <q-btn icon="edit" rounded flat dense :class="!loading.section ? 'edit' : ''" :loading="loading.section" />
    </div>
    <manage-tags-dialog ref="ManageTagsDialog" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { notifySuccess, notifyFailure } from 'src/utils'
import AddableSelect from 'components/inputs/AddableSelect'
import ManageTagsDialog from 'components/dialogs/ManageTagsDialog'
import TagsList from 'components/common/TagsList'

export default {
  name: 'ProjectHeader',
  components: {
    'addable-select': AddableSelect,
    'manage-tags-dialog': ManageTagsDialog,
    'tags-list': TagsList
  },
  data () {
    return {
      newName: '',
      newSectionId: '',
      loading: {}
    }
  },
  computed: {
    ...mapGetters({
      projectById: 'projects/projectById',
      sectionById: 'settings/sectionById',
      projectSettings: 'settings/project'
    }),
    project () {
      return this.projectById(this.$route.params.id)
    },
    sectionText () {
      return this.sectionById(this.project.sectionId).text
    }
  },
  watch: {
    project: function (val) {
      this.setData(val)
    }
  },
  created () {
    this.setData(this.project)
  },
  methods: {
    setData (project) {
      this.newName = project.name
      this.newSectionId = project.sectionId
    },
    openTagDialog () {
      this.$refs.ManageTagsDialog.open({
        id: this.project.id,
        type: 'project'
      }, null)
    },
    updateName (value) {
      this.updateProject({ ...this.project, name: value }, 'name')
    },
    addSection (value) {
      return this.$firebase.setting.project.section.create({ text: value })
    },
    updateSection (value) {
      this.updateProject({ ...this.project, sectionId: value }, 'section')
    },
    updateProject (project, field) {
      this.$set(this.loading, field, true)
      return this.$firebase.project.update(project)
        .then(() => {
          this.$set(this.loading, field, false)
          notifySuccess('The project is updated successfully')
        })
        .catch(error => {
          this.$set(this.loading, field, false)
          notifyFailure(error.message)
        })
    },
    async archiveProject () {
      this.$set(this.loading, 'more', true)
      try {
        const isArchived = this.project.archived
        await this.$firebase.cfApi('project')({
          action: 'archive',
          id: this.project.id,
          archived: !isArchived
        })
        // await this.$firebase.deal.update({ ...this.deal, archived: !isArchived })
        notifySuccess(`This project is ${isArchived ? 'unarchived' : 'archived'}`)
      } catch (error) {
        notifyFailure('We can not archive this project for now. Please try again later ')
      }
      this.$set(this.loading, 'more', false)
    },
    async deleteProject () {
      this.$set(this.loading, 'more', true)
      try {
        await this.$firebase.cfApi('project')({
          action: 'delete',
          id: this.project.id
        })
        notifySuccess('This project is deleted')
        this.$router.push({ name: 'projects' })
      } catch (error) {
        notifyFailure('We an not delete this project for now. Please try again later')
      }
      this.$set(this.loading, 'more', false)
    }
  }
}
</script>

<style>

</style>
