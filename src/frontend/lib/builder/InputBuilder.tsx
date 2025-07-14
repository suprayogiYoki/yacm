import { labelcase } from "@/shared/string";
import { ProFormCheckbox, ProFormDateTimePicker, ProFormSelect, ProFormText } from "@ant-design/pro-components";

export function InputBuilder({ schemas, item, name, withLabel, rules }: any) {
  const label = withLabel ? labelcase(name) : null
  if (item.type === 'boolean') {
    return <ProFormCheckbox
      label={label}
      name={name}
      placeholder={name}
      rules={rules}
    />
  }
  else if (item['x-rel']?.['name'] && schemas[item['x-rel']?.['name']]) {
    return <ProFormSelect
      label={label}
      name={name}
      placeholder={name}
      options={[]}
      rules={rules}
    />

  }
  else if (item.format === 'date-time') {
    return <ProFormDateTimePicker
      label={label}
      name={name}
      placeholder={name}
      rules={rules}
    />
  }
  return <ProFormText
    label={label}
    name={name}
    placeholder={name}
    rules={rules}
  />
}
