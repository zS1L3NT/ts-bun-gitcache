import config from "../config.json"

export default (
	block: {
		image:
			| {
					type: "external"
					external: {
						url: string
					}
			  }
			| {
					type: "file"
			  }
	},
	nr: NotionRepo
) =>
	block.image.type === "external" &&
	block.image.external.url === `${config.host}/${config.github.owner}/${nr.title}.png`
