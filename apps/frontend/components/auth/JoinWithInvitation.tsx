import {
  Error,
  InputWithLabel,
  Loading,
  WithLoadingAndError,
} from '@/components/shared';
import { joinWithInvitationSchema } from '@/lib/validation/auth';
import { useFormik } from 'formik';
import { useInvitation } from 'hooks/useInvitation';
import { useTranslation } from 'next-i18next';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import TogglePasswordVisibility from '../shared/TogglePasswordVisibility';
import { useRef, useState } from 'react';
import AgreeMessage from './AgreeMessage';
import GoogleReCAPTCHA from '../shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import { extractErrorMessage } from '@/lib/utils';
import { useJoin } from '@/hooks/useJoin';
import { signIn } from 'next-auth/react';


interface JoinWithInvitationProps {
  inviteToken: string;
  recaptchaSiteKey: string | null;
}

const JoinWithInvitation = ({
  inviteToken,
  recaptchaSiteKey,
}: JoinWithInvitationProps) => {
  const { t } = useTranslation('common');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const { isLoading, error, invitation } = useInvitation(inviteToken);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { join } = useJoin();

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      password: '',
    },
    validationSchema: joinWithInvitationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (!invitation) {
          toast.error(t('invitation-not-found'));
          return;
        }
        
        // Create the account
        await join({
          firstName: values.firstName,
          lastName: values.lastName,
          email: invitation.email,
          password: values.password,
          recaptchaToken,
        });
        
        recaptchaRef.current?.reset();
        formik.resetForm();
        toast.success(t('successfully-joined'));
    
        await signIn('credentials', {
          email: invitation.email,
          password: values.password,
          redirect: true,
          callbackUrl: `/teams?token=${inviteToken}`,
        });
        
      } catch (error: unknown) {
        toast.error(extractErrorMessage(error, t('error-joining')));
        recaptchaRef.current?.reset();
      }
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error || !invitation) {
    return <Error message={error?.message || t('invitation-not-found')} />;
  }

  return (
    <WithLoadingAndError isLoading={isLoading} error={error}>
      <form className="space-y-3" onSubmit={formik.handleSubmit}>
        <InputWithLabel
          type="text"
          label={t('first-name')}
          name="firstName"
          placeholder={t('your-first-name')}
          value={formik.values.firstName}
          error={formik.touched.firstName ? formik.errors.firstName : undefined}
          onChange={formik.handleChange}
        />
        <InputWithLabel
          type="text"
          label={t('last-name')}
          name="lastName"
          placeholder={t('your-last-name')}
          value={formik.values.lastName}
          error={formik.touched.lastName ? formik.errors.lastName : undefined}
          onChange={formik.handleChange}
        />
        <InputWithLabel
          type="email"
          name="email"
          label={t('email')}
          value={invitation.email}
          disabled
        />
        <div className="relative flex">
          <InputWithLabel
            type={isPasswordVisible ? 'text' : 'password'}
            label={t('password')}
            name="password"
            placeholder={t('password')}
            value={formik.values.password}
            error={formik.touched.password ? formik.errors.password : undefined}
            onChange={formik.handleChange}
          />
          <TogglePasswordVisibility
            isPasswordVisible={isPasswordVisible}
            handlePasswordVisibility={handlePasswordVisibility}
          />
        </div>
        <GoogleReCAPTCHA
          recaptchaRef={recaptchaRef}
          onChange={setRecaptchaToken}
          siteKey={recaptchaSiteKey}
        />
        <div className="space-y-3">
          <Button
            type="submit"
            color="primary"
            loading={formik.isSubmitting}
            active={formik.dirty}
            fullWidth
            size="md"
          >
            {t('create-account')}
          </Button>
          <AgreeMessage text="create-account" />
        </div>
      </form>
    </WithLoadingAndError>
  );
};

export default JoinWithInvitation;
