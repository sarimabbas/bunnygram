import { DocsThemeConfig } from "nextra-theme-docs";
import { useRouter } from "next/router";

const config: DocsThemeConfig = {
  banner: { key: 'archived', text: 'RIP — Bunnygram is no longer maintained. These docs are preserved for reference.' },
  logo: <span>Bunnygram 🐇📬</span>,
  useNextSeoProps() {
    const { asPath } = useRouter();
    return {
      titleTemplate: "%s – Bunnygram",
      canonical: new URL(asPath.split(/[?#]/)[0], "https://bunnygram.lil.run").href,
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
        content="https://bunnygram.lil.run/cover.png"
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
