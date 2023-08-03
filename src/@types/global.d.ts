import { Tracer } from "tracer"

declare global {
	var logger: Tracer.Logger<"log" | "info" | "alert" | "warn" | "error">
}
