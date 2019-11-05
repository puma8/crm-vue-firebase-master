<template>
  <padded-container>
    <template #header-title>
      <div class="text-h6 text-weight-bold">Project Sections</div>
    </template>
    <template #content>
      <q-card>
        <q-card-section>
          <div class="q-mt-md">
            <dnd-container @drop="onDrop" lock-axis="y" drag-handle-selector=".drag-handle">
              <dnd-draggable v-for="section in editableSections" :key="section.id">
                <div class="bg-blue-3 q-pa-sm best-rounded text-subtitle1 q-mt-sm row items-center editable">
                  <q-icon class="drag-handle" style="cursor: move" name="drag_handle" />
                  <span>{{section.text}}</span>
                  <q-space />
                  <q-btn icon="edit" rounded flat dense class="edit" @click="manageSection('update', section)" v-if="!loading[section.id]" />
                  <q-btn icon="delete" rounded flat dense :class="!loading[section.id] ? 'edit' : ''" :loading="loading[section.id]" @click="deleteSection(section)" />
                </div>
              </dnd-draggable>
            </dnd-container>
          </div>
          <q-btn class="q-mt-sm" color="primary" flat dense size="sm" label="+Add section" @click="manageSection('create')" />
        </q-card-section>
      </q-card>
      <simple-input-dialog ref="SimpleInputDialog" />
    </template>
  </padded-container>
</template>

<script>
import SimpleInputDialog from 'components/dialogs/SimpleInputDialog'
import PaddedContainer from 'components/layouts/PaddedContainer'
import { Container, Draggable } from 'vue-smooth-dnd'
import { applyDrag } from 'src/utils'
import { mapGetters } from 'vuex'

export default {
  name: 'ProjectSections',
  components: {
    'padded-container': PaddedContainer,
    'simple-input-dialog': SimpleInputDialog,
    'dnd-container': Container,
    'dnd-draggable': Draggable
  },
  data () {
    return {
      editableSections: [],
      loading: {}
    }
  },
  computed: {
    ...mapGetters({
      projectSettings: 'settings/project'
    })
  },
  watch: {
    projectSettings: function (value) {
      this.setData(value)
    }
  },
  mounted () {
    this.setData(this.projectSettings)
  },
  methods: {
    setData (projectSettings) {
      this.editableSections = projectSettings.sections || []
    },
    onDrop (dropResult) {
      this.editableSections = applyDrag(this.editableSections, dropResult)
      this.$firebase.setting.project.section.update({
        sections: this.projectSettings.sections
          .map(section => this.editableSections.find(es => es.id === section.id) || section)
      })
    },
    manageSection (action, section = {}) {
      this.$refs.SimpleInputDialog.open({
        title: `Enter section name`,
        label: 'Section name',
        initialValue: section.text
      }, newValue => {
        if (action === 'create') {
          return this.$firebase.setting.project.section.create({
            text: newValue
          })
        } else if (action === 'update') {
          return this.$firebase.setting.project.section.update({
            ...section,
            text: newValue
          })
        }

        return Promise.resolve()
      }, () => {

      })
    },
    deleteSection (section) {
      this.$q.dialog({
        title: 'Confirm',
        message: 'Do you really want to delete this section?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.$set(this.loading, section.id, true)
        this.$firebase.setting.project.section.delete(section)
          .then(result => {
            this.$set(this.loading, section.id, false)
          })
          .catch(error => {
            this.$set(this.loading, section.id, false)
            throw new Error(error.message)
          })
      })
    }
  }
}
</script>

<style lang='stylus'>
</style>
