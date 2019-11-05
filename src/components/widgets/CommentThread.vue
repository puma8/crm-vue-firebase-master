<template>
  <div>
    <div class="full-width row">
      <avatar :username="myProfile.name" :src="myProfile.photoUrl" :size="30" style="margin-left: -8px" />
      <div class="best-rounded bg-white flex-1 row items-center q-px-sm q-ml-md">
        <q-input class="flex-1" placeholder="Write a comment" type="textarea" autogrow borderless dense v-model="text" />
        <q-btn icon="send" dense flat @click="postComment" :loading="loading" />
      </div>
    </div>
    <h6 class="label-separator"><span>PAST</span></h6>
    <ul class="timeline timeline--dense timeline--dense--right">
      <li class="timeline__entry timeline__entry--icon" v-for="comment in comments" :key="comment.id">
        <div class="timeline__dot text-secondary">
          <avatar
            class="timeline__dot-img"
            :username="commentCreatorProfile(comment).name"
            :src="commentCreatorProfile(comment).photoUrl"
            :size="30"
          />
        </div>
        <div class="timeline__content">
          <div class="full-width best-rounded bg-white q-pa-sm">
            <div class="row justify-between items-center">
              <span class="text-subtitle1">{{comment.text}}</span>
              <q-btn flat round dense icon="more_horiz" />
            </div>
            <div class="row justify-between">
              <span class="text-grey-5">{{commentCreatorProfile(comment).name}}</span>
              <span class="text-grey-5">{{comment.createdAt | fromNow}}</span>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import Avatar from 'vue-avatar'
import { mapGetters } from 'vuex'
import { fromNow } from 'src/utils/filters'

export default {
  name: 'CommentThread',
  props: ['comments', 'loading'],
  components: {
    avatar: Avatar
  },
  data () {
    return {
      text: ''
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
      userById: 'users/userById'
    }),
    myProfile () {
      return {
        name: this.currentUser.name || 'Unknown',
        photoUrl: this.currentUser.photoUrl
      }
    }
  },
  filters: { fromNow },
  methods: {
    postComment () {
      this.$emit('post-comment', this.text)
      this.text = ''
    },
    commentCreatorProfile (comment) {
      if (!comment.isCreatorMavrikUser) return { name: comment.creatorName }
      const user = this.userById(comment.createdBy) || {}
      return {
        name: user.name || 'Unknown',
        photoUrl: user.photoUrl
      }
    }
  }
}
</script>
