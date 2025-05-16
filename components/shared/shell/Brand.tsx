import app from "@/lib/app";

const Brand = () => {
  return (
    <div className="flex shrink-0 items-center gap-2 pt-6 text-xl font-bold">
      <img src={app.logoUrl} alt={app.name} />
    </div>
  );
};

export default Brand;
