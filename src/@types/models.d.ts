interface Repo {
	id: number
	title: string
	description: string
	homepage: string
	tags: string[]
	archived: boolean
	private: boolean
}

interface NotionRepo extends Repo {
	pageId: string
}
