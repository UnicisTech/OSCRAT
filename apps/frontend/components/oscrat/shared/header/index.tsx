interface HeaderProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function Header({
  title,
  subtitle,
  buttonText,
  onButtonClick,
}: HeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12px] text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {buttonText && onButtonClick && (
          <button
            type="button"
            className="h-9 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
            onClick={onButtonClick}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
