"use client";

import Header from "@/components/header";
import LotteryEntrance from "@/components/lotteryEntrance";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "@web3uikit/core";

export default function Home() {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <Header />
        <main>
          <LotteryEntrance />
        </main>
      </NotificationProvider>{" "}
    </MoralisProvider>
  );
}
