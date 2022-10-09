 
import ExtensibleMongoDB , {DatabaseExtension} from 'extensible-mongoose'


import AppHelper from '../lib/app-helper'
import FileHelper from '../lib/file-helper'
 
import { generateSignatures } from './generateSignatures'
import {generateMultiClaim} from './generateMultiClaim'
import {generateClaimCodes} from './generateClaimCodes'
import { exerciseVibegraph } from './exerciseVibegraph'
/*const serverConfig = FileHelper.readJSONFile(
  './server/config/serverConfig.json'
)*/

const taskMap: any = {
  generateSignatures,
  exerciseVibegraph,
  generateMultiClaim,
  generateClaimCodes
}

async function init(): Promise<void> {
  const args = process.argv.slice(2)

  await runTask(args)
}

export async function connectToDatabase(): Promise<ExtensibleMongoDB> {
  const dbName = AppHelper.getDatabasePrefix()

 
  let mongoDB = new ExtensibleMongoDB(  ) 
  await mongoDB.init(  dbName.concat('_').concat(AppHelper.getEnvironmentName()) )



  
  return mongoDB
}

async function runTask(args: string[]): Promise<void> {
  const taskName = args[0]

  const taskMethod = taskMap[taskName]

  if (typeof taskMethod == 'undefined') throw new Error('unknown task')

  let mongoDB = await connectToDatabase()
  
  await taskMethod(  mongoDB  ) 

  console.log(`Task '${taskName}' complete.`)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
init()
