import { Abi, AccountInterface, Contract, uint256 } from "starknet";
import { toBN } from "starknet/dist/utils/number";
import { compileCalldata } from "starknet/dist/utils/stark";
import gameAbi from "./abi/Game.json";
import { provider } from "./provider";

export const TOKEN_CONTRACT_ADDRESS_DECIMALS = toBN(
  "0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10"
).toString();

export function getGameContract(address: string, account?: AccountInterface) {
  return new Contract(gameAbi as Abi, address, account ?? provider);
}

export async function deployGameContract(
  account: AccountInterface,
  player1: string,
  player2: string
) {
  const contractCode = await fetch("/GameContract.txt").then((x) => x.text());
  const deployment = await account.deployContract({
    contract: contractCode,
    constructorCalldata: [TOKEN_CONTRACT_ADDRESS_DECIMALS, player1, player2],
  });

  if (!deployment.address) {
    throw new Error("Deployment failed");
  }

  await account.waitForTransaction(deployment.transaction_hash);

  return getGameContract(deployment.address, account);
}

export function bet(account: AccountInterface, gameId: string, choice: number) {
  return account.execute([
    {
      contractAddress: TOKEN_CONTRACT_ADDRESS_DECIMALS,
      entrypoint: "increaseAllowance",
      calldata: compileCalldata({
        to: gameId,
        value: {
          type: "struct",
          ...uint256.bnToUint256("1000000000000000000"),
        },
      }),
    },
    {
      contractAddress: gameId,
      entrypoint: "bet",
      calldata: [choice],
    },
  ]);
}
