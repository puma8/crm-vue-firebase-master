<template>
  <q-layout view="lHh Lpr lFf">
    <aside class="sidebar">
      <div class="sidebar-content fit scroll bg-grey-2 q-gutter-y-sm column">
        <div class="q-py-md row justify-center">
          <q-btn dense flat class="flex-1">
            <avatar
              :username="currentUser.name"
              :src="currentUser.photoUrl"
              :size="48"
              v-if="currentUser.name"
            />
            <q-menu anchor="top right" self="top left">
              <q-list>
                <q-item clickable v-close-popup :to="{name: 'personal'}">
                  <q-item-section avatar>
                    <q-icon name="settings" />
                  </q-item-section>
                  <q-item-section>Settings</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="signOut">
                  <q-item-section avatar>
                    <q-icon name="power_settings_new" />
                  </q-item-section>
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
        <q-btn
          flat
          dense
          no-caps
          :to="{
            name: 'deals',
            query: {
              board: 'proposal'
            }
          }"
        >
          <q-icon name="monetization_on" />
          <span class="text-weight-light">Proposals</span>
        </q-btn>
        <q-btn
          flat
          dense
          no-caps
          :to="{
            name: 'deals',
            query: {
              board: 'job'
            }
          }"
        >
          <q-icon name="business_center" />
          <span class="text-weight-light">&nbsp;&nbsp;&nbsp;Jobs&nbsp;&nbsp;&nbsp;</span>
        </q-btn>
        <q-btn
          flat
          dense
          no-caps
          :to="{
            name: 'deals',
            query: {
              board: 'service'
            }
          }"
        >
          <q-icon name="headset_mic" />
          <span class="text-weight-light">Services</span>
        </q-btn>
        <div>
          <q-separator />
        </div>
        <q-btn flat dense no-caps :to="{
            name: 'projects'
          }">
          <q-icon name="work" />
          <span class="text-weight-light">Projects</span>
        </q-btn>
        <!-- No need in version 1 -->
        <q-btn flat dense no-caps :to="{name: 'inbox'}">
          <q-icon name="email" />
          <span class="text-weight-light">&nbsp;&nbsp;Inbox&nbsp;&nbsp;</span>
        </q-btn>
        <q-btn
          flat
          dense
          no-caps
          :to="{
            name: 'contacts',
            query: {
              type: 'people'
            }
          }"
        >
          <q-icon name="people" />
          <span class="text-weight-light">Contacts</span>
        </q-btn>
        <!-- <div class="flex-1"/>
        <q-btn flat dense no-caps :to="{name: 'personal'}">
          <q-icon name="settings" />
          <span class="text-weight-light">Settings</span>
        </q-btn>
        <q-btn flat dense no-caps @click="signOut">
          <q-icon name="power_settings_new" />
          <span class="text-weight-light">&nbsp;&nbsp;Logout&nbsp;&nbsp;</span>
        </q-btn>-->
      </div>
    </aside>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import Avatar from 'vue-avatar'

export default {
  name: 'MainLayout',
  components: {
    avatar: Avatar
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user'
    })
  },
  methods: {
    async signOut () {
      await this.$firebase.signOut()
      window.location.href = '#/login'
      window.location.reload()
    }
  }
}
</script>

<style>
</style>
