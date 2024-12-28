import { type makeRatio } from "@agoric/zoe/src/contractSupport/index.js";
import { AmountInput, useAgoric } from "@agoric/react-components";
import { stringifyValue } from "@agoric/web-components";
import { useState } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";
import { divideBy } from "@agoric/zoe/src/contractSupport/ratio";

type Props = {
  availableToWithdraw: bigint;
  shareWorth: ReturnType<typeof makeRatio> | undefined;
};

const Withdraw = ({ availableToWithdraw, shareWorth }: Props) => {
  const [value, setValue] = useState<bigint | null>(null);
  const { makeOffer, purses } = useAgoric();
  const usdcPurseAmount = purses?.find(
    ({ pursePetname }) => pursePetname === "USDC"
  )?.currentAmount as Amount<"nat">;

  const isMaxExceeded = !!value && value > availableToWithdraw;
  const isDisabled = !value || !shareWorth || !usdcPurseAmount || isMaxExceeded;

  const executeOffer = () => {
    const usdcAmount = harden({ brand: usdcPurseAmount.brand, value });
    const fastLPAmount = divideBy(usdcAmount, shareWorth);
    const proposal = {
      give: {
        PoolShare: fastLPAmount,
      },
      want: {
        USDC: usdcAmount,
      },
    };

    const invitationSpec = {
      source: "agoricContract",
      instancePath: ["fastUsdc"],
      callPipe: [["makeWithdrawInvitation", []]],
    };

    makeOffer?.(
      invitationSpec,
      proposal,
      undefined,
      (update: { status: string; data?: unknown }) => {
        if (update.status === "error") {
          toast.error(`Offer Error: ${update.data}`);
        }
        if (update.status === "accepted") {
          toast.success("Offer Accepted");
        }
        if (update.status === "refunded") {
          toast.warning("Offer Refunded");
        }
      }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow col-span-1 md:col-span-2 p-6">
      <div className="text-xl font-semibold">Withdraw USDC</div>
      <div className="my-6">
        <div className="text-gray-500 font-semibold text-sm mb-1">
          Amount to Withdraw
        </div>
        <AmountInput
          decimalPlaces={6}
          value={value}
          onChange={setValue}
          className="bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-3 w-full"
        />
        <div
          className={clsx(
            "text-gray-500 text-sm mt-1",
            isMaxExceeded && "text-red-500"
          )}
        >
          <span className="font-medium">Max Withdrawable:</span>{" "}
          {stringifyValue(availableToWithdraw, "nat", 6)} USDC
        </div>
      </div>
      <button
        onClick={executeOffer}
        disabled={isDisabled}
        className={clsx(
          "w-full bg-agoric-red p-2 px-3 h-12 rounded-lg text-white hover:bg-opacity-85 active:bg-opacity-70 active:scale-95 transition-all outline-none ring-offset-2 focus:ring-2",
          isDisabled && "bg-gray-300 cursor-not-allowed"
        )}
      >
        Withdraw
      </button>
    </div>
  );
};

export default Withdraw;