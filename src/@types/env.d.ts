declare module NodeJS {
	interface ProcessEnv {
		readonly CLOUDINARY_URL: string
		readonly CLOUDINARY_FOLDER: string

		readonly NOTION__TOKEN: string
		readonly NOTION__DATABASE_ID: string

		readonly GITHUB__TOKEN: string
		readonly GITHUB__OWNER: string
	}
}
