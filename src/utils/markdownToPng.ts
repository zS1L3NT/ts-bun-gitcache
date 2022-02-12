import axios from "axios"
import config from "../config.json"
import convertMd from "convert-md"
import nodeHtmlToImage from "node-html-to-image"

export default async (repoTitle: string) => {
	const { _content } = await axios
		.get(`https://raw.githubusercontent.com/${config.github.owner}/${repoTitle}/main/README.md`)
		.then(res => convertMd(res.data, { type: "html" }))

	const html = _content
		.replaceAll("  ", "\t")
		.replace("<style>", "<style>\n\t\t* {\n\t\t\tcolor: #eee;\n\t\t}\n")
		.replace("body {", "body {\n\t\t\twidth: 700px;")
		.replace("background-color: white", "background-color: 2f3437")

	await nodeHtmlToImage({
		html,
		output: `public/${config.github.owner}/${repoTitle}.png`
	})

	return `${config.host}/${config.github.owner}/${repoTitle}.png`
}
