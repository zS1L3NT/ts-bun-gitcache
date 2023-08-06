import { Project } from "@prisma/client"

const pick = <
	T extends Record<string | number | symbol, any>,
	U extends (string | number | symbol)[],
>(
	object: T,
	keys: U,
): Pick<T, keyof U> => {
	// @ts-ignore
	return Object.fromEntries(Object.entries(object).filter(([key]) => keys.includes(key)))
}

export default class GRPRDiffCalc {
	constructor(public gr: GithubRepo, public pr: Project) {
	}

	getUpdatedKeys(): (keyof GithubRepo)[] {
		const updated: (keyof GithubRepo)[] = []

		if (this.gr.title !== this.pr.title) {
			updated.push("title")
		}

		if (this.gr.description !== this.pr.description) {
			updated.push("description")
		}

		if (!this.gr.tags.every((t, i) => this.pr.tags[i] === t) || !this.pr.tags.every((t, i) => this.gr.tags[i] === t)) {
			updated.push("tags")
		}

		if (this.gr.updated_at.getTime() !== this.pr.updated_at.getTime()) {
			updated.push("updated_at")
		}

		return updated
	}

	formatPrismaToGithub() {
		const updated = this.getUpdatedKeys()
		return {
			from: pick(this.pr, updated),
			to: pick(this.gr, updated),
		}
	}
}