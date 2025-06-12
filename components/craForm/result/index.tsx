import { LuFileWarning, LuCheckCircle } from 'react-icons/lu';
import Button from '@/components/button';
import { useRouter } from 'next/navigation';
import { ResultProps } from '@/types/oscrat/craForm/form';

export default function Result({
  isEligible,
  teamSlug,
  projectId,
}: ResultProps) {
  const router = useRouter();

  const handleNavigateBack = () => {
    router.push(`/teams/${teamSlug}/oscrat/projects/${projectId}`);
  };

  const handleRestart = () => {
    router.push(`/teams/${teamSlug}/oscrat/projects`);
  };

  if (!isEligible) {
    return (
      <div className="flex flex-col items-center justify-center p-4 font-['Inter',_sans-serif]">
        <div className="w-full max-w-2xl rounded-lg border-2 bg-white p-8 text-center md:p-12 md:pb-0">
          <div className="mb-6">
            <LuCheckCircle className="mx-auto h-16 w-16 text-green-500" />
          </div>
          <h1 className="mb-4 text-2xl font-semibold text-gray-800 md:text-3xl">
            No Qualification Required
          </h1>
          <p className="mb-8 text-sm text-gray-600 md:text-base">
            Your product does not fall within the scope of the Cyber Resilience
            Act.
            <br />
            You can check another product or return to the main page.
          </p>
          <div className="mb-8 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button
              onClick={handleNavigateBack}
              className="w-full rounded-lg border border-black bg-white px-8 py-3 font-medium text-black transition-colors sm:w-auto"
              text="Back to Project"
              variant="normal"
            />
            <Button
              onClick={handleRestart}
              className="hover:bg-pri w-full rounded-lg bg-blue-600 px-8 py-3 font-medium text-white shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:w-auto"
              text="Check Another Product"
              variant="primary"
            />
          </div>
        </div>
        <p className="mt-8 max-w-2xl px-4 text-center text-xs text-gray-500">
          Note: This self-assessment is solely intended to evaluate the
          potential compliance of the product and does not constitute or imply
          formal certification.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 font-['Inter',_sans-serif]">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-xl md:p-12 md:pb-4">
        <div className="mb-6">
          <LuFileWarning className="mx-auto h-16 w-16 text-orange-500" />
        </div>
        <h1 className="mb-4 text-2xl font-semibold text-gray-800 md:text-3xl">
          Product Requires Assessment
        </h1>
        <p className="mb-8 text-sm text-gray-600 md:text-base">
          Your product falls within the scope of the Cyber Resilience Act as a{' '}
          <span className="font-semibold text-gray-700">Class I PDE</span>.
          <br />
          Follow the steps below to continue the assessment.
        </p>
        <div className="mb-8 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button
            onClick={handleNavigateBack}
            className="w-full rounded-lg bg-white px-8 py-3 font-medium transition-colors hover:bg-blue-50 sm:w-auto"
            text="Back to Project"
            variant="normal"
          />
          <Button
            onClick={() =>
              router.push(
                `/teams/${teamSlug}/oscrat/projects/${projectId}/cra/details`
              )
            }
            className="w-full rounded-lg px-8 py-3 font-medium text-white shadow-md transition-colors sm:w-auto"
            text="Continue Assessment"
            variant="primary"
          />
        </div>
      </div>
      <p className="mt-8 max-w-2xl px-4 text-center text-xs text-gray-500">
        Note: This self-assessment is solely intended to evaluate the potential
        compliance of the product and does not constitute or imply formal
        certification.
      </p>
    </div>
  );
}
