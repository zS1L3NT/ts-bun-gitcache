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
	block.image.external.url === `${process.env.HOST}/${process.env.GITHUB__OWNER}/${nr.title}.png`
