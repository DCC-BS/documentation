<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://avatars.githubusercontent.com/u/5276871?v=4',
    name: 'Tobias Bolinger',
    title: 'Developer',
    links: [
      { icon: 'github', link: 'https://github.com/swordbreaker' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/tobias-bollinger-657784154' },
      { icon: 'gmail', link: 'mailto:tobias.bollinger@bs.ch' }
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/15014440?v=4',
    name: 'Yanick Schraner',
    title: 'Developer',
    links: [
      { icon: 'github', link: 'https://github.com/YanickSchraner' },
      { icon: 'twitter', link: 'https://www.linkedin.com/in/yanick-schraner' },
      { icon: 'gmail', link: 'mailto:yanick.schraner@bs.ch' }
    ]
  },
  {
    avatar: 'https://avatars.githubusercontent.com/u/6950000?v=4',
    name: 'Thomas Gerig',
    title: 'Developer',
    links: [
      { icon: 'github', link: 'https://github.com/thogerig' },
      { icon: 'twitter', link: 'https://www.linkedin.com/in/thomas-gerig/' },
      { icon: 'gmail', link: 'mailto:thomas.gerig@bs.ch' }
    ]
  },
]
</script>

# Our Team

Say hello to our awesome team.

<VPTeamMembers size="small" :members />