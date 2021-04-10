<template>
  <div
    class="box"
    style="height: 100%;"
  >
    <h5 class="title is-5">
      Party <span
        v-tooltip="'Party information displayed on your rich presence'"
        class="is-tooltip"
      >?</span>
    </h5>
    <div class="field">
      <label class="checkbox">
        <input
          v-model="party.enableParty"
          type="checkbox"
        > Party
      </label>
      <span
        v-tooltip="'Toggle the display of the party information'"
        class="is-tooltip"
      >?</span>
    </div>

    <div class="columns is-multiline ml-4">
      <div class="column is-6 pb-0">
        <div class="field">
          <label class="checkbox">
            People in party
          </label>
          <span
            v-tooltip="'People currently inside the party'"
            class="is-tooltip"
          >?</span>
          <span
            v-if="party.enableParty && !text.enableState"
            v-tooltip="`You should enable &quot;Status&quot; if you want the party size to show`"
            class="is-tooltip has-text-warning"
          ><FontAwesomeIcon icon="info-circle" /></span>
          <!-- Real max is 1e+308 but it will mess up the invite button -->
          <div class="control">
            <input
              v-model="party.partySize"
              class="input"
              type="number"
              placeholder="Number of people"
              :disabled="!party.enableParty"
              min="1"
              max="999999999999999"
            >
          </div>
        </div>
      </div>

      <div class="column is-6 pb-0">
        <div class="field">
          <label class="checkbox">
            Total party size
          </label>
          <span
            v-tooltip="'Maxium amount of people the party can hold'"
            class="is-tooltip"
          >?</span>
          <span
            v-if="party.enableParty && !text.enableState"
            v-tooltip="`You should enable &quot;Status&quot; if you want the party size to show`"
            class="is-tooltip has-text-warning"
          ><FontAwesomeIcon icon="info-circle" /></span>
          <div class="control">
            <input
              v-model="party.partyMax"
              class="input"
              type="number"
              placeholder="Number of people"
              :disabled="!party.enableParty"
              min="1"
              max="999999999999999"
            >
          </div>
        </div>
      </div>

      <div class="column is-12">
        <div class="field">
          <label class="checkbox">
            <input
              v-model="party.joinSecret"
              type="checkbox"
              :disabled="!party.enableParty || buttons.enableButton1 || buttons.enableButton2"
            >
            Joinable party 
          </label>
          <span
            v-tooltip="'Toggle the joinable status of the party, if enabled you will be able to send invites and a button will be displayed on your rich presence'"
            class="is-tooltip"
          >?</span>
          <span
            v-if="party.enableParty && (buttons.enableButton1 || buttons.enableButton2)"
            v-tooltip="`Disabled because `+(buttons.enableButton1 && buttons.enableButton2 ? `buttons are` : `a button is`)+` enabled`"
            class="is-tooltip"
            :class="{'has-text-danger' : party.joinSecret, 'has-text-warning': !party.joinSecret}"
          >
            <FontAwesomeIcon :icon="party.joinSecret ? 'exclamation-triangle' : 'info-circle'" />
          </span>
          <span
            v-if="party.enableParty && party.joinSecret && (!buttons.enableButton1 && !buttons.enableButton2) && Number(party.partySize) > Number(party.partyMax)"
            v-tooltip="'You won\'t be able to send invites when the people in party are greater than the total party size'"
            class="is-tooltip has-text-warning"
          >
            <FontAwesomeIcon icon="info-circle" />
          </span>
        </div>
        <div class="field">
          <label class="checkbox">
            <input
              v-model="party.enableCustomPartyId"
              type="checkbox"
              :disabled="!party.enableParty"
            > 
            Custom party ID
          </label>
          <span
            v-tooltip="'Toggle custom party ID, if you set this the same as someone else using the same client, you will appear in the same party'"
            class="is-tooltip"
          >?</span>
          <div class="control">
            <input
              v-model="party.customPartyId"
              class="input"
              type="text"
              placeholder="Party ID"
              minlength="2"
              maxlength="128"
              :disabled="!party.enableParty || !party.enableCustomPartyId"
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
      party: "client/party",
      buttons: "client/buttons",
      text: "client/text",
    })
  }
}
</script>