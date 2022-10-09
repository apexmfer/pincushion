

 
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
    
    //Initialize the server segment managers which are also db extensions
    let serverSegmentManagers:Array<ServerSegmentManager> = []
    serverSegmentManagers.push(...[     
      new ImageManager(mongoDB)
    ])
    serverSegmentManagers.map(ext => ext.init())

    
    let web3 = new Web3( serverConfig.web3provider  )

    console.log('web3 ready with provider ',serverConfig.web3provider )
    
   
    let imageController = new ImageController(mongoDB)
 
    //init API Controllers 

    let apiControllers = [
      imageController,
       
    ]
  
   
     const domainRootURL = AppHelper.getLocalClientConfig().externalRoutes.api
    console.log({domainRootURL})
    
 

    let serverMods: ServerModule[] = [
      
    ]

         

    let backendserver = new BackendServer(web3, serverConfig, apiControllers, serverMods)
    await backendserver.start()
     
 
     
  }

 

 
 start()