# Bunnygram 🐇 📬

- [Bunnygram 🐇 📬](#bunnygram--)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Documentation](#documentation)
  - [Contributing](#contributing)

## Introduction

Bunnygram is a task scheduler for Next.js. You might need it if you want to defer a computationally expensive or long-running task in the background.

## Installation

```sh
pnpm add bunnygram
```

You can also use `npm` or `yarn` etc.

Note that Bunnygram is ESM only.

NPM link: https://www.npmjs.com/package/bunnygram

## Documentation

This project is no longer maintained. Preserved documentation: <https://bunnygram.lil.run/>.

## Contributing

I would appreciate PRs that:

- Add more tests, particularly those mocking the HTTP request
- Add support for other "adapters" e.g. Zeplo.
- Improve type inference when there are no user provided types for job payload and response
- Anything else!
