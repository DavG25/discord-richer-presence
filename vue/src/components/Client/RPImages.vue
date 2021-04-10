<template>
  <div
    class="box"
    style="height: 100%;"
  >
    <h5 class="title is-5">
      Images <span
        v-tooltip="'Images displayed on your rich presence'"
        class="is-tooltip"
      >?</span>
    </h5>
    <div v-if="client.assets.length > 0">
      <div class="field">
        <label class="checkbox">
          <input
            v-model="images.enableLargeImage"
            type="checkbox"
          >
          Large image
        </label>
        <span
          v-tooltip="'Toggle the display of the large image'"
          class="is-tooltip"
        >?</span>
      </div>

      <div class="columns is-multiline ml-4">
        <div class="column is-12">
          <div class="field">
            <div class="control pb-0">
              <label>Image name</label>
              <span
                v-tooltip="'Name of the asset key for the large image'"
                class="is-tooltip"
              >?</span>
              <span
                v-if="images.enableLargeImage && isInvalidAsset(images.largeImageKey)"
                v-tooltip="`The selected image no longer exists`"
                class="is-tooltip has-text-danger"
              ><FontAwesomeIcon icon="exclamation-triangle" /></span>
              <div
                class="select"
                style="width: 100%;"
              >
                <select
                  v-model="images.largeImageKey"
                  :disabled="!images.enableLargeImage"
                  style="width: 100%;"
                >
                  <option
                    value=""
                    :selected="images.largeImageKey.length==0"
                    class="has-text-info"
                  >
                    Select an image
                  </option>
                  <option
                    v-for="asset in client.assets"
                    :key="asset.id"
                    :value="asset.name"
                  >
                    {{ asset.name }}
                  </option>
                  <!-- Display an disabled option if selected asset was deleted -->
                  <option
                    v-if="isInvalidAsset(images.largeImageKey)"
                    :value="images.largeImageKey"
                    selected
                    disabled
                  >
                    {{ images.largeImageKey }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-12">
          <div class="field">
            <label class="checkbox">
              <input
                v-model="images.enableLargeImageText"
                type="checkbox"
                :disabled="!images.enableLargeImage"
              >
              Hover text
            </label>
            <span
              v-tooltip="'Text displayed when someone hovers the mouse on the large image'"
              class="is-tooltip"
            >?</span>
            <div class="control">
              <input
                v-model="images.largeImageText"
                class="input"
                type="text"
                placeholder="Image text"
                minlength="2"
                maxlength="128"
                :disabled="!images.enableLargeImageText || !images.enableLargeImage"
              >
            </div>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="checkbox">
          <input
            v-model="images.enableSmallImage"
            type="checkbox"
          >
          Small image
        </label>
        <span
          v-tooltip="'Toggle the display of the small image'"
          class="is-tooltip"
        >?</span>
      </div>

      <div class="columns is-multiline ml-4">
        <div class="column is-12 pb-0">
          <div class="field">
            <div class="control">
              <label>Image name</label>
              <span
                v-tooltip="'Name of the asset key for the small image'"
                class="is-tooltip"
              >?</span>
              <span
                v-if="images.enableSmallImage && isInvalidAsset(images.smallImageKey)"
                v-tooltip="`The selected image no longer exists`"
                class="is-tooltip has-text-danger"
              ><FontAwesomeIcon icon="exclamation-triangle" /></span>
              <div
                class="select"
                style="width: 100%;"
              >
                <select
                  v-model="images.smallImageKey"
                  :disabled="!images.enableSmallImage"
                  style="width: 100%;"
                >
                  <option
                    value=""
                    :selected="images.smallImageKey.length==0"
                    class="has-text-info"
                  >
                    Select an image
                  </option>
                  <option
                    v-for="asset in client.assets"
                    :key="asset.id"
                    :value="asset.name"
                  >
                    {{ asset.name }}
                  </option>
                  <!-- Display an disabled option if selected asset was deleted -->
                  <option
                    v-if="isInvalidAsset(images.smallImageKey)"
                    :value="images.smallImageKey"
                    :selected="isInvalidAsset(images.smallImageKey)"
                    disabled
                  >
                    {{ images.smallImageKey }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-12">
          <div class="field">
            <label class="checkbox">
              <input
                v-model="images.enableSmallImageText"
                type="checkbox"
                :disabled="!images.enableSmallImage"
              > 
              Hover text
            </label>
            <span
              v-tooltip="'Text displayed when someone hovers the mouse on the small image'"
              class="is-tooltip"
            >?</span>
            <div class="control">
              <input
                v-model="images.smallImageText"
                class="input"
                type="text"
                placeholder="Image text"
                minlength="2"
                maxlength="128"
                :disabled="!images.enableSmallImageText || !images.enableSmallImage"
              >
            </div>
          </div>
        </div>
      </div>
      <button
        class="button is-outlined is-white"
        @click="$emit('showClientImages')"
      >
        View available images
      </button>
    </div>
    <div v-else>
      <p>This client has no images available for use</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  computed: {
    ...mapGetters({
      images: "client/images",
      client: "client/client",
    })
  },
  methods: {
    isInvalidAsset(assetName) {
      if (assetName.length == 0) return false

      const assetIndex = this.client.assets.findIndex((asset)=>{
        return asset.name === assetName
      })

      if (assetIndex == -1) return true // Invalid asset
      else return false // Valid asset
    }
  },
}
</script>