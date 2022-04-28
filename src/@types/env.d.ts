declare module NodeJS {
	interface ProcessEnv {
		readonly NOTION__TOKEN: string
		readonly NOTION__DATABASE_ID: string
		readonly GITHUB__TOKEN: string
		readonly GITHUB__OWNER: string
		readonly HOST: string
	}
}
