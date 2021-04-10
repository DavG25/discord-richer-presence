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
              Official clients
            </p>
          </div>
          <div class="column is-6">
            <div class="field">
              <p class="control has-icons-left">
                <input
                  v-model="officialClientsSearchQuery"
                  class="input"
                  type="text"
                  placeholder="Search by name"
                  :disabled="!officialClients"
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
        <!-- Show loading bar / error -->
        <div v-if="!officialClients">
          <div v-if="!officialClientsError">
            <h5 class="subtitle is-5">
              Fetching official clients
            </h5>
            <progress
              class="progress is-small is-info"
              max="100"
            />
          </div>
          <div v-if="officialClientsError">
            <article class="message is-danger">
              <div class="message-body">
                <p>Unable to fetch official clients</p>
              </div>
            </article>
          </div>
        </div>

        <!-- List all clieents (that's a long list!) -->
        <div
          v-if="filteredOfficialClients && filteredOfficialClients.length == 0 && officialClientsSearchQuery"
          class="columns is-multiline"
        >
          <div class="column is-10 pt-2 pb-2">
            <p> No results </p>
          </div>
        </div>
        <div
          v-for="(client, index) in filteredOfficialClients"
          :key="client.id"
        >
          <hr v-if="index>0">
                    
          <div class="columns is-mobile">
            <div class="column is-1 pt-2 pb-0">
              <figure class="image is-24x24">
                <img
                  v-if="client.icon_url"
                  :src="client.icon_url"
                  class="client-image"
                  @error="client.icon_url = null"
                >
                <img
                  v-else
                  src="/img/question-cube.svg"
                >
              </figure>
            </div>
            <div class="column is-9 pt-2 pb-0">
              <p>{{ client.name }}</p>
            </div>
            <div class="column is-2 pt-0 pb-0">
              <div class="buttons is-justify-content-flex-end">
                <button
                  v-tooltip="{content: 'Use this client', boundariesElement: $refs.modal}"
                  class="button is-info is-outlined"
                  @click="importOfficialClient(client.id)"
                >
                  <span class="icon">
                    <FontAwesomeIcon icon="file-import" />
                  </span>
                </button>
              </div>
            </div>
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
    showOfficialClientsModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      officialClientsSearchQuery: "",
      officialClients: null,
      officialClientsError: null
    }
  },
  computed: {
    ...mapGetters({
      client: "client/client"
    }),
    filteredOfficialClients (){
      if(this.officialClientsSearchQuery != ""){
        return this.officialClients.filter((client)=>{
          return client.name.toLowerCase().includes(this.officialClientsSearchQuery.toLowerCase())
        })
      }else{
        return this.officialClients
      }
    }
  },
  watch: {
    showOfficialClientsModal(newValue, oldValue) {
      /**
       * Fetch clients only the first time the modal is shown
       */
      if (newValue && !this.officialClients) {
        this.fetchOfficialClients()
      }
      /**
       * Clear data when the modal is shown / hidden
       */
      this.$refs.modalContent.scrollTop = 0
      this.officialClientsSearchQuery = ""
      this.officialClientsError = null
    },
    'client.id'(newValue, oldValue) {
      /**
       * Close modal when client ID is changed
       */
      this.$emit('closeModal')
    }
  },
  methods: {
    /**
     * Get list of official clients
     */
    fetchOfficialClients: async function () {
      /**
       * Stop if we already have the list
       */
      if (this.officialClients) return

      /**
       * Fetch the list
       */
      const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/applications/get-list`, {
        method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
        redirect: 'follow', referrerPolicy: 'no-referrer'
      }).catch(() => {})
      const responseBody = response ? await response.json().catch(() => {}) : null

      if (response && response.status == 200) {
        this.officialClients = responseBody
      } else {
        this.officialClientsError = `Unable to fetch official clients` + (responseBody && responseBody.error && responseBody.message ? `: ${responseBody.message}` : "")
      }
    },
    /**
     * Close the official clients list modal
     */
    closeModal: async function () {
      this.$emit('closeModal')
    },
    /**
     * Import selected official client
     */
    importOfficialClient: async function (clientId) {
      this.$emit('importOfficialClient', clientId)
      this.closeModal()
    },
  },
}
</script>