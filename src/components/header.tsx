import { ConnectButton } from "web3uikit";

export default function Header() {
  return (
    <header>
      <h1>Decentralized Lottery</h1>
      <ConnectButton moralisAuth={false} />
    </header>
  );
}
