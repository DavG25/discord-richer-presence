<template>
  <div class="box">
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
    <div class="buttons">
      <button
        v-if="!client.isRunning"
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
        class="button is-danger is-outlined"
        :class="{'is-loading': client.isLoading}"
        :disabled="client.isLoading"
        @click="$emit('stopRPC')"
      >
        <span class="icon">
          <FontAwesomeIcon icon="stop-circle" />
        </span>
        <span>Stop client</span>
      </button>
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
    })
  },
  methods: {
    checkData: async function(action, params) {
      this.errors = await this.$store.dispatch('client/validateSettings', {settings: this.clientSettings})

      if (this.errors.length == 0) {
        this.$emit(action, params)
      } else {
        this.$toast.error("Please correct the errors")
      }
    }
  },
}
</script>