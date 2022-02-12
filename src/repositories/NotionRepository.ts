import assert from "assert"
import config from "../config.json"
import { Client as Notion } from "@notionhq/client"

export default class NotionRepository {
	private notion: Notion = new Notion({ auth: config.notion.token })

	public async getRepositories(): Promise<NotionRepo[]> {
		const repos: NotionRepo[] = []

		let hasMore = true
		let startCursor: string | undefined
		while (hasMore) {
			const response = await this.notion.databases.query({
				database_id: config.notion.database_id,
				start_cursor: startCursor
			})

			for (const page of response.results) {
				if ("properties" in page) {
					const repo: NotionRepo = {
						id: -1,
						lastEdited: new Date(page.last_edited_time),
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
						repo.title = page.properties.Name.title[0]?.plain_text || ""
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

					if (page.properties.Archived && page.properties.Archived.type === "checkbox") {
						repo.archived = page.properties.Archived.checkbox
					} else {
						throw new Error("Cannot get notion page archived")
					}

					if (page.properties.Private && page.properties.Private.type === "checkbox") {
						repo.private = page.properties.Private.checkbox
					} else {
						throw new Error("Cannot get notion page privated")
					}

					repos.push(repo)
				}
			}

			hasMore = response.has_more
			startCursor = response.next_cursor || undefined
		}

		return repos
	}

	public async deletePage(pageId: string) {
		await this.notion.pages.update({
			page_id: pageId,
			archived: true
		})
	}

	public async createPage(repo: Repo): Promise<NotionRepo> {
		const response = await this.notion.pages.create({
			parent: {
				database_id: config.notion.database_id
			},
			properties: {
				ID: {
					number: repo.id
				},
				Name: {
					title: [
						{
							text: {
								content: repo.title
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
				Archived: {
					checkbox: repo.archived
				},
				Private: {
					checkbox: repo.private
				},
				Link: {
					url: `https://github.com/${config.github.owner}/${repo.title}`
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
								content: repo.title
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
				Archived: {
					checkbox: repo.archived
				},
				Private: {
					checkbox: repo.private
				},
				Link: {
					url: `https://github.com/${config.github.owner}/${repo.title}`
				}
			}
		})
	}
}
