import AfterEvery from "after-every"
import assert from "assert"
import colors from "colors"
import config from "./config.json"
import DiffCalc from "./utils/DiffCalc"
import express from "express"
import fs from "fs"
import GithubRepository from "./repositories/GithubRepository"
import markdownToPng from "./utils/markdownToPng"
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
						diffCalc.formatGithubToNotion()
					)
					notionRepository.updatePage(nr, nr.pageId)
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
							diffCalc.formatNotionToGithub()
						)
						githubRepository.updateRepository(diffCalc)
					}
				}
			}
		}

		logger.log(`Fetching Notion Page Blocks`)
		const pageBlocks = await Promise.all(nrs.map(nr => notionRepository.getBlocks(nr.pageId)))

		for (let i = 0; i < pageBlocks.length; i++) {
			const blocks = pageBlocks[i]!.results
			const nr = nrs[i]!
			logger.log(`Syncing blocks for ${nr.title}`)

			// Create new blocks where necessary
			if (nr.archived && blocks.length === 0) {
				await notionRepository.addUnarchiveLink(nr)
				await markdownToPng(nr)
				await notionRepository.addImageBlock(nr)
			}

			if ((nr.archived && blocks.length === 1) || (!nr.archived && blocks.length === 0)) {
				await markdownToPng(nr)
				await notionRepository.addImageBlock(nr)
			}

			// Update old blocks where necessary
			for (let i = 0; i < blocks.length; i++) {
				const block = blocks[i]!
				if (!("type" in block)) continue

				if ((!nr.archived && i === 0) || (nr.archived && i === 1)) {
					if (
						block.type === "image" &&
						block.image.type === "external" &&
						block.image.external.url ===
							`${config.host}/${config.github.owner}/${nr.title}.png`
					) {
						const readmeLastEdited = await githubRepository.getReadmeLastEdited(nr)
						if (
							new Date(block.last_edited_time).getTime() > readmeLastEdited.getTime()
						) {
							continue
						}
					}

					await markdownToPng(nr)
					await notionRepository.editImageBlock(block.id, nr)
				}

				if (nr.archived && i === 0) {
					if (
						block.type === "bookmark" &&
						block.bookmark.caption.length === 1 &&
						block.bookmark.caption[0]!.plain_text === `Unarchive` &&
						block.bookmark.url ===
							`https://github.com/${config.github.owner}/${nr.title}/settings#danger-zone`
					) {
						continue
					}
					
					await notionRepository.editUnarchiveLink(block.id, nr)
				}

				await notionRepository.deleteBlock(block.id)
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
