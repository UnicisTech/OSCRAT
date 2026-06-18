import React from 'react';
import { useRouter } from 'next/router';

type ShortUuidButtonProps = {
  uuid: string;
  href: string;
  disabled?: boolean;
};

const ShortUuidButton: React.FC<ShortUuidButtonProps> = ({
  uuid,
  href,
  disabled = false,
}) => {
  const router = useRouter();
  const shortUuid = uuid.slice(0, 5);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      router.push(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`text-sm underline ${
        disabled
          ? 'text-content-placeholder cursor-not-allowed'
          : 'text-primary hover:text-primary-dark cursor-pointer'
      }`}
      type="button"
    >
      {shortUuid}
    </button>
  );
};

export default ShortUuidButton;
