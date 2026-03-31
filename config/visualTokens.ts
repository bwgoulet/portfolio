export const VISUAL_TOKENS = {
  colorRoles: {
    surface: {
      base: '#2b1f2e',
      text: '#d8ecff',
      panel: '#f6f2e7',
      panelText: '#121314'
    },
    accent: {
      warm: '#ffbb87',
      warmStrong: '#f58f6e',
      dusk: '#8f4f65',
      sky: '#edf3f8'
    },
    hover: {
      interactive: '#dcca9f',
      glow: '#f8d899'
    },
    focus: {
      ring: '#dcecff'
    },
    overlay: {
      scrim: 'rgba(8, 10, 12, 0.38)',
      glass: 'rgba(24, 24, 30, 0.35)',
      cardBorder: 'rgba(22, 24, 23, 0.68)'
    }
  },
  overlay: {
    spacing: {
      cardPadding: 'clamp(1rem, 2.5vw, 1.8rem)',
      cardPaddingCompact: 'clamp(1rem, 2.5vw, 1.6rem)',
      brandPadding: '0.85rem 1.05rem'
    },
    radius: {
      sm: '8px',
      md: '14px',
      pill: '999px'
    },
    shadow: {
      elevated: '0 28px 70px rgba(0, 0, 0, 0.52)',
      subtle: '0 2px 14px rgba(22, 11, 5, 0.35)',
      note: '0 1px 2px rgba(0, 0, 0, 0.18)'
    }
  },
  motion: {
    duration: {
      fast: 0.18,
      normal: 0.2,
      cloud: '14s',
      cloudSlow: '18s'
    },
    ease: {
      smoothOut: 'power2.out'
    }
  },
  lighting: {
    hemisphere: { intensity: 0.58, skyTint: '#ffe3c6', groundTint: '#2d3a34' },
    ambient: { intensity: 0.22, tint: '#ffd8bf' },
    key: { intensity: 2.1, tint: '#ffbc84' },
    fill: { intensity: 0.44, tint: '#8eb0ff' },
    rim: { intensity: 0.62, tint: '#9ac1ff' },
    sun: { tint: '#ffcc72' },
    warmBounce: { tint: '#ffc47a' }
  },
  scene: {
    billboard: {
      emissiveHover: '#433318',
      emissiveIdle: '#1f180f',
      titlePrimaryHover: '#f8d899',
      titlePrimaryIdle: '#7a592f',
      titlePrimaryOutlineHover: '#3a2a16',
      titlePrimaryOutlineIdle: '#2d210f',
      titleSecondaryHover: '#ffd8a5',
      titleSecondaryIdle: '#c79b62',
      noteEmissiveActive: '#534212',
      noteEmissiveIdle: '#32270d',
      notePin: '#b9a277'
    },
    cabin: {
      base: '#3e352f',
      trim: '#6b5642',
      chimney: '#534b4f',
      porch: '#604a39',
      windowGlow: '#d2bc90',
      windowFrame: '#4a3528',
      doorHover: '#6d4f2f',
      doorIdle: '#17100a',
      label: '#f6e6be',
      labelSubtle: '#e7d3a0',
      labelOutline: '#15100a'
    },
    environment: {
      tabletBase: '#5a615f',
      tabletHover: '#9da3a6',
      tabletEmissiveHover: '#49605a',
      tabletEmissiveIdle: '#1e2322',
      tabletCap: '#95a3a0',
      tabletImageHover: '#ffffff',
      tabletImageIdle: '#e0e0dd',
      mountainMid: '#2b3443',
      mountainFront: '#344256',
      mountainSnow: '#7f95ad',
      cloudMain: '#edf5ff',
      cloudBright: '#f7fbff',
      cloudCool: '#e8f1ff',
      cloudCore: '#ffffff',
      engravingPlate: '#28372d',
      engravingText: '#1a261f',
      signPost: '#4c382c',
      signBoard: '#7a5639',
      signText: '#f6e5be',
      grassBase: '#274431',
      mossA: '#365441',
      mossB: '#35513f',
      pathEdge: '#66766a',
      pathLow: '#495b50'
    },
    cabinInterior: {
      floor: '#3d2f25',
      wallBack: '#4a382d',
      wallSide: '#433226',
      tableTop: '#5b4334',
      tableLeg: '#3a2a1f',
      monitorBody: '#3e444f',
      monitorScreen: '#7cc8a8',
      photoPalette: ['#d6b383', '#caa17d', '#b98a68', '#dec89b', '#b57d5e'] as const
    }
  },
  ui: {
    brand: {
      border: 'rgba(245, 236, 217, 0.5)',
      title: '#fff1df',
      subtitle: '#ffe2bf',
      cloudInner: 'rgba(255, 245, 226, 0.9)',
      cloudOuter: 'rgba(255, 228, 199, 0.24)'
    },
    backButton: {
      border: 'rgba(212, 226, 240, 0.32)',
      background: 'rgba(12, 20, 28, 0.82)',
      text: '#dcecff',
      hoverBackground: 'rgba(20, 34, 46, 0.92)'
    },
    note: {
      border: 'rgba(44, 34, 18, 0.24)',
      scribble: 'rgba(50, 38, 17, 0.58)'
    },
    detail: {
      noteImageBorder: 'rgba(15, 17, 16, 0.8)',
      noteBodyText: 'rgba(19, 20, 18, 0.88)',
      experienceBackgroundTop: 'rgba(18, 25, 31, 0.98)',
      experienceBackgroundBottom: 'rgba(28, 38, 45, 0.96)',
      experienceBorder: 'rgba(224, 236, 245, 0.32)',
      experienceTitle: '#fff3dd',
      experienceMeta: '#cfdfec',
      experienceList: '#e8eff5'
    }
  }
} as const;

export function getVisualTokenCssVariables() {
  const t = VISUAL_TOKENS;
  return {
    '--vt-surface-base': t.colorRoles.surface.base,
    '--vt-surface-text': t.colorRoles.surface.text,
    '--vt-surface-panel': t.colorRoles.surface.panel,
    '--vt-surface-panel-text': t.colorRoles.surface.panelText,
    '--vt-accent-warm': t.colorRoles.accent.warm,
    '--vt-accent-warm-strong': t.colorRoles.accent.warmStrong,
    '--vt-accent-dusk': t.colorRoles.accent.dusk,
    '--vt-accent-sky': t.colorRoles.accent.sky,
    '--vt-hover-interactive': t.colorRoles.hover.interactive,
    '--vt-focus-ring': t.colorRoles.focus.ring,
    '--vt-overlay-scrim': t.colorRoles.overlay.scrim,
    '--vt-overlay-glass': t.colorRoles.overlay.glass,
    '--vt-overlay-card-border': t.colorRoles.overlay.cardBorder,
    '--vt-overlay-padding-card': t.overlay.spacing.cardPadding,
    '--vt-overlay-padding-card-compact': t.overlay.spacing.cardPaddingCompact,
    '--vt-overlay-padding-brand': t.overlay.spacing.brandPadding,
    '--vt-overlay-radius-sm': t.overlay.radius.sm,
    '--vt-overlay-radius-md': t.overlay.radius.md,
    '--vt-overlay-radius-pill': t.overlay.radius.pill,
    '--vt-overlay-shadow-elevated': t.overlay.shadow.elevated,
    '--vt-overlay-shadow-subtle': t.overlay.shadow.subtle,
    '--vt-overlay-shadow-note': t.overlay.shadow.note,
    '--vt-motion-cloud': t.motion.duration.cloud,
    '--vt-motion-cloud-slow': t.motion.duration.cloudSlow,
    '--vt-brand-border': t.ui.brand.border,
    '--vt-brand-title': t.ui.brand.title,
    '--vt-brand-subtitle': t.ui.brand.subtitle,
    '--vt-brand-cloud-inner': t.ui.brand.cloudInner,
    '--vt-brand-cloud-outer': t.ui.brand.cloudOuter,
    '--vt-back-border': t.ui.backButton.border,
    '--vt-back-bg': t.ui.backButton.background,
    '--vt-back-text': t.ui.backButton.text,
    '--vt-back-bg-hover': t.ui.backButton.hoverBackground,
    '--vt-note-border': t.ui.note.border,
    '--vt-note-scribble': t.ui.note.scribble,
    '--vt-note-image-border': t.ui.detail.noteImageBorder,
    '--vt-note-body-text': t.ui.detail.noteBodyText,
    '--vt-experience-bg-top': t.ui.detail.experienceBackgroundTop,
    '--vt-experience-bg-bottom': t.ui.detail.experienceBackgroundBottom,
    '--vt-experience-border': t.ui.detail.experienceBorder,
    '--vt-experience-title': t.ui.detail.experienceTitle,
    '--vt-experience-meta': t.ui.detail.experienceMeta,
    '--vt-experience-list': t.ui.detail.experienceList
  } as const;
}
