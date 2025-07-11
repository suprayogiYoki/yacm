import { ProFormText } from '@ant-design/pro-components';

import { ProForm } from '@ant-design/pro-components';
import { z, ZodError } from 'zod';
// 1. Define Zod validation schema
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// 2. Create manual validation rules using safeParse
const createZodRule = (schema: z.ZodTypeAny) => ({
  validator: (_: any, value: any) => {
    let formatted: { [key: string]: string[] } = {
      'date-time': [],
      date: [],
      time: [],
    };
    let transformed = value;
    // format date-time
    if (formatted['date-time'].indexOf(_.field) !== -1) {
      transformed = value.format('YYYY-MM-DD HH:mm:ss');
    }
    // format date
    else if (formatted['date'].indexOf(_.field) !== -1) {
      transformed = value.format('YYYY-MM-DD');
    }
    // format time
    else if (formatted['date'].indexOf(_.field) !== -1) {
      transformed = value.format('HH:mm:ss');
    }
    const result = schema.safeParse(transformed);
    if (result.success) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(result.error.errors[0].message));
  },
});

// 3. TypeScript type inference from Zod schema
type UserFormValues = z.infer<typeof schema>;

export default function LoginPost() {
  const handleSubmit = async (values: UserFormValues) => {
    try {
      // Full schema validation on submit
      const validatedData = schema.parse(values);
      console.log('Validated data:', validatedData);
      // Submit to API here
    } catch (err) {
      if (err instanceof ZodError) {
        console.error('Validation errors:', err.flatten());
      }
    }
  };

  return (
    <ProForm<UserFormValues>
      onFinish={handleSubmit}
      autoFocusFirstInput
      submitter={{
        searchConfig: {
          submitText: 'Save',
          resetText: 'Cancel',
        },
        render: (_, dom) => [dom[1], dom[0]],
      }}
    >
      <ProFormText
        name="email"
        label="Email"
        placeholder="user@example.com"
        rules={[createZodRule(schema.shape.email)]}
      />

      <ProFormText
        name="password"
        label="Password"
        placeholder=""
        rules={[createZodRule(schema.shape.password)]}
      />
    </ProForm>
  );
}
