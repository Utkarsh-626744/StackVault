import { AptosClient } from "aptos";
import { NODE_URL } from "../config";

export const client = new AptosClient(NODE_URL);

export const getBalance = async (address) => {
  const resources = await client.getAccountResources(address);
  const accountResource = resources.find((r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
  return accountResource.data.coin.value;
};

export const buildTransactionPayload = (func, tyArgs, args) => {
  return {
    type: "entry_function_payload",
    function: func,
    type_arguments: tyArgs,
    arguments: args
  };
};