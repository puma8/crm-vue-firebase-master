<template>
  <padded-container>
    <template #header-title>
      <div class="text-h6 text-weight-bold">Deal stages</div>
    </template>
    <template #content>
      <q-card>
        <q-card-section>
          <div>
            <q-select
              class="q-mt-md"
              v-model="selectedBoardId"
              :options="dealSettings.boards"
              option-label="text"
              option-value="id"
              @input="handleBoardSelect"
              label="Select Board"
              emit-value
              map-options
              dense
              :hide-bottom-space="true"
            />
          </div>
          <div class="q-mt-md">
            <dnd-container @drop="onDrop" lock-axis="y" drag-handle-selector=".drag-handle">
              <dnd-draggable v-for="stage in editableStages" :key="stage.id">
                <div class="bg-blue-3 q-pa-sm best-rounded text-subtitle1 q-mt-sm row items-center editable">
                  <q-icon class="drag-handle" style="cursor: move" name="drag_handle" />
                  <span>{{stage.order + 1}}. {{stage.text}}</span>
                  <q-space />
                  <q-btn icon="edit" rounded flat dense class="edit" @click="manageStage('update', stage)" v-if="!loading[stage.id]" />
                  <q-btn icon="delete" rounded flat dense :class="!loading[stage.id] ? 'edit' : ''" :loading="loading[stage.id]" @click="deleteStage(stage)" />
                </div>
              </dnd-draggable>
            </dnd-container>
          </div>
          <q-btn class="q-mt-sm" color="primary" flat dense size="sm" label="+Add stage" @click="manageStage('create')" />
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
  name: 'DealStages',
  components: {
    'padded-container': PaddedContainer,
    'simple-input-dialog': SimpleInputDialog,
    'dnd-container': Container,
    'dnd-draggable': Draggable
  },
  data () {
    return {
      editableStages: [],
      selectedBoardId: '',
      loading: {}
    }
  },
  computed: {
    ...mapGetters({
      dealSettings: 'settings/deal',
      stagesByBoardId: 'settings/stagesByBoardId'
    }),
    stages () {
      return this.dealSettings.stages || []
    }
  },
  watch: {
    dealSettings: function (value) {
      this.setData(value)
    }
  },
  mounted () {
    this.setData(this.dealSettings)
  },
  methods: {
    setData (dealSettings) {
      if (!dealSettings.boards[0]) return
      this.selectedBoardId = this.selectedBoardId || dealSettings.boards[0].id
      this.editableStages = this.stagesByBoardId(this.selectedBoardId)
    },
    handleBoardSelect (boardId) {
      this.editableStages = this.stagesByBoardId(this.selectedBoardId)
    },
    onDrop (dropResult) {
      this.editableStages = applyDrag(this.editableStages, dropResult)
        .map((stage, index) => ({
          ...stage,
          order: index
        }))
      this.$firebase.setting.deal.stage.update({
        stages: this.dealSettings.stages
          .map(stage => this.editableStages.find(es => es.id === stage.id) || stage)
      })
    },
    manageStage (action, stage = {}) {
      this.$refs.SimpleInputDialog.open({
        title: `Enter stage name`,
        label: 'Stage name',
        initialValue: stage.text
      }, newValue => {
        if (action === 'create') {
          return this.$firebase.setting.deal.stage.create({
            boardId: this.selectedBoardId,
            text: newValue,
            order: this.editableStages.length
          })
        } else if (action === 'update') {
          return this.$firebase.setting.deal.stage.update({
            ...stage,
            text: newValue
          })
        }

        return Promise.resolve()
      }, () => {

      })
    },
    deleteStage (stage) {
      this.$q.dialog({
        title: 'Confirm',
        message: 'Do you really want to delete this stage?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.$set(this.loading, stage.id, true)
        this.$firebase.setting.deal.stage.delete(stage)
          .then(result => {
            this.$set(this.loading, stage.id, false)
          })
          .catch(error => {
            this.$set(this.loading, stage.id, false)
            throw new Error(error.message)
          })
      })
    }
  }
}
</script>

<style lang='stylus'>
</style>
