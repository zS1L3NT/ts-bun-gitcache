# Github Notion Sync

![License](https://img.shields.io/github/license/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Languages](https://img.shields.io/github/languages/count/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Top Language](https://img.shields.io/github/languages/top/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Commit Activity](https://img.shields.io/github/commit-activity/y/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Last commit](https://img.shields.io/github/last-commit/zS1L3NT/ts-github-notion-sync?style=for-the-badge)

Github Notion Sync is a server that reads all my github repositories and displays their information in my Notion board. This server syncs the Github data and Notion data bidirectionally, meaning that for any changes on either Github or Notion, my server will see which client changed the data at a later date, then replace the older data.

## Motivation

I have quite a few GitHub repositories that I have been spending my time managing and updating the description and tags of. Using github.com sometimes can be slow, tiring and difficult to get an overhead view of all my repositories in one page.

## Features

-   Two way syncing between Github and Notion
-   Syncs data about Repositories
    -   Name
    -   Description
    -   Homepage URL
    -   Tags
    -   Archived
    -   Private
-   Runs the sync 60 seconds after the previous sync finishes

## Usage

With `yarn`

```
$ yarn
$ yarn dev
```

With `npm`

```
$ npm i
$ npm run dev
```

## Built with

-   TypeScript
    -   [![typescript](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/dev/typescript?style=flat-square)](https://npmjs.com/package/typescript)
-   Notion
    -   [![@notionhq/client](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/@notionhq/client?style=flat-square)](https://npmjs.com/package/@notionhq/client)
-   Github
    -   [![@octokit/core](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/@octokit/core?style=flat-square)](https://npmjs.com/package/@octokit/core)
-   Miscellaneous
    -   [![colors](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/colors?style=flat-square)](https://npmjs.com/package/colors)
    -   [![tracer](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/tracer?style=flat-square)](https://npmjs.com/package/tracer)
