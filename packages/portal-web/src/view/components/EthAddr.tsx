import * as React from "react";
import { useState } from "react";
import { useProvider } from "wagmi";

const lookups = {} as { [addr: string]: Promise<string> };

export default function EthAddr({
  addr,
  link,
}: {
  addr: string;
  link?: boolean;
}) {
  const provider = useProvider();

  const defaultName = addr.substring(0, 8) + "…";
  const [name, setName] = useState(defaultName);
  if (lookups[addr] == null) {
    lookups[addr] = provider.lookupAddress(addr);
  }
  lookups[addr].then(setName);

  if (link) {
    return (
      <a href={`https://etherscan.io/address/${addr}`} target="_blank">
        {name || defaultName}
      </a>
    );
  }
  return <span>{name || defaultName}</span>;
}
