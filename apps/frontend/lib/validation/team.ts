import * as Yup from 'yup';
import {
  OscratOrganizationType,
  OscratOrganizationRole,
  Role,
} from '@oscrat/model';
import {
  emailSchema,
  phoneSchema,
  postalAddressSchema,
  organizationNameSchema,
  taxIdSchema,
  additionalInfoSchema,
} from './inputs';
import { domainRegex } from '@/lib/common';
import { availableRoles } from '@/lib/permissions';

/**
 * Team creation schema
 */
export const teamCreationSchema = Yup.object({
  name: organizationNameSchema.required(
    'oscrat.ui.validation.team-name-required'
  ),
  type: Yup.mixed()
    .oneOf(
      [
        OscratOrganizationType.NATURAL_PERSON,
        OscratOrganizationType.LIMITED_LIABILITY_COMPANY,
      ],
      'oscrat.ui.validation.organization-type-invalid'
    )
    .required('oscrat.ui.validation.organization-type-required'),
  size: Yup.string().when('type', {
    is: (val: OscratOrganizationType) =>
      val === OscratOrganizationType.LIMITED_LIABILITY_COMPANY,
    then: (schema) =>
      schema.required('oscrat.ui.validation.organization-size-required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  taxId: Yup.string().when('type', {
    is: (val: OscratOrganizationType) =>
      val === OscratOrganizationType.LIMITED_LIABILITY_COMPANY,
    then: (_schema) => taxIdSchema.notRequired(),
    otherwise: (_schema) => _schema.notRequired(),
  }),
  orgRole: Yup.mixed<OscratOrganizationRole>()
    .oneOf(
      Object.values(OscratOrganizationRole),
      'oscrat.ui.validation.organization-role-invalid'
    )
    .required('oscrat.ui.validation.organization-role-required'),
  postalAddress: postalAddressSchema.required(
    'oscrat.ui.validation.postal-address-required'
  ),
  contactEmail: emailSchema.required(
    'oscrat.ui.validation.contact-email-required'
  ),
  contactPhone: phoneSchema.notRequired(),
  countryCode: Yup.string().when('contactPhone', {
    is: (contactPhone: string | undefined) => !!contactPhone?.trim(),
    then: (schema) => schema.required('oscrat.ui.validation.country-required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  additionalInformation: additionalInfoSchema.notRequired(),
});

/**
 * Team settings update schema
 */
export const teamSettingsSchema = Yup.object({
  name: Yup.string().required('oscrat.ui.validation.name-required-generic'),
  slug: Yup.string().required('oscrat.ui.validation.slug-required'),
  domain: Yup.string().nullable().matches(domainRegex, {
    message: 'oscrat.ui.validation.domain-invalid',
  }),
});

const roleSchema = Yup.mixed<Role>()
  .oneOf(
    availableRoles.map((r) => r.id),
    'oscrat.ui.validation.role-invalid'
  )
  .required('oscrat.ui.validation.role-required');

/**
 * Team member invitation schema
 */
export const inviteMemberSchema = Yup.object({
  email: emailSchema.required('oscrat.ui.validation.email-required'),
  role: roleSchema,
});

/**
 * Team member role update schema
 */
export const updateMemberRoleSchema = Yup.object({
  memberId: Yup.string()
    .required('oscrat.ui.validation.member-id-required')
    .uuid('oscrat.ui.validation.member-id-invalid'),
  role: roleSchema,
});

/**
 * Invite token validation schema
 */
export const inviteTokenSchema = Yup.object({
  token: Yup.string()
    .required('oscrat.ui.validation.invite-token-required')
    .uuid('oscrat.ui.validation.invite-token-invalid'),
});

// Type exports
export type TeamCreationData = Yup.InferType<typeof teamCreationSchema>;
export type TeamSettingsData = Yup.InferType<typeof teamSettingsSchema>;
export type InviteMemberData = Yup.InferType<typeof inviteMemberSchema>;
export type UpdateMemberRoleData = Yup.InferType<typeof updateMemberRoleSchema>;
export type InviteTokenData = Yup.InferType<typeof inviteTokenSchema>;
