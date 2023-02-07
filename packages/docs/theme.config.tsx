import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>Bunnygram 🐇📬</span>,
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Bunnygram",
    };
  },
  head: (
    <>
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Bunnygram" />
      <meta
        property="og:description"
        content="Simple task scheduling for Next.js"
      />
      <meta
        property="og:image"
        content="https://bunnygram.vercel.app/cover.png"
      />
    </>
  ),
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
