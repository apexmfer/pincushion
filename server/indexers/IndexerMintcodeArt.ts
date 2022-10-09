

import { ErrorFragment } from 'ethers/lib/utils';
import ExtensibleMongoDB , {DatabaseExtension} from 'extensible-mongoose'
import ClaimCodeController from '../controllers/ClaimCodeController';
import VibegraphIndexer from 'vibegraph/indexers/VibegraphIndexer'

import Web3 from 'web3'
import { DigitalAsset, DigitalAssetDefinition, DigitalAssetProject, DigitalAssetProjectDefinition } from '../dbextensions/DigitalAssetDBExtension';
import { createRecord, findRecord, modifyRecord } from '../lib/mongo-helper';


const web3utils = Web3.utils

/*



    event DefinedProject(uint16 indexed projectId, address signerAddress, address payoutAddress, uint16 totalSupply, uint256 mintPrice, string metadataURI, bool reuseableCodes);
    event UpdatedMintPrice(uint16 indexed projectId, uint256 mintPrice);
    event UpdatedMetadataURI(uint16 indexed projectId);
    event UpdatedReuseableCodes(uint16 indexed projectId, bool reuseableCodes);
    event UpdatedPayoutAddress(uint16 indexed projectId, address payoutAddress);

    event AllowlistedArtist(address indexed artist, bool enabled);
    
    event MintedToken(uint16 indexed projectId, address to, uint256 tokenId, uint16 nonceUsed, bytes32 sigHash);




*/

export default class IndexerMintcodeArt extends VibegraphIndexer {
 


    constructor(public mongoDB:ExtensibleMongoDB){
        super();
    }


    async modifyLedgerByEvent(event:any){

        await IndexerMintcodeArt.modifyLedgerByEvent(event,this.mongoDB)

    }
 


   
    static async modifyLedgerByEvent(event:any, mongoDB:ExtensibleMongoDB){
     
       let eventName = event.event 
 
       
       let blockNumber = parseInt(event.blockNumber)

      
       let outputs = event.returnValues

       let contractAddress = web3utils.toChecksumAddress(event.address )

       let currentTime = Date.now().toString()


       if(!eventName){  

           console.log('WARN: unknown event in ', event.transactionHash )
           return
       }

       eventName = eventName.toLowerCase()
       
       if(eventName == 'definedproject'){
           //add a digitalassetproject 

           let projectId =  ( outputs['0'] )
           let signerAddress = web3utils.toChecksumAddress( outputs['1'] )
           let payoutAddress = web3utils.toChecksumAddress(outputs['2']) 
           let totalSupply = parseInt(outputs['3']) 
           let mintPrice = (outputs['4']) //string
           let metadataURI = (outputs['5']) //string 
           let projectSeed = (outputs['6'])



           let matchingRecord = await findRecord( {projectId} ,DigitalAssetProjectDefinition , mongoDB)

           if(matchingRecord.success){

            let updateData = {
                status: 'minted',
                metadataURI, 
                mintPrice, 
                payoutAddress
                
            }

            await modifyRecord( matchingRecord.data._id, updateData ,DigitalAssetProjectDefinition , mongoDB)

           }else{

            let inputData:DigitalAssetProject = {
                projectId,
                projectSeed,
                signerAddress,
                payoutAddress,
                totalSupply,
                mintPrice, 
                contractAddress, 
                metadataURI,
                createdAt:currentTime,
                status:'minted'
                }
    
               let created = await createRecord(inputData, DigitalAssetProjectDefinition, mongoDB)
               console.log({created})

               await ClaimCodeController.generateClaimCodesForProject({projectId},mongoDB)

           }

         
 
       }
       else if(eventName == 'updatedmintprice'){

            let projectId =  ( outputs['0'] )
            let mintPrice = (outputs['1']) //string


            let matchingRecord = await findRecord( {projectId} ,DigitalAssetProjectDefinition , mongoDB)

            if(!matchingRecord.success)  throw new Error(`could not find matching project ${projectId}`)

            let updateData = {mintPrice}

            await modifyRecord(matchingRecord.data._id , updateData ,  DigitalAssetProjectDefinition, mongoDB)

          
       }
       else if(eventName == 'updatedmetadatauri'){
             let projectId =  ( outputs['0'] )
            let metadataURI = (outputs['1']) //string


            let matchingRecord = await findRecord( {projectId} ,DigitalAssetProjectDefinition , mongoDB)

            if(!matchingRecord.success)  throw new Error(`could not find matching project ${projectId}`) 
            let updateData = {metadataURI}
            
            await modifyRecord(matchingRecord.data._id , updateData ,  DigitalAssetProjectDefinition, mongoDB)

       }
        

       else if(eventName == 'updatedpayoutaddress'){

            let projectId =  ( outputs['0'] )
            let payoutAddress = web3utils.toChecksumAddress(outputs['1']) //string


            let matchingRecord = await findRecord( {projectId} ,DigitalAssetProjectDefinition , mongoDB)

            if(!matchingRecord.success) throw new Error(`could not find matching project ${projectId}`)

            let updateData = {payoutAddress}
            
            await modifyRecord(matchingRecord.data._id , updateData ,  DigitalAssetProjectDefinition, mongoDB)

       }


       else if(eventName == 'allowlistedartist'){
           //do nothing for now  - but could auto add to admin list in the future 

       

    }
        else if(eventName == 'mintedtoken'){
            //add a digitalasset

            let projectId =  ( outputs['0'] )
            let ownerPublicAddress = web3utils.toChecksumAddress( outputs['1'] )
            let tokenId =  (outputs['2']) 
            let nonce = parseInt(outputs['3']) 
            let sigHash = (outputs['4']) //string

         
           // let existingDigitalAssetRecord = await findRecord( {nonce,projectId} ,DigitalAssetDefinition, mongoDB )


            
           
           //  If an existing record is not in the database yet, we add it (owner address and tokenId)

              let existingRecord = await findRecord( {projectId,nonce}, DigitalAssetDefinition, mongoDB )
              if(existingRecord.success){
                let modified = await modifyRecord( 
                    existingRecord.data._id, 
                    {  status:'minted',
                       tokenId,
                       sigHash,
                       ownerPublicAddress,
                       updatedAt:currentTime
                    },
                     DigitalAssetDefinition,
                      mongoDB   )
              }else{


                    let inputData:DigitalAsset = {
                        projectId,
                        ownerPublicAddress,
                        tokenId,
            
                        nonce,
                        sigHash,
            
                        createdAt:currentTime,
                        updatedAt:currentTime,
                        status:'minted'
                        }


                let created=  await createRecord(inputData, DigitalAssetDefinition, mongoDB)
                
              }
    
             

              //mark virtual asset as 'minted' 

            
          
 
        }

      
   }
 



}