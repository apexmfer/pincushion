

 
import ExtensibleMongoDB , {DatabaseExtension} from 'extensible-mongoose'

 

import FileHelper from './lib/file-helper'
  
import AppHelper from './lib/app-helper'
  

import {DegenAuthExtension} from 'degen-auth'

 
import Web3 from 'web3'
 

import ServerSegmentManager from './segmentmanagers/ServerSegmentManager'
import ImageManager from './segmentmanagers/ImageManager'


import ServerModule from './servermods/ServerModule'
 
import ImageDBExtension from './dbextensions/ImageDBExtension'
 
 
import BackendServer from './lib/backend-server'
  
import ImageController from './controllers/ImageController'
import ManifestController from './controllers/ManifestController'
import PinningManager from './segmentmanagers/PinningManager'


require('dotenv').config()

const pjson = require('../package.json');

const APP_NAME = pjson.databasePrefix


let envmode = AppHelper.getEnvironmentName()

let serverConfigFile = FileHelper.readJSONFile('./server/serverconfig.json')
let serverConfig = serverConfigFile[envmode]

//let assetConfig = FileHelper.readJSONFile('./server/assetconfig.json')
  
  async function start(){

    console.log('server config: ',serverConfig)

     
    let mongoDB = new ExtensibleMongoDB(  ) 
    await mongoDB.init(  APP_NAME.concat('_').concat(envmode) )



    //Initialize the db extensions
    let dbExtensions:Array<DatabaseExtension> = []
    
    dbExtensions.push(...[
      new ImageDBExtension(mongoDB),

      
    ])

    await Promise.all(dbExtensions.map(ext => ext.bindModelsToDatabase()))


    let pinningManager = new PinningManager(mongoDB, {verbose:false})
    pinningManager.registerPinningFolder('./imagestorage')
    pinningManager.registerPinningFolder('./manifeststorage')
    

    //Initialize the server segment managers which are also db extensions
    let serverSegmentManagers:Array<ServerSegmentManager> = []
    serverSegmentManagers.push(...[     
      new ImageManager(mongoDB),
      pinningManager
    ])
    serverSegmentManagers.map(ext => ext.init())

     
    
   
    let imageController = new ImageController(mongoDB)
    let manifestController = new ManifestController(mongoDB)
 
    //init API Controllers 

    let apiControllers = [
      imageController,
      manifestController,
       
    ]
  
    
 

    let serverMods: ServerModule[] = [
      
    ]

         

    let backendserver = new BackendServer(  serverConfig, apiControllers, serverMods)
    await backendserver.start()

 
 
     
  }

 

 
 start()