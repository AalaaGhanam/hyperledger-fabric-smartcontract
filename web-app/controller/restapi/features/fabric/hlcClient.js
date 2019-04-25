'use strict';

let fs = require('fs');
let path = require('path');

const { FileSystemWallet, Gateway } = require('fabric-network');

let walletDir = path.join(path.dirname(require.main.filename),'controller/restapi/features/fabric/_idwallet');
const wallet = new FileSystemWallet(walletDir);

const ccpPath = path.resolve(__dirname, 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

exports.patentAction = async function (req, res, next) {
    try {
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        const network = await gateway.getNetwork('mychannel');

        const contract = await network.getContract('patentcontract');

        const responsePatent = await contract.evaluateTransaction('GetState', req.body.patentNo);
        let patent = JSON.parse(JSON.parse(responsePatent.toString()));
        switch (req.body.action)
        {
            case 'Verify':
                await contract.submitTransaction('VerifyPatent', patent.patentNumber, patent.owners[0].ownerId, patent.verifierId, req.body.publisherId);
                break;
            case 'Reject':
                await contract.submitTransaction('RejectPatent', patent.patentNumber, patent.owners[0].ownerId, patent.verifierId, req.body.rejectionReason);
                break;
            case 'Publish':
                await contract.submitTransaction('PublishPatent', patent.patentNumber, patent.owners[0].ownerId, patent.publisherId, req.body.publishURL, req.body.publishDate);
                break;
            default :
                res.send({'result': 'failed', 'error':' order '+req.body.orderNo+' unrecognized request: '+req.body.action});
        }
        await gateway.disconnect();
        res.send({'result': ' patent '+req.body.patentNo+' successfully updated to '+req.body.action});
            
    } catch (error) {
        res.send({'error': error.stack});
    } 
};
exports.addPatent = async function (req, res, next) {
    let method = 'addPatent';
    console.log(method+' req.body.owner is: '+req.body.owner);    
    let patentNumber = '00' + Math.floor(Math.random() * 10000);
    try {
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });
        const network = await gateway.getNetwork('mychannel');

        const contract = await network.getContract('patentcontract');

        await contract.submitTransaction('CreatePatent', req.body.ownerId, req.body.verifierId, patentNumber, req.body.industry, req.body.priorArt, req.body.details);
        
        await gateway.disconnect();
        res.send({'result': ' patent '+patentNumber+' successfully added'});

    } catch (error) {
        res.send({'error': error.stack});
    } 
};

exports.getPublisherPatents = async function(req, res, next) {
    let allPatents = new Array();
    try {
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });
        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract('patentcontract');
        const responseVerifier = await contract.evaluateTransaction('GetState', "verifiers");
        var verifiers = JSON.parse(JSON.parse(responseVerifier.toString()));

        for (let verifier of verifiers) { 
            const verifierResponse = await contract.evaluateTransaction('GetState', verifier);
            var _verifierjsn = JSON.parse(JSON.parse(verifierResponse.toString()));       
            
            for (let patentNo of _verifierjsn.patents) { 
                const response = await contract.evaluateTransaction('GetState', patentNo);
                var _jsn = JSON.parse(JSON.parse(response.toString()));
                if(_jsn.publisherId==req.body.publisherId){
                    allPatents.push(_jsn);    
                }
            }                           
        }
        await gateway.disconnect();
        res.send({'result': 'success', 'patents': allPatents});
        
    } catch (error) {
        res.send({'error': error.stack});
    } 
};

exports.getVerifierPatents = async function(req, res, next) {

    console.log('getVerifierPatents');
    let allPatents = new Array();

    try {
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract('patentcontract');
        
        const responseOwner = await contract.evaluateTransaction('GetState', "verifiers");
        var owners = JSON.parse(JSON.parse(responseOwner.toString()));

        for (let owner of owners) { 
            const ownerResponse = await contract.evaluateTransaction('GetState', owner);
            var _ownerjsn = JSON.parse(JSON.parse(ownerResponse.toString()));       
            
            for (let patentNo of _ownerjsn.patents) { 
                const response = await contract.evaluateTransaction('GetState', patentNo);
                var _jsn = JSON.parse(JSON.parse(response.toString()));
                if(_jsn.verifierId==req.body.verifierId){
                    allPatents.push(_jsn);    
                }
            }                           
        }
        await gateway.disconnect();
        res.send({'result': 'success', 'patents': allPatents});
        
    } catch (error) {
        res.send({'error': error.stack});
    } 
};
