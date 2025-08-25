import { Button, Modal as DModal } from 'react-daisyui';

interface ModalProps {
  open: boolean;
  close: () => void;
  children: React.ReactNode;
}

interface BodyProps {
  children: React.ReactNode;
  className?: string;
}

const Modal = ({ open, close, children }: ModalProps) => {
  return (
    <DModal 
      open={open}
      className="bg-white text-black border border-gray-300 shadow-lg"
    >
      <Button
        type="button"
        size="sm"
        shape="circle"
        className="btn-ghost absolute right-2 top-2 rounded-full bg-transparent hover:bg-gray-100 text-gray-600"
        onClick={close}
        aria-label="close"
      >
        x
      </Button>
      <div className="p-6">{children}</div>
    </DModal>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="text-lg font-bold text-black mb-4">{children}</h3>;
};

const Description = ({ children }: { children: React.ReactNode }) => {
  return <p className="pt-1 text-sm text-gray-700">{children}</p>;
};

const Body = ({ children, className }: BodyProps) => {
  return <div className={`py-3 text-black ${className || ''}`}>{children}</div>;
};

const Footer = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">{children}</div>;
};

Modal.Header = Header;
Modal.Description = Description;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;
