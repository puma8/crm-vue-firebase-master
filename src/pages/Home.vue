<template>
  <div>
    <q-btn color="primary" label="Login" @click="$router.push('/login')"></q-btn>
    <q-btn color="primary" label="Register" @click="$router.push('/register')"></q-btn>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>
