/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import './App.css'
import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";

type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage"

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

// create a provider interface (hint: think of this as an object) to store the Phantom Provider
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
}

function App() {
  const [provider, setProvider] = useState<PhantomProvider | undefined>(undefined);
  const [walletkey, setWalletkey] = useState<PhantomProvider | undefined>(undefined);

  useEffect(() => {
    const provider = getProvider();

    if (provider) setProvider(provider);
    else setProvider(undefined)
  }, [])

  const connectWallet = async () => {
    // @ts-expect-error -> we dont know the type of solana
    const { solana } = window;

    if (solana) {
      try {
        const response = await solana.connect();
        console.log('Wallet account ' + response.publicKey.toString());
        setWalletkey(response.publicKey.toString());
      } catch (err) {
        console.log(err)
      }
    }
  }

  const disconnectWallet = async () => {
    setWalletkey(undefined)
  }

  return (
    <div className="app">
      <header className="App-header">
        <h2>Connect to Phantom Wallet</h2>
        {(provider && !walletkey) && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px"
            }}
            onClick={connectWallet}
          >Connect Wallet</button>
        )}
        {(provider && walletkey) && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
              position: "absolute",
              top: "5%",
              right: "5%"
            }}
            onClick={disconnectWallet}
          >Disconnect Wallet</button>
        )}
        {provider && walletkey && <p><b>Connected Account</b>{walletkey.toString()} </p>}
        {!provider && (
          <p>
            No provider found Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}
      </header>
    </div>
  )
}

export default App
