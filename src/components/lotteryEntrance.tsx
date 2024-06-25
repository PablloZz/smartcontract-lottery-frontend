"use client";

import { abi, contractAddresses } from "@/constants";
import { type TransactionResponse } from "@ethersproject/providers";
import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const dispatch = useNotification();
  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayers, setNumberOfPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("");
  const chainId = String(Number.parseInt(chainIdHex ?? "0"));

  const raffleAddress =
    (contractAddresses as Record<string, string[] | undefined>)[chainId]?.[0] ?? "";
  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });
  console.log(raffleAddress);

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
  });

  const handleDispatchSuccessNotification = useCallback(() => {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    });
  }, [dispatch]);

  const handleUpdateUi = useCallback(async () => {
    const raffleEntranceFee = String(await getEntranceFee());
    const numberOfPlayers = String(await getNumberOfPlayers());
    const recentWinner = (await getRecentWinner()) as string;
    setEntranceFee(raffleEntranceFee);
    setNumberOfPlayers(numberOfPlayers);
    setRecentWinner(recentWinner);
  }, [
    setEntranceFee,
    setNumberOfPlayers,
    setRecentWinner,
    getRecentWinner,
    getNumberOfPlayers,
    getEntranceFee,
  ]);

  const handleSuccessRaffleEnter = useCallback(
    async (transaction: unknown) => {
      await (transaction as TransactionResponse).wait(1);
      handleUpdateUi();
      handleDispatchSuccessNotification();
    },
    [handleUpdateUi, handleDispatchSuccessNotification],
  );

  const handleEnterRaffle = useCallback(async () => {
    await enterRaffle({
      onSuccess: handleSuccessRaffleEnter,
      onError: (error) => console.log(error),
    });
  }, [enterRaffle, handleSuccessRaffleEnter]);

  useEffect(() => {
    if (isWeb3Enabled) handleUpdateUi();
  }, [isWeb3Enabled, handleUpdateUi]);

  return (
    <section className="p-5">
      {raffleAddress ? (
        <div>
          <button
            onClick={handleEnterRaffle}
            disabled={isLoading || isFetching}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              "Enter Raffle"
            )}
          </button>
          <h2>
            Entrance Fee:{" "}
            {!Number(entranceFee) ? entranceFee : ethers.utils.formatUnits(entranceFee, 18)} ETH
          </h2>
          <h3>Number of players: {numberOfPlayers}</h3>
          <h3>Recent Winner: {recentWinner}</h3>
        </div>
      ) : (
        <h2>No Raffle Address Detected</h2>
      )}
    </section>
  );
}
