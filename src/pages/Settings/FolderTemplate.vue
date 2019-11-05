<template>
  <padded-container>
    <template #header-title>
      <div class="text-h6 text-weight-bold">Folder Template</div>
    </template>
    <template #header-actions>
      <q-btn color="primary" label="Save" @click="saveTemplate" />
    </template>
    <template #content>
      <q-card>
        <q-card-section>
          <div class="text-weight-bold">
            Deals
            <q-btn icon="add" dense flat @click="addDealFolder" />
            <q-btn icon="clear" dense flat @click="clearDealFolders" />
          </div>
          <folder-tree-input class="q-pa-sm" v-model="dealsRootFolderTree" v-if="dealsRootFolderTree.length > 0" />
          <div class="q-pt-md text-weight-bold">
            Projects
            <q-btn icon="add" dense flat @click="addProjectFolder" />
            <q-btn icon="clear" dense flat @click="clearProjectFolders" />
          </div>
          <folder-tree-input class="q-pa-sm" v-model="projectsRootFolderTree" v-if="projectsRootFolderTree.length > 0" />
        </q-card-section>
      </q-card>
    </template>
  </padded-container>
</template>

<script>
import { mapGetters } from 'vuex'
import FolderTreeInput from 'components/inputs/FolderTreeInput'
import PaddedContainer from 'components/layouts/PaddedContainer'

export default {
  name: 'FolderTemplate',
  components: {
    'padded-container': PaddedContainer,
    'folder-tree-input': FolderTreeInput
  },
  data () {
    return {
      dealsRootFolderTree: [],
      projectsRootFolderTree: []
    }
  },
  computed: {
    ...mapGetters({
      'dealSettings': 'settings/deal',
      'projectSettings': 'settings/project'
    })
  },
  watch: {
    dealSettings () {
      this.init()
    },
    projectSettings () {
      this.init()
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.dealsRootFolderTree = this.dealSettings.folderTemplate || []
      this.projectsRootFolderTree = this.projectSettings.folderTemplate || []
    },
    addDealFolder () {
      this.$set(this.dealsRootFolderTree, this.dealsRootFolderTree.length, {
        title: 'New Folder'
      })
    },
    clearDealFolders () {
      this.dealsRootFolderTree.splice(0)
    },
    addProjectFolder () {
      this.$set(this.projectsRootFolderTree, this.projectsRootFolderTree.length, {
        title: 'New Folder'
      })
    },
    clearProjectFolders () {
      this.projectsRootFolderTree.splice(0)
    },
    saveTemplate () {
      this.$firebase.setting.deal.folderTemplate.create(this.dealsRootFolderTree)
      this.$firebase.setting.project.folderTemplate.create(this.projectsRootFolderTree)
    }
  }
}
</script>

<style>

</style>
