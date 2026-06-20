import { Icon } from "./icon";
import { ChatHeader } from "./chat-header";

export function ComingSoonView({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <ChatHeader icon={icon} title={title} status="Coming soon" subtitle={description} />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-[13px] bg-[#eaf4ff] text-brand-blue">
          <Icon name={icon} size={25} />
        </span>
        <h1 className="text-[18px] tracking-[-0.5px]">{title} is on the way</h1>
        <p className="max-w-[360px] text-[11px] text-[#7b8798]">{description}</p>
      </div>
    </>
  );
}
