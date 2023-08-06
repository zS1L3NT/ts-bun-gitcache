import axios from "axios"
import { useTryAsync } from "no-try"

import { Octokit as Github } from "@octokit/core"

export default class GithubRepository {
	private github: Github = new Github({ auth: process.env.GITHUB__TOKEN })

	public async getRepositories(): Promise<GithubRepo[]> {
		const { data: user } = await this.github.request("GET /user")
		const repoCount = user.public_repos + (user.total_private_repos || 0)

		const repos: Promise<GithubRepo>[] = []

		for (let i = 0; i < repoCount; i += 100) {
			const response = await this.github.request("GET /user/repos", {
				type: "owner",
				page: Math.floor(i / 100) + 1,
				per_page: 100,
			})

			repos.push(
				...response.data
					.filter(repo => !repo.fork)
					.map(async repo => {
						const [err, readme] = await useTryAsync(() =>
							axios.get(
								`https://raw.githubusercontent.com/${process.env.GITHUB__OWNER}/${repo.name}/main/README.md`,
							),
						)

						return {
							id: repo.id,
							title: repo.name,
							description: repo.description || "",
							homepage: repo.homepage || "",
							tags: repo.topics || [],
							readme: err ? false : readme.data.indexOf("![License]") > -1,
							archived: repo.archived,
							private: repo.private,
							updated_at: new Date(
								repo.pushed_at || repo.updated_at || repo.created_at || 0,
							),
						}
					}),
			)
		}

		return (await Promise.all(repos)).sort((a, b) =>
			new Intl.Collator().compare(a.title, b.title),
		)
	}
}
