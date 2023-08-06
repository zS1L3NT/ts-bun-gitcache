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
	updated_at: Date
}

interface NotionRepo extends Repo {
	page_id: string
}
