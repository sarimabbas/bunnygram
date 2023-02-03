import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>Bunnygram 🐇📬</span>,
  footer: {
    text: <p>MIT 2023 © Bunnygram.</p>,
  },
  project: {
    link: "https://github.com/sarimabbas/bunnygram",
  },
  docsRepositoryBase:
    "https://github.com/sarimabbas/bunnygram/tree/main/packages/docs",
};

export default config;
