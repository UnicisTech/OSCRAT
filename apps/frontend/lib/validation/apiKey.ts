import * as Yup from 'yup';

export const apiKeyCreateSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('oscrat.ui.validation.name-required-generic'),
});
