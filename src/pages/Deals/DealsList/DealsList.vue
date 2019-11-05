<template>
  <unpadded-container>
    <template #content>
      <q-table
        :dense="$q.screen.lt.md"
        :data="groupData"
        :columns="filteredColumns"
        row-key="name"
        :sort-method="sortDeals"
      >
        <template #header="props">
          <q-tr :props="props">
            <q-th key="name" :props="props" v-if="fields.includes('name')">Name</q-th>
            <q-th key="labels" :props="props" v-if="fields.includes('labels')">Labels</q-th>
            <q-th key="stage" :props="props" v-if="fields.includes('stage')">Stage</q-th>
            <q-th key="revenue" :props="props" v-if="fields.includes('revenue')">Revenue</q-th>
            <q-th key="createdAt" :props="props" v-if="fields.includes('createdAt')">Created At</q-th>
            <q-th key="settings" :props="props">
              <q-btn flat dense icon="settings" size="sm">
                <q-popup-proxy>
                  <div class="column q-pa-sm">
                    <q-checkbox v-model="fields" val="name" label="Name" dense />
                    <q-checkbox v-model="fields" val="labels" label="Labels" dense />
                    <q-checkbox v-model="fields" val="stage" label="Stage" dense />
                    <q-checkbox v-model="fields" val="revenue" label="Revenue" dense />
                    <q-checkbox v-model="fields" val="createdAt" label="Created At" dense />
                  </div>
                </q-popup-proxy>
              </q-btn>
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" class="cursor-pointer" @click.native="collapseStage(props.row.stageId)">
            <q-td key="name" :props="props" colspan="100%" class="text-weight-bold text-red">
              {{props.row.stageTitle}}
            </q-td>
          </q-tr>
          <q-tr :props="props" v-show="!collapsed[props.row.stageId]" v-for="deal in props.row.deals" :key="deal.id">
            <q-td key="name" :props="props">
              <router-link :to="{
                name: 'deal-history',
                params: {id: deal.id},
                query: $route.query
              }">{{ deal.name }}</router-link>
            </q-td>
            <q-td key="labels" :props="props">
              <tags-list :tags="deal.tags" containerType="deal" :containerId="deal.id" :read-only="true" />
            </q-td>
            <q-td key="stage" :props="props">{{ deal.stage }}</q-td>
            <q-td key="revenue" :props="props">{{ deal.revenue }}</q-td>
            <q-td key="createdAt" :props="props">{{ deal.createdAt }}</q-td>
            <q-td key="settings" />
          </q-tr>
        </template>
      </q-table>
    </template>
  </unpadded-container>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'
import UnpaddedContainer from 'components/layouts/UnpaddedContainer'
import TagsList from 'components/common/TagsList'
import * as formatters from 'src/utils/formatters'

export default {
  name: 'DealsList',
  props: ['board'],
  components: {
    'unpadded-container': UnpaddedContainer,
    'tags-list': TagsList
  },
  data () {
    return {
      columns: [
        { name: 'name', label: 'TITLE', align: 'left', field: 'name', sortable: true },
        { name: 'labels', label: 'LABELS', align: 'left', field: 'labels' },
        { name: 'stage', label: 'STAGE', field: 'stage', sortable: true },
        { name: 'revenue', label: 'REVENUE', field: 'revenue' },
        { name: 'createdAt', label: 'CREATION DATE', field: 'createdAt', sortable: true },
        { name: 'settings', fixed: true }
      ],
      fields: ['name', 'labels', 'stage', 'revenue', 'createdAt'],
      collapsed: {}
    }
  },
  computed: {
    ...mapGetters({
      deals: 'deals/list',
      stageById: 'settings/stageById',
      stagesByBoardId: 'settings/stagesByBoardId',
      shouldHideArchived: 'deals/shouldHideArchived'
    }),
    groupData () {
      const allStages = this.stagesByBoardId(this.board)
      const filteredDeals = this.deals
        .filter(deal => deal.boardId === this.board)
        .filter(deal => this.shouldHideArchived ? !deal.archived : true)
        .filter(deal => this.$permissionResolver.hasPermission('read', 'deals', deal))
      const groupedBy = _.groupBy(filteredDeals, 'stageId')
      const stages = _.keys(groupedBy)
      const result = stages.map(stageId => {
        const stage = this.stageById(stageId) || {}
        return {
          stageId: stage.id,
          stageTitle: stage.text,
          order: stage.order,
          deals: groupedBy[stageId].map(deal => {
            const stage = this.stageById(deal.stageId) || {}
            return {
              ...deal,
              stage: stage.text,
              createdAt: formatters.stringifiedDate(deal.createdAt)
            }
          })
        }
      })
      const append = allStages.filter(stage => !stages.includes(stage.id))
        .map(stage => ({
          stageId: stage.id,
          stageTitle: stage.text,
          order: stage.order,
          deals: []
        }))
      return _.sortBy([...result, ...append], 'order')
    },
    filteredColumns () {
      return this.columns.filter(column => column.fixed || this.fields.includes(column.name))
    }
  },
  methods: {
    collapseStage (stageId) {
      this.$set(this.collapsed, stageId, !this.collapsed[stageId])
    },
    sortDeals: (rows, sortBy, desc) => {
      return rows.map(row => {
        const deals = _.sortBy(row.deals, sortBy)
        return {
          ...row,
          deals: desc ? deals : _.reverse(deals)
        }
      })
    }
  }
}
</script>
