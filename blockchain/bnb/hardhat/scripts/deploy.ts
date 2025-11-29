import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/../.env" });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Registry = await ethers.getContractFactory("Field2FridgeAgentRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  console.log("AgentRegistry:", await registry.getAddress());

  const ServiceToken = await ethers.getContractFactory("Field2FridgeServiceToken");
  const serviceToken = await ServiceToken.deploy(ethers.parseEther("1000000"));
  await serviceToken.waitForDeployment();
  console.log("ServiceToken:", await serviceToken.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
