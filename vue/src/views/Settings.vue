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
        <Import v-if="isDiscordMagicPresenceInstalled" />
      </div>
    </div>
  </div>
</template>

<script>
import Manager from '@/components/Settings/Manager.vue'
import Import from '@/components/Settings/Import.vue'

export default {
  name: 'Settings',
  components: {
    Manager,
    Import
  },
  data() {
    return {
      isDiscordMagicPresenceInstalled: false
    }
  },
  mounted () {
    let path = `${window.electron.app.getPath('appData')}\\DG25-DMP\\settings.dcfg`
    window.electron.fs.access(path, window.electron.fs.F_OK, (err) => {
      if (err) this.isDiscordMagicPresenceInstalled = false
      else this.isDiscordMagicPresenceInstalled = true
    })
  },
}
</script>

<style scoped>
/* .input:read-only {
    background-color: #fff0;
    color: #ffffff;
} */
</style>