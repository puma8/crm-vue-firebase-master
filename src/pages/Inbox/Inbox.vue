<template>
  <div class="flex-1 primary-bg-color">
    <q-scroll-area class="full-height">
      <q-card v-for="(thread, index) in threads" :key="index">
        <q-card-section
          class="q-py-md text-h6 text-weight-medium cursor-pointer relative-position"
          v-ripple
          @click="toggleThread(index)"
        >{{thread.subject}}</q-card-section>
        <q-slide-transition>
          <div class="q-pl-lg" v-html="thread.snippet" v-show="expandedThreads[index]" />
        </q-slide-transition>
      </q-card>
    </q-scroll-area>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Inbox',
  props: ['containerId', 'containerType'],
  data () {
    return {
      threads: [],
      expandedThreads: {}
    }
  },
  computed: {
    ...mapGetters({
      dealById: 'deals/dealById',
      projectById: 'projects/projectById'
    }),
    deal () {
      return this.dealById(this.containerId)
    },
    project () {
      return this.projectById(this.containerId)
    }
  },
  watch: {
    deal: function (val) {
      this.setData(val)
    },
    project: function (val) {
      this.setData(val)
    }
  },
  mounted () {
    if (this.containerType === 'deal') {
      this.setData(this.deal)
    } else if (this.containerType === 'project') {
      this.setData(this.project)
    } else {
      this.setData()
    }
  },
  methods: {
    async setData (container) {
      const response = await this.$firebase.cfApi('nylas')({
        action: 'getThreads'
      })
      this.threads = response.data
    },
    toggleThread (index) {
      this.$set(this.expandedThreads, index, !this.expandedThreads[index])
    }
  }
}
</script>

<style>
</style>
