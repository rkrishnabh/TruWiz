({
    /*
Method Name :  doInit
Comments    :  
*/    
    doInit : function(component,event,helper){
        console.log('Inside doInit..');
        var lookUpType = component.get("v.lookUpType");
        var moduleName = component.get("v.moduleName");
        if(moduleName == 'Admin'){
            helper.fetchAllProfilesFromDb(component,event);   
        }
        if(lookUpType == 'MULTIPICKLIST'){
            helper.deleteSelectedValuesAndIdsFromPills(component, event);
            var lookUpDataStr = component.get("v.lookUpDataStr");
            var selectedValuesMap = {};
           
            //Start generate MultiSelect Picklist Values
            if(lookUpDataStr != undefined){
                var lookUpDataStrArray = lookUpDataStr.split(",");                
                var lookUpDataList = [];
                for( var j = 0; j < lookUpDataStrArray.length; j++){
                    //don't add the value which is part of answer to the look up search results
                    if(!selectedValuesMap[lookUpDataStrArray[j]]){
                       // console.log('Inside If..'+lookUpDataStrArray[j]);
                        lookUpDataList.push({Id: lookUpDataStrArray[j], Name: lookUpDataStrArray[j]});
                    }               
                }
               // console.log('lookUpDataList..'+JSON.stringify(lookUpDataList));
                component.set("v.lookUpDataMasterList", lookUpDataList);
                component.set("v.lookUpDataList", lookUpDataList);
            }		            
        }        
    },
    
    /*
Method Name : selectedRecordDetails
Comments : This method is used to get selected record details
  */   
    selectedRecordDetails : function(component, event, helper){
        console.log('Inside selectedRecordDetails');
        var lookupType = component.get("v.lookUpType");
        var selectedRecord = event.currentTarget;
        var questionId = component.get("v.questionId");
        var selectedRecordId = selectedRecord.dataset.record;
        var selectedRecordName = selectedRecord.dataset.seq;
        
        var revisedSelectedLookUpValues;
        var revisedSelectedLookUpIdValues;
        
        if(lookupType == 'REFERENCE'){
            component.set("v.value" , selectedRecordName);
        }else if(lookupType == 'MULTIPICKLIST'){
            var multiSelectPicklistAnswersList = component.get("v.multiSelectPicklistAnswersList");
            multiSelectPicklistAnswersList.push(selectedRecordName);
            revisedSelectedLookUpValues = multiSelectPicklistAnswersList.toString();
            component.set("v.multiSelectPicklistAnswersList",multiSelectPicklistAnswersList);
            
            var multiSelectPicklistIdAnswersList = component.get("v.multiSelectPicklistIdAnswersList");
            multiSelectPicklistIdAnswersList.push(selectedRecordId);
            revisedSelectedLookUpIdValues = multiSelectPicklistIdAnswersList.toString();
            component.set("v.multiSelectPicklistIdAnswersList",multiSelectPicklistIdAnswersList); 
            
            $A.util.removeClass(component.find("questionPills"), "slds-hide");         //Adjust space           
            helper.removingSelectedValueFromLookUpList(component, event, helper, multiSelectPicklistAnswersList);            
        }
        
       // console.log('..selectedRecordName..'+selectedRecordName+'..selectedRecordId..'+selectedRecordId+'..questionId..'+questionId);
        //console.log('..revisedSelectedLookUpValues..'+revisedSelectedLookUpValues);
        //console.log('..multiSelectPicklistAnswersList..'+component.get("v.multiSelectPicklistAnswersList"));
        //console.log('..lookUpDataList..'+component.get("v.lookUpDataList"));
        
        // call the event   
        var compEvent = component.getEvent("oSelectedRecordEvent");
        
        compEvent.setParams({
            "questionId" : questionId,
            "lookUpId" : selectedRecordId,
            "lookUpName" : selectedRecordName,
            "revisedSelectedLookUpValues": revisedSelectedLookUpValues,
            "revisedSelectedLookUpIdValues":revisedSelectedLookUpIdValues
        }); 
        compEvent.fire();    
    },
    
    /*
     MethodName: deleteMultiSelectValue
     Use: Delete selected values from multiSelectPicklist
     Created date: 
     */
    deleteMultiSelectValue: function(component,event,helper){
        console.log("Inside deleteMultiSelectValue..");
        
        var target = event.target;
        var rowIndex = target.getAttribute("data-record");
        var questionId = component.get("v.questionId");
        var lookUpDataList = component.get("v.lookUpDataMasterList");
        var multiSelectPicklistAnswersList = component.get("v.multiSelectPicklistAnswersList");
        var multiSelectPicklistIdAnswersList = component.get("v.multiSelectPicklistIdAnswersList");
        console.log('multiSelectPicklistIdAnswersList'+multiSelectPicklistIdAnswersList);
        
        var deletedLookUpOption = multiSelectPicklistAnswersList[rowIndex];
        
        multiSelectPicklistAnswersList.splice(rowIndex, 1);
        if(multiSelectPicklistIdAnswersList != undefined){
            multiSelectPicklistIdAnswersList.splice(rowIndex, 1);
        }        
        
        lookUpDataList.push({Id: deletedLookUpOption, Name: deletedLookUpOption});        
        //Adjust space
        if(multiSelectPicklistAnswersList != undefined && multiSelectPicklistAnswersList.length == 0 )
            $A.util.addClass(component.find("questionPills"), "slds-hide");        
        
        component.set("v.multiSelectPicklistAnswersList",multiSelectPicklistAnswersList);
        component.set("v.multiSelectPicklistIdAnswersList",multiSelectPicklistIdAnswersList);
        
        //console.log('..lookUpDataList..'+component.get("v.lookUpDataList"));
        //console.log('..multiSelectPicklistAnswersList..'+multiSelectPicklistAnswersList);
        component.set("v.lookUpDataList",lookUpDataList);
        component.set("v.lookUpDataMasterList",lookUpDataList);
        var revisedSelectedLookUpValues = multiSelectPicklistAnswersList.toString();
        var revisedSelectedLookUpIdValues = multiSelectPicklistIdAnswersList.toString();
        
        var compEvent = component.getEvent("oSelectedRecordEvent");
        
        compEvent.setParams({
            "questionId" : questionId,
            "revisedSelectedLookUpValues": revisedSelectedLookUpValues,
            "revisedSelectedLookUpIdValues":revisedSelectedLookUpIdValues
        }); 
        compEvent.fire(); 
    },
    
    /*
Method Name :  keyPressController
Comments    :  This method is called by keyup event, to search records and display based on search value.
*/   
    keyPressController : function(component, event, helper) {
        console.log('Inside keyPressController..');
        $A.util.removeClass(component.find("lookupData"), "slds-hide");
        var getInputkeyWord = component.get("v.value");
        // check if getInputKeyWord size id more then 0 then open the lookup result List and 
        // call the helper 
        // else close the lookup result List part.   
        if(getInputkeyWord != undefined && getInputkeyWord.length > 0 ){
            var forOpen = component.find("searchRes");
            $A.util.addClass(forOpen, 'slds-is-open');
            $A.util.removeClass(forOpen, 'slds-is-close');
            var lookUpType = component.get("v.lookUpType");
            var metaDataApi = component.get("v.metaDataApi");
            
            if(lookUpType == 'REFERENCE'){
                helper.fetchingRecordsFromDB(component,event,getInputkeyWord);
            }else{
                if(metaDataApi == 'metaDataApi'){
                    helper.fetchingFieldValuesFromDB(component, event);
                }
                var multiSelectPicklistAnswersMap = {};
                var multiSelectPicklistAnswersList = component.get("v.multiSelectPicklistAnswersList");
                for(var i = 0; i < multiSelectPicklistAnswersList.length; i++){
                    multiSelectPicklistAnswersMap[multiSelectPicklistAnswersList[i]] = multiSelectPicklistAnswersList[i];
                }
                
                var lookUpDataList = component.get("v.lookUpDataMasterList");
                var filteredlookUpDataList = [];
               // console.log('before lookUpDataList..'+JSON.stringify(lookUpDataList));
                for(var i = 0; i < lookUpDataList.length; i++){
                    var lookUpName = lookUpDataList[i].Name;                    
                    //if(lookUpName.includes(getInputkeyWord)){
                     if((lookUpName.includes(getInputkeyWord)) && (!multiSelectPicklistAnswersMap[lookUpName])){
                        filteredlookUpDataList.push({Id: lookUpDataList[i].Id, Name: lookUpDataList[i].Name});
                    }
                }  
               // console.log('after filteredlookUpDataList..'+JSON.stringify(filteredlookUpDataList));
               // console.log('lookUpDataMasterList..'+JSON.stringify(component.get("v.lookUpDataMasterList")));
                component.set("v.lookUpDataList", filteredlookUpDataList);            
            }
        }else{  
            if(lookUpType == 'REFERENCE')
                component.set("v.lookUpDataList", null ); 
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
        }        
    },
    
    /*
Method Name :  clear
Comments    : Function for clear the Record Selection
*/     
    clear :function(component,event,heplper){        
        var pillTarget = component.find("lookup-pill");
        var lookUpTarget = component.find("lookupField"); 
        
        $A.util.addClass(pillTarget, 'slds-hide');
        $A.util.removeClass(pillTarget, 'slds-show');
        
        $A.util.addClass(lookUpTarget, 'slds-show');
        $A.util.removeClass(lookUpTarget, 'slds-hide');
        
        component.set("v.SearchKeyWord",null);
        component.set("v.lookUpDataList", null );
        component.set("v.selectedRecord", {} );        
    },
      
    /*
Method Name :  hideSpinner
Comments    : Automatically call when the component is done waiting for a response to a server request.  
*/     
    hideSpinner : function (component, event, helper) {
        var spinner = component.find('spinner');
        var evt = spinner.get("e.toggle");
        evt.setParams({ isVisible : false });
        evt.fire();    
    },
    
    /*
Method Name :  hideSpinner
Comments    : Automatically call when the component is waiting for a response to a server request.
*/ 
    showSpinner : function (component, event, helper) {
        var spinner = component.find('spinner');
        var evt = spinner.get("e.toggle");
        evt.setParams({ isVisible : true });
        evt.fire();    
    },
    
    /*
     MethodName: mouseouted
     Use: Hiding the records section under Lookup field when blur event happens
     Created date: 07/02/18
     By:Vinodh
     */
    mouseouted : function(component, event, helper){        
        setTimeout(function(){ 
            $A.util.addClass(component.find("lookupData"), "slds-hide");},10);         
    }    
})