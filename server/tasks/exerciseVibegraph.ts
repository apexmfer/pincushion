 
 import ExtensibleMongoDB , {DatabaseExtension} from 'extensible-mongoose'
import DigitalAssetDBExtension from '../dbextensions/DigitalAssetDBExtension';
import AppHelper from '../lib/app-helper';


import VibegraphBot from "../vibegraph-bot";
 
require('dotenv').config()
 

 

 let dbPrefix = AppHelper.getDatabasePrefix()
 let envmode = AppHelper.getEnvironmentName()

export async function exerciseVibegraph(   ){



    let mongoDB = new ExtensibleMongoDB(  ) 
    await mongoDB.init(  dbPrefix.concat('_').concat(envmode) )



//Initialize the db extensions
    let dbExtensions:Array<DatabaseExtension> = []
    
    dbExtensions.push(...[ 
      new DigitalAssetDBExtension(mongoDB), 
    ])
    
    dbExtensions.map(ext => ext.bindModelsToDatabase())
  


    let vibegraphBot = new VibegraphBot()
    vibegraphBot.init( mongoDB )
  
}
 