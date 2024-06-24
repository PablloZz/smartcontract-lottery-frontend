"use client";

import { abi, contractAddresses } from "@/constants";
import { type TransactionResponse } from "@ethersproject/providers";
import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from "@web3uikit/core";

export default function LotteryEntrance() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const dispatch = useNotification();
  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayers, setNumberOfPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("");
  const chainId =
    String(Number.parseInt(chainIdHex ?? "0")) === "1337"
      ? "31337"
      : String(Number.parseInt(chainIdHex ?? "0"));

  const raffleAddress = (contractAddresses as Record<string, string[] | undefined>)[chainId]?.[0];
  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: "100000000000000000",
  });

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
    const raffleEntranceFee = (await getEntranceFee()) as BigNumber;
    const numberOfPlayers = (await getNumberOfPlayers()) as BigNumber;
    const recentWinner = (await getRecentWinner()) as string;
    console.log(raffleEntranceFee);
    setEntranceFee(ethers.utils.formatUnits(raffleEntranceFee, 18));
    setNumberOfPlayers(String(numberOfPlayers));
    setRecentWinner(recentWinner);
  }, [setEntranceFee, setNumberOfPlayers, setRecentWinner]);

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
          <h2>Entrance Fee: {entranceFee} ETH</h2>
          <h3>Number of players: {numberOfPlayers}</h3>
          <h3>Recent Winner: {recentWinner}</h3>
        </div>
      ) : (
        <h2>No Raffle Address Detected</h2>
      )}
    </section>
  );
}
