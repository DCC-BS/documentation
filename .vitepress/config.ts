import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "markdown",
  base: process.env.NODE_ENV === 'production' ? '/documentation/' : '/',
  title: "DCC Dev Guidelines",
  description: "Guidelines for the DCC Developers",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/imgs/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Team', link: '/team' },
    ],
    footer: {
      message: "Developed with ❤️ by the DCC. Documentation released under the MIT License.",
      copyright: "Copyright © 2025 DCC",
    },

    search: {
      provider: 'local',
    },

    sidebar: [
      {
        text: 'Docker',
        items: [
          { text: 'Docker', link: '/docker' }
        ]
      },
      {
        text: 'Coding',
        items: [
          { text: 'Coding', link: '/general' },
          { text: 'Python', link: '/python' },
          { text: 'Nuxt / Vue', link: '/nuxt' }
        ]
      },
      {
        text: 'Git / GitHub / CI/CD',
        items: [
          { text: 'Git / GitHub / CI/CD', link: '/git' }
        ]
      },
      {
        text: 'Team',
        items: [
          { text: 'Team', link: '/team' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/dcc-bs' },
    ]
  },
  lastUpdated: true
})
