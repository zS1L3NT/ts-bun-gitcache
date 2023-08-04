/* eslint-disable @typescript-eslint/no-unused-vars */
namespace NodeJS {
	interface ProcessEnv {
		readonly NOTION__TOKEN: string
		readonly NOTION__DATABASE_ID: string
		readonly GITHUB__TOKEN: string
		readonly GITHUB__OWNER: string
		readonly DATABASE_URL: string
	}
}
