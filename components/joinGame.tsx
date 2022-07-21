import { IStarknetWindowObject } from "@argent/get-starknet/dist";
import { FC } from "react";
import styles from "../styles/Home.module.css";
import { useForm } from "react-hook-form";
import { addressInputOptions } from "./newGame";
import { getGameContract } from "../lib/gameContract";
import { number } from "starknet";

export const JoinGame: FC<{
  account: IStarknetWindowObject["account"];
  className?: string;
  onGameChange: (game: string) => void;
}> = ({ className = "", onGameChange, account }) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting, submitCount },
  } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      gameAddress: "",
    },
  });

  return (
    <div className={className} style={{ minWidth: "360px" }}>
      <h1>Join Game</h1>
      <form
        onSubmit={handleSubmit(async ({ gameAddress }) => {
          console.log(gameAddress);

          // check if player is in the game
          const gameContract = getGameContract(gameAddress);

          try {
            const [x, y] = await gameContract.get_players();
            const players = [x, y].map(number.toHex);
            if (!players.includes(account.address)) {
              return setError("gameAddress", {
                message: "You are not in this game",
              });
            }
            onGameChange(gameAddress);
          } catch (e) {
            console.log(e);
          }
        })}
      >
        <div className={styles.input}>
          <label htmlFor="player1Address">Game Address</label>
          <input
            autoComplete="off"
            {...register("gameAddress", addressInputOptions)}
          />
          {errors.gameAddress && (
            <div className="error">{errors.gameAddress.message}</div>
          )}
        </div>
        <button
          style={{
            marginTop: "1rem",
          }}
          className={styles.button}
          disabled={(submitCount > 0 && !isDirty) || isSubmitting}
          type="submit"
        >
          Join
        </button>
      </form>
    </div>
  );
};
