---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "DCC Guidelines"
  text: "How we do things around here"
  tagline: Development standards, best practices, and shared packages for the Data Competence Center
  actions:
    - theme: brand
      text: Get Started
      link: /dev-setup
    - theme: alt
      text: Meet the Team
      link: /team

features:
  - title: Docker
    details: Container standards, best practices for Dockerfiles, and deployment configurations.
    icon: 
      light: https://cdn.simpleicons.org/docker
      dark: https://cdn.simpleicons.org/docker/white
    link: /docker
    linkText: View Docker Standards

  - title: Git & CI/CD
    details: Version control workflows, branching strategies, and continuous integration pipelines.
    icon: 
      light: https://cdn.simpleicons.org/github
      dark: https://cdn.simpleicons.org/github/white
    link: /git
    linkText: View Git Standards

  - title: Python
    details: Coding conventions, linting rules, and project structure for Python applications.
    icon: 
      light: https://cdn.simpleicons.org/python
      dark: https://cdn.simpleicons.org/python/white
    link: /coding/python
    linkText: View Python Standards

  - title: Nuxt / Vue
    details: Frontend architecture, component patterns, and Vue.js best practices.
    icon: 
      light: https://cdn.simpleicons.org/nuxt
      dark: https://cdn.simpleicons.org/nuxt/white
    link: /coding/nuxt
    linkText: View Nuxt Standards

  - title: Backend Common
    details: Shared Python utilities for configuration, logging, LLM integration, and health probes.
    icon: 
      light: https://cdn.simpleicons.org/fastapi
      dark: https://cdn.simpleicons.org/fastapi/white
    link: /backend-common
    linkText: Explore Package

  - title: User Interface
    details: Reusable Vue components, composables, and Nuxt layers for consistent UI across projects.
    icon: 
      light: https://cdn.simpleicons.org/vuedotjs
      dark: https://cdn.simpleicons.org/vuedotjs/white
    link: /user-interface
    linkText: Explore Components

  - title: Nuxt Layers
    details: Modular Nuxt layers for authentication, logging, health checks, and backend communication.
    icon: 
      light: https://cdn.simpleicons.org/nuxt
      dark: https://cdn.simpleicons.org/nuxt/white
    link: /nuxt-layers
    linkText: Explore Layers

  - title: How-To Guides
    details: Step-by-step tutorials for common tasks like changelogs and encrypting environment files.
    icon: 
      light: https://cdn.simpleicons.org/readthedocs
      dark: https://cdn.simpleicons.org/readthedocs/white
    link: /howto/changelogs
    linkText: View Guides
---
