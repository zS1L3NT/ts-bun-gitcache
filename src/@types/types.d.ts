interface Repo {
	id: number
	lastEdited: Date
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
