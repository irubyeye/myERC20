# My ERC20

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

Sūrya's Description Report

Files Description Table

| File Name                                                                                                                      | SHA-1 Hash                               |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| /Users/nikolaj/Desktop/Рабочий_стол/Redduck/milestone2_Final/v.0.1/contracts/myERC20.sol                                       | fb3ba01baaa9d1a8ea10a5f4c555ae1517cd0f6c |
| /Users/nikolaj/Desktop/Рабочий_стол/Redduck/milestone2_Final/v.0.1/node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol | bf7591fac4cca9756c1868273bcd2ce75122a00d |
| /Users/nikolaj/Desktop/Рабочий_стол/Redduck/milestone2_Final/v.0.1/node_modules/@openzeppelin/contracts/access/Ownable.sol     | 62f94c544a5dddf6f78fffa49350f2c163c46883 |
| /Users/nikolaj/Desktop/Рабочий_стол/Redduck/milestone2_Final/v.0.1/node_modules/@openzeppelin/contracts/utils/Context.sol      | 5e3293ce0ece50787f1c9e8cd38fbcf16c730c63 |
| /Users/nikolaj/Desktop/Рабочий_стол/Redduck/milestone2_Final/v.0.1/contracts/proxyContract.sol                                 | 90ea02ae63f18ec7d8d9fadedeaef04c7d315ea1 |
| /Users/nikolaj/Desktop/Рабочий_стол/Redduck/milestone2_Final/v.0.1/contracts/MyERC20.sol                                       | fb3ba01baaa9d1a8ea10a5f4c555ae1517cd0f6c |

Contracts Description Table

|       Contract       |          Type           |      Bases      |                |                |
| :------------------: | :---------------------: | :-------------: | :------------: | :------------: |
|          └           |    **Function Name**    | **Visibility**  | **Mutability** | **Modifiers**  |
|                      |                         |                 |                |                |
|     **MyERC20**      |     Implementation      | IERC20, Ownable |                |                |
|          └           |      <Constructor>      |    Public ❗️    |       🛑       | Ownable IERC20 |
|          └           | getMinTokenAmountToVote |   Internal 🔒   |                |                |
|          └           | getStartVotingThreshold |   Internal 🔒   |                |                |
|          └           |     \_getTokenPrice     |   External ❗️   |                |      NO❗️      |
|          └           |       totalSupply       |   External ❗️   |                |      NO❗️      |
|          └           |        balanceOf        |   External ❗️   |                |      NO❗️      |
|          └           |        transfer         |   External ❗️   |       🛑       | isNotInVoting  |
|          └           |        allowance        |   External ❗️   |                |      NO❗️      |
|          └           |         approve         |   External ❗️   |       🛑       |      NO❗️      |
|          └           |      transferFrom       |   External ❗️   |       🛑       | isNotInVoting  |
|          └           |        burnFees         |   Internal 🔒   |       🛑       |                |
|          └           | setBuySellFeePercentage |   External ❗️   |       🛑       |   onlyOwner    |
|          └           |         \_mint          |   Internal 🔒   |       🛑       |                |
|          └           |         \_burn          |   Internal 🔒   |       🛑       |                |
|          └           |           buy           |   External ❗️   |       💵       | isNotInVoting  |
|          └           |          sell           |   External ❗️   |       🛑       | isNotInVoting  |
|          └           |          vote           |   External ❗️   |       🛑       |    canVote     |
|          └           |         endVote         |   External ❗️   |       🛑       |      NO❗️      |
|                      |                         |                 |                |                |
|      **IERC20**      |        Interface        |                 |                |                |
|          └           |       totalSupply       |   External ❗️   |                |      NO❗️      |
|          └           |        balanceOf        |   External ❗️   |                |      NO❗️      |
|          └           |        transfer         |   External ❗️   |       🛑       |      NO❗️      |
|          └           |        allowance        |   External ❗️   |                |      NO❗️      |
|          └           |         approve         |   External ❗️   |       🛑       |      NO❗️      |
|          └           |      transferFrom       |   External ❗️   |       🛑       |      NO❗️      |
|                      |                         |                 |                |                |
|     **Ownable**      |     Implementation      |     Context     |                |                |
|          └           |      <Constructor>      |    Public ❗️    |       🛑       |      NO❗️      |
|          └           |          owner          |    Public ❗️    |                |      NO❗️      |
|          └           |      \_checkOwner       |   Internal 🔒   |                |                |
|          └           |    renounceOwnership    |    Public ❗️    |       🛑       |   onlyOwner    |
|          └           |    transferOwnership    |    Public ❗️    |       🛑       |   onlyOwner    |
|          └           |   \_transferOwnership   |   Internal 🔒   |       🛑       |                |
|                      |                         |                 |                |                |
|     **Context**      |     Implementation      |                 |                |                |
|          └           |       \_msgSender       |   Internal 🔒   |                |                |
|          └           |        \_msgData        |   Internal 🔒   |                |                |
|          └           |  \_contextSuffixLength  |   Internal 🔒   |                |                |
|                      |                         |                 |                |                |
| **TransparentProxy** |     Implementation      |                 |                |                |
|          └           |      <Constructor>      |    Public ❗️    |       🛑       |      NO❗️      |
|          └           |       <Fallback>        |   External ❗️   |       💵       |      NO❗️      |
|                      |                         |                 |                |                |
|     **MyERC20**      |     Implementation      | IERC20, Ownable |                |                |
|          └           |      <Constructor>      |    Public ❗️    |       🛑       | Ownable IERC20 |
|          └           | getMinTokenAmountToVote |   Internal 🔒   |                |                |
|          └           | getStartVotingThreshold |   Internal 🔒   |                |                |
|          └           |     \_getTokenPrice     |   External ❗️   |                |      NO❗️      |
|          └           |       totalSupply       |   External ❗️   |                |      NO❗️      |
|          └           |        balanceOf        |   External ❗️   |                |      NO❗️      |
|          └           |        transfer         |   External ❗️   |       🛑       | isNotInVoting  |
|          └           |        allowance        |   External ❗️   |                |      NO❗️      |
|          └           |         approve         |   External ❗️   |       🛑       |      NO❗️      |
|          └           |      transferFrom       |   External ❗️   |       🛑       | isNotInVoting  |
|          └           |        burnFees         |   Internal 🔒   |       🛑       |                |
|          └           | setBuySellFeePercentage |   External ❗️   |       🛑       |   onlyOwner    |
|          └           |         \_mint          |   Internal 🔒   |       🛑       |                |
|          └           |         \_burn          |   Internal 🔒   |       🛑       |                |
|          └           |           buy           |   External ❗️   |       💵       | isNotInVoting  |
|          └           |          sell           |   External ❗️   |       🛑       | isNotInVoting  |
|          └           |          vote           |   External ❗️   |       🛑       |    canVote     |
|          └           |         endVote         |   External ❗️   |       🛑       |      NO❗️      |

Legend

| Symbol | Meaning                   |
| :----: | ------------------------- |
|   🛑   | Function can modify state |
|   💵   | Function is payable       |

# Call Graph

![Alt text](../../../../../Downloads/callgraph.svg)

# Inheritance Graph

![Alt text](../../../../../Downloads/inheritance.svg)
