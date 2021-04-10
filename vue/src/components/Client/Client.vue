<template>
  <div class="box">
    <article
      v-if="triggersFormData.enabled"
      class="message is-warning"
    >
      <div class="message-body">
        <span class="icon-text">
          <span class="icon">
            <FontAwesomeIcon icon="robot" />
          </span>
          <span>Triggers are enabled</span>
        </span>
        <p>Last action: {{ lastTriggersMessage }}</p>
      </div>
    </article>

    <div v-if="!client.isValid">
      <h5 class="title is-5">
        Client ID <span
          v-tooltip="'ID of the rich presence application'"
          class="is-tooltip"
        >?</span>
      </h5> 
      <div class="field">
        <input
          v-model="client.id"
          class="input mb-2"
          style="max-width: 460px"
          type="text"
          minlength="1"
          maxlength="60"
          placeholder="Client ID"
          :disabled="client.isLoading"
        >

        <div class="buttons">
          <button
            class="button is-success is-outlined"
            :class="{'is-loading': client.isLoading}"
            :disabled="client.isLoading || client.id.trim() == ''"
            @click="$emit('validateClient')"
          >
            <span class="icon">
              <FontAwesomeIcon icon="check" />
            </span>
            <span>Validate and use this client</span>
          </button>  
          <button
            v-if="!client.isLoading"
            class="button is-info is-outlined"
            :class="{'is-loading': client.isLoading}"
            :disabled="client.isLoading"
            @click="$emit('showOfficialClients')"
          >
            <span class="icon">
              <FontAwesomeIcon icon="list" />
            </span>
            <span>View official clients list</span>
          </button>
        </div>
      </div>
    </div>
        
    <div v-if="client.isValid">
      <div class="block">
        <article
          class="media"
          style="height: 32px;"
        >
          <figure class="media-left">
            <p class="image is-32x32">
              <img
                v-if="client.data.icon_url"
                class="client-image"
                :src="client.data.icon_url"
                @error="client.data.icon_url = null"
              >
              <img
                v-else
                src="/img/question-cube.svg"
              >
            </p>
          </figure>
          <div
            class="media-content"
            style="height: 100%;"
          >
            <div class="content">
              <p
                class="title is-4"
                :class="{'has-text-success': client.isRunning}"
              >
                {{ client.data.name }}
              </p>
            </div>
          </div>
        </article>
      </div>

      <div class="field">
        <label class="checkbox">
          <input
            v-model="client.isNormalGame"
            type="checkbox"
          > Treat as a normal application
        </label>
        <span
          v-tooltip="'The client will be treated as a normal application, you won\'t have access to rich presence features but you will be able to set a greater start timestamp'"
          class="is-tooltip"
        >?</span>
      </div>


      <!-- Button -->
      <div class="buttons">
        <button
          v-if="!client.isRunning"
          ref="startRPC_Button"
          class="button is-success is-outlined"
          :class="{'is-loading': client.isLoading}"
          :disabled="client.isLoading"
          @click="checkData('startRPC')"
        >
          <span class="icon">
            <FontAwesomeIcon icon="play-circle" />
          </span>
          <span>Start client with current configs</span>
        </button>
        <button
          v-if="client.isRunning"
          ref="updateRPC_Button"
          class="button is-success is-outlined"
          :class="{'is-loading': client.isLoading}"
          :disabled="client.isLoading"
          @click="checkData('startRPC', true)"
        >
          <span class="icon">
            <FontAwesomeIcon icon="check-circle" />
          </span>
          <span>Apply current configs to client</span>
        </button>
        <button
          v-if="client.isRunning"
          ref="stopRPC_Button"
          class="button is-danger is-outlined"
          :class="{'is-loading': client.isLoading}"
          :disabled="client.isLoading"
          @click="checkData('stopRPC')"
        >
          <span class="icon">
            <FontAwesomeIcon icon="stop-circle" />
          </span>
          <span>Stop client</span>
        </button>
        <button
          v-if="!client.isRunning"
          class="button is-info is-outlined"
          :disabled="client.isRunning || client.isLoading"
          @click="checkData('removeClient')"
        >
          <span class="icon">
            <FontAwesomeIcon icon="edit" />
          </span>
          <span>{{ client.isRunning ? 'Stop the client to change it' : 'Change client' }}</span>
        </button>
      </div>

      <!-- Errors display -->
      <article
        v-if="errors.length > 0"
        class="message is-danger"
      >
        <div class="message-header">
          Please correct the following errors
        </div>
        <div class="message-body pt-0">
          <div class="content">
            <ul>
              <li
                v-for="error in errors"
                :key="error"
              >
                {{ error }}
              </li>
            </ul>
          </div>
        </div>
      </article>
        
      <!--
        <article class="message is-info" v-if="isRunning">
        <div class="message-body">
        <p>To change client you must first stop the current one</p>
        </div>
        </article> 
      -->
    </div>
  </div>
</template>


<script>
import { mapGetters } from "vuex"

export default {
  data() {
    return {
      errors: []
    }
  },
  computed: {
    ...mapGetters({
      client: "client/client",
      clientSettings : "client/allSettings",
      triggersFormData: "triggers/formData",
      lastTriggersMessage: "triggers/lastMessage"
    })
  },
  methods: {
    checkData: async function(action, params) {
      if (action == "stopRPC" || action == "removeClient") {
        this.errors = []
        this.$emit(action, params)
        return true
      }

      this.errors = await this.$store.dispatch('client/validateSettings', {settings: this.clientSettings})

      if (this.errors.length == 0) {
        this.$emit(action, params)
        return true
      } else {
        this.$toast.error("Please correct the errors")
        return false
      }
    }
  }
}
</script>