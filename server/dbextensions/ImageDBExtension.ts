
import {Mongoose, Schema, Model} from 'mongoose'
 
import ExtensibleMongoDatabase , {TableDefinition,DatabaseExtension} from 'extensible-mongoose'
import ServerSegmentManager from '../segmentmanagers/ServerSegmentManager'
import { MongoRecord } from './MongoDBExtension'
 
export interface FileMetadata {
    name:string,
    sizeBytes: number, 
    type:string
}
 

export interface ImageMetadata extends FileMetadata { 
  title?:string,
  widthPixels: number,
  heightPixels: number 
}

  export interface Image  extends MongoRecord {
    filename:  string,
    title:string,

    tagname:string, //like   thumbnail

    metadata: string,  //stringified 
    filenamehash: string,

    adminAddress: string,
     

    status: string
  
  }
 

  export const ImageSchema = new Schema<Image>({    
    filename:  { type: String, index: true },
    title:String,
    tagname:String,
    metadata: String ,
    filenamehash: String,
    adminAddress: { type: String  },
    
    status:   { type: String, required:true } 

  })

 

  export const ImageDefinition:TableDefinition= {tableName:'attachedimages',schema:ImageSchema}


export default class ImageDBExtension extends DatabaseExtension {
 

  
    getBindableModels() : Array<TableDefinition>{

        return  [
           ImageDefinition
        ]
    } 
    

}