import { Wallet } from "ethers";
import ExtensibleMongooseDatabase, { DatabaseExtension } from "extensible-mongoose";
import MultiClaimCodeController from "../controllers/MultiClaimCodeController";


import MintCodeDBExtension, { MintCode, MintCodeDefinition } from "../dbextensions/MintCodeDBExtension";
import MultiClaimCodeDBExtension, { MultiClaimCode } from "../dbextensions/ClaimCodeDBExtension";



import { createRecord } from "../lib/mongo-helper";
import { generateArtSignature, generateRandomNonce } from "./lib/art-signature-tools";
import FileHelper from './lib/filehelper'

require('dotenv').config()
//const ART_SIGNER_PRIVATE_KEY = process.env.ART_SIGNER_PRIVATE_KEY
 
 
const crypto = require('crypto');


export type GenerateMultiClaimInput = {

    projectIds: string[]
   

} 

 

export async function generateMultiClaim( mongoDB:ExtensibleMongooseDatabase ){

    let dbExtensions:Array<DatabaseExtension> = []
    
    dbExtensions.push(...[
       
      new MintCodeDBExtension(mongoDB), 
      new MultiClaimCodeDBExtension(mongoDB), 
     // new DigitalAssetDBExtension(mongoDB)
    ])
  
    dbExtensions.map(ext => ext.bindModelsToDatabase())
     
    
    //@ts-ignore
    let multiClaimCodeController = new MultiClaimCodeController({},{},mongoDB)

    const args = require('yargs')
    .option('projectIds', {
        alias: 'arr',
        default: null,
        type: 'string'
    }).argv;

    

    let projectIdsString = args.projectIds 

    let projectIdsArray = projectIdsString.replaceAll(']','').replaceAll('[','').split(',')

    console.log('projectIdsArray',projectIdsArray)
     
    let generationConfig:GenerateMultiClaimInput = args
 
 

    const projectIds:string[] =  projectIdsArray

    let creation = await MultiClaimCodeController.insertNewMultiClaimCode( {projectIds, baseProjectId:undefined}, mongoDB ) 
  
    if(creation.success){
        console.log(creation.data)
    }else{
        console.error(creation)
    }
    




   // console.log(`Added ${successCount} records to the database.`)


   /* let successCount = 0

    for(let claimCode of results){

        console.log({claimCode})     

        let currentTime = Date.now().toString()

        console.log(generationConfig.projectIds)

        //@ts-ignore
        const projectIds:string[] =  projectIdsArray

        let creationData:MultiClaimCode = {

            projectIds ,
            code: claimCode.code,
          
            createdAt: currentTime,
            updatedAt: currentTime,
            status:'unclaimed'

        }
 
    }
*/
    
}

/*
 export function generateMultiClaimCodesFromData(
    input : GenerateMultiClaimInput
     ) : any[] {


    let outputs:any[] = [] 
 


    for(let i=0;i<input.quantity;i++){

       let code = crypto.randomBytes(44).toString('hex')

            outputs.push({
                code
            })
        }

    return outputs
 }*/