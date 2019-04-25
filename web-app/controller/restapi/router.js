
'use strict';

let express = require('express');
let router = express.Router();
let format = require('date-format');
let hlcAdmin = require('./features/fabric/hlcAdmin');
let hlcClient = require('./features/fabric/hlcClient');
let setup = require('./features/fabric/autoLoad');
let blockchain = require('./features/fabric/getBlockchain');

router.post('/setup/autoLoad*', setup.autoLoad);

module.exports = router;
let count = 0;

router.use(function(req, res, next) {
    count++;
    console.log('['+count+'] at: '+format.asString('hh:mm:ss.SSS', new Date())+' Url is: ' + req.url);
    next(); 
});

router.post('/fabric/getBlockchain', blockchain.getBlockchain);

router.get('/fabric/admin/getRegistries*', hlcAdmin.getRegistries);
router.post('/fabric/admin/getMembers*', hlcAdmin.getMembers);
router.post('/fabric/admin/getAssets*', hlcAdmin.getAssets);
router.post('/fabric/admin/addMember*', hlcAdmin.addMember);
router.post('/fabric/client/getVerifierPatents*', hlcClient.getVerifierPatents);
router.post('/fabric/client/getPublisherPatents*', hlcClient.getPublisherPatents);
router.post('/fabric/client/addPatent*', hlcClient.addPatent);
router.post('/fabric/client/patentAction*', hlcClient.patentAction);
