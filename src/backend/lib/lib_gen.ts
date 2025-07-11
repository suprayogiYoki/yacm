export function deepMerge(target:any, source:any) {
  if (typeof target !== 'object' || typeof source !== 'object') {
    return source;
  }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key]) {
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  return target;
}

export function inDeepSchema({schema, schemas}:{schema:any, schemas:any}) {
  let newSchema:any= {};
  if(schema?.['$ref']) {
    const schemaName = schema['$ref'].split('/').pop()
    newSchema = schemas[schemaName];
    Object.keys(newSchema.properties).forEach(key => {
        newSchema.properties[key] = {
          ...newSchema.properties[key],
          'x-model': schemaName
        };
    });
  }
  else if(schema?.['allOf']) {
    schema['allOf'].forEach((s:any) => {
      newSchema = deepMerge(newSchema, inDeepSchema({schema:s, schemas}));
    })
    if(schema.properties) {
      newSchema = deepMerge(newSchema, {
        type: 'object',
        properties: schema.properties
      });
    }
    if(newSchema?.required) {
      newSchema.required = Object.values(newSchema.required);
    }
  }
  else if(schema?.type === 'array') {
    newSchema = {
      type: 'array',
      items: inDeepSchema({schema:schema.items, schemas})
    }
  }
  else {
    newSchema = schema;
  }

  Object.keys(newSchema?.properties??[]).forEach(key => {
    if(newSchema.properties[key]['$ref']) {
      const refSplit = newSchema.properties[key]['$ref'].split('/');
      newSchema.properties[key] = {
        ...schemas[refSplit[3]].properties[refSplit[5]],
        'x-model': refSplit[3]
      };
    }
  })
  return newSchema;
}