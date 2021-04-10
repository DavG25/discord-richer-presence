<template>
  <div class="box">
    <h5 class="title is-5">
      External profiles <span
        v-tooltip="'Save current client configs to share them or import them from others'"
        class="is-tooltip"
      >?</span>
    </h5>
    <div class="buttons">
      <button
        class="button is-success is-outlined"
        :disabled="formData.isLoading"
        @click="exportSettings"
      >
        <span class="icon">
          <FontAwesomeIcon icon="download" />
        </span>
        <span>Save current client configs to file</span>
      </button>

      <button
        class="button is-info is-outlined"
        :disabled="formData.isLoading"
        @click="importSettingFromConfig"
      >
        <span class="icon">
          <FontAwesomeIcon icon="upload" />
        </span>
        <span>Load client configs from file</span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  computed: {
    ...mapGetters({
      client: "client/client",
      formData: "profiles/formData"
    })
  },
  methods: {
    goToClientPage() {
      window.scrollTo(0, 0)
      this.$router.push({ name: 'Home'})
    },
    exportSettings: async function () {
      if (!this.client.id.trim() || !this.client.isValid) {
        this.$toast.error('The current client configs don\'t have a valid client ID')
        this.goToClientPage()
        return
      }

      /**
       * Export current settings to local file
       */
      this.formData.isLoading = true
      const settings = await this.$store.dispatch('client/export')
      this.formData.isLoading = false
      const filename = `${this.client.data.name ? this.client.data.name : 'Rich Presence Profile'} (${(Date.now() / 1000).toFixed(0)})`


      window.electron.dialog.showSaveDialog({defaultPath: `${filename}`, title: "Select where to save the file", filters: [{name: "Discord Richer Presence", extensions: ["DiscordRP"]}] }).then(result => {
        if (result.canceled) return

        window.electron.fs.writeFile(result.filePath, settings, 'utf8', ((err) => {
          if (err) {
            this.$toast.error('Unable to save client configs to file')
            return
          }
          this.$toast.success('Client configs saved to file')
        }))
      })
    },
    importSettingFromConfig: async function () {
      window.electron.dialog.showOpenDialog({ properties: ['openFile'], title: "Select the file to load", filters: [{name: "Discord Richer Presence", extensions: ["DiscordRP", "dmpc"]}] }).then(result => {
        if (result.canceled) return
        window.electron.fs.readFile(result.filePaths[0], "utf8", async (err, settings) => {
          if (err) {
            this.$toast.error('Unable to load client configs from file')
            return
          }

          settings = await this.$store.dispatch('profiles/format', {profileConfigs: settings})

          this.formData.isLoading = true
          let imported = await this.$store.dispatch('client/import', {settings: settings})
          this.formData.isLoading = false
          if (imported) {
            this.$toast.success('Client configs loaded from file')
            this.goToClientPage()
          }
          else this.$toast.error('Unable to load client configs from file')
        })
      })
    },
  },
}
</script>