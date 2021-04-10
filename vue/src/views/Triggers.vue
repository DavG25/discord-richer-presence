<template>
  <div
    class="container"
    style="margin-top: 30px;"
  >
    <div class="columns is-multiline">
      <div class="column is-12">
        <Manager 
          @showTasksModal="showTasksModal = true"
          @editTrigger="editTrigger"
        />
      </div>
    </div>

    <ActionModal 
      :show-action-modal="showActionModal"
      :trigger-to-edit="triggerToEdit"
      :class="{ 'is-active': showActionModal}"
      @closeModal="showActionModal = false"
    />

    <TasksModal
      :show-tasks-modal="showTasksModal"
      :class="{ 'is-active': showTasksModal}"
      @closeModal="showTasksModal = false"
    />
  </div>
</template>

<script>
import Manager from '@/components/Triggers/Manager.vue'
import TasksModal from '@/components/Triggers/TasksModal.vue'
import ActionModal from '@/components/Triggers/ActionModal.vue'

export default {
  name: 'Triggers',
  components: {
    Manager,
    TasksModal,
    ActionModal
  },
  data() {
    return {
      showTasksModal: false,
      showActionModal: false,
      triggerToEdit: null,
    }
  },
  methods: {
    editTrigger(trigger) {
      this.showActionModal = true
      this.triggerToEdit = trigger
    }
  }
}
</script>

<style scoped>
/* .input:read-only {
    background-color: #fff0;
    color: #ffffff;
} */
</style>