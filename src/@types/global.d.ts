import { Tracer } from "tracer"

declare global {
	// eslint-disable-next-line no-var
	var logger: Tracer.Logger<"log" | "info" | "alert" | "warn" | "error">
}
