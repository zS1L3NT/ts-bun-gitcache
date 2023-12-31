declare namespace NodeJS {
	interface ProcessEnv {
		readonly GITHUB_TOKEN: string
		readonly GITHUB_OWNER: string
		readonly DATABASE_URL: string
	}
}
