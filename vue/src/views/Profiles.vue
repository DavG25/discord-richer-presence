<template>
  <div
    class="container"
    style="margin-top: 30px;"
  >
    <div class="columns is-multiline">
      <div class="column is-12">
        <Manager />
      </div>
      <div class="column is-12">
        <Files />
      </div>
    </div>
  </div>
</template>

<script>
import Files from '@/components/Profiles/Files.vue'
import Manager from '@/components/Profiles/Manager.vue'

export default {
  name: 'Profiles',
  components: {
    Files,
    Manager
  },
  mounted () {
    this.loadProfiles()
  },
  methods: {
    loadProfiles: async function() {
      this.$store.dispatch('profiles/loadList')
    }
  },
}
</script>