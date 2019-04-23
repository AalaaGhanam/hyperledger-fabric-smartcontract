# hyperledger-fabric-smartcontract
1. npm install  
2. npm start   
  
apis:  
http://localhost:6003/setup/autoLoad  
http://localhost:6003/fabric/admin/getAssets  
http://localhost:6003/fabric/admin/getMembers  
body: {  
"registry": "Publisher"  
}  
http://localhost:6003/fabric/admin/addMember  
body: {  
        "id" : "publisher@cib.com",  
        "companyName" : "cib"  
	"type" : "Publisher"  
}  
http://localhost:6003/fabric/client/addPatent  
body: {  
  "ownerId": "jojo@ibm.com",  
  "verifierId": "abdul@hsbc.com",  
  "industry": "banking",  
  "priorArt": "anything",  
  "details": "banking"  
}  
http://localhost:6003/fabric/client/getVerifierPatents  
body: {  
	"verifierId": "abdul@hsbc.com"  
}  
http://localhost:6003/fabric/client/getPublisherPatents  
body: {  
	"publisherId": "yes@cib.comd"  
}  
http://localhost:6003/fabric/client/patentAction  
body: {  
  "action" : "Verify",  
  "patentNo" : "001207",   
  "publisherId": "alwayson@cib.com"   
} or  
{    
  "action" : "Publish",    
  "patentNo" : "001207",  
  "publishURL": "anything",    
  "publishDate":"22",     
} or  
{    
  "action" : "Reject",    
  "patentNo" : "001207",  
  "rejectionReason": "anything"  
}  
