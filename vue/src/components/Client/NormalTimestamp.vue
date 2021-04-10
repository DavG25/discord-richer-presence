<template>
  <div
    class="box"
    style="height: 100%;"
  >
    <h5 class="title is-5">
      Time <span
        v-tooltip="'Timestamp information displayed on your application'"
        class="is-tooltip"
      >?</span>
    </h5>
    <div class="field">
      <label class="checkbox">
        <input
          v-model="normal.enableNormalTimestamp"
          type="checkbox"
        > Timestamp
      </label>
      <span
        v-tooltip="'Toggle the display of the timestamp'"
        class="is-tooltip"
      >?</span>
    </div>

    <div class="columns is-multiline ml-4">
      <div class="column is-6">
        <div class="field">
          <div class="control">
            <label>
              Elapsed seconds
            </label>
            <span
              v-tooltip="'Seconds that have elapsed since the application launch, you can set up to 1615680000 seconds (~51 years)'"
              class="is-tooltip"
            >?</span>
          </div>
          <div class="control">
            <!-- The *theoretical* maximum should be the seconds since epoch 0, but Discord only seems to support up to ~18700 days -->
            <input
              v-model="normal.normalStartTimestamp"
              class="input"
              type="number"
              min="0"
              max="1615680000"
              placeholder="Number of seconds"
              :disabled="!normal.enableNormalTimestamp"
            >
            <!-- We use "visibility" instead of v-if to keep the spacing even when the element is hidden -->
            <p :style="{visibility: normal.enableNormalTimestamp ? 'visible' : 'hidden'}">
              That's ~ {{ [Number(normal.normalStartTimestamp), 'seconds'] | duration('humanize') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { mapGetters } from "vuex"

export default {
  computed: {
    ...mapGetters({
      normal: "client/normal",
    })
  }
}
</script>