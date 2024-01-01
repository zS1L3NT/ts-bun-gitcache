import axios from "axios"
import schedule from "node-schedule"

import { Octokit } from "@octokit/core"
import { PrismaClient } from "@prisma/client"

import Difference from "./utils/Difference"

const prisma = new PrismaClient()

const sync = async (now: Date) => {
	console.log(`Syncing at ${now.toLocaleString("en-SG")}`)

	const github = new Octokit({ auth: Bun.env.GITHUB_TOKEN })

	const { data: user } = await github.request("GET /user")
	const repoCount = user.public_repos + (user.total_private_repos || 0)

	const promises: Promise<Repository>[] = []
	for (let i = 0; i < repoCount; i += 100) {
		const response = await github.request("GET /user/repos", {
			type: "owner",
			page: Math.floor(i / 100) + 1,
			per_page: 100,
		})

		promises.push(
			...response.data
				.filter(repo => !repo.fork)
				.map(async repo => {
					let readme: string | null = null
					try {
						readme = await axios
							.get(
								`https://raw.githubusercontent.com/${Bun.env.GITHUB_OWNER}/${repo.name}/main/README.md`,
							)
							.then(res => res.data)
					} catch {
						/* */
					}

					return {
						id: repo.id,
						title: repo.name,
						description: repo.description || "",
						homepage: repo.homepage || "",
						tags: repo.topics || [],
						readme: readme ? readme.indexOf("![License]") > -1 : false,
						archived: repo.archived,
						private: repo.private,
						updated_at: new Date(
							repo.pushed_at || repo.updated_at || repo.created_at || 0,
						),
					}
				}),
		)
	}

	try {
		console.log("Fetching Github and Prisma Repositories")
		const time = Date.now()
		const [grs, prs] = await Promise.all([
			Promise.all(promises).then(rs => rs.sort((a, b) => a.title.localeCompare(b.title))),
			prisma.project.findMany(),
		])
		console.log(`Fetching took ${Date.now() - time}ms`)

		for (const pr of prs) {
			if (!grs.filter(gr => !gr.private).find(gr => gr.title === pr.title)) {
				console.warn(`Deleting non-matching prisma row <${pr.title}>`)
				await prisma.project.delete({ where: { title: pr.title } })
				prs.splice(
					prs.findIndex(r => r.title === pr.title),
					1,
				)
			}
		}

		// Add inexistent prisma rows
		for (const gr of grs.filter(gr => !gr.private)) {
			if (!prs.find(pr => pr.title === gr.title)) {
				console.info(`Creating new prisma row <${gr.title}>`)
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

		// Update out of date prisma rows
		for (const gr of grs.filter(gr => !gr.private)) {
			const pr = prs.find(pr => pr.title === gr.title)!

			const diff = new Difference(gr, pr)
			if (diff.getUpdatedKeys().length > 0) {
				console.info(`Updating prisma row <${pr.title}>`, diff.formatPrismaToGithub())
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

		console.log("Syncing complete\n")
	} catch (err) {
		console.error(err)
	}
}

await sync(new Date())
schedule.scheduleJob("0 0 * * *", sync)
