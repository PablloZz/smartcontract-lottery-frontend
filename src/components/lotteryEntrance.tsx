import { abi, contractAddresses } from "@/constants";
import { ethers } from "ethers";
import { type BigNumber } from "moralis/common-core";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const [entranceFee, setEntranceFee] = useState("0");
  const chainId =
    String(Number.parseInt(chainIdHex ?? "0")) === "1337"
      ? "31337"
      : String(Number.parseInt(chainIdHex ?? "0"));

  const raffleAddress = (contractAddresses as Record<string, string[] | undefined>)[chainId]?.[0];
  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
  });

  const handleEnterRaffle = useCallback(() => {
    await enterRaffle();
  }, [])

  useEffect(() => {
    async function updateUI() {
      const raffleEntranceFee = (await getEntranceFee()) as BigNumber;
      setEntranceFee(String(raffleEntranceFee));
    }

    if (isWeb3Enabled) updateUI();
  }, [isWeb3Enabled]);

  return <section>{raffleAddress ? <div><h2>Entrance Fee: {ethers.utils.formatUnits(entranceFee, 18)} ETH</h2><button>Enter Raffle</button></div> : <h2>No Raffle Address Detected</h2></section>;
}
