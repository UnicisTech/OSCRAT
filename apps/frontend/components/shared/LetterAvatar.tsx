const LetterAvatar = ({ name }: { name: string }) => {
  return (
    <div className="bg-primary text-content-inverse flex h-8 w-8 items-center justify-center rounded-full">
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

export default LetterAvatar;
