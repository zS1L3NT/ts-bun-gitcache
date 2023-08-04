import assert from "assert"
import colors from "colors"
import { NextApiRequest, NextApiResponse } from "next"
import Tracer from "tracer"

import { PrismaClient } from "@prisma/client"

import GithubRepository from "../../repositories/GithubRepository"
import NotionRepository from "../../repositories/NotionRepository"
import DiffCalc from "../../utils/DiffCalc"

const logger = Tracer.colorConsole({
	level: process.env.LOG_LEVEL || "log",
	format: [
		"[{{timestamp}}] <{{path}}> {{message}}",
		{
			alert: "[{{timestamp}}] <{{path}}, Line {{line}}> {{message}}",
			warn: "[{{timestamp}}] <{{path}}, Line {{line}}> {{message}}",
			error: "[{{timestamp}}] <{{path}}, Line {{line}} at {{pos}}> {{message}}",
		},
	],
	methods: ["log", "debug", "info", "alert", "warn", "error"],
	dateformat: "dd mmm yyyy, hh:MM:sstt",
	filters: {
		log: colors.grey,
		debug: colors.blue,
		info: colors.green,
		alert: colors.yellow,
		warn: colors.yellow.bold.italic,
		error: colors.red.bold.italic,
	},
	preprocess: data => {
		data.path = "src/" + data.path.split("/src/").at(-1)!.replaceAll("\\", "/")
	},
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const githubRepository = new GithubRepository()
	const notionRepository = new NotionRepository()
	const prisma = new PrismaClient()

	try {
		logger.log("Fetching Github and Notion Repositories")
		const time = Date.now()
		const [grs, nrs] = await Promise.all([
			githubRepository.getRepositories(),
			notionRepository.getRepositories(),
		])
		logger.log(`Fetching took ${Date.now() - time}ms`)

		// Delete non-matching notion pages
		for (const nr of nrs) {
			if (!grs.find(gr => gr.id === nr.id)) {
				logger.warn(`Deleting non-matching notion page <${nr.title}>`)
				notionRepository.deletePage(nr.pageId)
				nrs.splice(
					nrs.findIndex(r => r.id === nr.id),
					1,
				)
			}
		}

		// Add inexistent github repositories
		// for (const gr of grs) {
		// 	if (!nrs.find(nr => nr.id === gr.id)) {
		// 		logger.info(`Creating new notion page <${gr.title}>`)
		// 		nrs.push(await notionRepository.createPage(gr))
		// 	}
		// }
		nrs.push(
			...(await Promise.all(
				grs
					.filter(gr => !nrs.find(nr => nr.id === gr.id))
					.map(async gr => {
						logger.info(`Creating new notion page <${gr.title}>`)
						return await notionRepository.createPage(gr)
					}),
			)),
		)

		assert(grs.length === nrs.length)
		for (const gr of grs) {
			const nr = nrs.find(nr => nr.id === gr.id)!

			const diffCalc = new DiffCalc(gr, nr)
			if (diffCalc.getUpdatedKeys().length > 0) {
				logger.info(`Updating notion page <${nr.title}>`, diffCalc.formatNotionToGithub())
				notionRepository.updatePage(gr, nr.pageId)
			}
		}

		logger.log("Upserting into database")
		prisma.$transaction(
			grs.map(gr =>
				prisma.project.upsert({
					where: { name: gr.title },
					create: {
						name: gr.title,
						description: gr.description,
						topics: gr.tags,
						updated_at: gr.updatedAt,
					},
					update: {
						name: gr.title,
						description: gr.description,
						topics: gr.tags,
						updated_at: gr.updatedAt,
					},
				}),
			),
		)

		logger.log("Syncing complete\n")
		res.status(200).json({ message: "Syncing complete" })
	} catch (err) {
		logger.error(err)
		res.status(400).json({ message: "Syncing failed", error: err })
	}
}
