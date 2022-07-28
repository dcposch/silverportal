/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type { Portal, PortalInterface } from "../Portal";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakePercent",
        type: "uint256",
      },
      {
        internalType: "contract IBtcTxVerifier",
        name: "_btcVerifier",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "escrowID",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountSats",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "ethDest",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
    ],
    name: "EscrowSettled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "escrowID",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "escrowDeadline",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "ethDest",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ethAmount",
        type: "uint256",
      },
    ],
    name: "EscrowSlashed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "orderID",
        type: "uint256",
      },
    ],
    name: "OrderCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "escrowID",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "orderID",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int128",
        name: "amountSats",
        type: "int128",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "priceTokPerSat",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "takerStakedWei",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "maker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "taker",
        type: "address",
      },
    ],
    name: "OrderMatched",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "orderID",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int128",
        name: "amountSats",
        type: "int128",
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "priceTokPerSat",
        type: "uint128",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "makerStakedWei",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "maker",
        type: "address",
      },
    ],
    name: "OrderPlaced",
    type: "event",
  },
  {
    inputs: [],
    name: "btcVerifier",
    outputs: [
      {
        internalType: "contract IBtcTxVerifier",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "orderID",
        type: "uint256",
      },
    ],
    name: "cancelOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "escrows",
    outputs: [
      {
        internalType: "bytes20",
        name: "destScriptHash",
        type: "bytes20",
      },
      {
        internalType: "uint128",
        name: "amountSatsDue",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "deadline",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "escrowWei",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "successRecipient",
        type: "address",
      },
      {
        internalType: "address",
        name: "timeoutRecipient",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "orderID",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "amountSats",
        type: "uint128",
      },
    ],
    name: "initiateBuy",
    outputs: [
      {
        internalType: "uint256",
        name: "escrowID",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "orderID",
        type: "uint256",
      },
      {
        internalType: "uint128",
        name: "amountSats",
        type: "uint128",
      },
      {
        internalType: "bytes20",
        name: "destScriptHash",
        type: "bytes20",
      },
    ],
    name: "initiateSell",
    outputs: [
      {
        internalType: "uint256",
        name: "escrowID",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "nextOrderID",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "orderbook",
    outputs: [
      {
        internalType: "address",
        name: "maker",
        type: "address",
      },
      {
        internalType: "int128",
        name: "amountSats",
        type: "int128",
      },
      {
        internalType: "uint128",
        name: "priceTokPerSat",
        type: "uint128",
      },
      {
        internalType: "bytes20",
        name: "scriptHash",
        type: "bytes20",
      },
      {
        internalType: "uint256",
        name: "stakedWei",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "priceTokPerSat",
        type: "uint256",
      },
      {
        internalType: "bytes20",
        name: "scriptHash",
        type: "bytes20",
      },
    ],
    name: "postAsk",
    outputs: [
      {
        internalType: "uint256",
        name: "orderID",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountSats",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "priceTokPerSat",
        type: "uint256",
      },
    ],
    name: "postBid",
    outputs: [
      {
        internalType: "uint256",
        name: "orderID",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "escrowID",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "bitcoinBlockNum",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "blockHeader",
            type: "bytes",
          },
          {
            internalType: "bytes32",
            name: "txId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "txIndex",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "txMerkleProof",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "rawTx",
            type: "bytes",
          },
        ],
        internalType: "struct BtcTxProof",
        name: "bitcoinTransactionProof",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "txOutIx",
        type: "uint256",
      },
    ],
    name: "proveSettlement",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "escrowID",
        type: "uint256",
      },
    ],
    name: "slash",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stakePercent",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60c060405234801561001057600080fd5b506040516117a83803806117a883398101604081905261002f9161004b565b6080919091526001600160a01b031660a0526001600255610088565b6000806040838503121561005e57600080fd5b825160208401519092506001600160a01b038116811461007d57600080fd5b809150509250929050565b60805160a0516116e66100c26000396000818161030701526110200152600081816101b601528181610c160152610e0701526116e66000f3fe6080604052600436106100a75760003560e01c80636b597cb7116100645780636b597cb71461021a5780637fee4dc1146102cf5780638e69655f146102e25780638e89e8ba146102f5578063ba38678f14610341578063f47a0acc1461036157600080fd5b8063012f52ee146100ac5780630b728b24146101705780631f3466471461019157806334a6cdc5146101a457806345bc4d10146101d8578063514fcac7146101fa575b600080fd5b3480156100b857600080fd5b5061011b6100c7366004611207565b60016020819052600091825260409091208054918101546002820154600383015460049093015460609490941b936001600160801b0380841694600160801b90940416926001600160a01b03908116911686565b604080516001600160601b031990971687526001600160801b039586166020880152949093169385019390935260608401526001600160a01b0391821660808401521660a082015260c0015b60405180910390f35b61018361017e36600461123d565b610377565b604051908152602001610167565b61018361019f366004611280565b610593565b3480156101b057600080fd5b506101837f000000000000000000000000000000000000000000000000000000000000000081565b3480156101e457600080fd5b506101f86101f3366004611207565b6107bb565b005b34801561020657600080fd5b506101f8610215366004611207565b610975565b34801561022657600080fd5b50610283610235366004611207565b60006020819052908152604090208054600182015460028301546003909301546001600160a01b0390921692600f82900b92600160801b9092046001600160801b03169160609190911b9085565b604080516001600160a01b039096168652600f9490940b60208601526001600160801b03909216928401929092526001600160601b03199091166060830152608082015260a001610167565b6101836102dd3660046112bc565b610ae6565b6101836102f03660046112de565b610d37565b34801561030157600080fd5b506103297f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b039091168152602001610167565b34801561034d57600080fd5b506101f861035c366004611301565b610fa8565b34801561036d57600080fd5b5061018360025481565b6000670de0b6b3a76400008311156103c75760405162461bcd60e51b815260206004820152600e60248201526d5072696365206f766572666c6f7760901b60448201526064015b60405180910390fd5b600083116104095760405162461bcd60e51b815260206004820152600f60248201526e507269636520756e646572666c6f7760881b60448201526064016103be565b60006104158434611374565b9050660775f05a0740008111156104605760405162461bcd60e51b815260206004820152600f60248201526e416d6f756e74206f766572666c6f7760881b60448201526064016103be565b600081116104a35760405162461bcd60e51b815260206004820152601060248201526f416d6f756e7420756e646572666c6f7760801b60448201526064016103be565b346104ae8583611396565b146104cb5760405162461bcd60e51b81526004016103be906113b5565b600280549060006104db836113dc565b90915550600081815260208190526040902080546001600160a01b03191633178155909250610509826113f7565b6001600160801b03908116600160801b878316810291909117600184018190556002840180546001600160a01b031916606089901c1790556040517ff6eaf0ee1a0f4968eb1cdfb289b155068481735ebbdc10d55450ac43b398d17a93610583938893600f81900b93919004909116906000903390611427565b60405180910390a1505092915050565b60006105a384633b9aca00611396565b6000858152602081905260408120600181015492935091600f0b136105da5760405162461bcd60e51b81526004016103be9061145f565b6001810154600f85810b91900b146106275760405162461bcd60e51b815260206004820152601060248201526f105b5bdd5b9d081a5b98dbdc9c9958dd60821b60448201526064016103be565b600181015461064690600160801b90046001600160801b03168561148d565b6001600160801b0316341461066d5760405162461bcd60e51b81526004016103be906113b5565b600082815260016020819052604090912080546001600160a01b031916606086901c17815590810180546001600160801b0319166001600160801b0387161790556106bb42620151806114bc565b6001820180546001600160801b03928316600160801b02921691909117905560038201546106ea9034906114bc565b6002808301919091558254600380840180546001600160a01b03199081166001600160a01b039485161790915560048501805482163390811790915560008b81526020819052604080822080548516815560018181018490559781018054909516909455929093019290925592850154855493517fc4084b3dd124675dac91b748c76ccf9aa77181f388261bd90709ccacc13f430c946107aa9489948d94600f81900b94600160801b9091046001600160801b03169334931691906114d4565b60405180910390a150509392505050565b600081815260016020526040902060048101546001600160a01b031633146108145760405162461bcd60e51b815260206004820152600c60248201526b2bb937b7339031b0b63632b960a11b60448201526064016103be565b600181015442600160801b9091046001600160801b0316106108645760405162461bcd60e51b8152602060048201526009602482015268546f6f206561726c7960b81b60448201526064016103be565b600281810154600084815260016020819052604080832080546001600160a01b03199081168255928101849055948501839055600385018054831690556004909401805490911690559151909190339083908381818185875af1925050503d80600081146108ee576040519150601f19603f3d011682016040523d82523d6000602084013e6108f3565b606091505b50509050806109145760405162461bcd60e51b81526004016103be9061151c565b600183015460408051868152600160801b9092046001600160801b031660208301523390820152606081018390527f9574d16e2095e9ca6955a1d539f1cd446228d565f093f1aae339cffbebade07b9060800160405180910390a150505050565b600081815260208190526040902080546001600160a01b031633146109cd5760405162461bcd60e51b815260206004820152600e60248201526d2737ba103cb7bab91037b93232b960911b60448201526064016103be565b6001810154600f0b6109f15760405162461bcd60e51b81526004016103be9061145f565b6001810154600090600f0b811215610a0e57506003810154610a46565b60018201546001600160801b03600160801b82041690610a3090600f0b6113f7565b610a3a919061148d565b6001600160801b031690505b60008381526020819052604080822080546001600160a01b0319908116825560018201849055600282018054909116905560030182905551339083908381818185875af1925050503d8060008114610aba576040519150601f19603f3d011682016040523d82523d6000602084013e610abf565b606091505b5050905080610ae05760405162461bcd60e51b81526004016103be9061151c565b50505050565b6000660775f05a074000831115610b315760405162461bcd60e51b815260206004820152600f60248201526e416d6f756e74206f766572666c6f7760881b60448201526064016103be565b60008311610b745760405162461bcd60e51b815260206004820152601060248201526f416d6f756e7420756e646572666c6f7760801b60448201526064016103be565b670de0b6b3a7640000821115610bbd5760405162461bcd60e51b815260206004820152600e60248201526d5072696365206f766572666c6f7760901b60448201526064016103be565b60008211610bff5760405162461bcd60e51b815260206004820152600f60248201526e507269636520756e646572666c6f7760881b60448201526064016103be565b6000610c0b8385611396565b905060006064610c3b7f000000000000000000000000000000000000000000000000000000000000000084611396565b610c459190611374565b9050803414610c885760405162461bcd60e51b815260206004820152600f60248201526e496e636f7272656374207374616b6560881b60448201526064016103be565b60028054906000610c98836113dc565b909155506000818152602081905260409081902080546001600160a01b0319163390811782556001600160801b03888116600160801b908102828c16176001850181905560038501889055945195985092947ff6eaf0ee1a0f4968eb1cdfb289b155068481735ebbdc10d55450ac43b398d17a94610d26948a94600f83900b94919092041691889190611427565b60405180910390a150505092915050565b6000610d4783633b9aca00611396565b6000848152602081905260408120600181015492935091600f0b12610d7e5760405162461bcd60e51b81526004016103be9061145f565b6001810154600f84810b91610d93910b6113f7565b600f0b14610dd65760405162461bcd60e51b815260206004820152601060248201526f105b5bdd5b9d081a5b98dbdc9c9958dd60821b60448201526064016103be565b6001810154600090610dfc906001600160801b03600160801b9091048116908616611396565b905060006064610e2c7f000000000000000000000000000000000000000000000000000000000000000084611396565b610e369190611374565b905080341415610e585760405162461bcd60e51b81526004016103be906113b5565b6000848152600160208190526040909120600285015481546001600160a01b0319166001600160a01b0390911617815590810180546001600160801b0319166001600160801b038816179055610eb142620151806114bc565b6001820180546001600160801b03928316600160801b029216919091179055610eda34846114bc565b600280830191909155600380830180546001600160a01b031990811633908117909255875460048601805483166001600160a01b0392831617905560008c815260208190526040808220805485168155600181810184905597810180549095169094559290940184905593880154885491517fc4084b3dd124675dac91b748c76ccf9aa77181f388261bd90709ccacc13f430c95610f96958c958f95600f86900b95600160801b90046001600160801b031694929316916114d4565b60405180910390a15050505092915050565b600084815260016020526040902060038101546001600160a01b031633146110015760405162461bcd60e51b815260206004820152600c60248201526b2bb937b7339031b0b63632b960a11b60448201526064016103be565b8054600182810154604051630694ad7560e11b81526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001693630d295aea9361106e9390928a928a928a9260609290921b916001600160801b03909116906004016115bb565b602060405180830381865afa15801561108b573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110af9190611687565b6110fb5760405162461bcd60e51b815260206004820152601760248201527f42616420626974636f696e207472616e73616374696f6e00000000000000000060448201526064016103be565b600281810154600087815260016020819052604080832080546001600160a01b03199081168255928101849055948501839055600385018054831690556004909401805490911690559151909190339083908381818185875af1925050503d8060008114611185576040519150601f19603f3d011682016040523d82523d6000602084013e61118a565b606091505b50509050806111ab5760405162461bcd60e51b81526004016103be9061151c565b6001830154604080518981526001600160801b039092166020830152338282015260608201849052517f3ca1d4fc64a52405e25934bbf634646decfb04579a3006e5a4252749fc3096159181900360800190a150505050505050565b60006020828403121561121957600080fd5b5035919050565b80356001600160601b03198116811461123857600080fd5b919050565b6000806040838503121561125057600080fd5b8235915061126060208401611220565b90509250929050565b80356001600160801b038116811461123857600080fd5b60008060006060848603121561129557600080fd5b833592506112a560208501611269565b91506112b360408501611220565b90509250925092565b600080604083850312156112cf57600080fd5b50508035926020909101359150565b600080604083850312156112f157600080fd5b8235915061126060208401611269565b6000806000806080858703121561131757600080fd5b8435935060208501359250604085013567ffffffffffffffff81111561133c57600080fd5b850160a0818803121561134e57600080fd5b9396929550929360600135925050565b634e487b7160e01b600052601160045260246000fd5b60008261139157634e487b7160e01b600052601260045260246000fd5b500490565b60008160001904831182151516156113b0576113b061135e565b500290565b6020808252600d908201526c15dc9bdb99c81c185e5b595b9d609a1b604082015260600190565b60006000198214156113f0576113f061135e565b5060010190565b600081600f0b6f7fffffffffffffffffffffffffffffff1981141561141e5761141e61135e565b60000392915050565b948552600f9390930b60208501526001600160801b0391909116604084015260608301526001600160a01b0316608082015260a00190565b60208082526014908201527313dc99195c88185b1c9958591e48199a5b1b195960621b604082015260600190565b60006001600160801b03808316818516818304811182151516156114b3576114b361135e565b02949350505050565b600082198211156114cf576114cf61135e565b500190565b9687526020870195909552600f9390930b60408601526001600160801b0391909116606085015260808401526001600160a01b0390811660a08401521660c082015260e00190565b6020808252600f908201526e151c985b9cd9995c8819985a5b1959608a1b604082015260600190565b6000808335601e1984360301811261155c57600080fd5b830160208101925035905067ffffffffffffffff81111561157c57600080fd5b80360383131561158b57600080fd5b9250929050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b86815285602082015260c0604082015260006115d78687611545565b60a060c08501526115ed61016085018284611592565b915050602087013560e084015260408701356101008401526116126060880188611545565b60bf19808685030161012087015261162b848385611592565b935061163a60808b018b611545565b93509150808685030161014087015250611655838383611592565b935050505084606083015261167660808301856001600160601b0319169052565b8260a0830152979650505050505050565b60006020828403121561169957600080fd5b815180151581146116a957600080fd5b939250505056fea2646970667358221220240088c6b853f9f3e55625d9d58283c3b1215a2b100d427d0dac325b8132dce064736f6c634300080c0033";

type PortalConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PortalConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Portal__factory extends ContractFactory {
  constructor(...args: PortalConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _stakePercent: PromiseOrValue<BigNumberish>,
    _btcVerifier: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Portal> {
    return super.deploy(
      _stakePercent,
      _btcVerifier,
      overrides || {}
    ) as Promise<Portal>;
  }
  override getDeployTransaction(
    _stakePercent: PromiseOrValue<BigNumberish>,
    _btcVerifier: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _stakePercent,
      _btcVerifier,
      overrides || {}
    );
  }
  override attach(address: string): Portal {
    return super.attach(address) as Portal;
  }
  override connect(signer: Signer): Portal__factory {
    return super.connect(signer) as Portal__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PortalInterface {
    return new utils.Interface(_abi) as PortalInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Portal {
    return new Contract(address, _abi, signerOrProvider) as Portal;
  }
}
