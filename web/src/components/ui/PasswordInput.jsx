import { useState } from "react";
import { Input } from "./Input";
import { IconButton } from "./IconButton";

function EyeIcon({ hidden }) {
  return hidden ? (
    <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5.2 0 9 5 9 5a16.6 16.6 0 0 1-2.1 2.5M6.6 6.6C4.4 8 3 10 3 10s3.8 5 9 5c1 0 1.9-.2 2.7-.5" />
  ) : (
    <>
      <path d="M3 10s3.8-5 9-5 9 5 9 5-3.8 5-9 5-9-5-9-5Z" />
      <circle cx="12" cy="10" r="2.25" />
    </>
  );
}

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        inputClassName="pr-12"
      />
      <IconButton
        label={visible ? "Hide password" : "Show password"}
        className="absolute right-1 top-[29px] border-0"
        onClick={() => setVisible((current) => !current)}
      >
        <svg
          viewBox="0 0 24 20"
          className="size-5 fill-none stroke-current stroke-1.75"
          aria-hidden="true"
        >
          <EyeIcon hidden={visible} />
        </svg>
      </IconButton>
    </div>
  );
}
