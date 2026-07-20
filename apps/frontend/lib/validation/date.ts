import { endOfDay } from 'date-fns';
import * as Yup from 'yup';

export const notFutureDateSchema = Yup.date().test(
  'date-not-in-future',
  'oscrat.ui.validation.date-cannot-be-future',
  (value) => !value || value <= endOfDay(new Date())
);
