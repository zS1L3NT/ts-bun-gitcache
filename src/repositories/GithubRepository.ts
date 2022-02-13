import config from "../config.json"
import DiffCalc from "../utils/DiffCalc"
import pick from "../functions/pick"
import { Octokit as Github } from "@octokit/core"

export default class GithubRepository {
	private github: Github = new Github({ auth: config.github.token })

	public async getRepositories(): Promise<Repo[]> {
		const { data: user } = await this.github.request("GET /user")
		const repoCount = user.public_repos + (user.total_private_repos || 0)

		const repos: Repo[] = []

		for (let i = 0; i < repoCount; i += 100) {
			const response = await this.github.request("GET /user/repos", {
				type: "owner",
				page: Math.floor(i / 100) + 1,
				per_page: 100
			})

			for (const repo of response.data) {
				if (!repo.fork) {
					repos.push({
						id: repo.id,
						lastEdited: repo.updated_at ? new Date(repo.updated_at) : new Date(),
						title: repo.name,
						description: repo.description || "",
						homepage: repo.homepage || "",
						tags: repo.topics || [],
						archived: repo.archived,
						private: repo.private
					})
				}
			}
		}

		return repos
	}

	public async updateRepository(diffCalc: DiffCalc) {
		const { gr, nr } = diffCalc
		const updatedKeys = diffCalc.getUpdatedKeys()

		if (updatedKeys.includes("tags")) {
			await this.github.request("PUT /repos/{owner}/{repo}/topics", {
				owner: config.github.owner,
				repo: gr.title,
				names: nr.tags,
				mediaType: {
					previews: ["mercy"]
				}
			})
		}

		await this.github.request("PATCH /repos/{owner}/{repo}", {
			owner: config.github.owner,
			repo: gr.title,
			...pick(
				nr,
				updatedKeys.filter(k => k !== "tags")
			)
		})
	}

	public async getReadmeLastEdited(repo: Repo): Promise<Date> {
		const commits = await this.github.request("GET /repos/{owner}/{repo}/commits", {
			owner: config.github.owner,
			repo: repo.title,
			path: "README.md",
			per_page: 1
		})

		if (commits.data.length > 0) {
			return new Date(commits.data[0]!.commit.author!.date!)
		} else {
			return new Date(0)
		}
	}
}
