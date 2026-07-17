import * as Yup from 'yup';

export const COMMENT_MAX_LENGTH = 1000;

export const commentTextSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.comment-required')
  .max(COMMENT_MAX_LENGTH, 'oscrat.ui.validation.comment-too-long');

export const commentCreateSchema = Yup.object({
  text: commentTextSchema.required('oscrat.ui.validation.comment-required'),
});

export type CommentCreateData = Yup.InferType<typeof commentCreateSchema>;
