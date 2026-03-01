export const PARTY_COLORS = {
  BJP: '#FF6B35', INC: '#4A9EFF', AAP: '#2ECC71', TMC: '#8E44AD',
  SP: '#E74C3C', BSP: '#3498DB', DMK: '#E67E22', AIADMK: '#1ABC9C',
  TRS: '#F39C12', BRS: '#F39C12', 'TRS/BRS': '#F39C12',
  'YSR Congress': '#2980B9', TDP: '#D4AC0D', NCP: '#6C3483',
  'Shiv Sena': '#E74C3C', JDU: '#27AE60', RJD: '#E74C3C',
  LDF: '#C0392B', UDF: '#2471A3', SAD: '#F1C40F',
  JMM: '#1E8449', SKM: '#117A65', NC: '#5D6D7E', PDP: '#784212',
}

export function getPartyColor(name) {
  if (PARTY_COLORS[name]) return PARTY_COLORS[name]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return `hsl(${h},65%,55%)`
}

export const SECTOR_ICONS  = ['⚙️', '📚', '💼', '🏥', '🚌']
export const SECTOR_COLORS = ['#FFD700', '#4A9EFF', '#2ECC71', '#E74C3C', '#9B59B6']
export const SECTOR_KEYS   = ['Administration', 'Education', 'Employment', 'Health', 'Public Transport']

export function sentClass(label) {
  if (label === 'Positive')
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
  if (label === 'Negative')
    return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20'
  return 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
}
