
 
import axios from 'axios'
import fs from 'fs'
import { SetExpressionOperatorReturningBoolean } from 'mongoose'
import path from 'path'


import web3utils from 'web3-utils'

const FileReader = require('filereader')

import AppHelper from './app-helper'

const serverConfig = require('../../server/serverconfig.json')[AppHelper.getEnvironmentName()]

export default class FileHelper{


    static  readJSONFile(uri:string){

         let input =  fs.readFileSync(path.resolve( uri),   {encoding:'utf8', flag:'r'}); 

         return JSON.parse(input)
    }

    static readLocalFile( path:string, encoding: BufferEncoding){

        return fs.readFileSync(path,{ encoding  });
     
    }

    static readLocalFileUTF8( path:string  ){

        let output = fs.readFileSync(path,{ encoding: 'utf8' });
    
        return output 

    }


    static mkdirSync(path){
        try{
            fs.mkdirSync(path)
        }catch(e){
            //console.error(e)
        }
       
    }
    
    static saveBinaryFileToCache(data: string, fileName: string) : {savedFile: boolean, error:any} {
          

        let imageStoragePath = serverConfig.imageStoragePath

        console.log('saving file to cache', imageStoragePath)
        

        try{
            fs.writeFileSync(
                path.join(imageStoragePath.concat(fileName)), 
                data, 'binary')
            return {savedFile: true , error:undefined}
        }catch(error){
            console.error(error)
            return {savedFile: false , error:error}
        } 

    }


    static saveBase64FileToCache(data: string, fileName: string) : {savedFile: boolean, error:any} {
          

        let imageStoragePath = serverConfig.imageStoragePath

        console.log('saving file to cache', imageStoragePath)
        

        try{
            fs.writeFileSync(
                path.join(imageStoragePath.concat(fileName)), 
                data, 'base64')
            return {savedFile: true , error:undefined}
        }catch(error){
            console.error(error)
            return {savedFile: false , error:error}
        } 

    }


    static saveJsonFile( data:string, fileName:string  ) : {savedFile: boolean, error:any}  {

        let jsonStoragePath = serverConfig.jsonStoragePath

        try{
            fs.writeFileSync(
                path.join(jsonStoragePath.concat(fileName)), 
                data
                )
            return {savedFile: true , error:undefined}
        }catch(error){
            console.error(error)
            return {savedFile: false , error:error}
        } 


    }
 
    static readLocalJSONFile( fileName:string  ){
        
        let jsonStoragePath = serverConfig.jsonStoragePath


        const fullPath = path.join(jsonStoragePath.concat(fileName))
        console.log({fullPath})
        let output = fs.readFileSync(fullPath,{ encoding: 'utf8' });
    
        return output 

    }

    

    static getFileDataBinary(file: File): Promise<string | ArrayBuffer | null> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsBinaryString(file)
          reader.onload = () => resolve(reader.result)
          reader.onerror = (error: any) => reject(error)
        })
      }

    static async getFileDataBinaryBuffer(file:File){

        //@ts-ignore
        let fileDataBinary:string  = await FileHelper.getFileDataBinary(file)

        return Buffer.from(fileDataBinary,'binary')
    }


    static readLocalFileBase64( path:string  ){

        let output = fs.readFileSync(path,{ encoding: 'base64' });
    
        return output 

    }

      static getFileDataBase64(file: File): Promise<string | ArrayBuffer | null> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result)
          reader.onerror = (error: any) => reject(error)
        })
      }

      static async getFileDataBase64Buffer(file:File){

        //@ts-ignore
        let fileDataBase64:string  = await FileHelper.getFileDataBase64(file)

        return Buffer.from(fileDataBase64.split(",")[1],'base64')
    }
      

    static addRandomSaltToFileName(fileName:string){

        let fileNameSalt = web3utils.randomHex(16)

        let fileNamePrefix = fileName.split('.')[0]
        let fileNamePostfix = fileName.split('.')[1]

        return fileNamePrefix.concat('_').concat(fileNameSalt).concat('.').concat(fileNamePostfix)

    }






    static async downloadImageToBinary(imageURL) : Promise<Buffer>{

        return new Promise( (resolve,reject) => {
            axios.get(imageURL,
                    {
                        responseType: 'arraybuffer',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/pdf'
                        }
                    })
                    .then((response) => {

                        resolve( response.data )
                        
                    })
                    .catch((error) => reject(error));

        })

    }
    
    static async writeBufferToFile(buffer, filePath) : Promise<String>{


        let fullPath = path.join(__dirname, '../../'.concat(filePath)) 
        console.log({fullPath})
        fs.writeFileSync(fullPath , buffer); 
        console.log({buffer})

        return  fullPath //new File(buffer, fullPath)
    }


}