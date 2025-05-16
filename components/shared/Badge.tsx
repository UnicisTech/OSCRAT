import { BadgeProps, Badge as BaseBadge } from "react-daisyui";

const Badge = (props: BadgeProps) => {
  const { children, className } = props;

  return (
    <>
      <BaseBadge
        {...props}
        className={`rounded py-2 text-xs text-white ${className}`}
      >
        {children}
      </BaseBadge>
    </>
  );
};

export default Badge;
