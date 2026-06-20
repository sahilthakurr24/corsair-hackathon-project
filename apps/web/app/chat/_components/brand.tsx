import Link from "next/link";
import { Icon } from "./icon";

export function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-[9px] text-[19px] font-bold tracking-[-0.5px]"
    >
      <span className="grid h-[30px] w-[30px] place-items-center rounded-[7px] border-2 border-brand-blue text-brand-blue shadow-[4px_4px_0_#beddff]">
        <Icon name="mail" size={20} />
      </span>
      <span>CalMail</span>
    </Link>
  );
}
