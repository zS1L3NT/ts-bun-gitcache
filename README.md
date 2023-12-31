# Gitcache

![License](https://img.shields.io/github/license/zS1L3NT/ts-bun-gitcache?style=for-the-badge) ![Languages](https://img.shields.io/github/languages/count/zS1L3NT/ts-bun-gitcache?style=for-the-badge) ![Top Language](https://img.shields.io/github/languages/top/zS1L3NT/ts-bun-gitcache?style=for-the-badge) ![Commit Activity](https://img.shields.io/github/commit-activity/y/zS1L3NT/ts-bun-gitcache?style=for-the-badge) ![Last commit](https://img.shields.io/github/last-commit/zS1L3NT/ts-bun-gitcache?style=for-the-badge)

Gitcache is helps me cache my current github repositories so that it can be queried easily by [my portfolio website](https://github.com/zS1L3NT/web-next-portfolio). This needs to be in a separate repository and not as a serverless function because the runtime limit of a Vercel serverless function is 10s and this project takes more than 10s to run.

## Motivation

I want my portfolio website to have a way to filter project by the technologies (tags) that the project uses, and this caching system helps with that.

## Usage

Copy the .env.example file to .env then fill in the file with the correct project credentials.

```
$ bun i
$ bun start
```

## Built with

-   BunJS
    -   TypeScript
        -   [![@types/node-cron](https://img.shields.io/badge/%40types%2Fnode--cron-%5E3.0.11-red?style=flat-square)](https://npmjs.com/package/@types/node-cron/v/3.0.11)
        -   [![@typescript-eslint/eslint-plugin](https://img.shields.io/badge/%40typescript--eslint%2Feslint--plugin-latest-red?style=flat-square)](https://npmjs.com/package/@typescript-eslint/eslint-plugin/v/latest)
        -   [![@typescript-eslint/parser](https://img.shields.io/badge/%40typescript--eslint%2Fparser-latest-red?style=flat-square)](https://npmjs.com/package/@typescript-eslint/parser/v/latest)
        -   [![typescript](https://img.shields.io/badge/typescript-%5E4.9.5-red?style=flat-square)](https://npmjs.com/package/typescript/v/4.9.5)
    -   ESLint
        -   [![eslint](https://img.shields.io/badge/eslint-latest-red?style=flat-square)](https://npmjs.com/package/eslint/v/latest)
        -   [![eslint-config-prettier](https://img.shields.io/badge/eslint--config--prettier-latest-red?style=flat-square)](https://npmjs.com/package/eslint-config-prettier/v/latest)
        -   [![eslint-plugin-simple-import-sort](https://img.shields.io/badge/eslint--plugin--simple--import--sort-latest-red?style=flat-square)](https://npmjs.com/package/eslint-plugin-simple-import-sort/v/latest)
        -   [![prettier](https://img.shields.io/badge/prettier-latest-red?style=flat-square)](https://npmjs.com/package/prettier/v/latest)
    -   Miscellaneous
        -   [![@octokit/core](https://img.shields.io/badge/%40octokit%2Fcore-%5E3.6.0-red?style=flat-square)](https://npmjs.com/package/@octokit/core/v/3.6.0)
        -   [![@prisma/client](https://img.shields.io/badge/%40prisma%2Fclient-%5E5.1.1-red?style=flat-square)](https://npmjs.com/package/@prisma/client/v/5.1.1)
        -   [![axios](https://img.shields.io/badge/axios-%5E0.27.2-red?style=flat-square)](https://npmjs.com/package/axios/v/0.27.2)
        -   [![bun-types](https://img.shields.io/badge/bun--types-%5E1.0.20-red?style=flat-square)](https://npmjs.com/package/bun-types/v/1.0.20)
        -   [![node-cron](https://img.shields.io/badge/node--cron-%5E3.0.3-red?style=flat-square)](https://npmjs.com/package/node-cron/v/3.0.3)
        -   [![prisma](https://img.shields.io/badge/prisma-%5E5.1.1-red?style=flat-square)](https://npmjs.com/package/prisma/v/5.1.1)
