import "dotenv/config"

import AfterEvery from "after-every"
import assert from "assert"
import colors from "colors"
import express from "express"
import fs from "fs"
import Tracer from "tracer"

import isImageBlock from "./functions/isImageBlock"
import GithubRepository from "./repositories/GithubRepository"
import NotionRepository from "./repositories/NotionRepository"
import DiffCalc from "./utils/DiffCalc"

const PORT = 2348
const app = express()

fs.mkdirSync(`./public/${process.env.GITHUB__OWNER}`, { recursive: true })
app.use(express.static("public"))

global.logger = Tracer.colorConsole({
	level: process.env.LOG_LEVEL || "log",
	format: [
		"[{{timestamp}}] <{{path}}> {{message}}",
		{
			//@ts-ignore
			alert: "[{{timestamp}}] <{{path}}, Line {{line}}> {{message}}",
			warn: "[{{timestamp}}] <{{path}}, Line {{line}}> {{message}}",
			error: "[{{timestamp}}] <{{path}}, Line {{line}} at {{pos}}> {{message}}"
		}
	],
	methods: ["log", "debug", "info", "alert", "warn", "error"],
	dateformat: "dd mmm yyyy, hh:MM:sstt",
	filters: {
		log: colors.grey,
		debug: colors.blue,
		info: colors.green,
		//@ts-ignore
		alert: colors.yellow,
		warn: colors.yellow.bold.italic,
		error: colors.red.bold.italic
	},
	preprocess: data => {
		data.path = data.path
			.split("ts-github-notion-sync")
			.at(-1)!
			.replace(/^(\/|\\)(dist|src)/, "src")
			.replaceAll("\\", "/")
	}
})

const githubRepository = new GithubRepository()
const notionRepository = new NotionRepository()
let syncLock = false

const sync = async () => {
	if (syncLock) {
		logger.log(`Previous sync still ongoing, skipping current sync`)
		return
	}

	syncLock = true

	try {
		logger.log("Fetching Github Repositories")
		const grs = await githubRepository.getRepositories()

		logger.log("Fetching Notion Repositories")
		const nrs = await notionRepository.getRepositories()

		// Delete non-matching notion pages
		for (const nr of nrs) {
			if (!grs.find(gr => gr.id === nr.id)) {
				logger.warn(`Deleting non-matching notion page <${nr.title}>`)
				await notionRepository.deletePage(nr.pageId)
				nrs.splice(
					nrs.findIndex(r => r.id === nr.id),
					1
				)
			}
		}

		// Add inexistent github repositories
		for (const gr of grs) {
			if (!nrs.find(nr => nr.id === gr.id)) {
				logger.info(`Creating new notion page <${gr.title}>`)
				nrs.push(await notionRepository.createPage(gr))
			}
		}

		assert(grs.length === nrs.length)
		for (const gr of grs) {
			const nr = nrs.find(nr => nr.id === gr.id)!

			const diffCalc = new DiffCalc(gr, nr)
			if (diffCalc.getUpdatedKeys().length > 0) {
				logger.info(`Updating notion page <${nr.title}>`, diffCalc.formatNotionToGithub())
				notionRepository.updatePage(gr, nr.pageId)
			}
		}

		logger.log(`Fetching Notion Page Blocks`)
		const pageBlocks = await Promise.all(nrs.map(nr => notionRepository.getBlocks(nr)))

		for (let i = 0; i < pageBlocks.length; i++) {
			const blocks = pageBlocks[i]!.results
			const nr = nrs[i]!

			switch (blocks.length) {
				case 0:
					logger.info(`No blocks found, adding image block <${nr.title}>`)
					await notionRepository.addImageBlock(nr)
					break
				default:
					if ("type" in blocks[0]! && blocks[0].type === "image") {
						if (!isImageBlock(blocks[0], nr)) {
							logger.info(`One invalid image block found, editing it <${nr.title}>`)
							await notionRepository.editImageBlock(blocks[0].id, nr)
						} else {
							const readmeLastEdited = await githubRepository.getReadmeLastEdited(nr)
							if (
								readmeLastEdited.getTime() >
								new Date(blocks[0].last_edited_time).getTime()
							) {
								logger.info(`Image block outdated, updating it <${nr.title}>`)
								await notionRepository.editImageBlock(blocks[0].id, nr)
							}
						}
						break
					}

					logger.info(
						`First block not an image block, replacing all blocks <${nr.title}>`
					)
					for (const block of blocks) {
						await notionRepository.deleteBlock(block.id)
					}
					await notionRepository.addImageBlock(nr)
			}
		}

		logger.log("Syncing complete\n")
	} catch (err) {
		logger.error(err)
	}

	syncLock = false
}

AfterEvery(1).minutes(sync)

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))
