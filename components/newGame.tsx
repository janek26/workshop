import { IStarknetWindowObject } from "@argent/get-starknet/dist";
import { FC } from "react";
import styles from "../styles/Home.module.css";
import { useForm, RegisterOptions } from "react-hook-form";
import { validateAndParseAddress } from "starknet";
import { deployGameContract } from "../lib/gameContract";

function compareAddresses(a: string, b: string) {
  return validateAndParseAddress(a) === validateAndParseAddress(b);
}

export const addressInputOptions: RegisterOptions = {
  required: { value: true, message: "This field is required" },
  maxLength: {
    value: 66,
    message: "Address must be maximum 66 characters long",
  },
  minLength: {
    value: 63,
    message: "Address must be minimum 63 characters long",
  },
  pattern: {
    value: /^0x[0-9a-fA-F]*$/i,
    message: "Address must be hexadecimal",
  },
  validate: (value) => {
    try {
      validateAndParseAddress(value);
    } catch {
      return "Invalid address";
    }
  },
};

export const NewGame: FC<{
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
      player1Address: account?.address ?? "",
      player2Address: "",
    },
  });

  return (
    <div className={className} style={{ minWidth: "360px" }}>
      <h1>New Game</h1>
      <form
        onSubmit={handleSubmit(async ({ player1Address, player2Address }) => {
          if (compareAddresses(player1Address, player2Address)) {
            return setError(
              "player2Address",
              {
                message: "Player 1 and Player 2 must be different",
              },
              { shouldFocus: true }
            );
          }

          try {
            const game = await deployGameContract(
              account,
              player1Address,
              player2Address
            );

            return onGameChange(game.address);
          } catch (e) {
            return setError("player2Address", {
              message: "Deployment failed",
            });
          }
        })}
      >
        <div className={styles.input}>
          <label htmlFor="player1Address">Player 1 Address</label>
          <input
            autoComplete="off"
            {...register("player1Address", addressInputOptions)}
          />
          {errors.player1Address && (
            <div className="error">{errors.player1Address.message}</div>
          )}
        </div>
        <div className={styles.input}>
          <label htmlFor="player2Address">Player 2 Address</label>
          <input
            autoComplete="off"
            {...register("player2Address", addressInputOptions)}
          />
          {errors.player2Address && (
            <div className="error">{errors.player2Address.message}</div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            justifyContent: "center",
            color: "#333",
          }}
        >
          <button
            style={{
              marginTop: "1rem",
            }}
            className={styles.button}
            disabled={(submitCount > 0 && !isDirty) || isSubmitting}
            type="submit"
          >
            Create
          </button>
          {isSubmitting && <span>Waiting for transaction...</span>}
        </div>
      </form>
    </div>
  );
};
