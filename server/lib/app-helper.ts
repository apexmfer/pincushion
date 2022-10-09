 
 


const NODE_ENV = process.env.NODE_ENV

import web3utils from 'web3-utils'
import FileHelper from './file-helper'


require('dotenv').config()
const serverConfig = require('../serverconfig.json')

const clientConfig = require('../../shared/config/clientConfig.json')
 

const imageUploadValidations = require('../../shared/config/imageUploadValidations.json')


const pjson = require('../../package.json');

 

export default class AppHelper  {

  static getAppName() : string {

    return pjson.databasePrefix
  }


  static getDatabasePrefix() : string {

    return pjson.databasePrefix
  }

  static getLocalClientConfig(){
    return clientConfig[AppHelper.getEnvironmentName()]
  }

 


  static getWeb3RpcUrl(chainId:number) : string | undefined  {

    switch(chainId){
      case 5: return process.env.GOERLI_RPC_URL;
      case 4: return process.env.RINKEBY_RPC_URL;
      case 1 : return process.env.MAINNET_RPC_URL
      default: return undefined;
    }
  }



  static getEnvironmentName() : string{
    let envName = NODE_ENV ? NODE_ENV : 'development'

    return envName
  }

  static getServerConfig(envName?:string) {

    if(!envName){
      envName = AppHelper.getEnvironmentName()
    }
     
    let currentConfig = serverConfig[envName]

    return currentConfig
  }
 


  static getChainId(){
    return AppHelper.getServerConfig().chainId
  }

  static getNetworkName(){
    switch (AppHelper.getChainId()){
      case 1 : return 'mainnet'
      case 4 : return 'rinkeby'
      case 5 : return 'goerli'
      default: return 'unknown'
    }
  }

  static toChecksumAddress(address: string) {
    return web3utils.toChecksumAddress(address)
  }

  static randomHexString(size:number){
    return web3utils.randomHex(size)
  }

  
  static getImageUploadValidationsForDomain(domainName){
    let result =  imageUploadValidations[domainName]

    if(!result){
      throw new Error(`Error: missing image upload validations config for ${domainName}`)
    }

    return result 
  }
      
}