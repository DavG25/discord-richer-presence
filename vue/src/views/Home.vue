<template>
  <div
    class="container"
    style="margin-top: 30px;"
  >
    <div class="columns is-multiline">
      <!-- Client ID -->
      <div class="column is-full">
        <Client 
          :is-valid="client.isValid"
          :error="client.idError"
          :is-running="client.isRunning"
          :is-loading="client.isLoading"

          @validateClient="$store.dispatch('client/validateClient')"
          @showOfficialClients="showOfficialClientsModal = true"
          @removeClient="removeClient"

          @startRPC="startRPC"
          @stopRPC="stopRPC"
        />
      </div>

      <div
        v-if="client.isValid && client.isNormalGame"
        class="column is-full"
      >
        <NormalTimestamp />
      </div>

      <div
        v-if="client.isValid && !client.isNormalGame"
        class="column is-half"
      >
        <RPText />
      </div>

      <div
        v-if="client.isValid && !client.isNormalGame"
        class="column is-half"
      >
        <RPImages 
          @showClientImages="showClientImagesModal = true" 
        />
      </div>

      <div
        v-if="client.isValid && !client.isNormalGame"
        class="column is-half"
      >
        <RPParty />
      </div>

      <div
        v-if="client.isValid && !client.isNormalGame"
        class="column is-half"
      >
        <RPTimestamp />
      </div>

      <div
        v-if="client.isValid && !client.isNormalGame"
        class="column is-full"
      >
        <RPButtons />
      </div>
    </div>

    <!-- Modals -->
    <div> 
      <OfficialClientsModal 
        :show-official-clients-modal="showOfficialClientsModal"
        :class="{ 'is-active': showOfficialClientsModal && !client.isValid}"
        @closeModal="showOfficialClientsModal=false"

        @importOfficialClient="importOfficialClient"
      />

      <ClientImagesModal
        :show-client-images-modal="showClientImagesModal"
        :class="{ 'is-active': showClientImagesModal && client.isValid && !client.isNormalGame}"
        @closeModal="showClientImagesModal=false"
      />
    </div>
  </div>
</template>

<script>
import Client from '@/components/Client/Client.vue'
import RPText from '@/components/Client/RPText.vue'
import RPImages from '@/components/Client/RPImages.vue'
import RPParty from '@/components/Client/RPParty.vue'
import RPTimestamp from '@/components/Client/RPTimestamp.vue'
import RPButtons from '@/components/Client/RPButtons.vue'
// import RPStatusManager from '@/components/Client/RPStatusManager.vue'
import NormalTimestamp from '@/components/Client/NormalTimestamp.vue'

import OfficialClientsModal from '@/components/Client/OfficialClientsModal.vue'
import ClientImagesModal from '@/components/Client/ClientImagesModal.vue'

import { mapGetters } from "vuex"


export default {
  name: 'Home',
  components: {
    Client,
    RPText,
    RPImages,
    RPParty,
    RPTimestamp,
    RPButtons,
    // RPStatusManager,
    NormalTimestamp,

    OfficialClientsModal,
    ClientImagesModal
  },
  data() {
    return {
      showOfficialClientsModal: false,
      showClientImagesModal: false,
    }
  },
  computed: {
    ...mapGetters({
      client: "client/client",
      normal: "client/normal",
      text: "client/text",
      images: "client/images",
      party: "client/party",
      time: "client/time",
      buttons: "client/buttons",
    })
  },
  mounted: function () {
    // this.getRpcStatus()
  },
  methods: {
    /**
     * Import an official client to the application
     */
    importOfficialClient: function (clientId) {
      /**
       * Import the client and then validate it
       */
      this.client.id = clientId
      this.$store.dispatch('client/validateClient')
    },
    /**
     * Remove current client
     */
    removeClient: function () {
      /**
       * Remove client and its data
       */
      // this.clientId = ""
      let clientId = this.client.id
      this.$store.commit('client/resetState')
      this.client.id = clientId
    },
    /**
     * Get RPC status
     */
    getRpcStatus: async function () {
      /**
       * Clear errors
       */
      this.statusError = null

      this.client.isLoading = true
      const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/rpc/status`, {
        method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
        redirect: 'follow', referrerPolicy: 'no-referrer'
      }).catch(() => {})
      const responseBody = response ? await response.json().catch(() => {}) : null
      this.client.isLoading = false

      if (response && response.status == 200) {
        if (responseBody.active) {
          this.client.isRunning = true
          this.importSettingsFromServer(responseBody.rpcSettings)
        } else {
          this.client.isRunning = false
        }
      }
    },
    /**
     * Start the RPC server
     */
    startRPC: async function (update = false) {
      this.$store.dispatch('client/startRPC', {update: update})
    },
    /**
     * Stop the RPC server
     */
    stopRPC: async function () {
      this.$store.dispatch('client/stopRPC')
    },
  }
}
</script>
