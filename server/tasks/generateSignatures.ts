import { Wallet } from "ethers";
import ExtensibleMongooseDatabase, { DatabaseExtension } from "extensible-mongoose";
import MintCodeController from "../controllers/MintCodeController";
import DigitalAssetDBExtension from "../dbextensions/DigitalAssetDBExtension";
import MintCodeDBExtension, { MintCode, MintCodeDefinition } from "../dbextensions/MintCodeDBExtension";
import { createRecord } from "../lib/mongo-helper";
import { generateArtSignature, generateRandomNonce } from "./lib/art-signature-tools";
import FileHelper from './lib/filehelper'

require('dotenv').config()
const ART_SIGNER_PRIVATE_KEY = process.env.ART_SIGNER_PRIVATE_KEY
 


//if(!ART_SIGNER_PRIVATE_KEY) throw new Error('Missing ART_SIGNER_PRIVATE_KEY')

export type GenerateSignaturesInput = {

    artistPrivateKey: string,
    projectId: number,    
    chainId:number,
    proxyContractAddress:string,
    quantity: number,
    startNonce: number 

} 

 

export async function generateSignatures( mongoDB:ExtensibleMongooseDatabase ){

    let dbExtensions:Array<DatabaseExtension> = []
    
    dbExtensions.push(...[
       
      new MintCodeDBExtension(mongoDB), 
      new DigitalAssetDBExtension(mongoDB)
    ])
  
    dbExtensions.map(ext => ext.bindModelsToDatabase())
     
    
    //@ts-ignore
    let mintCodeController = new MintCodeController({},{},mongoDB)

    const args = require('yargs')
    .option('proxyContractAddress', {
        string: true
    })
    .option('artistPrivateKey', {
        string: true
    })
    .option('projectId', {
        string: true
    })
    .argv;
     
    let generationConfig:GenerateSignaturesInput = args

 

    let results =  generateSignaturesFromData(generationConfig);
    

    let successCount = 0

    for(let mintCode of results){

        console.log({mintCode})

        if(!mintCode.signature){
            console.log('Missing signature')
            continue;
        }

        let currentTime = Date.now().toString()

        let creationData:MintCode = {
            projectId: mintCode.projectId,
            nonce:mintCode.nonce,
            signature:mintCode.signature,

            code: mintCode.secretMessage,
            chainId: mintCode.chainId,

            createdAt: currentTime,
            updatedAt: currentTime,
            status:'unclaimed'

        }

       let creation = await mintCodeController.insertNewMintCode(creationData) 
        if(creation.success){

            await mintCodeController.updateMintCodeStatusBasedOnDigitalAssets( creation.data.code  )

            successCount++
        }else{
            console.log(creation)
        }
   
    }

    console.log(`Added ${successCount} records to the database.`)

   // let outputPath = 'tasks/output/generatedsignatures.json'
   // let saved = FileHelper.saveUTF8FileToCache(JSON.stringify(results), outputPath )

  //  return results 
}


 export function generateSignaturesFromData(
    input : GenerateSignaturesInput
     ) : any[] {


    let outputs:any[] = [] 


    for(let i=0;i<input.quantity;i++){

        let projectId = input.projectId
        let nonce = input.startNonce + i ;

        let contractAddress = input.proxyContractAddress
        let chainId = input.chainId

        let artistWallet = new Wallet(input.artistPrivateKey)

        let signatureResponse = generateArtSignature(
             artistWallet, 
            {projectId,nonce,chainId,contractAddress})

        if(signatureResponse.data){
                outputs.push(
                    signatureResponse.data
                )
        }else{
            console.error("Unable to generate signature!!", signatureResponse)
        }
 
    }

    return outputs
 }