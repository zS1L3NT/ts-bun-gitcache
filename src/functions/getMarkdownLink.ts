import axios from "axios"
import convertMd from "convert-md"
import fs from "fs"
import { useTryAsync } from "no-try"
import puppeteer from "puppeteer"

export default async (repo: Repo) => {
	const [err, res] = await useTryAsync(() =>
		axios
			.get(
				`https://raw.githubusercontent.com/${process.env.GITHUB__OWNER}/${repo.title}/main/README.md`
			)
			.then(res => convertMd(res.data, { type: "html" }))
	)

	if (err) {
		fs.copyFileSync(
			"./public/default.png",
			`./public/${process.env.GITHUB__OWNER}/${repo.title}.png`
		)
		return `${process.env.HOST}/${process.env.GITHUB__OWNER}/${repo.title}.png`
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
	fs.writeFileSync(`./public/${process.env.GITHUB__OWNER}/${repo.title}.png`, imageBuffer)

	return `${process.env.HOST}/${process.env.GITHUB__OWNER}/${repo.title}.png`
}
