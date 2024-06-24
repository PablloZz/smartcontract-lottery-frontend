import { ConnectButton } from "web3uikit";

export default function Header() {
  return (
    <header className="border-b-2 flex flex-row items-center pt-[200px]">
      <h1 className="p-4 font-bold text-3xl">Decentralized Lottery</h1>
      <div className="ml-auto py-2 px-4">
        <ConnectButton moralisAuth={false} />
      </div>
    </header>
  );
}
