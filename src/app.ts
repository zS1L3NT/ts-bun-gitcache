import AfterEvery from "after-every"
import assert from "assert"
import colors from "colors"
import config from "./config.json"
import DiffCalc from "./utils/DiffCalc"
import express from "express"
import GithubRepository from "./repositories/GithubRepository"
import markdownToPng from "./utils/markdownToPng"
import NotionRepository from "./repositories/NotionRepository"
import Tracer from "tracer"
import { useTryAsync } from "no-try"

const PORT = 2348
const app = express()

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

const sync = async () => {
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

			const diffCalculator = new DiffCalc(gr, nr)

			if (diffCalculator.getUpdatedKeys().length > 0) {
				if (gr.lastEdited.getTime() > nr.lastEdited.getTime()) {
					logger.info(
						`Updating notion page <${nr.title}>`,
						diffCalculator.formatGithubToNotion()
					)
					notionRepository.updatePage(nr, nr.pageId)
				} else {
					if (gr.archived) {
						logger.warn(`Cannot update archived repository <${gr.title}>`)
						logger.info(
							`Updating notion page <${nr.title}>`,
							diffCalculator.formatNotionToGithub()
						)
						notionRepository.updatePage(gr, nr.pageId)
					} else {
						logger.info(
							`Updating github page <${gr.title}>`,
							diffCalculator.formatNotionToGithub()
						)
						githubRepository.updateRepository(diffCalculator)
					}
				}
			}
		}

		logger.log(`Fetching Notion Page Blocks`)
		const pageBlocks = await Promise.all(nrs.map(nr => notionRepository.getBlocks(nr.pageId)))

		for (let i = 0; i < pageBlocks.length; i++) {
			const blocks = pageBlocks[i]!.results
			const nr = nrs[i]!

			const [err, imageUrl] = await useTryAsync(() => markdownToPng(nr.title))
			if (err) continue

			await Promise.all(blocks.map(block => notionRepository.deleteBlock(block.id)))
			if (nr.archived) {
				await notionRepository.addUnarchiveLink(
					nr.pageId,
					`https://github.com/${config.github.owner}/${nr.title}/settings#danger-zone`
				)
			}
			await notionRepository.addImageBlock(nr.pageId, imageUrl)
		}
	} catch (err) {
		logger.error(err)
	}
}

AfterEvery(1).minutes(sync)

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))