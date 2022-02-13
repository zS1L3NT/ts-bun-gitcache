import config from "../config.json"

export default (
	block: {
		bookmark: {
			url: string
			caption: { plain_text: string }[]
		}
	},
	nr: NotionRepo
) =>
	block.bookmark.caption.length === 1 &&
	block.bookmark.caption[0]!.plain_text === `Unarchive` &&
	block.bookmark.url ===
		`https://github.com/${config.github.owner}/${nr.title}/settings#danger-zone`
