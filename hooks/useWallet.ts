import { IStarknetWindowObject } from "@argent/get-starknet/dist";
import { connect } from "get-starknet";
import { useCallback, useEffect, useRef, useState } from "react";

export const useWallet = () => {
  const [wallet, setWallet] = useState<IStarknetWindowObject | undefined>();
  const modalOpen = useRef(false); // only needed for react strict mode, as it will render onmount hooks twice

  useEffect(() => {
    if (!modalOpen.current) {
      modalOpen.current = true;
      connect({ include: ["argentX"], showList: false }).then(
        async (wallet) => {
          if (!wallet?.isConnected) {
            await wallet?.enable({ showModal: false });
          }
          modalOpen.current = false;
          if (wallet?.isConnected) {
            setWallet(wallet);
          }
        }
      );
    }
  }, []);

  const connectFn = useCallback(async () => {
    const wallet = await connect({ include: ["argentX"] });
    await wallet?.enable({ showModal: false });
    if (wallet?.isConnected) {
      setWallet(wallet);
    }
  }, []);

  return { wallet, connect: connectFn };
};
