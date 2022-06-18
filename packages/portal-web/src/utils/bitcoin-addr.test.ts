import * as test from "tape";
import { formatBitcoinAddr, parseBitcoinAddr } from "./bitcoin-addr";

test("parseBitcoinAddr", function (t) {
  const parsed1 = parseBitcoinAddr("2MxAHMwEqJRTpuTTdGAsS2fZudn1eGUTTKb");
  t.equal(parsed1.supported, true);
  t.equal(parsed1.network, "testnet");
  t.equal(parsed1.type, "p2sh");
  t.equal(parsed1.bech32, false);
  t.equal(
    Buffer.from(parsed1.scriptHash).toString("hex"),
    "35e95d712621ce96193546e0012bbdf6b7554036"
  );

  const parsed2 = parseBitcoinAddr("36c5JCJogxxUhfq5b3FZQiaeRRoUV5eJRk");
  t.equal(parsed2.network, "mainnet");
  t.deepEqual(parsed2, Object.assign({}, parsed1, { network: "mainnet" }));

  t.end();
});

test("formatBitcoinAddr", function (t) {
  const destHash = "35e95d712621ce96193546e0012bbdf6b7554036";

  const formatted1 = formatBitcoinAddr(destHash, "testnet");
  t.equal(formatted1, "2MxAHMwEqJRTpuTTdGAsS2fZudn1eGUTTKb");

  const formatted2 = formatBitcoinAddr(destHash, "mainnet");
  t.equal(formatted2, "36c5JCJogxxUhfq5b3FZQiaeRRoUV5eJRk");

  t.end();
});
