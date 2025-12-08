import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid({
	title: "DCC Dev Guidelines",
	description: "Guidelines for the DCC Developers",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		logo: "/imgs/logo.png",
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Team", link: "/team" },
		],

		sidebar: [
			{
				text: "Docker",
				items: [{ text: "Docker", link: "/docker" }],
			},
		],

		socialLinks: [{ icon: "github", link: "https://github.com/dcc-bs" }],
	},
});
