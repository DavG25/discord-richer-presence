<template>
  <div
    class="box"
    style="height: 100%;"
  >
    <h5 class="title is-5">
      Buttons <span
        v-tooltip="'Buttons displayed on your rich presence'"
        class="is-tooltip"
      >?</span>
    </h5>
    <div class="field">
      <label class="checkbox">
        <input
          v-model="buttons.enableButton1"
          type="checkbox"
        >
        Button 1
      </label>
      <span
        v-tooltip="'Toggle the button display'"
        class="is-tooltip"
      >?</span>
    </div>
    <div class="columns is-multiline ml-4">
      <div class="column is-6">
        <div class="field">
          <label class="checkbox">
            Button text
          </label>
          <span
            v-tooltip="'Text displayed on the button'"
            class="is-tooltip"
          >?</span>
          <div class="control">
            <input
              v-model="buttons.button1Label"
              class="input"
              type="text"
              placeholder="Button text"
              minlength="1"
              maxlength="32"
              :disabled="!buttons.enableButton1"
            >
          </div>
        </div>
      </div>
      <div class="column is-6">
        <div class="field">
          <label class="checkbox">
            Button URL
          </label>
          <span
            v-tooltip="'URL to open when someone clicks on the button (note: as of now Discord won\'t let you click on your own buttons but others can)'"
            class="is-tooltip"
          >?</span>
          <div class="control">
            <input
              v-model="buttons.button1URL"
              class="input"
              type="text"
              placeholder="Button URL"
              minlength="1"
              maxlength="512"
              :disabled="!buttons.enableButton1"
            >
          </div>
        </div>
      </div>
    </div>

    <div class="field">
      <label class="checkbox">
        <input
          v-model="buttons.enableButton2"
          type="checkbox"
        >
        Button 2
      </label>
      <span
        v-tooltip="'Toggle the button display'"
        class="is-tooltip"
      >?</span>
    </div>
    <div class="columns is-multiline ml-4">
      <div class="column is-6">
        <div class="field">
          <label class="checkbox">
            Button text
          </label>
          <span
            v-tooltip="'Text displayed on the button'"
            class="is-tooltip"
          >?</span>
          <div class="control">
            <input
              v-model="buttons.button2Label"
              class="input"
              type="text"
              placeholder="Button text"
              minlength="1"
              maxlength="32"
              :disabled="!buttons.enableButton2"
            >
          </div>
        </div>
      </div>
      <div class="column is-6">
        <div class="field">
          <label class="checkbox">
            Button URL
          </label>
          <span
            v-tooltip="'URL to open when someone clicks on the button (note: as of now Discord won\'t let you click on your own buttons but others can)'"
            class="is-tooltip"
          >?</span>
          <div class="control">
            <input
              v-model="buttons.button2URL"
              class="input"
              type="text"
              placeholder="Button URL"
              minlength="1"
              maxlength="512"
              :disabled="!buttons.enableButton2"
            >
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
      buttons: "client/buttons"
    })
  }
}
</script>