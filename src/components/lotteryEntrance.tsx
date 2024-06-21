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
  const chainId =
    String(Number.parseInt(chainIdHex ?? "0")) === "1337"
      ? "31337"
      : String(Number.parseInt(chainIdHex ?? "0"));

  const raffleAddress = (contractAddresses as Record<string, string[] | undefined>)[chainId]?.[0];
  const { runContractFunction: enterRaffle } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
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
  }, []);

  const handleUpdateUi = useCallback(async () => {
    const raffleEntranceFee = (await getEntranceFee()) as BigNumber;
    const numberOfPlayers = (await getNumberOfPlayers()) as BigNumber;
    const recentWinner = (await getRecentWinner()) as string;
    setEntranceFee(String(raffleEntranceFee));
    setNumberOfPlayers(String(numberOfPlayers));
    setRecentWinner(recentWinner);
  }, []);

  const handleSuccessRaffleEnter = useCallback(async (transaction: unknown) => {
    await (transaction as TransactionResponse).wait(1);
    handleUpdateUi();
    handleDispatchSuccessNotification();
  }, []);

  const handleEnterRaffle = useCallback(async () => {
    await enterRaffle({
      onSuccess: handleSuccessRaffleEnter,
      onError: (error) => console.log(error),
    });
  }, []);

  useEffect(() => {
    if (isWeb3Enabled) handleUpdateUi();
  }, [isWeb3Enabled]);

  return (
    <section>
      {raffleAddress ? (
        <div>
          <h2>Entrance Fee: {ethers.utils.formatUnits(entranceFee, 18)} ETH</h2>
          <button onClick={handleEnterRaffle}>Enter Raffle</button>
          <h3>Number of players: {numberOfPlayers}</h3>
          <h3>Recent Winner: {recentWinner}</h3>
        </div>
      ) : (
        <h2>No Raffle Address Detected</h2>
      )}
    </section>
  );
}
