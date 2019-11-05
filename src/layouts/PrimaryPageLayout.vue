<template>
  <q-page class="column">
    <q-toolbar class="fixed bg-white q-gutter-xs shadow-1" style="z-index: 1">
      <slot name="header" />
      <q-separator vertical />
      <q-btn flat round dense icon="notifications" />
      <q-separator vertical />
      <q-btn flat round dense icon="more_horiz">
        <q-menu>
          <q-list style="min-width: 180px">
            <q-item clickable v-close-popup @click="hideArchivedDeals()">
              <q-item-section>{{shouldHideArchived ? 'Show archived' : 'Hide Archived'}}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn flat round dense icon="check_box" :to="{ name: 'todos' }">
        <q-badge floating v-if="uncompletedTasks.length">{{uncompletedTasks.length}}</q-badge>
      </q-btn>
      <q-btn flat round dense icon="add_circle" size="20px">
        <q-popup-proxy v-model="openMenu">
          <div class="column" id="entityMenu">
            <div class="row justify-end">
              <q-chip
                clickable
                @click="$refs.ManageDealDialog.open()"
                color="primary"
                text-color="white"
                icon-right="event"
              >Deal</q-chip>
            </div>
            <div class="row justify-end">
              <q-chip
                clickable
                @click="$refs.ManageProjectDialog.open()"
                color="primary"
                text-color="white"
                icon-right="work"
              >Project</q-chip>
            </div>
            <!-- No need in version 1 -->
            <!-- <div class="row justify-end">
              <q-chip clickable color="primary" text-color="white" icon-right="event">
                Mail
              </q-chip>
            </div>-->
            <div class="row justify-end">
              <q-chip
                clickable
                @click="$refs.ManagePeopleDialog.open()"
                color="primary"
                text-color="white"
                icon-right="event"
              >Contact</q-chip>
            </div>
            <div class="row justify-end">
              <q-chip
                clickable
                @click="$refs.ManageCompanyDialog.open()"
                color="primary"
                text-color="white"
                icon-right="event"
              >Company</q-chip>
            </div>
          </div>
        </q-popup-proxy>
      </q-btn>
    </q-toolbar>
    <div class="page-primary column">
      <slot name="content" />
    </div>
    <manage-deal-dialog ref="ManageDealDialog" />
    <manage-project-dialog ref="ManageProjectDialog" />
    <manage-people-dialog ref="ManagePeopleDialog" />
    <manage-company-dialog ref="ManageCompanyDialog" />
  </q-page>
</template>

<script>
import ManageDealDialog from '../components/dialogs/ManageDealDialog'
import ManageProjectDialog from '../components/dialogs/ManageProjectDialog'
import ManagePeopleDialog from '../components/dialogs/ManagePeopleDialog'
import ManageCompanyDialog from '../components/dialogs/ManageCompanyDialog'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'DealsLayout',
  components: {
    'manage-deal-dialog': ManageDealDialog,
    'manage-project-dialog': ManageProjectDialog,
    'manage-people-dialog': ManagePeopleDialog,
    'manage-company-dialog': ManageCompanyDialog
  },
  data () {
    return {
      openMenu: false,
      uncompletedTasks: []
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
      shouldHideArchived: 'deals/shouldHideArchived'
    })
  },
  watch: {
    openMenu: function (val) {
      if (val) {
        this.$nextTick().then(() => {
          const node = document.getElementById('entityMenu').parentElement
          node.classList.add('no-shadow')
          node.classList.add('transparent')
        })
      }
    },
    currentUser: function (val) {
      this.bind(val.orgId)
    }
  },
  mounted () {
    this.bind(this.currentUser.orgId)
  },
  methods: {
    ...mapActions({
      hideArchivedDeals: 'deals/hideArchived'
    }),
    bind (orgId) {
      if (!orgId) return
      this.$bind(
        'uncompletedTasks',
        this.$firebase.db
          .collection('tasks')
          .where('orgId', '==', orgId)
          .where('completed', '==', false)
      )
    }
  }
}
</script>

<style>
</style>
