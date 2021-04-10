<template>
  <div
    class="box"
    style="height: 100%;"
  >
    <h5 class="title is-5">
      Text <span
        v-tooltip="'Text displayed on your rich presence'"
        class="is-tooltip"
      >?</span>
    </h5>
    <div class="field">
      <label class="checkbox">
        <input
          v-model="text.enableDetails"
          type="checkbox"
        > Details
      </label>
      <span
        v-tooltip="'Toggle the display of the details text'"
        class="is-tooltip"
      >?</span>
      <div class="control">
        <input
          v-model="text.details"
          class="input"
          type="text"
          placeholder="Details text"
          minlength="2"
          maxlength="128"
          :disabled="!text.enableDetails"
        >
      </div>
    </div>

    <div class="field">
      <label class="checkbox">
        <input
          v-model="text.enableState"
          type="checkbox"
        > Status
      </label>
      <span
        v-tooltip="'Toggle the display of the status text'"
        class="is-tooltip"
      >?</span>
      <div class="control">
        <input
          v-model="text.state"
          class="input"
          type="text"
          placeholder="Status text"
          minlength="2"
          maxlength="128"
          :disabled="!text.enableState"
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  computed: {
    ...mapGetters({
      text: "client/text",
    })
  }
}
</script>