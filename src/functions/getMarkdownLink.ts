import axios from "axios"
import config from "../config.json"
import convertMd from "convert-md"
import fs from "fs"
import puppeteer from "puppeteer"
import { useTryAsync } from "no-try"

export default async (repo: Repo) => {
	const [err, res] = await useTryAsync(() =>
		axios
			.get(
				`https://raw.githubusercontent.com/${config.github.owner}/${repo.title}/main/README.md`
			)
			.then(res => convertMd(res.data, { type: "html" }))
	)

	if (err) {
		fs.copyFileSync("./public/default.png", `./public/${config.github.owner}/${repo.title}.png`)
		return `${config.host}/${config.github.owner}/${repo.title}.png`
	}

	const html = res._content
		.replaceAll("  ", "\t")
		.replace("<style>", "<style>\n\t\t* {\n\t\t\tcolor: #eee;\n\t\t}\n")
		.replace("body {", "body {\n\t\t\twidth: 700px;")
		.replace("background-color: white", "background-color: 2f3437")

	const browser = await puppeteer.launch(
		process.platform === "linux"
			? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
			: undefined
	)
	const page = await browser.newPage()

	await page.setContent(html)

	const content = await page.$("body")
	const imageBuffer = await content!.screenshot({ omitBackground: true })

	await page.close()
	await browser.close()
	fs.writeFileSync(`./public/${config.github.owner}/${repo.title}.png`, imageBuffer)

	return `${config.host}/${config.github.owner}/${repo.title}.png`
}
