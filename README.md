# Github Notion Sync

![License](https://img.shields.io/github/license/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Languages](https://img.shields.io/github/languages/count/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Top Language](https://img.shields.io/github/languages/top/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Commit Activity](https://img.shields.io/github/commit-activity/y/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Last commit](https://img.shields.io/github/last-commit/zS1L3NT/ts-github-notion-sync?style=for-the-badge)

Github Notion Sync is a server that reads all my github repositories and displays their information in my Notion board. This server syncs the Github data and Notion data in one direction, meaning that any change to a repository's information will be reflected in the Notion board. The Notion board can be viewed [here](https://zs1l3nt.notion.site/8ebb45edc82e4a6fafa3046a59fce9c2?v=c19a65a264514e6682c4736c5850a786)

This project also stores fetched data from GitHub into a database so that my [portfolio website](https://github.com/zS1L3NT/web-next-portfolio) can do advanced querying on the fetched data.

## Motivation

I have quite a few GitHub repositories that I have been spending my time managing and updating the description and tags of. Using github.com sometimes can be slow, tiring and difficult to get an overhead view of all my repositories in one page.

## Features

-   Reads all my repositories and displays them in my Notion board
-   Syncs data about Repositories
    -   Name
    -   Description
    -   Homepage URL
    -   Tags
    -   Archived
    -   Private
-   Runs the sync every minute at 0s

## Usage

Copy the .env.example file to .env then fill in the file with the correct project credentials.

```
$ npm i
$ npm run dev
```

## Built with

-   TypeScript
	-   TypeScript
        -   [![@types/node](https://img.shields.io/badge/%40types%2Fnode-latest-red?style=flat-square)](https://npmjs.com/package/@types/node/v/latest)
        -   [![@typescript-eslint/eslint-plugin](https://img.shields.io/badge/%40typescript--eslint%2Feslint--plugin-latest-red?style=flat-square)](https://npmjs.com/package/@typescript-eslint/eslint-plugin/v/latest)
        -   [![@typescript-eslint/parser](https://img.shields.io/badge/%40typescript--eslint%2Fparser-latest-red?style=flat-square)](https://npmjs.com/package/@typescript-eslint/parser/v/latest)
        -   [![ts-node](https://img.shields.io/badge/ts--node-%5E10.9.1-red?style=flat-square)](https://npmjs.com/package/ts-node/v/10.9.1)
        -   [![typescript](https://img.shields.io/badge/typescript-%5E4.9.5-red?style=flat-square)](https://npmjs.com/package/typescript/v/4.9.5)
	-   Notion
        -   [![@notionhq/client](https://img.shields.io/badge/%40notionhq%2Fclient-%5E1.0.4-red?style=flat-square)](https://npmjs.com/package/@notionhq/client/v/1.0.4)
	-   Github
        -   [![@octokit/core](https://img.shields.io/badge/%40octokit%2Fcore-%5E3.6.0-red?style=flat-square)](https://npmjs.com/package/@octokit/core/v/3.6.0)
	-	ESLint
        -   [![eslint](https://img.shields.io/badge/eslint-latest-red?style=flat-square)](https://npmjs.com/package/eslint/v/latest)
        -   [![eslint-config-prettier](https://img.shields.io/badge/eslint--config--prettier-latest-red?style=flat-square)](https://npmjs.com/package/eslint-config-prettier/v/latest)
        -   [![eslint-plugin-simple-import-sort](https://img.shields.io/badge/eslint--plugin--simple--import--sort-latest-red?style=flat-square)](https://npmjs.com/package/eslint-plugin-simple-import-sort/v/latest)
        -   [![prettier](https://img.shields.io/badge/prettier-latest-red?style=flat-square)](https://npmjs.com/package/prettier/v/latest)
	-   Miscellaneous
        -   [![@prisma/client](https://img.shields.io/badge/%40prisma%2Fclient-%5E5.1.1-red?style=flat-square)](https://npmjs.com/package/@prisma/client/v/5.1.1)
        -   [![after-every](https://img.shields.io/badge/after--every-%5E1.0.4-red?style=flat-square)](https://npmjs.com/package/after-every/v/1.0.4)
        -   [![axios](https://img.shields.io/badge/axios-%5E0.27.2-red?style=flat-square)](https://npmjs.com/package/axios/v/0.27.2)
        -   [![colors](https://img.shields.io/badge/colors-%5E1.4.0-red?style=flat-square)](https://npmjs.com/package/colors/v/1.4.0)
        -   [![dotenv](https://img.shields.io/badge/dotenv-%5E16.3.1-red?style=flat-square)](https://npmjs.com/package/dotenv/v/16.3.1)
        -   [![no-try](https://img.shields.io/badge/no--try-%5E3.1.0-red?style=flat-square)](https://npmjs.com/package/no-try/v/3.1.0)
        -   [![prisma](https://img.shields.io/badge/prisma-%5E5.1.1-red?style=flat-square)](https://npmjs.com/package/prisma/v/5.1.1)
        -   [![tracer](https://img.shields.io/badge/tracer-%5E1.1.6-red?style=flat-square)](https://npmjs.com/package/tracer/v/1.1.6)