export default <
	T extends Record<string | number | symbol, any>,
	U extends (string | number | symbol)[],
>(
	object: T,
	keys: U,
): Pick<T, keyof U> => {
	// @ts-ignore
	return Object.fromEntries(Object.entries(object).filter(([key]) => keys.includes(key)))
}
