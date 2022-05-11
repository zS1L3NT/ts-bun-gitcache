import { Octokit as Github } from "@octokit/core"

export default class GithubRepository {
	private github: Github = new Github({ auth: process.env.GITHUB__TOKEN })

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

		return repos.sort((a, b) => new Intl.Collator().compare(a.title, b.title))
	}
}
