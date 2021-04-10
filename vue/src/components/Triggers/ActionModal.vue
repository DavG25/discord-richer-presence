<template>
  <div
    ref="modal"
    class="modal"
  >
    <div class="modal-background" />
    <div class="modal-card">
      <header class="modal-card-head">
        <div
          class="columns"
          style="width: 100%;"
        >
          <div class="column is-6">
            <p class="modal-card-title">
              Edit trigger
            </p>
          </div>
          <div class="column is-6">
            <div class="field">
              <p class="control has-icons-left">
                <input
                  v-model="profilesQuery"
                  class="input"
                  type="text"
                  placeholder="Search by name"
                  :disabled="!profiles"
                >
                <span class="icon is-small is-left">
                  <FontAwesomeIcon icon="search" />
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>
      <section
        ref="modalContent"
        class="modal-card-body"
      >
        <!-- List all profiles -->
        <div
          v-if="filteredProfiles && filteredProfiles.length == 0 && profilesQuery"
          class="columns is-multiline"
        >
          <div class="column is-10 pt-2 pb-2">
            <p> No results </p>
          </div>
        </div>


        <div
          v-for="(profile, index) in filteredProfiles"
          :key="index"
        >
          <hr v-if="index>0">

          <h4
            v-if="index==0 && !profilesQuery"
            class="subtitle is-4 pb-1"
          >
            Perform an action
          </h4>
          <h4
            v-if="index==2 && !profilesQuery"
            class="subtitle is-4 pb-2"
          >
            Load and run a profile
          </h4>
          <div class="columns is-multiline">
            <!-- Actions -->
            <div
              v-if="profile.action == true || profile.action == false"
              class="column is-10 pt-2 pb-0"
            >
              <span class="icon-text">
                <span class="icon">
                  <figure class="image is-24x24">
                    <FontAwesomeIcon :icon="profile.action ? 'stop-circle' : 'ban'" />
                  </figure>
                </span>
                <span class="ml-1">{{ profile.name }}</span>
              </span>
            </div>

            <!-- Profiles -->
            <div
              v-if="profile.action == null"
              class="column is-10 pt-2 pb-0"
            >
              <span class="icon-text">
                <span class="icon">
                  <figure class="image is-24x24">
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
                </span>
                <span class="ml-1">{{ profile.name }}</span>
              </span>
            </div>

            <!-- Confirm button -->
            <div class="column is-2 pt-0 pb-0">
              <div class="buttons is-justify-content-flex-end">
                <button
                  v-tooltip="{content: (profile.action == true || profile.action == false ? 'Use this action' : 'Use this profile'), boundariesElement: $refs.modal}"
                  class="button is-info is-outlined"
                  :disabled="formData.isLoading"
                  @click="setAction(profile)"
                >
                  <span class="icon">
                    <FontAwesomeIcon icon="check" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="profiles && profiles.length == 0 && !profilesQuery"
          class="columns is-multiline"
        >
          <div class="column is-12">
            <hr>
            <h4 class="subtitle is-4">
              Load and run a profile
            </h4>
            <span> No profiles yet, create one to link it to this trigger </span>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button"
          @click="closeModal"
        >
          Close
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  props: {
    showActionModal: {
      type: Boolean,
      default: false
    },
    triggerToEdit: {
      type: Object,
      default: () => {return {}}
    }
  },
  data() {
    return {
      profilesQuery: "",
      profilesError: null,
      fetching: false,
      systemActions: [
        {name: "Nothing", action: false},
        {name: "Stop client", action: true}
      ]
    }
  },
  computed: {
    compundProfiles() {
      return this.systemActions.concat(this.profiles)
    },
    filteredProfiles (){
      if(this.profilesQuery != ""){
        return this.compundProfiles.filter((profile)=>{
          return profile.name.toLowerCase().includes(this.profilesQuery.toLowerCase())
        })
      }else{
        return this.compundProfiles
      }
    },
    ...mapGetters({
      formData: "triggers/formData",
      profiles: "profiles/profiles",
      icons: "profiles/icons",
    }),
  },
  watch: {
    showActionModal(newValue, oldValue) {
      /**
       * Clear data when the modal is shown / hidden
       */
      this.$refs.modalContent.scrollTop = 0
      this.profilesQuery = ""
    }
  },
  mounted () {
    // this.$store.dispatch('profiles/loadMissingIcons')
  },
  methods: {
    profileIcon(profile) {
      const clientId = JSON.parse(profile.settings).client.id
      let icon = this.icons.filter((icon)=>{
        return icon.clientId === clientId
      })
      icon = icon[0] ? icon[0].icon_url : null
      return icon
    },
    /**
     * Set the associated profile (or action) to the trigger
     */
    setAction: async function (profile) {
      let action
      if (profile.action == true || profile.action == false) action = profile.action
      else action = profile.name

      this.formData.isLoading = true
      await this.$store.dispatch('triggers/update', {path: this.triggerToEdit.path, action: action, updateTriggers: true})
      this.formData.isLoading = false
      this.$emit('closeModal')
    },
    /**
     * Close the action modal
     */
    closeModal: async function () {
      this.$emit('closeModal')
    },
  },
}
</script>