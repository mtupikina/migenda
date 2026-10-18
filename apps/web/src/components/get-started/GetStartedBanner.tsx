import { Check } from 'lucide-react';

const line = 'absolute border-[color-mix(in_srgb,#201e1d_40%,transparent)]';

export function GetStartedBanner() {
  return (
    <figure
      className="relative mb-[70px] aspect-[21/7] w-full overflow-hidden border-2 border-[color-mix(in_srgb,#201e1d_40%,transparent)] bg-body"
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className={`${line} inset-x-0 top-1/4 border-b`} />
        <div className={`${line} inset-x-0 top-2/4 border-b`} />
        <div className={`${line} inset-x-0 top-3/4 border-b`} />
        <div className={`${line} inset-y-0 left-[8.33%] border-r`} />
        <div className={`${line} inset-y-0 left-1/4 border-r`} />
        <div className={`${line} inset-y-0 left-[41.67%] border-r`} />
        <div className={`${line} inset-y-0 left-[58.33%] border-r`} />
        <div className={`${line} inset-y-0 left-3/4 border-r`} />
        <div className={`${line} inset-y-0 left-[91.67%] border-r`} />
      </div>
      <div className="absolute left-[4%] top-[14%] h-[72%] w-[15%] bg-[#201e1d] opacity-90">
        <div className="h-1/5 bg-accent" />
        <div className="absolute left-[16%] top-[40%] h-[3px] w-[67%] bg-body opacity-50" />
        <div className="absolute left-[16%] top-[48%] h-[3px] w-[47%] bg-body opacity-50" />
        <div className="absolute left-[16%] top-[56%] h-[3px] w-[60%] bg-body opacity-50" />
      </div>
      <div className="absolute left-[25%] top-[30%] h-[46%] w-[13%] -rotate-3 bg-[#201e1d] opacity-85">
        <div className="absolute left-[15%] top-[13%] h-[11%] w-[69%] rounded-full border-[1.5px] border-body" />
        <div className="absolute left-[15%] top-[35%] h-[11%] w-[69%] rounded-full border-[1.5px] border-body" />
        <div className="absolute left-[15%] top-[57%] h-[11%] w-[46%] rounded-full bg-accent" />
      </div>
      <div className="absolute left-[46%] top-[20%] h-[60%] w-[20%] rounded-full border-[2.5px] border-[#201e1d] opacity-90" />
      <div className="absolute left-[55.7%] top-[32%] h-[18%] w-[1.5px] origin-bottom rotate-[20deg] bg-[#201e1d]" />
      <div className="absolute left-[55.7%] top-[38%] h-[12%] w-[1.5px] origin-bottom rotate-[110deg] bg-accent" />
      <div className="absolute right-[6%] top-[18%] h-[64%] w-[18%] border-2 border-[#201e1d] bg-body opacity-95 shadow-[0_8px_24px_color-mix(in_srgb,#201e1d_18%,transparent)]">
        <div className="flex h-[22%] items-center border-b-2 border-[color-mix(in_srgb,#201e1d_40%,transparent)] px-[8%]">
          <div className="h-[18%] w-[30%] bg-accent" />
        </div>
        <div className="grid gap-[10%] p-[8%]">
          <div className="h-2 bg-[#201e1d] opacity-15" />
          <div className="h-2 w-[70%] bg-[#201e1d] opacity-15" />
          <div className="h-2 bg-accent" />
        </div>
      </div>
      <div className="absolute left-[68%] top-[10%] flex aspect-square w-[8%] items-center justify-center rounded-full bg-accent opacity-90">
        <Check className="h-[45%] w-[45%] text-body" strokeWidth={2.5} aria-hidden />
      </div>
    </figure>
  );
}
