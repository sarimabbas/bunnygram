import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>Bunnygram 🐇📬</span>,
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Bunnygram",
      description: "Simple task scheduling for Next.js",
    };
  },
  footer: {
    text: <p>MIT {new Date().getFullYear()} © Bunnygram.</p>,
  },
  project: {
    link: "https://github.com/sarimabbas/bunnygram",
  },
  docsRepositoryBase:
    "https://github.com/sarimabbas/bunnygram/tree/main/packages/docs",
};

export default config;
