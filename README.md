# hyperledger-fabric-smartcontract 

* packaged smart contract using the [IBM Blockchain Platform Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform).
* install and instantiate the smart contract.
* run client sdk by navigating into web-app 
  * npm install
  * npm start  
* try apis using postman: 
        # Hint: All requests using POST method

	load dummy data
	
	```bash
	http://localhost:6003/setup/autoLoad 
	``` 
	get all patents
	
	```bash
	http://localhost:6003/fabric/admin/getAssets
	``` 
	
	get all users
	
	```bash
	http://localhost:6003/fabric/admin/getMembers 
	body: {  
	    "registry": "type of user {Publisher/Owner/Verifier}"  
	}
	``` 
	
	add user
	
	```bash
	http://localhost:6003/fabric/admin/addMember  
	body: {  
		"id" : "publisher@cib.com",  
		"companyName" : "cib"  
		"type" : "Publisher"  
	} 
	``` 
	add patent
	
	```bash
	http://localhost:6003/fabric/client/addPatent  
	body: {  
		  "ownerId": "jojo@ibm.com",  
		  "verifierId": "abdul@hsbc.com",  
		  "industry": "banking",  
		  "priorArt": "anything",  
		  "details": "banking"  
	} 
	``` 
	get patents of specific verifier
	
	```bash
	http://localhost:6003/fabric/client/getVerifierPatents  
	body: {  
		"verifierId": "abdul@hsbc.com"  
	}
	``` 
	
	get patents of specific publisher
	
	```bash
	http://localhost:6003/fabric/client/getPublisherPatents  
	body: {  
		"publisherId": "yes@cib.comd"  
	} 
	``` 
	verify, publish or reject patent
	
	```bash
	http://localhost:6003/fabric/client/patentAction 
	body: {  
		"action" : "Verify/Publish/Reject",  
		"patentNo" : "001207",   
		"publisherId": "alwayson@cib.com" # in case of verify
		"publishURL": "anything",         # in case of publish
	        "publishDate":"22",              # in case of publish 
		"rejectionReason": "anything"     # in case of reject
	} 
	```  
