 

 import ExtensibleDB from "extensible-mongoose";

import ServerSegmentManager from "./ServerSegmentManager";

import fs from 'fs'
import path from 'path'
import SingletonLoopMethod from '../lib/singleton-loop-method';

import {create, globSource} from 'ipfs-http-client'


export interface TrackableFile {
    cidPath: string ,
    fileName?: string,
    expectedExtension?: string
   

}


export default class PinningManager extends ServerSegmentManager  {
    
  
    client 

    pinningFolders:string[]
    
    constructor(public mongoDB:ExtensibleDB, public options:any){
        super(mongoDB)

        try{
            this.client = create()
        }catch(e){
            console.error(e)
        }

        this.pinningFolders = []

        
    }



    registerPinningFolder(folderName:string){
        this.pinningFolders.push( folderName )
    } 
   

    async init(){  

        if(!this.client){
            console.error("Could not connect to IPFS on port 5001")
            return
        }
        
        let publishFilesLoop = new SingletonLoopMethod( this.publishAllFiles.bind(this)  );
        publishFilesLoop.start(15000)
        
    }

    async publishAllFiles( ){

       return await Promise.all( this.pinningFolders.map( x => this.publishFilesOfFolder( x ) )     )

    }


    async publishFilesOfFolder( folderName:string ){
        
        let verbose = this.options.verbose 
      

        let allCacheFiles = fs.readdirSync(folderName)

        if(allCacheFiles.length == 0 ){
            return
        } 

        for await (const file of this.client.addAll(globSource(folderName, '**/*'))) {
            if(verbose){
                console.log('published file to ipfs: ',file)
            } 
        }



    }


    async fetchFiles( filesArray: TrackableFile[] ){
        for(let file of filesArray){
            let expectedFileName = file.cidPath

            if(!PinningManager.hasFileCached(file)){

                let success = await this.downloadFileFromIPFS( file )

            }

        }

    }



    static hasFileCached(file:TrackableFile) {
        let allCacheFiles = fs.readdirSync('./cache')
        for(let fileName of allCacheFiles){
            console.log('file',file)
            let fileNameRaw = fileName.split('.')[0]

            if(file.cidPath 
            && fileNameRaw 
            && file.cidPath.toLowerCase() == fileNameRaw.toLowerCase()){
                return true
            }
        } 

        return false
    }



    async downloadFileFromIPFS(file:TrackableFile) {

        let ipfsPath = file.cidPath
 
        let fetchedFileIterable = this.client.cat(ipfsPath, {})  

        let extension = file.expectedExtension ? file.expectedExtension : 'png'  // get this somehow - metadata files ?  

        var writeStream = fs.createWriteStream(`./cache/${ipfsPath}.${extension}`);
        writeStream.on('error', function (err) {
            console.log(err);
        });
         
         
        for await (const part of fetchedFileIterable) {
            writeStream.write(part) 
        }

        writeStream.close()       
 
  
       // console.log('fin'   ) 

    }

    

   
 
}