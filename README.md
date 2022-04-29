# Github Notion Sync

![License](https://img.shields.io/github/license/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Languages](https://img.shields.io/github/languages/count/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Top Language](https://img.shields.io/github/languages/top/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Commit Activity](https://img.shields.io/github/commit-activity/y/zS1L3NT/ts-github-notion-sync?style=for-the-badge) ![Last commit](https://img.shields.io/github/last-commit/zS1L3NT/ts-github-notion-sync?style=for-the-badge)

Github Notion Sync is a server that reads all my github repositories and displays their information in my Notion board. This server syncs the Github data and Notion data in one direction, meaning that any change to a repository's information will be reflected in the Notion board. The Notion board can be viewed [here](https://zs1l3nt.notion.site/8ebb45edc82e4a6fafa3046a59fce9c2?v=c19a65a264514e6682c4736c5850a786)

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
-   Syncs the README file of the repository to each Notion page

## Usage

Copy the .env.example file to .env then fill in the file with the correct project credentials.

```
$ npm i
$ npm run dev
```

## Built with

-   TypeScript
    -   [![@types/streamifier](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/dev/@types/streamifier?style=flat-square)](https://npmjs.com/package/@types/streamifier)
    -   [![typescript](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/dev/typescript?style=flat-square)](https://npmjs.com/package/typescript)
-   Notion
    -   [![@notionhq/client](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/@notionhq/client?style=flat-square)](https://npmjs.com/package/@notionhq/client)
-   Github
    -   [![@octokit/core](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/@octokit/core?style=flat-square)](https://npmjs.com/package/@octokit/core)
-   File Converters
    -   [![convert-md](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/convert-md?style=flat-square)](https://npmjs.com/package/convert-md)
    -   [![puppeteer](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/puppeteer?style=flat-square)](https://npmjs.com/package/puppeteer)
-	File Uploading
    -   [![cloudinary](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/cloudinary?style=flat-square)](https://npmjs.com/package/cloudinary)
    -   [![streamifier](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/streamifier?style=flat-square)](https://npmjs.com/package/streamifier)
-   Miscellaneous
    -   [![after-every](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/after-every?style=flat-square)](https://npmjs.com/package/after-every)
    -   [![axios](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/axios?style=flat-square)](https://npmjs.com/package/axios)
    -   [![colors](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/colors?style=flat-square)](https://npmjs.com/package/colors)
    -   [![dotenv](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/dotenv?style=flat-square)](https://npmjs.com/package/dotenv)
    -   [![no-try](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/no-try?style=flat-square)](https://npmjs.com/package/no-try)
    -   [![tracer](https://img.shields.io/github/package-json/dependency-version/zS1L3NT/ts-github-notion-sync/tracer?style=flat-square)](https://npmjs.com/package/tracer)
