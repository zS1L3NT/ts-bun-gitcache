import colors from "colors"
import { NextApiRequest, NextApiResponse } from "next"
import Tracer from "tracer"

import { PrismaClient } from "@prisma/client"

import GithubRepository from "../../repositories/GithubRepository"
import NotionRepository from "../../repositories/NotionRepository"
import GRNRDiffCalc from "../../utils/GRNRDiffCalc"
import GRPRDiffCalc from "../../utils/GRPRDiffCalc"

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
		logger.log("Fetching Github, Notion and Prisma Repositories")
		const time1 = Date.now()
		const [grs, nrs, prs] = await Promise.all([
			githubRepository.getRepositories(),
			notionRepository.getRepositories(),
			prisma.project.findMany(),
		])
		logger.log(`Fetching took ${Date.now() - time1}ms`)

		// Delete non-matching notion pages
		for (const nr of nrs) {
			if (!grs.find(gr => gr.id === nr.id)) {
				logger.warn(`Deleting non-matching notion page <${nr.title}>`)
				await notionRepository.deletePage(nr.page_id)
				nrs.splice(
					nrs.findIndex(r => r.id === nr.id),
					1,
				)
			}
		}

		// Delete non-matching prisma rows
		for (const pr of prs) {
			if (!grs.filter(gr => !gr.private).find(gr => gr.title === pr.title)) {
				logger.warn(`Deleting non-matching prisma row <${pr.title}>`)
				await prisma.project.delete({ where: { title: pr.title } })
				prs.splice(
					prs.findIndex(r => r.title === pr.title),
					1,
				)
			}
		}

		// Add inexistent notion pages
		for (const gr of grs) {
			if (!nrs.find(nr => nr.id === gr.id)) {
				logger.info(`Creating new notion page <${gr.title}>`)
				nrs.push(await notionRepository.createPage(gr))
			}
		}

		// Add inexistent prisma rows
		for (const gr of grs.filter(gr => !gr.private)) {
			if (!prs.find(pr => pr.title === gr.title)) {
				logger.info(`Creating new prisma row <${gr.title}>`)
				prs.push(
					await prisma.project.create({
						data: {
							title: gr.title,
							description: gr.description,
							tags: gr.tags,
							updated_at: gr.updated_at,
						},
					}),
				)
			}
		}

		// Update out of date notion pages
		for (const gr of grs) {
			const nr = nrs.find(nr => nr.id === gr.id)!

			const diff = new GRNRDiffCalc(gr, nr)
			if (diff.getUpdatedKeys().length > 0) {
				logger.info(`Updating notion page <${nr.title}>`, diff.formatNotionToGithub())
				await notionRepository.updatePage(gr, nr.page_id)
			}
		}

		// Update out of date prisma rows
		for (const gr of grs.filter(gr => !gr.private)) {
			const pr = prs.find(pr => pr.title === gr.title)!

			const diff = new GRPRDiffCalc(gr, pr)
			if (diff.getUpdatedKeys().length > 0) {
				logger.info(`Updating prisma row <${pr.title}>`, diff.formatPrismaToGithub())
				await prisma.project.update({
					where: { title: pr.title },
					data: {
						title: gr.title,
						description: gr.description,
						tags: gr.tags,
						updated_at: gr.updated_at,
					},
				})
			}
		}

		logger.log("Syncing complete\n")
		res.status(200).json({ message: "Syncing complete" })
	} catch (err) {
		logger.error(err)
		res.status(400).json({ message: "Syncing failed", error: err })
	}
}
