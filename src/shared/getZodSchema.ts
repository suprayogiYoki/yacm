import z from "zod";
export function getZodSchema({ schema }: { schema: any }) {
  const zodSchema: any = {}
  if (!schema) return z.object(zodSchema);

  const fields = Object.entries(schema.properties || {})
    .forEach(([key, val]: any) => {

      // Base type mapping
      switch (val.type) {
        case 'string':
          zodSchema[key] = z.string()
          if (val.format === 'email') zodSchema[key] = zodSchema[key].email()
          if (val.maxLength) zodSchema[key] = zodSchema[key].max(val.maxLength)
          if (val.minLength) zodSchema[key] = zodSchema[key].min(val.minLength)
          if (val.pattern) zodSchema[key] = zodSchema[key].regex(new RegExp(JSON.stringify(val.pattern)))
          break

        case 'integer':
          zodSchema[key] = z.number().int();
          break

        case 'number':
          zodSchema[key] = z.number();
          if (val.minimum !== undefined) zodSchema[key] = zodSchema[key].min(val.minimum);
          if (val.maximum !== undefined) zodSchema[key] = zodSchema[key].max(val.maximum);
          break

        case 'boolean':
          zodSchema[key] = z.boolean();
          break

        default:
          zodSchema[key] = z.any();
      }

      if (!(schema.required ?? []).includes(key) || val.readOnly) zodSchema[key] = zodSchema[key].optional();

      if (val.format === 'date-time') {
        zodSchema[key] = z.preprocess((value: any) => value && value.format('YYYY-MM-DD HH:mm:ss'), zodSchema[key])
      }
      else if (val.format === 'date') {
        zodSchema[key] = z.preprocess((value: any) => value && value.format('YYYY-MM-DD'), zodSchema[key])
      }
      else if (val.format === 'time') {
        zodSchema[key] = z.preprocess((value: any) => value && value.format('HH:mm:ss'), zodSchema[key])
      }
      else if (val.type === 'integer' || val.type === 'number') {
        zodSchema[key] = z.preprocess((value: any) => value && Number(value), zodSchema[key])
      }
    })

  return z.object(zodSchema)
}

export const createZodRule = (schema: z.ZodTypeAny) => ({
  validator: (_: any, value: any) => {
    const result = schema.safeParse(value);
    if (result.success) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(result.error.errors[0].message));
  },
});