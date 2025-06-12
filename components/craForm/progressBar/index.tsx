type ProgressProps = {
  step: number;
  total: number;
};

export default function ProgressBar({ step, total }: ProgressProps) {
  const progress = Math.round((step / total) * 100);

  if (!step || !total) {
    return null;
  }

  return (
    <div>
      <p className="mb-1 text-sm font-bold">Progress</p>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between">
        <p className="mb-1 text-sm">
          {step}/{total} Questions
        </p>
        <p className="mb-1 text-sm">{progress}%</p>
      </div>
    </div>
  );
}
