<template>
  <div class="box">
    <div class="columns is-multiline">
      <div class="column is-8">
        <h5 class="title is-5">
          Triggers <span
            v-tooltip="'Triggers allow you to automatically perform an action or run a profile when an application is launched'"
            class="is-tooltip"
          >?</span>
        </h5>
      </div>

      <div class="column is-4">
        <p class="control has-icons-left">
          <input
            v-model="triggersQuery"
            class="input"
            type="text"
            placeholder="Search by name"
            :disabled="!triggers || formData.isLoading || (triggers && triggers.length < 2)"
          >
          <span class="icon is-small is-left">
            <FontAwesomeIcon icon="search" />
          </span>
        </p>
      </div>
    </div>

    <label class="checkbox">
      <input
        v-model="formData.enabled"
        type="checkbox"
        :disabled="formData.isLoading"
        @change="updateTriggersStatus"
      >
      Enable triggers
    </label>
    <span
      v-tooltip="'Toggle triggers status, please wait a few seconds after activating them'"
      class="is-tooltip"
    >?</span>

    <div class="content mt-3">
      <p> Last action performed by triggers: {{ lastMessage }} </p>
    </div>

    <hr>
    <div
      v-if="filteredTriggers && filteredTriggers.length == 0 && triggersQuery"
      class="columns is-multiline"
    >
      <div class="column is-10 pt-4 pb-2">
        <p> No results </p>
      </div>
    </div>
    <div
      v-for="(trigger, index) in filteredTriggers"
      :key="trigger.path"
    >
      <hr v-if="index>0">
      <div class="columns is-multiline">
        <div
          class="column is-5 pt-0 pb-0"
          :class="{'is-active': trigger.path == activeTrigger.path && formData.enabled}"
        >
          <label>
            When running
          </label>

          <!-- Path or window name if it has no path -->
          <p class="control has-icons-left has-icons-right">
            <input
              v-tooltip="trigger.path || emptyTriggerText"
              class="input is-transparent"
              type="text"
              placeholder="Program path"
              :value="trigger.path ? ((trigger.name || trigger.path.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, '')) + ` <${trigger.path}>`) : emptyTriggerText"
              readonly
              :class="{'has-background-success': trigger.path == activeTrigger.path && formData.enabled}"
            >
            <span class="icon is-small is-left">
              <figure
                v-if="trigger.path != false"
                class="image is-24x24"
              >
                <img
                  v-if="trigger.base64_icon"
                  :src="'data:image/png;base64,'+trigger.base64_icon"
                  @error="trigger.base64_icon = null"
                >
                <img
                  v-else
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABpElEQVRYR+2Wy0rDQBSGTze51UVIspDgot6wCxcufAKfSXAhSmMpqBRBQXwbn0MRotbSpWRnlTQjR0mZJDOdE1vTLjqblnQy/zffOZO0BnMetTnnwxJgcQx0Lrqsyn44Pjr82fzYwGAwqBTA9/0sQBRFlQLYtq024HketO/fS1Xm5MAhzdc0rQjw8PgEzZ3t8QIIsH/XhzgBiEcMYsYgHgHECfu9hp94Pf2eMBgGm38HyN+JAHu3fXJ4kgB8tacAEBnYvXkj7RzDcUwFIDLQvO4ptafhVADGGOi6TuuBravexJrz4SoADE6HEEBkoNF9lTZcPlwEwIfy65MNrF0iQLHbReEpgCxUCSAysHr+UjhqsnC8//NsQ3oMeTDDMGg94HWeM+d8UrgIQGZDCCAyYLcRAB82DFThKQClBGSAlSAkhyPAMFgnlcA0TfW7wHVdMFshaedpah5AZoMMoJ+GpGc7D0Apwb8BfLQapBJYlkUrQVkDeQCZDRKA44jf7RTFqjmlAVQLonfVHP73er2eLUGpTpvh5MX5Wz7DTZVaamlg7ga+AW2WjjDdn6vvAAAAAElFTkSuQmCC"
                >
              </figure>
              <span
                v-if="trigger.path == false"
                class="icon"
              >
                <FontAwesomeIcon icon="ban" />
              </span>
            </span>
          </p>
        </div>

        <div
          class="column is-5 pt-0 pb-0"
          :class="{'is-active': trigger.path == activeTrigger.path && formData.enabled}"
        >
          <label v-if="trigger.action == true || trigger.action == false">
            Perform this action
          </label>
          <label v-if="typeof trigger.action === 'string'">
            Load and run this profile
          </label>
          <br>

          <!-- Action -->
          <p
            v-if="trigger.action == true || trigger.action == false"
            class="control has-icons-left has-icons-right"
          >
            <input
              v-tooltip="trigger.action ? 'Stop client' : 'Nothing'"
              class="input is-transparent"
              type="text"
              placeholder="Program path"
              :value="trigger.action ? 'Stop client' : 'Nothing'"
              readonly
              :class="{'has-background-success': trigger.path == activeTrigger.path && formData.enabled}"
            >
            <span class="icon is-small is-left">
              <span class="icon">
                <FontAwesomeIcon :icon="trigger.action ? 'stop-circle' : 'ban'" />
              </span>
            </span>
          </p>
          <!-- Profile -->
          <p
            v-if="typeof trigger.action === 'string'"
            class="control has-icons-left has-icons-right"
          >
            <input
              v-tooltip="trigger.action"
              class="input is-transparent"
              type="text"
              placeholder="Program path"
              :value="trigger.action"
              readonly
              :class="{'has-background-success': trigger.path == activeTrigger.path && formData.enabled}"
            >
            <span class="icon is-small is-left">
              <figure class="image is-24x24">
                <img
                  v-if="profileIcon(trigger.action)"
                  :src="profileIcon(trigger.action)"
                  class="client-image"
                  @error="updateProfileIcon(trigger.action)"
                >
                <img
                  v-else
                  src="/img/question-cube.svg"
                >
              </figure>
            </span>
          </p>
        </div>
                

        <div class="column is-2 pt-0 pb-0">
          <label>
            <br>
          </label>
          <div class="buttons is-justify-content-flex-end">
            <button
              v-tooltip="'Edit this trigger'"
              class="button is-info is-outlined"
              :disabled="formData.isLoading"
              @click="$emit('editTrigger', trigger)"
            >
              <span class="icon">
                <FontAwesomeIcon icon="edit" />
              </span>
            </button>

            <button
              v-tooltip="'Delete this trigger'"
              class="button is-danger is-outlined"
              :disabled="!trigger.path || formData.isLoading"
              @click="deleteTrigger(trigger.path)"
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
      <div class="column is-12">
        <div class="buttons">
          <!--
            <button class="button is-success is-outlined" v-on:click="createTriggerByFile" :disabled="formData.isLoading" v-bind:class="{'is-loading': formData.isLoading}">
            <span class="icon">
            <FontAwesomeIcon icon="plus" />
            </span>
            <span>Create trigger by application path</span>
            </button> 
          -->
          <button
            class="button is-success is-outlined"
            :disabled="formData.isLoading"
            :class="{'is-loading': formData.isLoading}"
            @click="createTriggerByProcess"
          >
            <span class="icon">
              <FontAwesomeIcon icon="plus" />
            </span>
            <span>Create trigger from currently running applications</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  data() {
    return {
      triggersQuery: "",
      executablesIcons: [],
      emptyTriggerText: "Nothing from this list"
    }
  },
  computed: {
    ...mapGetters({
      client: "client/client",
      profiles: "profiles/profiles",
      profileIcons: "profiles/icons",
      triggers: "triggers/triggers",
      formData: "triggers/formData",
      activeTrigger: "triggers/activeTrigger",
      lastMessage: "triggers/lastMessage"
    }),
    filteredTriggers (){
      if(this.triggersQuery != ""){
        return this.triggers.filter((trigger)=>{
          try {
            return trigger.path.toLowerCase().includes(this.triggersQuery.toLowerCase()) || trigger.name.toLowerCase().includes(this.triggersQuery.toLowerCase())
          } catch {
            if (this.emptyTriggerText.toLowerCase().includes(this.triggersQuery.toLowerCase())) return this.triggers
          }
        })
      }else{
        return this.triggers
      }
    },
  },
  watch: {
    triggers(newValue, oldValue) {
      this.loadIcons()
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    profileIcon(profileName) {
      const profile = this.profiles.filter((profile)=>{
        return profile.name === profileName
      })
      if (!profile[0] || profile[0].length == 0) return
      const clientId = JSON.parse(profile[0].settings).client.id
      let icon = this.profileIcons.filter((icon)=>{
        return icon.clientId === clientId
      })
      icon = icon[0] ? icon[0].icon_url : null
      return icon
    },
    updateProfileIcon(profileName) {
      const profile = this.profiles.filter((profile)=>{
        return profile.name === profileName
      })
      if (!profile[0] || profile[0].length == 0) return
      this.$store.dispatch('profiles/updateIcon', {profile: profile[0], icon_url: null})
    },
    updateTriggersStatus: function() {
      this.$store.dispatch('triggers/setEnabled', {enabled: this.formData.enabled})
    },
    loadIcons: async function() {
      this.triggers.forEach((trigger, index) => {
        let buffer, icon
        try {
          buffer = window.electron.extractIcon(trigger.path, 'large')
          icon = new Buffer.from(buffer).toString('base64')
        } catch {
          icon = null
        }
        this.$set(this.triggers[index], 'base64_icon', icon)
      })
    },
    loadData: async function() {
      this.formData.isLoading = true

      await this.$store.dispatch('profiles/loadList')
      await this.$store.dispatch('triggers/loadList')
      // Correct a trigger if the associated profile was deleted
      for (var trigger of this.triggers) {
        const associatedProfile = trigger.action
        let profileByName = this.profiles.findIndex(profile => {
          return profile.name === associatedProfile
        })
        if (profileByName == -1 && trigger.action != false && trigger.action != true) {
          console.log("Resetting a trigger because the linked profile was deleted:", trigger)
          trigger.action = false
          await this.$store.dispatch('triggers/update', {path: trigger.path, action: trigger.action, silent: true, updateTriggers: true})
        }
      }
      this.formData.isLoading = false
    },
    createTriggerByFile: async function() {
      window.electron.dialog.showOpenDialog({ properties: ['openFile'], title: "Select an application", filters: [{name: "Application", extensions: ["exe"]}] }).then(async result => {
        const path = result.filePaths[0]
        const action = false
        this.formData.isLoading = true
        await this.$store.dispatch('triggers/create', {path: path, action: action, updateTriggers: true})
        this.formData.isLoading = false
      })
    },
    createTriggerByProcess: async function() {
      this.$emit('showTasksModal')
    },
    updateTrigger: async function(path, newAction) {
      this.formData.isLoading = true
      await this.$store.dispatch('triggers/update', {path: path, action: newAction, updateTriggers: true})
      this.formData.isLoading = false
    },
    deleteTrigger: async function(path) {
      this.formData.isLoading = true
      await this.$store.dispatch('triggers/delete', {path: path, updateTriggers: true})
      this.formData.isLoading = false
    },
  },
}
</script>

<style scoped>
.is-transparent {
    background-color: #fff0;
    color: #ffffff;
}
figure {
    color: #ffffff;
}
</style>