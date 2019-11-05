<template>
  <div class="column q-px-sm q-py-md bg-grey-3">
    <div class="row items-center">
      <q-btn
        class="col-1"
        flat
        dense
        icon="keyboard_arrow_left"
        @click="$router.push({
          name: 'deals',
          query: {
            board: deal.boardId
          }
        })"
      />
      <div class="col-10 row items-center text-h6 editable">
        {{deal.name}}
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
            <q-item clickable v-close-popup @click="deleteDeal">
              <q-item-section>Delete</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="archiveDeal">
              <q-item-section>{{deal.archived ? 'Unarchive' : 'Archive'}}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <div class="q-px-sm q-pt-sm" v-if="deal.archived">
      <q-badge color="warning">
        Archived
      </q-badge>
    </div>
    <div class="row q-pt-sm items-center">
      <div class="col-11 q-px-sm">
        <tags-list :tags="deal.tags" containerType="deal" :containerId="deal.id" />
      </div>
      <q-btn
        class="col-1"
        dense
        flat
        icon="local_offer"
        @click="openTagDialog"
      />
    </div>
    <div>
      <div class="text-subtitle1 q-px-sm editable">
        {{stageText}}
        <q-popup-edit v-model="newStage" buttons @save="updateStage">
          <q-select
            v-model="newStage.boardId"
            :options="dealSettings.boards"
            option-label="text"
            option-value="id"
            label="Board"
            emit-value
            map-options
            dense
            @input="changeBoard"
            :hide-bottom-space="true"
          />
          <q-select
            v-model="newStage.stageId"
            :options="stages"
            option-label="text"
            option-value="id"
            label="Stage"
            emit-value
            map-options
            dense
            :hide-bottom-space="true"
          />
        </q-popup-edit>
        <q-btn icon="edit" rounded flat dense :class="!loading.stage ? 'edit' : ''" :loading="loading.stage" />
      </div>
      <div class="q-px-sm">
        <q-linear-progress :value="dealStagePerc(deal)" class="rounded-borders" />
      </div>
    </div>
    <manage-tags-dialog ref="ManageTagsDialog" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { notifySuccess, notifyFailure } from 'src/utils'
import ManageTagsDialog from 'components/dialogs/ManageTagsDialog'
import TagsList from 'components/common/TagsList'

export default {
  name: 'DealHeader',
  components: {
    'manage-tags-dialog': ManageTagsDialog,
    'tags-list': TagsList
  },
  data () {
    return {
      newName: '',
      newStage: {},
      loading: {}
    }
  },
  computed: {
    ...mapGetters({
      dealById: 'deals/dealById',
      stageById: 'settings/stageById',
      dealStagePerc: 'settings/dealStagePerc',
      stagesByBoardId: 'settings/stagesByBoardId',
      dealSettings: 'settings/deal'
    }),
    deal () {
      return this.dealById(this.$route.params.id)
    },
    stageText () {
      return this.stageById(this.deal.stageId).text
    },
    stages () {
      return this.stagesByBoardId(this.newStage.boardId)
    }
  },
  watch: {
    deal: function (val) {
      this.setData(val)
    }
  },
  created () {
    this.setData(this.deal)
  },
  methods: {
    setData (deal) {
      this.newName = deal.name
      this.$set(this.newStage, 'boardId', this.deal.boardId)
      this.$set(this.newStage, 'stageId', this.deal.stageId)
    },
    updateName (value) {
      this.updateDeal({ ...this.deal, name: value }, 'name')
    },
    openTagDialog () {
      this.$refs.ManageTagsDialog.open({
        id: this.deal.id,
        type: 'deal'
      }, null)
    },
    updateStage (value) {
      this.updateDeal({ ...this.deal, boardId: value.boardId, stageId: value.stageId }, 'stage')
    },
    changeBoard (value) {
      this.$set(this.newStage, 'stageId', this.stagesByBoardId(this.newStage.boardId)[0].id)
    },
    updateDeal (updatedDeal, field) {
      this.$set(this.loading, field, true)
      return this.$firebase.deal.update(updatedDeal)
        .then(() => {
          this.$set(this.loading, field, false)
          notifySuccess('The deal is updated successfully')
        })
        .catch(error => {
          this.$set(this.loading, field, false)
          notifyFailure(error.message)
        })
    },
    async archiveDeal () {
      this.$set(this.loading, 'more', true)
      try {
        const isArchived = this.deal.archived
        await this.$firebase.cfApi('deal')({
          action: 'archive',
          id: this.deal.id,
          archived: !isArchived
        })
        // await this.$firebase.deal.update({ ...this.deal, archived: !isArchived })
        notifySuccess(`This deal is ${isArchived ? 'unarchived' : 'archived'}`)
      } catch (error) {
        notifyFailure('We can not archive this deal for now. Please try again later ')
      }
      this.$set(this.loading, 'more', false)
    },
    async deleteDeal () {
      this.$set(this.loading, 'more', true)
      try {
        await this.$firebase.cfApi('deal')({
          action: 'delete',
          id: this.deal.id
        })
        notifySuccess('This deal is deleted')
        this.$router.push({ name: 'deals' })
      } catch (error) {
        notifyFailure('We an not delete this deal for now. Please try again later')
      }
      this.$set(this.loading, 'more', false)
    }
  }
}
</script>

<style>

</style>
