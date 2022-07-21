import { Abi, AccountInterface, Contract } from "starknet";
import gameAbi from "./abi/Game.json";
import { provider } from "./provider";

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
    constructorCalldata: [player1, player2],
  });

  if (!deployment.address) {
    throw new Error("Deployment failed");
  }

  await account.waitForTransaction(deployment.transaction_hash);

  return getGameContract(deployment.address, account);
}
