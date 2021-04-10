<template>
  <div class="box">
    <h5 class="title is-5">
      Import from Discord MagicPresence
    </h5>

    <label>
      <p> Discord MagicPresence was detected, you can import all your settings, profiles and triggers </p>
    </label>

    <button
      v-if="importStep==0 || importStep==1"
      class="button is-outlined mt-4"
      :class="{'is-info' : importStep==0, 'is-warning' : importStep==1}"
      @click="(importStep==0 ? importStep=1 : importAll())"
    >
      <span class="icon">
        <FontAwesomeIcon :icon="importStep==1 ? 'exclamation-triangle' : 'wrench'" />
      </span>
      <span>{{ importStep==0 ? 'Import everything' : 'Click again to confirm' }}</span>
    </button>

    <p
      v-if="importStep>=2"
      style="white-space: pre;"
    >
      {{ output }}
    </p>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  data() {
    return {
      importStep: 0,
      output: "",
    }
  },
  computed: {
    ...mapGetters({
      settings: "settings/settings",
    }),
  },
  methods: {
    /**
     * Import everything from Discord MagicPresence
     */
    importAll: async function() {
      this.importStep=2
      const path = `${window.electron.app.getPath('appData')}\\DG25-DMP`

      const importProfiles = async () => {
        this.output += `\n[INFO] Importing profiles`
        await window.electron.fs.readdir(`${path}\\profiles\\`, (async (err, filenames) => {
          if (err) {
            this.output += `\n[FATAL ERROR] Unable to read profiles folder`
            return
          }
          for (const filename of filenames){
            await new Promise((resolve, reject) => {
              window.electron.fs.readFile(`${path}\\profiles\\${filename}`, 'utf-8', (async (err, content) => {
                if (err) {
                  this.output += `\n[FATAL ERROR] Unable to read profile`
                  reject(false)
                  return
                }
                const profileName = filename.replace(/^.*[\\/]/, '').replace(/\.[^/.]+$/, '')
                const profileConfigs = await this.$store.dispatch('profiles/format', {profileConfigs: content})
                const imported = await this.$store.dispatch('profiles/create', {profileName: profileName, settings: profileConfigs, updateProfiles: true, silent: true})
                if (imported) {
                  this.output += `\n[OK] Successfully imported ${profileName}`
                  resolve(true)
                } else { 
                  this.output += `\n[ERROR] Unable to import ${profileName}`
                  reject(false)
                }
              }))
            }).catch(() => {})
          }
          this.output += `\n[INFO] Done`
          importTriggers()
        }))
      }
      importProfiles()

      const importTriggers = async () => {
        this.output += `\n\n[INFO] Importing triggers`
        await window.electron.fs.readdir(`${path}\\autorun\\`, (async (err, filenames) => {
          if (err) {
            this.output += `\n[FATAL ERROR] Unable to read triggers folder`
            return
          }
          // This is so messed up, I don't want to look at this ever again
          const trigger_paths = filenames.filter(el => el.split('.').pop() === 'RunPath')
                    
          const trigger_profiles = filenames.filter(el => el.split('.').pop() === 'RunProfile')

          // This one is for "Nothing from this list"
          await new Promise((resolve, reject) => {
            window.electron.fs.readFile(`${path}\\autorun\\App.NullProfile`, 'utf-8', (async (err, content) => {
              if (err) {
                this.output += `\n[FATAL ERROR] Unable to read profile`
                reject(false)
                return
              }

              if (content == "*** NOTHING ***") content = false
              if (content == "*** STOP CLIENT ***") content = true

              const imported = await this.$store.dispatch('triggers/update', {path: false, action: content, updateTriggers: true, silent: true})
              if (imported) {
                this.output += `\n[OK] Successfully imported *** NOTHING FROM THIS LIST ***`
                resolve(true)
              } else { 
                this.output += `\n[ERROR] Unable to import *** NOTHING FROM THIS LIST ***`
                reject(false)
              }
            }))
          }).catch(() => {})

          for (const filename of trigger_paths){
            await new Promise((resolve, reject) => {
              window.electron.fs.readFile(`${path}\\autorun\\${filename}`, 'utf-8', (async (err, content) => {
                if (err) {
                  this.output += `\n[FATAL ERROR] Unable to read trigger`
                  reject(false)
                  return
                }
                                
                let associatedProfile = await new Promise((resolve, reject) => {
                  window.electron.fs.readFile(`${path}\\autorun\\${filename.split('.').slice(0, -1).join('.')}.RunProfile`, 'utf-8', (async (err, content) => {
                    if (err) {
                      this.output += `\n[FATAL ERROR] Unable to read trigger`
                      reject(false)
                      return
                    }
                    if (content == "*** NOTHING ***") content = false
                    if (content == "*** STOP CLIENT ***") content = true
                    resolve(content)
                  }))
                }).catch(() => {})
                                
                const triggerName = content.split(",")[0]
                const triggerPath = content.split(",")[1]
                const imported = await this.$store.dispatch('triggers/create', {path: triggerPath, action: associatedProfile, updateTriggers: true, silent: true})
                if (imported) {
                  this.output += `\n[OK] Successfully imported ${triggerName} <${triggerPath}>`
                  resolve(true)
                } else { 
                  this.output += `\n[ERROR] Unable to import ${triggerName} <${triggerPath}>`
                  reject(false)
                }
              }))
            }).catch(() => {})
          }
          this.output += `\n[INFO] Done`
          importSettings()
        }))
      }

      const importSettings = async () => {
        this.output += `\n\n[INFO] Importing settings`
        await new Promise((resolve, reject) => {
          window.electron.fs.readFile(`${path}\\settings.dcfg`, 'utf-8', (async (err, content) => {
            if (err) {
              this.output += `\n[FATAL ERROR] Unable to read settings`
              reject(false)
              return
            }
                        
            // Remove BOM marker
            content = content.replace(/^\uFEFF/gm, "").replace(/^\u00BB\u00BF/gm,"")
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(content, "text/xml")
            let importedSettings = {
              runAtBoot: getSafe(() => xmlDoc.getElementsByTagName("ss5")[0].childNodes[0].nodeValue == 'true'),
              runAsMinimized: getSafe(() => xmlDoc.getElementsByTagName("ss6")[0].childNodes[0].nodeValue == 'true'),
              // trayIconOnMinimize: getSafe(() => xmlDoc.getElementsByTagName("ss7")[0].childNodes[0].nodeValue == 'true'),
              autoLoadProfile: getSafe(() => xmlDoc.getElementsByTagName("ss1")[0].childNodes[0].nodeValue == 'true'),
              autoLoadProfileName: getSafe(() => xmlDoc.getElementsByTagName("ss2")[0].childNodes[0].nodeValue),
              autoStartProfile: getSafe(() => xmlDoc.getElementsByTagName("ss3")[0].childNodes[0].nodeValue == 'true')
            }
            let isTriggersEnabled = getSafe(() => xmlDoc.getElementsByTagName("ss4")[0].childNodes[0].nodeValue == 'true')
            function getSafe(fn, defaultVal) {
              try {
                return fn()
              } catch (e) {
                return defaultVal
              }
            }
                        
            await this.$store.dispatch('triggers/setEnabled', {enabled: isTriggersEnabled, silent: true})
            const settings = {...this.settings, ...importedSettings}
            const imported = await this.$store.dispatch('settings/set', {settings: settings, silent: true, updateSettings: true})
            if (imported) {
              this.output += `\n[OK] All settings imported`
              resolve(true)
            } else { 
              this.output += `\n[ERROR] Unable to import settings`
              reject(false)
            }
          }))
        }).catch(() => {})
        this.output += `\n[INFO] Done`
        this.importStep=3
        this.$store.dispatch('profiles/loadMissingIcons')
      }
    }
  },
}
</script>
