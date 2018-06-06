({
    /*
Method Name :  hideSpinner
Comments    : This method is called for onfocus event, to search records and display. 
*/  
    fetchingRecordsFromDB : function(component,event,getInputkeyWord) {        
        console.log('object Name'+component.get("v.objectAPIName")+'..getInputkeyWord..'+getInputkeyWord);
        var fieldsToBeQueried = component.get("v.fieldsToBeQueried"); 
        console.log('fieldsToBeQueried'+fieldsToBeQueried);
        if(fieldsToBeQueried != undefined){
            var fieldsToBeQueried = fieldsToBeQueried.replace(/;/g, ',');   
        }
       
      
        //Calling Server-Side Action
        
        var action = component.get("c.fetchLookUpValues");  
        action.setParams({
            'searchKeyWord': getInputkeyWord,
            'ObjectName' : component.get("v.objectAPIName"),
            'fieldsToBeQueried': fieldsToBeQueried
        });
        // set a callBack    
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(state === "SUCCESS"){
                var storeResponse = response.getReturnValue();
                // if storeResponse size is equal 0 ,display No Result Found... message on screen.                }
                if(storeResponse.length == 0){
                    component.set("v.Message", 'No Result Found...');
                }else{
                    component.set("v.Message", '');
                }
                component.set("v.lookUpDataList", storeResponse);
               
            } 
        });
        // enqueue the Action  
        $A.enqueueAction(action);   
    },
    
    /*
     MethodName: removingSelectedValuesFromMultiSelect
     Use: This method used for to remove vlues form multiSelect picklist
     Created date: 
     */
    removingSelectedValueFromLookUpList :function(component, event, helper, multiSelectPicklistAnswersList){
        console.log('Inside removingSelectedValuesToMultiSelect..');
        
        var selectedRecordsMap = {};
        
        for(var i = 0; i < multiSelectPicklistAnswersList.length; i++){
            selectedRecordsMap[multiSelectPicklistAnswersList[i]] = multiSelectPicklistAnswersList[i];
        }        
        
        var lookUpDataList = component.get('v.lookUpDataMasterList');
        //console.log('..before lookUpDataList..'+component.get("v.lookUpDataList"));
        for(var i = 0; i < lookUpDataList.length; i++){
            var lookUpName = lookUpDataList[i].Name;
            if(selectedRecordsMap[lookUpName]){
                lookUpDataList.splice(i, 1);
            }
        }
        //console.log('..after lookUpDataList..'+component.get("v.lookUpDataList"));
        component.set("v.lookUpDataList", lookUpDataList);        
    },
      /*
     Method Name : fetchAllProfilesFromDb
     Comments    : This method is used to get all profiles related to salesforce org.
    */     
    fetchAllProfilesFromDb : function(component, event, helper) {
         console.log('getAllProfiles');   
        var action = component.get('c.getAllProfileValues');
        console.log('action' + action);
        
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                var storeResponse = response.getReturnValue();
                console.log('storeResponse' + storeResponse);
                component.set("v.lookUpDataList", storeResponse);
                component.set("v.lookUpDataMasterList", storeResponse);
              
             }
             
        });
        $A.enqueueAction(action);
    },
        /*
Method Name :  fetchingFieldValuesFromDB
Comments    : This method is called for onfocus event, to search records and display. 
*/  
    fetchingFieldValuesFromDB : function(component,event) { 
        var selctedObjectValue = component.get("v.objectAPIName").toString();
         console.log('selctedObjectValue'+selctedObjectValue);
     
        //Calling Server-Side Action
        var action = component.get("c.getsObjectRelatedFields");  
        action.setParams({
            'selctedObjectValue' : selctedObjectValue
        });
        // set a callBack    
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(state === "SUCCESS"){
                var storeResponse = response.getReturnValue();
                // if storeResponse size is equal 0 ,display No Result Found... message on screen.                }
                if(storeResponse.length == 0){
                    component.set("v.Message", 'No Result Found...');
                }else{
                    component.set("v.Message", '');
                }
                component.set("v.lookUpDataList", storeResponse);
                component.set("v.lookUpDataMasterList", storeResponse);
            }
           
        });
        // enqueue the Action  
        $A.enqueueAction(action);   
    } ,
         /*
Method Name : deleteSelectedValuesAndIdsFromPills 
Comments : This method is used to get selected record details
  */   
    deleteSelectedValuesAndIdsFromPills : function(component, event, helper){
        console.log('Inside deleteSelectedValuesAndIdsFromPills');
         var selectedValuesMap = {};
      
        var multiSelectPicklistAnswers = component.get("v.multiSelectPicklistAnswers");
        console.log('multiSelectPicklistAnswers'+multiSelectPicklistAnswers);
        
        var multiSelectPicklistAnswersId = component.get("v.multiSelectPicklistAnswersId");
        console.log('multiSelectPicklistAnswersId'+multiSelectPicklistAnswersId);
        
        if(multiSelectPicklistAnswers != undefined){
            //convert answers string to array to show the results as pills
            var multiSelectPicklistAnswersArray = multiSelectPicklistAnswers.split(";");
            var multiSelectPicklistAnswersList = [];
            for(var i = 0; i < multiSelectPicklistAnswersArray.length; i++){
                multiSelectPicklistAnswersList.push(multiSelectPicklistAnswersArray[i]);
                //store the answers in a map so that this map can be used to remove the answers from super set of pick list values
                selectedValuesMap[multiSelectPicklistAnswersArray[i]] = multiSelectPicklistAnswersArray[i];
            }
            console.log('multiSelectPicklistAnswersList..'+JSON.stringify(multiSelectPicklistAnswersList));
            component.set("v.multiSelectPicklistAnswersList", multiSelectPicklistAnswersList);
        }           
        else
            $A.util.addClass(component.find("questionPills"), "slds-hide");        //Adjust space 
             
        if(multiSelectPicklistAnswersId != undefined){
            //convert answers string to array to show the results as pills
            var multiSelectPicklistAnswersIdArray = multiSelectPicklistAnswersId.split(",");
            var multiSelectPicklistIdAnswersList = [];
            for(var i = 0; i < multiSelectPicklistAnswersIdArray.length; i++){
                multiSelectPicklistIdAnswersList.push(multiSelectPicklistAnswersIdArray[i]);
               }
            console.log('multiSelectPicklistIdAnswersList..'+JSON.stringify(multiSelectPicklistIdAnswersList));
            component.set("v.multiSelectPicklistIdAnswersList", multiSelectPicklistIdAnswersList);
        }            
    }
    
})