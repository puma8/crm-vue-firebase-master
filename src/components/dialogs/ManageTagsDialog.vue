<template>
  <q-dialog v-model="openModal">
    <q-card v-if="openModal" class="dialog-md-sized">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-medium" v-if="!currentTag">Tags</div>
        <div class="row items-center" v-else>
          <q-btn class="col-1" flat dense icon="keyboard_arrow_left" @click="currentTag=null" />
          <div
            class="col-11 text-h6 text-weight-medium"
          >{{currentTag.id ? 'Update the' : 'Create new'}} tag</div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section v-if="!currentTag">
        <q-input v-model="search" dense autofocus placeholder="Search" :hide-bottom-space="true" />
        <div class="text-grey q-pt-md" v-if="showCreateTag">Create</div>
        <div class="row items-center cursor-pointer best-hover" @click="go" v-if="showCreateTag">
          <q-icon class="col-1" name="local_offer" />
          <span
            class="col-10"
          >{{ filteredTags.length === 0 && this.search ? `Tag "${this.search}"` : 'New tag' }}</span>
          <div class="col-1 row justify-end">
            <q-icon name="navigate_next" />
          </div>
        </div>
        <div class="text-grey q-pt-sm" v-if="filteredTags.length > 0">All tags</div>
        <div class="column q-gutter-y-sm" v-if="filteredTags.length < 7">
          <div
            class="row items-center cursor-pointer best-hover editable"
            v-on:click="toggleTag(tag.id)"
            v-for="tag in filteredTags"
            :key="tag.id"
            style="height: 20px;"
          >
            <q-icon :class="{ [`text-${tag.color}`]: true, 'col-1': true }" name="local_offer" />
            <span class="col-9">{{tag.name}}</span>
            <div class="col-2 row justify-end items-center">
              <q-btn
                class="edit"
                icon="edit"
                rounded
                flat
                dense
                size="sm"
                @click.stop="handleEditTag(tag)"
              />
              <q-btn
                class="edit"
                icon="delete"
                rounded
                flat
                dense
                size="sm"
                @click.stop="handleDeleteTag(tag)"
              />
              <q-icon name="check" v-if="containerTags.includes(tag.id)" />
            </div>
          </div>
        </div>
        <q-scroll-area style="height: 200px; max-height: 300px;" v-else>
          <div class="column q-gutter-y-sm">
            <div
              class="row items-center cursor-pointer best-hover editable"
              v-on:click="toggleTag(tag.id)"
              v-for="tag in filteredTags"
              :key="tag.id"
              style="height: 20px;"
            >
              <q-icon :class="{ [`text-${tag.color}`]: true, 'col-1': true }" name="local_offer" />
              <span class="col-9">{{tag.name}}</span>
              <div class="col-2 row justify-end items-center">
                <q-btn
                  class="edit"
                  icon="edit"
                  rounded
                  flat
                  dense
                  size="sm"
                  @click.stop="handleEditTag(tag)"
                />
                <q-btn
                  class="edit"
                  icon="delete"
                  rounded
                  flat
                  dense
                  size="sm"
                  @click.stop="handleDeleteTag(tag)"
                />
                <q-icon name="check" v-if="containerTags.includes(tag.id)" />
              </div>
            </div>
          </div>
        </q-scroll-area>
      </q-card-section>
      <q-card-section v-if="currentTag">
        <q-input
          v-model="name"
          dense
          autofocus
          placeholder="Name"
          @input="delayTouch($v.name, $options.touchMap)"
          :error="$v.name.$error"
          :hide-bottom-space="!$v.name.$error"
          :error-message="!$v.name.required ? 'Tag name is required' : !$v.name.isUnique ? 'THe tag name was already taken' : ''"
        />
        <div class="row justify-between q-pt-md">
          <div
            :class="{[`bg-${color}`]: true, 'tag-color': true, 'best-hover': true, row: true, 'justify-center': true, 'items-center': true}"
            v-for="(color, index) in tagColors"
            :key="index"
            @click="selectedColor=color"
          >
            <q-icon name="check" size="24px" color="white" v-if="color === selectedColor" />
          </div>
        </div>
      </q-card-section>
      <q-separator v-if="currentTag" />
      <q-card-section class="row justify-end q-gutter-x-md" v-if="currentTag">
        <q-btn color="primary" label="Cancel" outline @click="cancel" />
        <q-btn
          color="primary"
          label="Create"
          :loading="loading"
          @click="manageTag('create')"
          v-if="!currentTag.id"
        />
        <q-btn color="primary" label="Update" :loading="loading" @click="manageTag('edit')" v-else />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import tagColors from '../../constants/tagColors'
import { delayTouch, notifyFailure } from 'src/utils'
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'ManageTagsDialog',
  touchMap: new WeakMap(),
  data () {
    return {
      tagColors,
      openModal: false,
      name: '',
      search: '',
      selectedColor: tagColors[0],
      currentTag: true,
      loading: false,
      containerId: '',
      containerType: 'deal',
      callback: null
    }
  },
  computed: {
    ...mapGetters({
      dealSettings: 'settings/deal',
      projectSettings: 'settings/project',
      dealById: 'deals/dealById',
      projectById: 'projects/projectById'
    }),
    tags () {
      if (this.containerType === 'deal') {
        return this.dealSettings.tags || []
      } else if (this.containerType === 'project') {
        return this.projectSettings.tags || []
      } else {
        return []
      }
    },
    containerTags () {
      return this[`${this.containerType}ById`](this.containerId).tags || []
    },
    filteredTags () {
      if (this.search) {
        return this.tags.filter(tag => tag.name.indexOf(this.search) !== -1)
      }
      return this.tags
    },
    showCreateTag () {
      if (this.search && this.filteredTags.length === 0) return true
      return !this.search
    }
  },
  validations: {
    name: {
      required,
      isUnique (value) {
        if (this.loading) return true
        if (!value) return true
        return !this.tags.find(tag => tag.name === value)
      }
    }
  },
  methods: {
    open (container, tag, callback) {
      this.openModal = true
      this.containerType = container.type
      this.containerId = container.id
      this.callback = callback
      this.reset(tag)
    },
    go () {
      const defaultName =
        this.filteredTags.length === 0 && this.search ? this.search : ''
      this.reset({
        name: defaultName
      })
      this.$nextTick(() => {
        this.name = defaultName
      })
    },
    handleEditTag (tag) {
      this.reset(tag)
      this.$nextTick(() => {
        this.name = tag.name
      })
    },
    handleDeleteTag (tag) {
      this.$q
        .dialog({
          title: 'Confirm',
          message: 'Do you really want to delete this tag?',
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          return this.$firebase.setting[this.containerType].tag.delete({
            containerType: this.containerType,
            tag
          })
        })
    },
    async manageTag (type) {
      this.loading = true
      if (this.$v.name.$invalid) {
        this.$v.name.$touch()
        notifyFailure('You have some errors in the form')
        setTimeout(() => {
          this.loading = false
        }, 1000)
        throw new Error('You have some errors in the form')
      }

      try {
        if (type === 'create') {
          const tagCreate = this.$firebase.setting[this.containerType].tag
            .create
          const response = await tagCreate({
            containerType: this.containerType,
            name: this.name,
            color: this.selectedColor
          })
          await this.$firebase[this.containerType].update({
            id: this.containerId,
            tags: [...this.containerTags, response]
          })
          if (this.callback) {
            this.callback(response)
          }
        } else if (type === 'edit') {
          await this.$firebase.setting[this.containerType].tag.update({
            ...this.currentTag,
            containerType: this.containerType,
            name: this.name,
            color: this.selectedColor
          })
        }
      } catch (error) {
        notifyFailure(error.message)
      }
      this.currentTag = null
      this.loading = false
    },
    async toggleTag (id) {
      let containerTags = this.containerTags
      if (containerTags.includes(id)) {
        containerTags = this.containerTags.filter(tagId => tagId !== id)
      } else {
        containerTags = [...containerTags, id]
      }
      await this.$firebase[this.containerType].update({
        id: this.containerId,
        tags: containerTags
      })
    },
    cancel () {
      this.openModal = false
    },
    reset (tag) {
      this.search = ''
      this.name = tag ? tag.name : ''
      this.selectedColor = tag ? tag.color || tagColors[0] : tagColors[0]
      this.currentTag = tag
    },
    delayTouch
  }
}
</script>

<style>
.tag-color {
  width: 30px;
  height: 30px;
  border-radius: 15px;
  cursor: pointer;
}
</style>
