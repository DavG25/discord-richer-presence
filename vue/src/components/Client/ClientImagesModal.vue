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
              Available images
            </p>
          </div>
          <div class="column is-6">
            <div class="field">
              <p class="control has-icons-left">
                <input
                  v-model="clientAssetsQuery"
                  class="input"
                  type="text"
                  placeholder="Search by name"
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
        <div
          v-if="filteredClientAssets && filteredClientAssets.length == 0 && clientAssetsQuery"
          class="columns is-multiline"
        >
          <div class="column is-10 pt-2 pb-2">
            <p> No results </p>
          </div>
        </div>
        <!-- List all images -->
        <div
          v-for="(asset, index) in filteredClientAssets"
          :key="asset.id"
        >
          <hr v-if="index>0">
          <div class="columns is-mobile">
            <div class="column is-full">
              <article class="media">
                <figure class="media-left">
                  <p class="image is-128x128">
                    <img
                      class="autofit"
                      :src="asset.url"
                    >
                  </p>
                </figure>
                <div class="media-content">
                  <div class="content">
                    <p class="subtitle is-5 mb-4">
                      {{ asset.name }}
                    </p>
                    <button
                      class="button is-outlined"
                      :class="{'is-success' : inUseAsLargeImage(asset.name), 'is-info' : !inUseAsLargeImage(asset.name)}"
                      :disabled="inUseAsLargeImage(asset.name)"
                      @click="importLargeImage(asset.name)"
                    >
                      <span class="icon">
                        <FontAwesomeIcon :icon="inUseAsLargeImage(asset.name) ? 'check' : 'file-import'" />
                      </span>
                      <span>{{ inUseAsLargeImage(asset.name) ? 'In use as large image' : 'Use as large image' }}</span>
                    </button>
                    <br>
                    <button
                      class="button is-outlined mt-1"
                      :class="{'is-success' : inUseAsSmallImage(asset.name), 'is-info' : !inUseAsSmallImage(asset.name)}"
                      :disabled="inUseAsSmallImage(asset.name)"
                      @click="importSmallImage(asset.name)"
                    >
                      <span class="icon">
                        <FontAwesomeIcon :icon="inUseAsSmallImage(asset.name) ? 'check' : 'file-import'" />
                      </span>
                      <span>{{ inUseAsSmallImage(asset.name) ? 'In use as small image' : 'Use as small image' }}</span>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button"
          @click="$emit('closeModal')"
        >
          Close
        </button>
      </footer>
    </div>
  </div>
</template>


<script>
import { mapGetters } from "vuex"

export default {
  props: {
    showClientImagesModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      clientAssetsQuery: "",
    }
  },
  computed: {
    ...mapGetters({
      client: "client/client",
      images: "client/images"
    }),
    filteredClientAssets (){
      if(this.clientAssetsQuery != ""){
        return this.client.assets.filter((asset)=>{
          return asset.name.toLowerCase().includes(this.clientAssetsQuery.toLowerCase())
        })
      }else{
        return this.client.assets
      }
    }
  },
  watch: {
    showClientImagesModal(newValue, oldValue) {
      /**
       * Clear data when the modal is shown / hidden
       */
      this.$refs.modalContent.scrollTop = 0
      this.clientAssetsQuery = ""
    },
    'client.id'(newValue, oldValue) {
      /**
       * Close modal when client ID is changed
       */
      this.$emit('closeModal')
    }
  },
  methods: {
    importLargeImage(keyName) {
      this.images.enableLargeImage = true
      this.images.largeImageKey = keyName
      this.$emit('closeModal')
    },
    importSmallImage(keyName) {
      this.images.enableSmallImage = true
      this.images.smallImageKey = keyName
      this.$emit('closeModal')
    },
    inUseAsLargeImage(assetName) {
      if (this.images.enableLargeImage && this.images.largeImageKey == assetName) return true
      else return false
    },
    inUseAsSmallImage(assetName) {
      if (this.images.enableSmallImage && this.images.smallImageKey == assetName) return true
      else return false
    },
  }
}
</script>

<style scoped>
.autofit {
    /*
    * Object fit can have two values:
    * "contain" is the real image size as uploaded on the Discord assets
    * "cover" is the resized image as it will be shown in the Rich Presence box
    * The border radius is also the same of the Rich Presence box
    **/
    /*object-fit: contain !important;*/
    object-fit: cover !important;
    border-radius: 8px;
    width: 100% !important;
    height: 100% !important;
}
</style>