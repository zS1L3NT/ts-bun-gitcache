import pick from "./pick"

export default class DiffCalc {
	public constructor(public gr: Repo, public nr: Repo) {}

	public getUpdatedKeys(): (keyof Repo)[] {
		const updated: (keyof Repo)[] = []

		if (this.gr.title !== this.nr.title) {
			updated.push("title")
		}

		if (this.gr.description !== this.nr.description) {
			updated.push("description")
		}

		if (this.gr.homepage !== this.nr.homepage) {
			updated.push("homepage")
		}

		if (
			!this.gr.tags.every((tag, i) => this.nr.tags[i] === tag) ||
			!this.nr.tags.every((tag, i) => this.gr.tags[i] === tag)
		) {
			updated.push("tags")
		}

		if (this.gr.archived !== this.nr.archived) {
			updated.push("archived")
		}

		if (this.gr.private !== this.nr.private) {
			updated.push("private")
		}

		return updated
	}

	public formatGithubToNotion() {
		const updated = this.getUpdatedKeys()
		return {
			from: pick(this.gr, updated),
			to: pick(this.nr, updated)
		}
	}

	public formatNotionToGithub() {
		const updated = this.getUpdatedKeys()
		return {
			from: pick(this.nr, updated),
			to: pick(this.gr, updated)
		}
	}
}
