<template>
  <fragment>
    <span class="text-subtitle1" style="width: 80px">{{boardName}}</span>
    <q-btn flat round dense icon="view_week"
      @click="$router.push({
        name: 'deals',
        query: {
          ...$route.query,
          viewMode: 'kanban',
          board: boardId
        }
      })"
    />
    <q-btn flat round dense icon="menu"
      @click="$router.push({
        name: 'deals',
        query: {
          ...$route.query,
          viewMode: 'list',
          board: boardId
        }
      })"
    />
    <q-separator vertical />
    <q-input borderless v-model="text" dense type="search">
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <q-space />
  </fragment>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DealsHeader',
  data () {
    return {
      text: '',
      boardName: '',
      boardId: ''
    }
  },
  computed: {
    ...mapGetters({
      dealSettings: 'settings/deal',
      dealById: 'deals/dealById',
      deals: 'deals/list'
    })
  },
  watch: {
    $route (to, from) {
      this.updateBoardName(to, from)
    },
    deals () {
      this.updateBoardName(this.$route)
    }
  },
  mounted () {
    this.updateBoardName(this.$route)
  },
  methods: {
    updateBoardName (to, from = {}) {
      const { query, params } = to
      if (params.id) {
        if (from.params && from.params.id === params.id) return
        const deal = this.dealById(params.id)
        if (deal) {
          const board = this.dealSettings.boards.find(board => board.id === deal.boardId) || {}
          this.boardId = board.id
          this.boardName = board.text
        }
      } else {
        const board = this.dealSettings.boards.find(board => board.id === query.board) || {}
        this.boardId = board.id
        this.boardName = board.text
      }
    }
  }
}
</script>

<style>

</style>
