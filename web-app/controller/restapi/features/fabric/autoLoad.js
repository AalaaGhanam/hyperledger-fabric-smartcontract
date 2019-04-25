'use strict';

const fs = require('fs');
const path = require('path');

// Bring Fabric SDK network class
const { FileSystemWallet, Gateway } = require('fabric-network');

// A wallet stores a collection of identities for use
let walletDir = path.join(path.dirname(require.main.filename),'controller/restapi/features/fabric/_idwallet');
const wallet = new FileSystemWallet(walletDir);

const ccpPath = path.resolve(__dirname, 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

exports.autoLoad = async function autoLoad(req, res, next) {

    console.log('autoload');

    // get the autoload file
    let newFile = path.join(path.dirname(require.main.filename),'startup','memberList.json');
    let startupFile = JSON.parse(fs.readFileSync(newFile));   

    // Main try/catch block
    try {

        // A gateway defines the peers used to access Fabric networks
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        // Get addressability to network
        const network = await gateway.getNetwork('mychannel');

        // Get addressability to  contract
        const contract = await network.getContract('patentcontract');
        
        const responseBuyer = await contract.evaluateTransaction('GetState', "owners");
        let owners = JSON.parse(JSON.parse(responseBuyer.toString()));
                
        const responseSeller = await contract.evaluateTransaction('GetState', "verifiers");
        let verifiers = JSON.parse(JSON.parse(responseSeller.toString()));
 
        const responseProvider = await contract.evaluateTransaction('GetState', "publishers");
        let publishers = JSON.parse(JSON.parse(responseProvider.toString()));

        for (let member of startupFile.members) {

            var transaction = 'Register' + member.type;         

            for (let owner of owners) { 
                if (owner == member.id) {
                    res.send({'error': 'member id already exists'});
                }
            }
            for (let verifier of verifiers) { 
                if (verifier == member.id) {
                    res.send({'error': 'member id already exists'});
                }
            }
            for (let publisher of publishers) { 
                if (publisher == member.id) {
                    res.send({'error': 'member id already exists'});
                }
            }
            const response = await contract.submitTransaction(transaction, member.id, member.companyName);
            console.log('transaction response: ')
            console.log(JSON.parse(response.toString()));
        } 

        let allPatents = new Array();
        for (let owner of owners) { 
            const ownerResponse = await contract.evaluateTransaction('GetState', owner);
            var _ownerjsn = JSON.parse(JSON.parse(ownerResponse.toString()));       
            
            for (let patentNo of _ownerjsn.patents) {                 
                allPatents.push(patentNo);            
            }                           
        }

        for (let patent of startupFile.patents) {

            for (let patentNo of allPatents) { 
                if (patentNo == patent.patentNumber) {
                    res.send({'error': 'patent already exists'});
                }
            }           

            const createPatentResponse = await contract.submitTransaction('CreatePatent', patent.ownerId, patent.verifierId, patent.patentNumber, patent.industry, patent.priorArt, patent.details );
            console.log('createPatentResponse: ')
            console.log(JSON.parse(createPatentResponse.toString()));
        }
        await gateway.disconnect();
        res.send({'result': 'Success'});

    } catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        res.send({'error': error.message});
    }

};
