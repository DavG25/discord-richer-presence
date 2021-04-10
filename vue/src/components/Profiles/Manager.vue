<template>
  <div class="box">
    <div class="columns is-multiline">
      <div class="column is-8">
        <h5 class="title is-5">
          Profiles <span
            v-tooltip="'Profiles allow you to store custom client configs to quickly switch between them'"
            class="is-tooltip"
          >?</span>
        </h5>
      </div>

      <div class="column is-4">
        <p class="control has-icons-left">
          <input
            v-model="profilesQuery"
            class="input"
            type="text"
            placeholder="Search by name"
            :disabled="profiles && profiles.length < 1"
          >
          <span class="icon is-small is-left">
            <FontAwesomeIcon icon="search" />
          </span>
        </p>
      </div>
    </div>
    <hr>


    <div
      v-if="filteredProfiles && filteredProfiles.length == 0 && profilesQuery"
      class="columns is-multiline"
    >
      <div class="column is-10 pt-1 pb-0">
        <p> No results </p>
      </div>
    </div>
    <div
      v-if="profiles.length == 0"
      class="columns is-multiline"
    >
      <div class="column is-10 pt-1 pb-0">
        <p> Nothing here yet, validate a client to create a new profile </p>
      </div>
    </div>
    <div
      v-for="(profile, index) in filteredProfiles"
      :key="index"
    >
      <hr v-if="index>0">
      <div class="columns is-multiline">
        <div class="column is-9 pt-1 pb-0">
          <span class="icon-text">
            <figure class="image is-32x32">
              <img
                v-if="profileIcon(profile)"
                :src="profileIcon(profile)"
                class="client-image"
                @error="$store.dispatch('profiles/updateIcon', {profile: profile, icon_url: null})"
              >
              <img
                v-else
                src="/img/question-cube.svg"
              >
            </figure>
            <span class="ml-2 mt-1">{{ profile.name }}</span>
          </span>
        </div>

        <div class="column is-3 pt-0 pb-0">
          <div class="buttons is-justify-content-flex-end">
            <button
              v-tooltip="'Save current client configs to this profile'"
              class="button is-success is-outlined"
              :disabled="formData.isLoading"
              @click="updateProfile(profile.name)"
            >
              <span class="icon">
                <FontAwesomeIcon icon="save" />
              </span>
            </button>
            <button
              v-tooltip="'Load client configs from this profile'"
              class="button is-info is-outlined"
              :disabled="formData.isLoading"
              @click="importSettingsFromProfile(profile.name)"
            >
              <span class="icon">
                <FontAwesomeIcon icon="file-import" />
              </span>
            </button>
            <button
              v-tooltip="'Delete this profile'"
              class="button is-danger is-outlined"
              :disabled="formData.isLoading"
              @click="deleteProfile(profile.name)"
            >
              <span class="icon">
                <FontAwesomeIcon icon="trash" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <hr>
    <div class="columns is-multiline">
      <div class="column is-6">
        <p class="control has-icons-left">
          <input
            v-model="formData.newProfileName"
            class="input"
            type="text"
            maxlength="60"
            placeholder="New profile name"
            :disabled="formData.isLoading"
          >
          <span class="icon is-small is-left">
            <FontAwesomeIcon icon="pen" />
          </span>
        </p>
      </div>
      <div class="column is-6">
        <button
          class="button is-success is-outlined"
          :disabled="!formData.newProfileName.trim() || formData.isLoading"
          @click="createProfile"
        >
          <span class="icon">
            <FontAwesomeIcon icon="plus" />
          </span>
          <span>Create profile with current client configs</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  data() {
    return {
      profilesQuery: ""
    }
  },
  computed: {
    ...mapGetters({
      client: "client/client",
      profiles: "profiles/profiles",
      icons: "profiles/icons",
      formData: "profiles/formData",
    }),
    filteredProfiles (){
      if(this.profilesQuery != ""){
        return this.profiles.filter((profile)=>{
          return profile.name.toLowerCase().includes(this.profilesQuery.toLowerCase())
        })
      }else{
        return this.profiles
      }
    },
  },
  mounted () {
    // this.$store.dispatch('profiles/loadMissingIcons')
  },
  methods: {
    goToClientPage() {
      window.scrollTo(0, 0)
      this.$router.push({ name: 'Home'})
    },
    profileIcon(profile) {
      const clientId = JSON.parse(profile.settings).client.id
      let icon = this.icons.filter((icon)=>{
        return icon.clientId === clientId
      })
      icon = icon[0] ? icon[0].icon_url : null
      return icon
    },
    createProfile: async function() {
      if (!this.client.id.trim() || !this.client.isValid) {
        this.$toast.error('The current client configs don\'t have a valid client ID')
        this.goToClientPage()
        return
      }
      const settings = await this.$store.dispatch('client/export')
      const created = await this.$store.dispatch('profiles/create', {profileName: this.formData.newProfileName, settings: settings, updateProfiles: true})
      if (created) this.formData.newProfileName = ""
      /*
       * Add client icon
       * this.loadClientsIcons()
       */
      this.$store.commit('profiles/ADD_icon', {clientId: this.client.id, icon_url: this.client.data.icon_url})
    },
    updateProfile: async function(profileName) {
      if (!this.client.id.trim() || !this.client.isValid) {
        this.$toast.error('The current client configs don\'t have a valid client ID')
        this.goToClientPage()
        return
      }
      const settings = await this.$store.dispatch('client/export')
      const saved = await this.$store.dispatch('profiles/update', {profileName: profileName, settings: settings, updateProfiles: true})
      this.$store.commit('profiles/ADD_icon', {clientId: this.client.id, icon_url: this.client.data.icon_url})
    },
    deleteProfile: async function(profileName) {
      const deleted = await this.$store.dispatch('profiles/delete', {profileName: profileName, updateProfiles: true})
      if (deleted) this.formData.selectedProfile = null
    },
    importSettingsFromProfile: async function(profileName) {
      const profile = this.profiles.filter(profile => {
        return profile.name === profileName
      })
      const settings = profile[0].settings
      this.formData.isLoading = true
      const imported = await this.$store.dispatch('client/import', {settings: settings})
      this.formData.isLoading = false
      if (imported) { 
        this.$toast.success('Client configs loaded from profile')
        this.goToClientPage()
      }
      else this.$toast.error('Unable to load client configs from profile')
    }
  },
}
</script>