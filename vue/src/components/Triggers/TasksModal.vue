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
              Applications
            </p>
            <div class="field mt-2">
              <label class="checkbox">
                <input
                  v-model="showAll"
                  type="checkbox"
                  :disabled="!tasks"
                >
                Show all
              </label>
              <span
                v-tooltip="'Show all applications, including the system and background ones'"
                class="is-tooltip"
              >?</span>
            </div>
          </div>
          <div class="column is-6">
            <div class="field">
              <p class="control has-icons-left">
                <input
                  v-model="tasksQuery"
                  class="input"
                  type="text"
                  placeholder="Search by name"
                  :disabled="!tasks"
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
        <div v-if="!tasks">
          <div v-if="!tasksError">
            <h5 class="subtitle is-5">
              Fetching running applications
            </h5>
            <progress
              class="progress is-small is-info"
              max="100"
            />
          </div>
          <div v-if="tasksError">
            <article class="message is-danger">
              <div class="message-body">
                <p>Unable to fetch applications</p>
              </div>
            </article>
          </div>
        </div>

        <!-- List all clieents (that's a long list!) -->
        <div
          v-if="filteredTasks && filteredTasks.length == 0 && tasksQuery && !fetching"
          class="columns is-multiline"
        >
          <div class="column is-10 pt-2 pb-2">
            <p> No results </p>
          </div>
        </div>
        <div
          v-for="(task, index) in filteredTasks"
          :key="index"
        >
          <hr v-if="index>0">
                    
          <div class="columns is-mobile">
            <div
              class="column pt-0 pb-0"
              :class="{'is-10': task.Path, 'is-9': !task.Path}"
            >
              <p class="control has-icons-left has-icons-right">
                <input
                  v-tooltip="{content: task.Path || task.SafeModuleName, boundariesElement: $refs.modal}"
                  class="input is-transparent"
                  type="text"
                  placeholder="Program name and path"
                  :value="`${task.Product || task.MainWindowTitle || task.SafePath.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, '')} <${task.Path || task.SafeModuleName}>`"
                  readonly
                >
                <span class="icon is-small is-left">
                  <figure class="image is-24x24">
                    <img
                      v-if="task.base64_icon"
                      :src="'data:image/png;base64,'+task.base64_icon"
                      @error="task.base64_icon = null"
                    >
                    <img
                      v-else
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABpElEQVRYR+2Wy0rDQBSGTze51UVIspDgot6wCxcufAKfSXAhSmMpqBRBQXwbn0MRotbSpWRnlTQjR0mZJDOdE1vTLjqblnQy/zffOZO0BnMetTnnwxJgcQx0Lrqsyn44Pjr82fzYwGAwqBTA9/0sQBRFlQLYtq024HketO/fS1Xm5MAhzdc0rQjw8PgEzZ3t8QIIsH/XhzgBiEcMYsYgHgHECfu9hp94Pf2eMBgGm38HyN+JAHu3fXJ4kgB8tacAEBnYvXkj7RzDcUwFIDLQvO4ptafhVADGGOi6TuuBravexJrz4SoADE6HEEBkoNF9lTZcPlwEwIfy65MNrF0iQLHbReEpgCxUCSAysHr+UjhqsnC8//NsQ3oMeTDDMGg94HWeM+d8UrgIQGZDCCAyYLcRAB82DFThKQClBGSAlSAkhyPAMFgnlcA0TfW7wHVdMFshaedpah5AZoMMoJ+GpGc7D0Apwb8BfLQapBJYlkUrQVkDeQCZDRKA44jf7RTFqjmlAVQLonfVHP73er2eLUGpTpvh5MX5Wz7DTZVaamlg7ga+AW2WjjDdn6vvAAAAAElFTkSuQmCC"
                    >
                  </figure>
                </span>
              </p>
            </div>
            <div
              v-if="!task.Path"
              class="column is-1 pb-0 pt-1"
            >
              <span
                v-tooltip="'This application is protected, the trigger detection may be less accurate'"
                class="is-tooltip has-text-warning is-size-5"
              >
                <FontAwesomeIcon icon="info-circle" />
              </span>
            </div>
            <div class="column is-2 pt-0 pb-0">
              <div class="buttons is-justify-content-flex-end">
                <button
                  v-tooltip="{content: 'Create trigger for this application', boundariesElement: $refs.modal}"
                  class="button is-info is-outlined"
                  @click="importTask(task)"
                >
                  <span class="icon">
                    <FontAwesomeIcon icon="plus" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <div class="buttons">
          <button
            class="button"
            @click="closeModal"
          >
            Close
          </button>
          <button
            v-if="!fetching"
            class="button"
            @click="refreshTasks"
          >
            Refresh
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  props: {
    showTasksModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tasksQuery: "",
      tasksList: null,
      tasksError: null,
      fetching: false,
      showAll: false,
      systemPathsFilter: ["C:/WINDOWS/", "C:/Program Files/WindowsApps/"]
    }
  },
  computed: {
    tasks (){
      if (!this.tasksList) return null
      if (this.showAll) {
        return this.tasksList
      }
      else return this.tasksList.filter((task)=>{
        // All three conditions must be true when the tasks are filtered
        return task.MainWindowTitle != "" && 
          task.MainWindowTitle != null && 
          this.systemPathsFilter.findIndex(path => task.SafePath.toLowerCase().startsWith(path.toLowerCase())) == -1
      })
    },
    filteredTasks (){
      if (!this.tasksList) return []
      if(this.tasksQuery != ""){
        return this.tasks.filter((task)=>{
          return task.SafePath.toLowerCase().includes(this.tasksQuery.toLowerCase()) || 
            (task.MainWindowTitle ? !task.Product && task.MainWindowTitle.toLowerCase().includes(this.tasksQuery.toLowerCase()) : null) || 
            (task.Product ? task.Product.toLowerCase().includes(this.tasksQuery.toLowerCase()) : null)
        })
      }else{
        return this.tasks
      }
    },
    ...mapGetters({
      formData: "triggers/formData",
    }),
  },
  watch: {
    showTasksModal(newValue, oldValue) {
      /**
       * Fetch tasks every time the modal is shown
       */
      if (newValue != oldValue && newValue && !this.fetching) {
        this.fetchRunningTasks()
      }
      /**
       * Clear data when the modal is shown / hidden
       */
      this.$refs.modalContent.scrollTop = 0
      this.tasksQuery = ""
      this.tasksError = null
      this.showAll = false
    }
  },
  methods: {
    /**
     * Fetch the list
     */
    fetchRunningTasks: async function () {
      this.tasksList = null
      this.tasksError = null

      this.fetching = true
      const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/executables/get-list?icons=${false}`, {
        method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
        redirect: 'follow', referrerPolicy: 'no-referrer'
      }).catch(() => {})
      const responseBody = response ? await response.json().catch(() => {}) : null
      this.fetching = false

      if (response && response.status == 200) {
        this.tasksList = responseBody
        this.loadIcons()
      } else {
        this.tasksError = `Unable to fetch running applications` + (responseBody && responseBody.error && responseBody.message ? `: ${responseBody.message}` : "")
      }
    },
    /**
     * Load icons of EXEs
     */
    loadIcons: async function() {
      this.tasksList.forEach((task, index) => {
        let buffer, icon
        try {
          if (!task.Path) throw "Task has no path"
          buffer = window.electron.extractIcon(task.Path, 'large')
          icon = new Buffer.from(buffer).toString('base64')
        } catch {
          icon = null
        }
        this.$set(this.tasksList[index], 'base64_icon', icon)
      })
    },
    importTask: async function(task) {
      const path = task.Path ? task.Path : task.SafeModuleName
      const action = false
      this.closeModal()
      this.formData.isLoading = true
      await this.$store.dispatch('triggers/create', {path: path, name: task.Product || task.MainWindowTitle, action: action, updateTriggers: true})
      this.formData.isLoading = false
    },
    /**
     * Refresh the tasks list
     */
    refreshTasks: async function () {
      this.fetchRunningTasks()
    },
    /**
     * Close the tasks modal
     */
    closeModal: async function () {
      this.$emit('closeModal')
    },
  },
}
</script>

<style scoped>
.is-transparent {
    background-color: #fff0;
    color: #ffffff;
}
</style>