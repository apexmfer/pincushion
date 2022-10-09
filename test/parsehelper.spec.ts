
import chai, { expect } from 'chai'
import { centsToPrice, priceToCents } from '../server/lib/parse-helper'
 

/*
    write tests for pricing 
*/
 

describe('Parse Helper',    () => {
  

      
        it ('should priceToCents', async () => {
 
            expect(priceToCents('1.4442')).to.eql(144)

            expect(priceToCents('0')).to.eql(0)

            expect(priceToCents('-1')).to.eql(0)

            expect(priceToCents('abc123')).to.eql(0)


            expect(priceToCents('2.00002')).to.eql(200)

        })

         
        it ('should centsToPrice', async () => {
 
            expect(centsToPrice(1245)).to.eql('12.45')
            expect(centsToPrice(-122)).to.eql('0.00')

            expect(centsToPrice(200)).to.eql('2.00')

        })
 
       
       


 

})

