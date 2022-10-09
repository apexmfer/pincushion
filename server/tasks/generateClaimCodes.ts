import { Wallet } from "ethers";
import ExtensibleMongooseDatabase, { DatabaseExtension } from "extensible-mongoose";
import ClaimCodeController from "../controllers/ClaimCodeController";


import MintCodeDBExtension, { MintCode, MintCodeDefinition } from "../dbextensions/MintCodeDBExtension";
import ClaimCodeDBExtension, { MultiClaimCode } from "../dbextensions/ClaimCodeDBExtension";
import DigitalAssetDBExtension from "../dbextensions/DigitalAssetDBExtension"


import { createRecord } from "../lib/mongo-helper";
import { generateArtSignature, generateRandomNonce } from "./lib/art-signature-tools";
import FileHelper from './lib/filehelper'
import { AssertionResponse } from "degen-route-loader";

require('dotenv').config()
//const ART_SIGNER_PRIVATE_KEY = process.env.ART_SIGNER_PRIVATE_KEY
 
 
const crypto = require('crypto');


 
 

export async function generateClaimCodes( mongoDB:ExtensibleMongooseDatabase ){

    let dbExtensions:Array<DatabaseExtension> = []
    
    dbExtensions.push(...[
       
      new MintCodeDBExtension(mongoDB), 
      new ClaimCodeDBExtension(mongoDB), 
     new DigitalAssetDBExtension(mongoDB)
    ])
  
    dbExtensions.map(ext => ext.bindModelsToDatabase())
     
    
    //@ts-ignore
  //  let multiClaimCodeController = new MultiClaimCodeController({},{},mongoDB)

    const args = require('yargs')
    .option('projectId', {
       string:true
    }).argv;

    

    let projectId = args.projectId
  

    let results = await ClaimCodeController.generateClaimCodesForProject( {projectId }, mongoDB)
    
    return results 
 
    
}
 