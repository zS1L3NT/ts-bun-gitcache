import assert from "assert"

import { Client as Notion } from "@notionhq/client"

import getMarkdownLink from "../functions/getMarkdownLink"

export default class NotionRepository {
	private notion: Notion = new Notion({ auth: process.env.NOTION__TOKEN })

	public async getRepositories(): Promise<NotionRepo[]> {
		const repos: NotionRepo[] = []

		let hasMore = true
		let startCursor: string | undefined
		while (hasMore) {
			const response = await this.notion.databases.query({
				database_id: process.env.NOTION__DATABASE_ID,
				start_cursor: startCursor
			})

			for (const page of response.results) {
				if ("properties" in page) {
					const repo: NotionRepo = {
						id: -1,
						title: "",
						description: "",
						homepage: "",
						tags: [],
						archived: false,
						private: false,
						pageId: page.id
					}

					if (page.properties.ID && page.properties.ID.type === "number") {
						repo.id = page.properties.ID.number!
					} else {
						throw new Error("Cannot get notion page ID")
					}

					if (page.properties.Name && page.properties.Name.type === "title") {
						const title = page.properties.Name.title[0]?.plain_text || ""
						repo.title = title.split(" ").at(0)!

						if (title.includes("🔒")) {
							repo.private = true
						}

						if (title.includes("📂")) {
							repo.archived = true
						}
					} else {
						throw new Error("Cannot get notion page title")
					}

					if (
						page.properties.Description &&
						page.properties.Description.type === "rich_text"
					) {
						repo.description =
							page.properties.Description.rich_text[0]?.plain_text || ""
					} else {
						throw new Error("Cannot get notion page description")
					}

					if (page.properties.Homepage && page.properties.Homepage.type === "url") {
						repo.homepage = page.properties.Homepage.url || ""
					} else {
						throw new Error("Cannot get notion page link")
					}

					if (page.properties.Tags && page.properties.Tags.type === "multi_select") {
						repo.tags = page.properties.Tags.multi_select.map(t => t.name)
					} else {
						throw new Error("Cannot get notion page tags")
					}

					repos.push(repo)
				}
			}

			hasMore = response.has_more
			startCursor = response.next_cursor || undefined
		}

		return repos.sort((a, b) => new Intl.Collator().compare(a.title, b.title))
	}

	public async getBlocks(nr: NotionRepo) {
		return await this.notion.blocks.children.list({ block_id: nr.pageId })
	}

	public async addImageBlock(nr: NotionRepo) {
		return await this.notion.blocks.children.append({
			block_id: nr.pageId,
			children: [
				{
					type: "image",
					image: {
						external: {
							url: await getMarkdownLink(nr)
						}
					}
				}
			]
		})
	}

	public async editImageBlock(blockId: string, nr: NotionRepo) {
		return await this.notion.blocks.update({
			block_id: blockId,
			type: "image",
			image: {
				external: {
					url: await getMarkdownLink(nr)
				}
			}
		})
	}

	public async deleteBlock(blockId: string) {
		return await this.notion.blocks.delete({ block_id: blockId })
	}

	public async deletePage(pageId: string) {
		await this.notion.pages.update({
			page_id: pageId,
			archived: true
		})
	}

	private getTitleWithEmojis(repo: Repo) {
		let title = repo.title
		if (repo.private && repo.archived) {
			title += " 🔒📂"
		} else if (repo.private) {
			title += " 🔒"
		} else if (repo.archived) {
			title += " 📂"
		}

		return title
	}

	public async createPage(repo: Repo): Promise<NotionRepo> {
		const response = await this.notion.pages.create({
			parent: {
				database_id: process.env.NOTION__DATABASE_ID
			},
			properties: {
				ID: {
					number: repo.id
				},
				Name: {
					title: [
						{
							text: {
								content: this.getTitleWithEmojis(repo)
							}
						}
					]
				},
				Description: {
					rich_text: [
						{
							text: {
								content: repo.description
							}
						}
					]
				},
				Homepage: {
					url: repo.homepage || null
				},
				Tags: {
					multi_select: repo.tags.map(t => ({
						name: t
					}))
				},
				Link: {
					url: `https://github.com/${process.env.GITHUB__OWNER}/${repo.title}`
				}
			}
		})

		assert("parent" in response)
		if ("page_id" in response.parent) {
			return {
				...repo,
				pageId: response.parent.page_id
			}
		}

		if ("database_id" in response.parent) {
			return {
				...repo,
				pageId: response.parent.database_id
			}
		}

		throw new Error("Unknown page id")
	}

	public async updatePage(repo: Repo, pageId: string) {
		await this.notion.pages.update({
			page_id: pageId,
			properties: {
				Name: {
					title: [
						{
							text: {
								content: this.getTitleWithEmojis(repo)
							}
						}
					]
				},
				Description: {
					rich_text: [
						{
							text: {
								content: repo.description
							}
						}
					]
				},
				Homepage: {
					url: repo.homepage || null
				},
				Tags: {
					multi_select: repo.tags.map(t => ({
						name: t
					}))
				},
				Link: {
					url: `https://github.com/${process.env.GITHUB__OWNER}/${repo.title}`
				}
			}
		})
	}
}
