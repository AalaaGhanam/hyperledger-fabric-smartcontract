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

exports.getRegistries = function(req, res, next)
{
    var allRegistries = [ 
        [ 'Owner' ],
        [ 'Verifier' ],
        [ 'Publisher' ]
    ];
    res.send({'result': 'success', 'registries': allRegistries});
};

exports.getMembers = async function(req, res, next) {

    console.log('getMembers');
    let allMembers = new Array();
    let members;
    try {
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });
        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract('patentcontract');
                
        switch (req.body.registry)
        {
            case 'Owner':
                const responseOwner = await contract.evaluateTransaction('GetState', "owners");
                console.log('responseOwner: ');
                console.log(JSON.parse(responseOwner.toString()));
                members = JSON.parse(JSON.parse(responseOwner.toString()));
                break;            
            case 'Verifier':
                const responseVerifier = await contract.evaluateTransaction('GetState', "verifiers");
                console.log('responseVerifier: ');
                console.log(JSON.parse(responseVerifier.toString()));
                members = JSON.parse(JSON.parse(responseVerifier.toString()));
                break;
            case 'Publisher':
                const responsePublisher = await contract.evaluateTransaction('GetState', "publishers");
                console.log('responsePublisher: ');
                console.log(JSON.parse(responsePublisher.toString()));
                members = JSON.parse(JSON.parse(responsePublisher.toString()));
                break; 
            default:
                res.send({'error': 'body registry not found'});
        }
        
        for (const member of members) { 
            const response = await contract.evaluateTransaction('GetState', member);
            console.log('response: ');
            console.log(JSON.parse(response.toString()));
            var _jsn = JSON.parse(JSON.parse(response.toString()));                       
            allMembers.push(_jsn); 
        }
        await gateway.disconnect();
        res.send({'result': 'success', 'members': allMembers});
                
    } catch (error) {
        res.send({'error': error.stack});
    } 
         
};

exports.getAssets = async function(req, res, next) {

    console.log('getAssets');
    let allPatents = new Array();

    try {

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        const network = await gateway.getNetwork('mychannel');

        const contract = await network.getContract('patentcontract');
        
        const responseOwner = await contract.evaluateTransaction('GetState', "owners");

        var owners = JSON.parse(JSON.parse(responseOwner.toString()));

        for (let owner of owners) { 
            const ownerResponse = await contract.evaluateTransaction('GetState', owner);
            var _ownerjsn = JSON.parse(JSON.parse(ownerResponse.toString()));       
            
            for (let patentNo of _ownerjsn.patents) { 
                const response = await contract.evaluateTransaction('GetState', patentNo);
                var _jsn = JSON.parse(JSON.parse(response.toString()));
                allPatents.push(_jsn);            
            }                           
        }
        
        await gateway.disconnect();
        res.send({'result': 'success', 'patents': allPatents});
        
    } catch (error) {
        res.send({'error': error.stack});
    } 
};

exports.addMember = async function(req, res, next) {

    let members;
    try {

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'User1@org1.example.com', discovery: { enabled: false } });

        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract('patentcontract');        

        switch (req.body.type)
        {
            case 'Owner':
                const responseOwner = await contract.evaluateTransaction('GetState', "owners");
                members = JSON.parse(JSON.parse(responseOwner.toString()));
                break;            
            case 'Verifier':
                const responseVerifier = await contract.evaluateTransaction('GetState', "verifiers");
                members = JSON.parse(JSON.parse(responseVerifier.toString()));
                break;
            case 'Publisher':
                const responsePublisher = await contract.evaluateTransaction('GetState', "publishers");
                members = JSON.parse(JSON.parse(responsePublisher.toString()));
                break; 
            default:
                res.send({'error': 'body type not found'});
        }

        for (let member of members) { 
            if (member == req.body.id) {
                res.send({'error': 'member id already exists'});
            }
        }

        var transaction = 'Register' + req.body.type;
        await contract.submitTransaction(transaction, req.body.id, req.body.companyName);
        await gateway.disconnect();
        res.send(req.body.id+' successfully added');
   
    } catch (error) {
        res.send({'error': error.stack});
    } 
};