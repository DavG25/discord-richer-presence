<template>
  <div class="box">
    <h5 class="title is-5">
      Settings
    </h5>

    <div class="field">
      <label class="checkbox">
        <input
          v-model="settings.runAtBoot"
          type="checkbox"
          @change="updateSettings"
        >
        Autorun application at computer startup
      </label>
    </div>
    <div class="field ml-4">
      <label class="checkbox">
        <input
          v-model="settings.runAsMinimized"
          type="checkbox"
          :disabled="!settings.runAtBoot"
          @change="updateSettings"
        >
        Run as minimized window
      </label>
    </div>

    <!--
      <hr>
      <div class="field">
      <label class="checkbox">
      <input type="checkbox" v-model="settings.trayIconOnMinimize" @change="updateSettings">
      Use tray icon when application is minimized
      </label>
      </div> 
    -->

    <hr>

    <div class="field">
      <label class="checkbox">
        <input
          v-model="settings.autoLoadProfile"
          type="checkbox"
          @change="updateSettings"
        >
        Load a profile when the application starts
      </label>
    </div>
    <div class="field ml-4">
      <label class="checkbox">
        Profile to load
      </label>
      <br>
      <div
        class="select"
        style="width: 50%;"
      >
        <select
          v-model="settings.autoLoadProfileName"
          style="width: 100%;"
          :disabled="!settings.autoLoadProfile"
          @change="updateSettings"
        >
          <option
            value=""
            :selected="!settings.autoLoadProfileName"
            class="has-text-info"
          >
            Select a profile
          </option>
          <option
            v-for="(profile, index) in profiles"
            :key="index"
            :value="profile.name"
          >
            {{ profile.name }}
          </option>
        </select>
      </div>
    </div>
    <div class="field ml-4">
      <label class="checkbox">
        <input
          v-model="settings.autoStartProfile"
          type="checkbox"
          :disabled="!settings.autoLoadProfile"
          @change="updateSettings"
        >
        Start client after loading the profile
      </label>
    </div>

    <hr>

    <p> App version: {{ appVersion }} </p>
    <p v-if="!updateDownloaded">
      You will receive a notification when an update is available 
    </p>
    <p v-if="updateDownloaded">
      An update is available, click on 
      <FontAwesomeIcon 
        icon="arrow-down" 
        class="has-text-success" 
      />
      to install it
    </p>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  computed: {
    ...mapGetters({
      settings: "settings/settings",
      profiles: "profiles/profiles",
      updateDownloaded: "settings/updateDownloaded"
    }),
    appVersion() {
      return window.electron.app.getVersion() || "unknown"
    }
  },
  mounted () {
    this.loadSettings()
    this.checkProfile()
  },
  methods: {
    updateSettings: function(silent = false) {
      this.$store.dispatch('settings/set', {settings: this.settings, silent: silent})
    },
    loadSettings: async function() {
      await this.$store.dispatch('settings/get')
    },
    /**
     * Check if the selected profile in the settings still exists, if not, reset to default selection
     */
    checkProfile() {
      if (!this.settings.autoLoadProfileName) return
      let profileByName = this.profiles.findIndex(profile => {
        return profile.name === this.settings.autoLoadProfileName
      })
      if (profileByName == -1) {
        console.log("Resetting autorun profile setting because the linked profile was deleted:", this.settings.autoLoadProfileName)
        this.settings.autoLoadProfileName = ""
        this.updateSettings(true)
      }
    }
  },
}
</script>
