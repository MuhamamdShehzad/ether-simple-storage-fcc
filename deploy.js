const async = require("async")
const ethers = require("ethers")
const fs = require("fs-extra")
require("dotenv").config()

async function main() {
  // http://127.0.0.1:7545
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
  // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const encryptedKeyJson = fs.readFileSync("./.encryptedKey.json", "utf8")
  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    encryptedKeyJson,
    process.env.PRIVATE_KEY_PASSWORD
  )
  wallet = await wallet.connect(provider)
  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8")
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  )
  const ContractFactory = new ethers.ContractFactory(abi, binary, wallet)
  console.log("Deploying the contract....")
  const contract = await ContractFactory.deploy()
  //console.log(contract);
  await contract.deployTransaction.wait(1)
  const currFavoriteNumber = await contract.retrieve()
  console.log(`Current Favorite Number: ${currFavoriteNumber.toString()}`)
  const transactionResponse = await contract.store("7")
  const transactionReceipt = await transactionResponse.wait(1)
  const UpdatedNumber = await contract.retrieve()
  console.log(`Updated Favorite Number: ${UpdatedNumber.toString()}`)
}
main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
