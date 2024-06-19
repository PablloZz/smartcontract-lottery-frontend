import { useEffect } from "react";
import { useMoralis } from "react-moralis";

export default function ManualHeader() {
  const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
    useMoralis();

  async function handleConnectMetaMask() {
    await enableWeb3();

    if (typeof window !== "undefined") {
      window.localStorage.setItem("connection", "injected");
    }
  }

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Account changed to ${account}`);

      if (account === null) {
        window.localStorage.removeItem("connection");
        deactivateWeb3();
        console.log("Null account found");
      }
    });
  }, []);

  useEffect(() => {
    if (isWeb3Enabled) return;

    if (typeof window !== "undefined") {
      if (window.localStorage.getItem("connection")) handleConnectMetaMask();
    }
  }, [handleConnectMetaMask]);

  return (
    <header>
      {account ? (
        <div>
          Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
        </div>
      ) : (
        <button onClick={handleConnectMetaMask} disabled={isWeb3EnableLoading}>
          Connect
        </button>
      )}
    </header>
  );
}
