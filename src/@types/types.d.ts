interface Repo {
	id: number
	title: string
	description: string
	homepage: string
	tags: string[]
	readme: boolean
	archived: boolean
	private: boolean
}

interface GithubRepo extends Repo {
	updatedAt: string
}

interface NotionRepo extends Repo {
	pageId: string
}
