# My ERC20

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

## Sūrya's Description Report

### Contracts Description Table

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

### Legend

| Symbol | Meaning                   |
| :----: | ------------------------- |
|   🛑   | Function can modify state |
|   💵   | Function is payable       |

## Call Graph

![![Alt text](../../../../../Downloads/callgraph.svg)
](graphs/callgraph.svg)

## Inheritance Graph

![![Alt text](../../../../../Downloads/inheritance.svg)](graphs/inheritance.svg)
