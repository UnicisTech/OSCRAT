import * as Yup from 'yup';

const DATA_KEY_REGEX = /^[a-z0-9_-]+$/;

const jsonStringSchema = Yup.string()
  .required('Payload is required')
  .test('valid-json', 'Payload must be valid JSON', (value) => {
    if (!value) return false;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  });

const dataKeySchema = Yup.string()
  .required('Data key is required')
  .max(100, 'Data key too long')
  .lowercase()
  .matches(DATA_KEY_REGEX, 'Data key must be lowercase alphanumeric with hyphens/underscores');

export const teamDataCreateSchema = Yup.object({
  dataKey: dataKeySchema,
  payload: jsonStringSchema,
});

export const teamDataUpdateSchema = Yup.object({
  payload: jsonStringSchema,
});

export type TeamDataCreateInput = Yup.InferType<typeof teamDataCreateSchema>;
export type TeamDataUpdateInput = Yup.InferType<typeof teamDataUpdateSchema>;
