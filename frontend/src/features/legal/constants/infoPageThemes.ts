export type InfoPageVariant = 'terms' | 'privacy' | 'rules' | 'about' | 'help'

export type TocMode = 'sidebar' | 'pills' | 'select' | 'none'
export type LayoutMode = 'narrow' | 'sidebar' | 'wide' | 'support'
export type SectionStyle = 'clause' | 'card' | 'playbook' | 'editorial' | 'support'

export interface InfoPageTheme {
  variant: InfoPageVariant
  tocMode: TocMode
  layout: LayoutMode
  sectionStyle: SectionStyle
  accentClass: string
  accentBorder: string
  accentBg: string
  accentText: string
  relatedLabel: string
}

export const INFO_PAGE_THEMES: Record<InfoPageVariant, InfoPageTheme> = {
  terms: {
    variant: 'terms',
    tocMode: 'pills',
    layout: 'narrow',
    sectionStyle: 'clause',
    accentClass: 'text-accent-primary',
    accentBorder: 'border-accent-primary/40',
    accentBg: 'bg-accent-primary/10',
    accentText: 'text-accent-primary',
    relatedLabel: 'Related policies',
  },
  privacy: {
    variant: 'privacy',
    tocMode: 'sidebar',
    layout: 'sidebar',
    sectionStyle: 'card',
    accentClass: 'text-accent-win',
    accentBorder: 'border-accent-win/35',
    accentBg: 'bg-accent-win/10',
    accentText: 'text-accent-win',
    relatedLabel: 'Your data & rights',
  },
  rules: {
    variant: 'rules',
    tocMode: 'pills',
    layout: 'wide',
    sectionStyle: 'playbook',
    accentClass: 'text-accent-gold',
    accentBorder: 'border-accent-gold/40',
    accentBg: 'bg-accent-gold/10',
    accentText: 'text-accent-gold',
    relatedLabel: 'Competition docs',
  },
  about: {
    variant: 'about',
    tocMode: 'select',
    layout: 'wide',
    sectionStyle: 'editorial',
    accentClass: 'text-accent-secondary',
    accentBorder: 'border-accent-secondary/35',
    accentBg: 'bg-accent-secondary/10',
    accentText: 'text-accent-secondary',
    relatedLabel: 'Explore further',
  },
  help: {
    variant: 'help',
    tocMode: 'none',
    layout: 'support',
    sectionStyle: 'support',
    accentClass: 'text-accent-live',
    accentBorder: 'border-accent-live/35',
    accentBg: 'bg-accent-live/10',
    accentText: 'text-accent-live',
    relatedLabel: 'Policy references',
  },
}

export function getInfoTheme(variant: InfoPageVariant) {
  return INFO_PAGE_THEMES[variant]
}
