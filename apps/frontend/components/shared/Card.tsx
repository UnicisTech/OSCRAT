import React from 'react';

interface CardProps {
  heading?: string;
  children: React.ReactNode;
  button?: React.ReactNode;
}

const Card = (props: CardProps) => {
  const { heading, children, button } = props;

  return (
    <div className="border-rounded card bg-surface border-line mb-5 w-full border">
      {(heading || button) && (
        <div className="border-line bg-surface-muted text-content flex items-center justify-between border-b px-3 py-3 text-sm font-medium">
          <div>{heading || ''}</div>
          <div>{button ? button : null}</div>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

const Title = ({ children }: { children: React.ReactNode }) => {
  return (
    <h2 className="card-title text-xl font-medium leading-none tracking-tight">
      {children}
    </h2>
  );
};

const Description = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-content-secondary text-sm">{children}</p>;
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-3">{children}</div>;
};

//TODO: card fix className
const Body = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`card-body gap-6 p-6 ${className || ''}`}>{children}</div>
  );
};

const Footer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="card-actions border-line justify-end border-t px-6 py-4">
      {children}
    </div>
  );
};

Card.Body = Body;
Card.Title = Title;
Card.Description = Description;
Card.Header = Header;
Card.Footer = Footer;

export default Card;
