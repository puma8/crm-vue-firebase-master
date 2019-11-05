<template>
  <div class="row justify-center">
    <div class="box">
      <form>
        <h4 class="text-capitalize">{{ $route.name }}</h4>
        <q-input
          v-if="isSignUp"
          label="Organization Name"
          v-model="orgName"
          @input="delayTouch($v.orgName, $options.touchMap)"
          :error="$v.orgName.$error"
        />
        <div v-if="isSignUp" class="row justify-center">
          <q-input
            class="col-6"
            label="First Name"
            v-model="firstName"
            @input="delayTouch($v.firstName, $options.touchMap)"
            :error="$v.firstName.$error"
          />
          <q-input
            class="col-6"
            label="Last Name"
            v-model="lastName"
            @input="delayTouch($v.lastName, $options.touchMap)"
            :error="$v.lastName.$error"
          />
        </div>
        <q-input
          label="Email"
          v-model="email"
          type="email"
          @input="delayTouch($v.email, $options.touchMap)"
          :error="$v.email.$error"
        />
        <q-input
          label="Password"
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          :error="$v.password.$error"
          @input="delayTouch($v.password, $options.touchMap)"
          @keyup.enter="authenticate(); $event.target.blur()"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
        <q-input
          v-if="isSignUp"
          label="Verify Password"
          v-model="passwordMatch"
          :type="isPwd ? 'password' : 'text'"
          :error="$v.passwordMatch.$error"
          @input="delayTouch($v.passwordMatch, $options.touchMap)"
          @keyup.enter="authenticate(); $event.target.blur()"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
        <div class="row justify-center items-center q-gutter-x-md" v-if="!isSignUp">
          <span>Don't you have an account?</span>
          <q-btn flat dense label="Register" @click="goToRegister" />
        </div>
        <div v-else class="row justify-center items-center q-gutter-x-md">
          <span>Do you have an account?</span>
          <q-btn flat dense label="Login" @click="goToLogin" />
        </div>
        <div class="flex justify-end">
          <q-btn
            class="q-mt-lg"
            color="primary"
            :label="getAuthType"
            :loading="loading"
            @click="authenticate"
          >
            <template v-slot:loading>
              <q-spinner-gears />
            </template>
          </q-btn>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { required, email, sameAs } from 'vuelidate/lib/validators'
import { delayTouch, notifyFailure } from 'src/utils'

export default {
  name: 'Auth',
  touchMap: new WeakMap(),
  computed: {
    isSignUp () {
      return this.$route.name === 'register'
    },
    getAuthType () {
      return this.isSignUp ? 'Register' : 'Login'
    }
  },
  validations: {
    orgName: { required },
    firstName: { required },
    lastName: { required },
    email: { required, email },
    password: {},
    passwordMatch: {
      sameAsPassword: sameAs(function () {
        return this.password
      })
    }
  },
  data () {
    return {
      isPwd: true,
      orgName: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordMatch: '',
      loading: false
    }
  },
  methods: {
    goToRegister () {
      this.resetFormFields()
      this.$router.push({ name: 'register' })
    },
    goToLogin () {
      this.resetFormFields()
      this.$router.push({ name: 'login' })
    },
    authenticate () {
      this.loading = true
      this.checkCredentials()
      const nextPath = (this.$route.query || {}).redirect
      this.performAuthentication()
        .then(user => {
          this.loading = false
          this.resetFormFields()
          if (!nextPath) {
            this.$router.push({ name: 'deals' })
          } else {
            this.$router.push(nextPath)
          }
        })
        .catch(error => {
          notifyFailure(`Looks like there is an issue: ${error.message}`)
          this.loading = false
        })
    },
    checkCredentials () {
      if (this.$v.email.$invalid || this.$v.password.$invalid) {
        this.$v.email.$touch()
        this.$v.password.$touch()

        notifyFailure('Email or password is invalid')
        setTimeout(() => {
          this.loading = false
        }, 1000)
        throw new Error('Email or password is invalid')
      }

      if (this.isSignUp && (
        this.$v.orgName.$invalid ||
        this.$v.firstName.$invalid ||
        this.$v.lastName.$invalid
      )) {
        this.$v.orgName.$touch()
        this.$v.firstName.$touch()
        this.$v.lastName.$touch()

        notifyFailure('You have has invalid inputs')
        setTimeout(() => {
          this.loading = false
        }, 1000)
        throw new Error('You have has invalid inputs')
      }

      if (this.isSignUp && this.$v.passwordMatch.$invalid) {
        this.$v.password.$touch()
        this.$v.passwordMatch.$touch()

        notifyFailure('Your password don\'t match')
        setTimeout(() => {
          this.loading = false
        }, 1000)
        throw new Error('Password Mismatch')
      }
    },
    performAuthentication () {
      return this.isSignUp
        ? this.$firebase.signUp({
          orgName: this.orgName,
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password
        })
        : this.$firebase.login(this.email, this.password)
    },
    resetFormFields () {
      this.orgName = ''
      this.firstName = ''
      this.lastName = ''
      this.email = ''
      this.password = ''
      this.passwordMatch = ''
      this.$v.$reset()
    },
    delayTouch
  }
}
</script>

<style>
  .box {
    width: 500px;
    height: 500px;
  }
</style>
