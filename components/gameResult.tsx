import { FC } from "react";
import styles from "../styles/Home.module.css";
import { Fireworks } from "@fireworks-js/react";

export const GameResults: FC<{
  gameResult: "tie" | "account" | "other";
}> = ({ gameResult }) => {
  if (gameResult === "tie") {
    return <p className={styles.description}>It&apos;s a tie! You both won!</p>;
  } else if (gameResult === "account") {
    return (
      <p className={styles.description}>
        You won! Congratulations! 🎉
        <Fireworks
          options={{
            opacity: 0.5,
          }}
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            position: "fixed",
            background: "transparent",
            zIndex: -1,
          }}
        />
      </p>
    );
  } else {
    return (
      <p className={styles.description}>You lost! Better luck next time!</p>
    );
  }
};
