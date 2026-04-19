import { defineShortcutsSetup } from '@slidev/types'

export default defineShortcutsSetup((nav, base) => {
  return base.filter(s => s.name !== 'toggle_overview' && s.name !== 'goto')
})
