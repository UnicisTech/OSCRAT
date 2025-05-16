import React, { InputHTMLAttributes } from "react";

interface InputWithLabelProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string | React.ReactNode;
  error?: string;
  descriptionText?: string;
}

const InputWithLabel = (props: InputWithLabelProps) => {
  const { label, error, descriptionText, ...rest } = props;
  console.log("rest", rest);

  const classes = Array<string>();

  if (error) {
    classes.push("input-error");
  }

  return (
    <div className="form-control w-full">
      {typeof label === "string" ? (
        <label className="label">
          <span className="label-text text-black dark:text-white">{label}</span>
        </label>
      ) : (
        label
      )}
      <input className={`${classes.join(" ")} border-2 p-3`} {...rest} />
      {(error || descriptionText) && (
        <label className="label">
          <span className={`label-text-alt ${error ? "text-red-500" : ""}`}>
            {error || descriptionText}
          </span>
        </label>
      )}
    </div>
  );
};

export default InputWithLabel;
