# Github Notion Sync

![License](https://img.shields.io/github/license/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Languages](https://img.shields.io/github/languages/count/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Top Language](https://img.shields.io/github/languages/top/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Commit Activity](https://img.shields.io/github/commit-activity/y/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Last commit](https://img.shields.io/github/last-commit/zS1L3NT/ts-github-notion-sync?style=for-the-badge)

Github Notion Sync is a server that reads all my github repositories and displays their information in my Notion board. This server syncs the Github data and Notion data bidirectionally, meaning that for any changes on either Github or Notion, my server will see which client changed the data at a later date, then replace the older data.

This project was terminated because

-   Notion API is very slow
-   Possible unfixable sync errors
    -   Notion API has no webhooks or change listeners
    -   Notion API is inconsistent with the `last_edited_time` property
-   Github doesn't allow unarchiving a repository through the API

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
-   Runs the sync every minute at 0s
-   Syncs the README file of the repository to each Notion page

## Usage

Copy the .env.example file to .env then fill in the file with the correct project credentials.

```
$ npm i
$ npm run dev
```

## Built with

-   TypeScript
    -   [![@types/express](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/dev/@types/express?style=flat-square)](https://npmjs.com/package/@types/express)
    -   [![typescript](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/dev/typescript?style=flat-square)](https://npmjs.com/package/typescript)
-   Notion
    -   [![@notionhq/client](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/@notionhq/client?style=flat-square)](https://npmjs.com/package/@notionhq/client)
-   Github
    -   [![@octokit/core](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/@octokit/core?style=flat-square)](https://npmjs.com/package/@octokit/core)
-   File Converters
    -   [![convert-md](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/convert-md?style=flat-square)](https://npmjs.com/package/convert-md)
    -   [![puppeteer](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/puppeteer?style=flat-square)](https://npmjs.com/package/puppeteer)
-   Miscellaneous
    -   [![after-every](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/after-every?style=flat-square)](https://npmjs.com/package/after-every)
    -   [![axios](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/axios?style=flat-square)](https://npmjs.com/package/axios)
    -   [![colors](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/colors?style=flat-square)](https://npmjs.com/package/colors)
    -   [![express](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/express?style=flat-square)](https://npmjs.com/package/express)
    -   [![no-try](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/no-try?style=flat-square)](https://npmjs.com/package/no-try)
    -   [![tracer](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/tracer?style=flat-square)](https://npmjs.com/package/tracer)
