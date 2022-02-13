import AfterEvery from "after-every"
import assert from "assert"
import colors from "colors"
import config from "./config.json"
import DiffCalc from "./utils/DiffCalc"
import express from "express"
import fs from "fs"
import GithubRepository from "./repositories/GithubRepository"
import isImageBlock from "./functions/isImageBlock"
import isUnarchiveBlock from "./functions/isUnarchiveBlock"
import NotionRepository from "./repositories/NotionRepository"
import Tracer from "tracer"

const PORT = 2348
const app = express()

fs.mkdirSync(`./public/${config.github.owner}`, { recursive: true })
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
		logger.warn(`Previous sync still ongoing, skipping current sync`)
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
				if (gr.lastEdited.getTime() > nr.lastEdited.getTime()) {
					logger.info(
						`Updating notion page <${nr.title}>`,
						diffCalc.formatNotionToGithub()
					)
					notionRepository.updatePage(gr, nr.pageId)
				} else {
					if (gr.archived) {
						logger.warn(`Cannot update archived repository <${gr.title}>`)
						logger.info(
							`Updating notion page <${nr.title}>`,
							diffCalc.formatNotionToGithub()
						)
						notionRepository.updatePage(gr, nr.pageId)
					} else {
						logger.info(
							`Updating github page <${gr.title}>`,
							diffCalc.formatGithubToNotion()
						)
						githubRepository.updateRepository(diffCalc)
					}
				}
			}
		}

		logger.log(`Fetching Notion Page Blocks`)
		const pageBlocks = await Promise.all(nrs.map(nr => notionRepository.getBlocks(nr)))

		for (let i = 0; i < pageBlocks.length; i++) {
			const blocks = pageBlocks[i]!.results
			const nr = nrs[i]!
			logger.log(`Syncing blocks for ${nr.title}`, nr.archived ? `(archived)` : ``)

			if (nr.archived) {
				switch (blocks.length) {
					case 0:
						logger.info(`No blocks found, adding both`)
						await notionRepository.addUnarchiveLink(nr)
						await notionRepository.addImageBlock(nr)
						break
					case 1:
						if ("type" in blocks[0]! && blocks[0].type === "bookmark") {
							if (!isUnarchiveBlock(blocks[0], nr)) {
								logger.info(`One invalid bookmark block found, editing it`)
								await notionRepository.editUnarchiveLink(blocks[0].id, nr)
							}

							logger.info(`Adding image block`)
							await notionRepository.addImageBlock(nr)
						}

						logger.info(`Single block type was incorrect, adding all blocks`)
						await notionRepository.deleteBlock(blocks[0]!.id)
						await notionRepository.addUnarchiveLink(nr)
						await notionRepository.addImageBlock(nr)
						break
					default:
						if ("type" in blocks[0]! && blocks[0].type === "bookmark") {
							if (!isUnarchiveBlock(blocks[0], nr)) {
								logger.info(`One invalid bookmark block found, editing it`)
								await notionRepository.editUnarchiveLink(blocks[0].id, nr)
							}

							if ("type" in blocks[1]! && blocks[1].type === "image") {
								if (!isImageBlock(blocks[1], nr)) {
									logger.info(`One invalid image block found, editing it`)
									await notionRepository.editImageBlock(blocks[1].id, nr)
								} else {
									const readmeLastEdited =
										await githubRepository.getReadmeLastEdited(nr)
									if (
										readmeLastEdited.getTime() >
										new Date(blocks[1].last_edited_time).getTime()
									) {
										logger.info(`Image block outdated, updating it`)
										await notionRepository.editImageBlock(blocks[1].id, nr)
									}
								}
							} else {
								logger.info(`Second block not an image block, replacing it`)
								await notionRepository.deleteBlock(blocks[1]!.id)
								await notionRepository.addImageBlock(nr)
							}

							if (blocks.length > 2) {
								logger.info(`Deleting all blocks after first two`)
								for (const block of blocks.slice(2)) {
									await notionRepository.deleteBlock(block.id)
								}
							}

							break
						}

						logger.info(`First block not a bookmark block, replacing all blocks`)
						for (const block of blocks) {
							await notionRepository.deleteBlock(block.id)
						}
						await notionRepository.addUnarchiveLink(nr)
						await notionRepository.addImageBlock(nr)
						break
				}
			} else {
				switch (blocks.length) {
					case 0:
						logger.info(`No blocks found, adding image block`)
						await notionRepository.addImageBlock(nr)
						break
					default:
						if ("type" in blocks[0]! && blocks[0].type === "image") {
							if (!isImageBlock(blocks[0], nr)) {
								logger.info(`One invalid image block found, editing it`)
								await notionRepository.editImageBlock(blocks[0].id, nr)
							} else {
								const readmeLastEdited = await githubRepository.getReadmeLastEdited(
									nr
								)
								if (
									readmeLastEdited.getTime() >
									new Date(blocks[0].last_edited_time).getTime()
								) {
									logger.info(`Image block outdated, updating it`)
									await notionRepository.editImageBlock(blocks[0].id, nr)
								}
							}
							break
						}

						logger.info(`First block not an image block, replacing all blocks`)
						for (const block of blocks) {
							await notionRepository.deleteBlock(block.id)
						}
						await notionRepository.addImageBlock(nr)
				}
			}
		}

		console.log("Syncing complete\n")
	} catch (err) {
		logger.error(err)
	}

	syncLock = false
}

AfterEvery(1).minutes(sync)

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))
