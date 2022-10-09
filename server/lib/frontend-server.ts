
 
 import express from 'express'
 
 import cors from 'cors'
 const formidable = require('express-formidable')

 
import fs from 'fs'
import path from 'path'

// @ts-ignore
import  history from 'connect-history-api-fallback'
  

import DegenRouteLoader, { Route } from 'degen-route-loader'
 

import FileHelper from './file-helper'

 

const MAX_FILE_SIZE = 104857600 //bytes //100MB

 
 

export default class FrontendServer  {



  //  server:https.Server|http.Server

    
    app:any

    apiPort:number

    degenRouteLoader:DegenRouteLoader

    appListener: any

    constructor(
      public web3:any, 
      public serverConfig:any
      ){
      
 
         

        this.app = express()

        this.degenRouteLoader = new DegenRouteLoader({verboseLogging:true})

        this.apiPort = this.serverConfig.port? this.serverConfig.port : 3000

        //var server = http.createServer(app);

        let envmode = process.env.NODE_ENV

    
         
        this.app.use(cors());


        let formidableOptions= {
          maxFileSize : MAX_FILE_SIZE,
         // encoding: 'base64'

        }
 
        this.app.use(formidable(formidableOptions))
   
  
    }


    async start(    ){
       
     
      //host static files from dist for webpage  
      
      this.app.use(express.static('dist'));
     
      this.app.use(history({
        disableDotRule: true,
        verbose: true
      }));
      this.app.use(express.static('dist'));
     


      this.appListener = this.app.listen(this.apiPort, () => {
        console.log(`API Server listening at http://localhost:${this.apiPort}`)
      })


 

    }
 
    async stop(    ){
      if(this.appListener){
        this.appListener.close()
      }
      


    }
 

}