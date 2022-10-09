 
import {
    bufferToHex,
    ecrecover,
    ecsign,
    pubToAddress,
    toBuffer,
    toRpcSig,
  } from 'ethereumjs-util'
  import { BigNumber, utils, Wallet } from 'ethers'
 

const contractName = "DetroitLocalArt"
const contractVersion = "1.0"

export type SignatureInputs = {
  projectId:number,
   nonce:number,
  chainId:number,
  contractAddress:string

}
 

export interface DomainData {
    name: string
    version: string
    chainId: number
    verifyingContract: string
  }
  

function getDomainData(chainId: number, verifyingContractAddress:string): DomainData {
  
    const abiCoder = new utils.AbiCoder()
  
    const domainString = utils.keccak256(
      utils.toUtf8Bytes(
        'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
      )
    )
  
    const domainData: DomainData = {
      name: contractName,
      version: contractVersion,
      chainId,
      verifyingContract: verifyingContractAddress,
    }
  
    const domainSeparator = utils.keccak256(
      abiCoder.encode(
        ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
        [
          domainString,
          utils.keccak256(utils.toUtf8Bytes(domainData.name)),
          utils.keccak256(utils.toUtf8Bytes(domainData.version)),
          domainData.chainId,
          domainData.verifyingContract,
        ]
      )
    )
 
  
    const TypedDataEncoder = utils._TypedDataEncoder
  
    const hashDomain = TypedDataEncoder.hashDomain(domainData)
  
    if (hashDomain != domainSeparator) {
      throw new Error('domainhash mismatch')
    }
  
    return domainData
  }

export function generateArtSignature(wallet:Wallet, messageInputs: SignatureInputs) : 
{success:boolean,data?: {secretMessage:string, signature:string, chainId:number, projectId: number, nonce: number}  ,error?:string} {

    const domainData = getDomainData(messageInputs.chainId, messageInputs.contractAddress)

    const types = {
        inputs: [
          { name: 'projectId', type: 'bytes32' },
          { name: 'nonce', type: 'uint16' },       
        ],
      }

    const values:SignatureInputs = messageInputs

    const TypedDataEncoder = utils._TypedDataEncoder

    const codedMessage = TypedDataEncoder.encode(domainData, types, values)
  
    const digest = utils.keccak256(codedMessage)
  
    const codedHash = TypedDataEncoder.hash(domainData, types, values)
  
    const hashStruct = TypedDataEncoder.hashStruct('inputs', types, values)
      

 

    const msgBuffer = toBuffer(digest)

    const sig = ecsign(msgBuffer, toBuffer(wallet.privateKey))
  
    const pubKey = ecrecover(msgBuffer, sig.v, sig.r, sig.s)
    const addrBuf = pubToAddress(pubKey)
    const recoveredSignatureSigner = bufferToHex(addrBuf)
  
    if (recoveredSignatureSigner.toLowerCase() != wallet.address.toLowerCase()) {
      console.error(
        'recovered sig mismatched ',
        recoveredSignatureSigner,
        wallet.address
      )
      return { success: false, error: 'Signature mismatch.' }
    }
  
    const signature = toRpcSig(sig.v, sig.r, sig.s)
 
    const secretMessage = utils.solidityPack(
        ['bytes32','uint16','bytes'],
        [
            messageInputs.projectId,
            messageInputs.nonce,
            signature
        ]
      )

  
    
    //const final_list: CraResponse = Object.assign({}, signature, input);
    return { success: true, data: 
        {

        projectId:messageInputs.projectId,
        nonce:messageInputs.nonce,
        chainId:messageInputs.chainId,
        signature,
        secretMessage
      }
    } 
}

export function generateRandomNonce() : number {


    return Math.floor(Math.random()*65535)

}