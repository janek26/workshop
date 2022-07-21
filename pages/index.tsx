import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import ClipLoader from "react-spinners/ClipLoader";
import styles from "../styles/Home.module.css";

import { useWallet } from "../hooks/useWallet";
import { NewGame } from "../components/newGame";
import { JoinGame } from "../components/joinGame";
import { useEffect, useState } from "react";
import { Choose } from "../components/choose";
import { getGameContract } from "../lib/gameContract";
import { BigNumber } from "@ethersproject/bignumber";
import { GameResults } from "../components/gameResult";

const Home: NextPage = () => {
  const [gameResult, setGameResult] = useState<
    "tie" | "account" | "other" | undefined
  >();
  const [betAccepted, setBetAccepted] = useState(false);
  const [betTransaction, setBetTransaction] = useState<string | undefined>();
  const [gameId, setGameId] = useState<string | null>(null);
  const { wallet, connect } = useWallet();
  const isConnected = wallet?.isConnected;

  useEffect(() => {
    let pid: number;
    if (isConnected && gameId && betTransaction && !betAccepted) {
      wallet.account.waitForTransaction(betTransaction).then(async () => {
        const [winner] = await getGameContract(gameId).get_winner();
        const winnerBn = BigNumber.from(winner.toString());

        if (winnerBn.eq(1)) {
          setGameResult("tie");
        } else if (winnerBn.eq(wallet.account.address)) {
          setGameResult("account");
        } else if (winnerBn.gt(1)) {
          setGameResult("other");
        }

        setBetAccepted(true);
      });
    }
    if (isConnected && gameId && betTransaction && betAccepted) {
      pid = setInterval(async () => {
        const [winner] = await getGameContract(gameId).get_winner();
        const winnerBn = BigNumber.from(winner.toString());

        if (winnerBn.eq(1)) {
          setGameResult("tie");
        } else if (winnerBn.eq(wallet.account.address)) {
          setGameResult("account");
        } else if (winnerBn.gt(1)) {
          setGameResult("other");
        }
      }, 5000) as unknown as number;
    }
    return () => {
      if (pid) {
        clearInterval(pid);
      }
    };
  }, [
    betTransaction,
    gameId,
    isConnected,
    setBetAccepted,
    wallet,
    betAccepted,
  ]);

  return (
    <div className={styles.container}>
      <Head>
        <title>🪨🧻✂️</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to 🪨🧻✂️</h1>
        {isConnected &&
        gameId &&
        betTransaction &&
        betAccepted &&
        gameResult ? (
          <GameResults gameResult={gameResult} />
        ) : isConnected && gameId && betTransaction && betAccepted ? (
          <>
            <p className={styles.description}>
              Your bet was accepted, waiting for the game to finish...
            </p>
            <ClipLoader color="#000000" size="5rem" />
          </>
        ) : isConnected && gameId && betTransaction ? (
          <>
            <p className={styles.description}>
              Your bet transaction is being send, this may take some time:{" "}
              <br /> <code>{betTransaction}</code>
            </p>
            <ClipLoader color="#000000" size="5rem" />
          </>
        ) : isConnected && gameId ? (
          <>
            <p className={styles.description}>
              Welcome to game: <br /> <code>{gameId}</code>
            </p>

            <Choose
              onChoose={async (c) => {
                const gameContract = getGameContract(gameId, wallet.account);
                const tx = await gameContract.bet(c);
                if (!tx?.transaction_hash) {
                  throw new Error("Transaction hash is undefined");
                }
                setBetTransaction(tx.transaction_hash);
              }}
            />
          </>
        ) : isConnected ? (
          <>
            <p className={styles.description}>
              Next you should deploy a game contract on the blockchain or join a
              existing game 🎮👨‍💻
            </p>

            <div className={styles.grid}>
              <NewGame
                onGameChange={(gameId) => {
                  setGameId(gameId);
                }}
                className={styles.card}
                account={wallet.account}
              />
              <JoinGame
                account={wallet.account}
                onGameChange={(gameId) => {
                  setGameId(gameId);
                }}
                className={styles.card}
              />
            </div>
          </>
        ) : (
          <>
            <p className={styles.description}>
              Get started by connecting your wallet below
            </p>

            <button onClick={connect} className={styles.button + " big"}>
              Connect wallet
            </button>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <a
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          href="https://argent.xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/argent.svg" alt="Argent Logo" width={92} height={36} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
