 
 

 
import { Contract, ethers } from 'ethers'
import web3utils from 'web3-utils'
import AppHelper from './app-helper'
import FileHelper from './file-helper'

require('dotenv').config()


const contractsConfig = {

  "mainnet":{
    "ETH_USD_Oracle": {

      address: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
      abi: FileHelper.readJSONFile(`abi/EACAggregatorProxy.json`)

    }
  } 


}

export default class ContractHelper  {

  /*
  Get the deployment data for a contract, including the address and abi 
  */
  static getDeploymentConfig(networkName: string, contractName: string) : {address:string,abi:any} {
    
    let contents = FileHelper.readJSONFile(`deployments/${networkName}/${contractName}.json`)

    return contents
  }

  static getRpcProvider(envName?:string){
    
     
    let rpcURI = AppHelper.getServerConfig(envName).web3provider

    return new ethers.providers.JsonRpcProvider(rpcURI)



  }


  static getContractInstance(contractName:string,netName?:string){

    if(!netName) netName = 'mainnet'

    let contractConfig = contractsConfig[netName][contractName]

    if(!contractConfig) return undefined 

    return new Contract(contractConfig.address, 
      contractConfig.abi)


  }

 
      
}