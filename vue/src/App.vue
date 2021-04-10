<template>
  <div
    v-if="electron"
    id="app"
    ref="app"
  >
    <div id="nav">
      <nav
        class="navbar is-fixed-top"
        role="navigation"
        aria-label="main navigation"
      >
        <div class="navbar-brand">
          <p class="navbar-item">
            <img
              :src="client.isRunning ? '/img/icons-active/256x256.png' : '/img/icons/256x256.png'"
              width="28"
              height="28"
            >
          </p>
        </div>

        <div
          class="navbar-menu"
        >
          <div class="navbar-start">
            <router-link
              to="/"
              class="navbar-item"
            >
              Client
            </router-link>
            <router-link
              to="/profiles"
              class="navbar-item"
            >
              Profiles
            </router-link>
            <router-link
              to="/triggers"
              class="navbar-item"
            >
              Triggers
            </router-link>
            <router-link
              to="/settings"
              class="navbar-item"
            >
              Settings
            </router-link>
          </div>
          <div class="navbar-end">
            <div
              v-if="updateDownloaded"
              class="navbar-item pb-0 pt-0" 
            >
              <button 
                v-tooltip="'Quit and install the new update'"
                class="navbar-item button is-ghost has-text-success"
                :disabled="installingNewUpdate"
                @click="quitAndUpdate"
              >
                <FontAwesomeIcon icon="arrow-down" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
    <router-view />
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  data() {
    return {
      /*
       * heartbeat: null,
       * sessionId: null 
       */
      electron: window.electron,
      installingNewUpdate: false,
    }
  },
  computed: {
    ...mapGetters({
      client: "client/client",
      updateDownloaded: "settings/updateDownloaded"
    })
  },
  metaInfo: {
    meta: process.env.NODE_ENV==='development' ? [ 
      /* Dev environment */ 
      { 'http-equiv': 'Content-Security-Policy', content: "script-src 'self' 'unsafe-eval' localhost:*" }
    ] : [
      /* Prod environment */
      { 'http-equiv': 'Content-Security-Policy', content: "script-src 'self' localhost:*" }
    ]
  },
  mounted () {
    /* this.keepAlive() */
    /**
     * Why is the app open served on the localhost server and not just inside Electron as static files?
     * Because one day there will be (hopefully, if there is time) an integration with mobile devices
     */
    if (!this.electron) alert("Web integration is not yet supported")
  },
  methods: {
    /**
     * Quit, update Electron app and start it again
     */
    quitAndUpdate: function() {
      this.installingNewUpdate = true
      window.electron.quitAndInstallUpdate({silent: true, runAfterInstall: true})
    }
    /**
     * Heartbeat, keeps server alive [not needed when using Electron]
     */
    /*
     * keepAlive: async function () {
     *      const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/heartbeat/keep-alive`, {
     *          method: 'POST', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
     *          redirect: 'follow', referrerPolicy: 'no-referrer',
     *          headers: {
     *              'Content-Type': 'application/json'
     *          },
     *          body: JSON.stringify({sessionId: this.sessionId})
     *      }).catch(() => {})
     * const responseBody = response ? await response.json().catch(() => {}) : null
     * 
     *      if (response && response.status == 200) {
     * // Refresh session ID
     * this.sessionId = responseBody.sessionId
     *          // All is good, wait and send next heartbeat
     * await new Promise((resolve) => setTimeout(resolve, 6000))
     * this.keepAlive()
     *      } else {
     *          // Server is dead
     *          console.log("Server is dead")
     *      }
     *  }, 
     */
  },
}
</script>

<style scoped>
.navbar-item {
	-webkit-user-drag: none;
	-webkit-user-select: none;
	user-select: none;
}
</style>