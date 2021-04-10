<template>
  <div
    class="box"
    style="height: 100%;"
  >
    <h5 class="title is-5">
      Time <span
        v-tooltip="'Timestamp information displayed on your rich presence'"
        class="is-tooltip"
      >?</span>
    </h5>
    <div class="field">
      <label class="checkbox">
        <input
          v-model="time.enableTimestamp"
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
            <label class="radio">
              <input
                v-model="time.timestampType"
                type="radio"
                name="timestampRadio"
                value="start"
                :disabled="!time.enableTimestamp"
              >
              Elapsed seconds
            </label>
            <span
              v-tooltip="'Show already elapsed seconds'"
              class="is-tooltip"
            >?</span>
          </div>
          <div class="control">
            <input
              v-model="time.startTimestamp"
              class="input"
              type="number"
              min="0"
              max="86400"
              placeholder="Number of seconds"
              :disabled="!time.enableTimestamp || time.timestampType=='end'"
            >
            <p :style="{visibility: time.enableTimestamp && time.timestampType=='start' ? 'visible' : 'hidden'}">
              That's ~ {{ [Number(time.startTimestamp), 'seconds'] | duration('humanize') }}
            </p>
          </div>
        </div>
      </div>

      <div class="column is-6">
        <div class="field">
          <div class="control">
            <label class="radio">
              <input
                v-model="time.timestampType"
                type="radio"
                name="timestampRadio"
                value="end"
                :disabled="!time.enableTimestamp"
              >
              Remaining seconds
            </label>
            <span
              v-tooltip="'Show remaining seconds'"
              class="is-tooltip"
            >?</span>
          </div>
          <div class="control">
            <input
              v-model="time.endTimestamp"
              class="input"
              type="number"
              min="0"
              max="86400"
              placeholder="Number of seconds"
              :disabled="!time.enableTimestamp || time.timestampType=='start'"
            >
            <div class="block">
              <p :style="{visibility: time.enableTimestamp && time.timestampType=='end' ? 'visible' : 'hidden'}">
                That's ~ {{ [Number(time.endTimestamp), 'seconds'] | duration('humanize') }}
              </p>
            </div>
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
      time: "client/time",
    })
  }
}
</script>