import axios from "axios"
import { v2 as cloudinary } from "cloudinary"
import convertMd from "convert-md"
import { useTryAsync } from "no-try"
import puppeteer from "puppeteer"
import StreamPromises from "stream/promises"
import streamifier from "streamifier"

export default async (repo: Repo) => {
	const [err, res] = await useTryAsync(() =>
		axios
			.get(
				`https://raw.githubusercontent.com/${process.env.GITHUB__OWNER}/${repo.title}/main/README.md`
			)
			.then(res => convertMd(res.data, { type: "html" }))
	)

	if (err) {
		await cloudinary.uploader.upload(`src/default.png`, {
			public_id: `ts-github-notion-sync/${repo.title}`
		})
		return `${process.env.CLOUDINARY_FOLDER}/${repo.title}.png`
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
	await StreamPromises.pipeline(
		streamifier.createReadStream(imageBuffer),
		cloudinary.uploader.upload_stream({
			resource_type: "image",
			format: "png",
			public_id: `ts-github-notion-sync/${repo.title}`
		})
	)

	return `${process.env.CLOUDINARY_FOLDER}/${repo.title}.png`
}
