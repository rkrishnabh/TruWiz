({
    loadCreateEditChildRecord : function(component, event, helper){
        console.log('Inside loadCreateEditChildRecord');
        helper.loadCreateEditChildRecord(component, event, helper);
    },
    
    createEditChildSave : function(component, event, helper){
        console.log('Inside createEditChildSave');
        helper.createEditChildSave(component, event, helper);		
    },
    
    closePopUp : function(component, event, helper){
        console.log('Inside closePopUp');
        component.set("v.showPopUp", false);        
    },
    /*
Method Name : captureSelectedLookUpValEvent
Comments : captureSelected captureSelected values from selectedsObjectRecordEvent
Date : 13-April 
  */ 
    captureSelectedLookUpValEvent : function(component, event){
        console.log('Inside Create Edit Child CmpcaptureSelectedLookUpValEvent');
        var questionId = event.getParam("questionId");
        var revisedLookUpValues = event.getParam("revisedLookUpValues");
        var revisedSelectedLookUpValues =  event.getParam("revisedSelectedLookUpValues");
        var questionObjectList = component.get("v.questionsList");
        for(var i = 0; i < questionObjectList.length; i++){
            var questionObj = questionObjectList[i];
            if(i == questionId){
                if(questionObj.Field_Type__c == 'REFERENCE'){
                    questionObj.Answer__c = lookUpId;
                    questionObj.LookUpName__c = lookUpName;
                    objectName = questionObj.Object_API_Used_for_Lookup__c;
                    readRecordData = questionObj.Read_Record_Data__c; 
                    //new code Date 08-April
                }else if(questionObj.Field_Type__c == 'MULTIPICKLIST'){
                    questionObj.Answer__c = revisedSelectedLookUpValues;
                    questionObj.SelectedMultiPickListValues__c = revisedSelectedLookUpValues ;  
                }
            }    
        }  
        component.set('v.questionsList',questionObjectList); 
    },
    
})