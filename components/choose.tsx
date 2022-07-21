import { FC, useState } from "react";
import styles from "../styles/Home.module.css";

export const Choose: FC<{
  onChoose: (choice: number) => void;
}> = ({ onChoose }) => {
  const [disabled, setDisabled] = useState(false);
  return (
    <div className={styles.grid}>
      {["🪨", "🧻", "✂️"].map((choice, index) => (
        <div
          key={index}
          className={styles.card}
          onClick={() => {
            setDisabled(true);
            !disabled && onChoose(index + 1);
          }}
          style={{
            fontSize: "10rem",
            textAlign: "center",
            cursor: "pointer",
            ...(disabled
              ? { opacity: 0.5, boxShadow: "none", cursor: "not-allowed" }
              : {}),
          }}
        >
          {choice}
        </div>
      ))}
    </div>
  );
};
