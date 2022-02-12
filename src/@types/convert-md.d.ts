declare module "convert-md" {
	export default function (data: any, options: { type: "html" }): Promise<{ _content: string }>
}
