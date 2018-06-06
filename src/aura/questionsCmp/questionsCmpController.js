({ 
    questionsOnLoad : function(component, event, helper){
        helper.loadQuestions(component, event, helper, false);
    },
    
    createEditChildRecordEvt : function(component, event, helper) {
        console.log('Inside createEditChildRecordEvt.. Start');        
        var metaDataMap = event.getParam("metaDataMap");         
        component.set("v.metaDataMap",metaDataMap);       
        helper.loadQuestions(component, event, helper, false);
    },
    /*
Method Name :  captureSelectedLookUpValEvent
Usage       :  This method is used to updating the metadataMap with latest selected lookup Values.
Comments    :  Handles by event
*/    
    captureSelectedLookUpValEvent : function(component, event, helper){       
        console.log('Inside captureSelectedLookUpValEvent..');
        var questionId = event.getParam("questionId");
        var lookUpId = event.getParam("lookUpId");
        var lookUpName = event.getParam("lookUpName");
        var revisedLookUpValues = event.getParam("revisedLookUpValues");
        var revisedSelectedLookUpValues =  event.getParam("revisedSelectedLookUpValues");
        var objectName;
        var recordId = lookUpId;
        var readRecordData;
        var fieldsToBeQueried = '';
        var metaDataMap = component.get("v.metaDataMap");
        var tabName = component.get("v.tabName");
        var subTabName = component.get("v.subTabName");        
        var tabNameSubTabNameKey = tabName+':'+subTabName;
        
        console.log('..questionId..'+questionId+'..LookUpId..'+lookUpId+'..LookUpName..'+lookUpName+'..tabNameSubTabNameKey..'+tabNameSubTabNameKey);
        
        var questionsMapList = metaDataMap[tabNameSubTabNameKey];
        for(var i = 0; i < questionsMapList.length; i++){
            var questionAnsMap = questionsMapList[i];
            for (var apiNameKey in questionAnsMap){               
                var questionObj = questionAnsMap[apiNameKey];
                var fieldAPIName = questionObj.Field_API_Name__c;
                if(questionObj.Id == questionId){
                    if(questionObj.Field_Type__c == 'REFERENCE'){
                        questionObj.Answer__c = lookUpId;
                        questionObj.LookUpName__c = lookUpName;
                        objectName = questionObj.Object_API_Used_for_Lookup__c;
                        readRecordData = questionObj.Read_Record_Data__c;                        
                    }else if(questionObj.Field_Type__c == 'MULTIPICKLIST'){
                        questionObj.Answer__c = revisedSelectedLookUpValues;
                        questionObj.SelectedMultiPickListValues__c = revisedSelectedLookUpValues;
                        console.log('SelectedMultiPickListValues..'+questionObj.SelectedMultiPickListValues__c);
                    }
                }else if(i == 0 && fieldAPIName != 'Id')
                    fieldsToBeQueried += fieldAPIName+',';
            }
        }
        component.set("v.metaDataMap",metaDataMap);
        fieldsToBeQueried = fieldsToBeQueried.slice(0, -1);
        
        if(readRecordData == true){
            helper.readLookupQuesAnswer(component, event, helper, recordId, tabNameSubTabNameKey, objectName, metaDataMap, fieldsToBeQueried);           
        }
    },
    
    captureQuestionIdOnClick : function(component,event,helper){
        console.log('captureQuestionIdOnClick..Start..');
        var questionId = event.currentTarget.id;
        component.set("v.questionId",questionId);
    },
    
    invokeGlobalTabsEvent : function(component, event, helper){
        console.log('Inside invokeGlobalTabs');
        helper.transformAndPassValuesToParentComponents(component, event);       
    },  
    
    createChildRecord : function(component, event, helper){
        console.log('Inside createChildRecord');
        component.set("v.questionChildRecordAdded",true);        
        var tabName = component.get("v.tabName");
        var subTabName = component.get("v.subTabName");
        var metaDataMap = component.get("v.metaDataMap");
        var subTabFieldApiName = component.get("v.subTabFieldApiName");
        var subTabFilteringValue = component.get("v.subTabFilteringValue");        
        $A.createComponents([["c:createEditChildRecordCmp",{tabName:tabName,subTabName:subTabName,metaDataMap:metaDataMap,popUpMode:'New',subTabFieldApiName:subTabFieldApiName,subTabFilteringValue:subTabFilteringValue}]],
                            function(createChildRecord, status){
                                if (component.isValid() && status === 'SUCCESS'){
                                    component.set("v.body", createChildRecord);
                                }else{
                                    var showToast = $A.get('e.force:showToast');
                                    showToast.setParams({
                                        'title': 'Insert New Child Record',
                                        'message': 'Error while launching New Child Record Create pop up. Please try again.', });            
                                    showToast.fire();
                                }
                            } 
                           ); 
    },    
    
    tabActionClicked : function(component, event, helper){
        console.log('Inside tabActionClicked');
        debugger;
        var actionId = event.getParam('actionId'); 
        var clickedRow = event.getParam('row');
        console.log('Row Id..'+clickedRow.Id+'..actionId..'+actionId);
        if(actionId !="" && actionId != null && actionId != undefined){
            if(actionId == 'editQuestion'){ 
                var tabName = component.get("v.tabName");
                var subTabName = component.get("v.subTabName");
                var metaDataMap = component.get("v.metaDataMap");  
                $A.createComponents([["c:createEditChildRecordCmp",{tabName:tabName,subTabName:subTabName,metaDataMap:metaDataMap,popUpMode:'Edit',selectedQuesSeq:clickedRow.Id}]],                
                                    function(editChildRecord, status){
                                        if (component.isValid() && status === 'SUCCESS'){
                                            component.set("v.body", editChildRecord);
                                        }else{
                                            var showToast = $A.get('e.force:showToast');
                                            showToast.setParams({
                                                'title': 'Insert New Child Record',
                                                'message': 'Error while launching Edit Child Record Create pop up. Please try again.', });            
                                            showToast.fire();
                                        }
                                    } 
                                   ); 
            }
        }
    },    
    
    loadDependentQuestions : function(component, event, helper){        
        console.log('Inside loadDependentQuestions..');
        var metaDataMap = component.get("v.metaDataMap");
        var tabName = component.get("v.tabName");
        var subTabName = component.get("v.subTabName");       
        var selectedQuestionId = component.get("v.questionId");
        var selectedAnswer = event.getSource().get("v.value");
        var dependentQuestionFlag;
        var dependentSubtab;
        var dependentTab;
        
        console.log('selectedQuestionId..'+selectedQuestionId+'..selectedAnswer..'+selectedAnswer);       
        var questionsAnsList = metaDataMap[tabName+':'+subTabName];           
        for(var i = 0; i < questionsAnsList.length; i++){ 
            var questionsAnsMap = questionsAnsList[i]
            for(var questionsAnsMapKey in questionsAnsMap){
                var questionObj = questionsAnsMap[questionsAnsMapKey];
                if(questionObj.Id === selectedQuestionId){
                    dependentTab = questionObj.Dependent_Tab__c;
                    dependentSubtab = questionObj.Dependent_Subtab__c;
                    dependentQuestionFlag = questionObj.Dependent_Question__c;
                    break;
                }               
            }           
        }
        
        console.log('dependentQuestionFlag..'+dependentQuestionFlag+'..dependentTab..'+dependentTab+'..dependentSubtab..'+dependentSubtab);
        
        if(dependentQuestionFlag == true){        
            console.log('Inside if dependentQuestionFlag ');
            $A.util.removeClass(component.find("spinner"), "slds-hide");
            
            //start
            
            var depQuestionsConditionsMap = component.get("v.depQuestionsConditionsMapMaster");
            var depQuesIdAnsMap = {};       
            
            for(var depQuestionConditionMapkey in depQuestionsConditionsMap){
                var depQuestionConditionListMap = depQuestionsConditionsMap[depQuestionConditionMapkey];
                
                if(depQuestionConditionMapkey.includes("Show or Hide")){   
                    helper.loadDependentQuestionsForShowOrHide(component, event, depQuestionConditionListMap);
                }else if(depQuestionConditionMapkey.includes("Picklist Filtering")){
                    helper.loadDependentQuestionsForPicklistFilteringNPreDefaultNMandatory(component, event, depQuestionConditionListMap,'Picklist Filtering');
                }else if(depQuestionConditionMapkey.includes("PreDefault")){
                    helper.loadDependentQuestionsForPicklistFilteringNPreDefaultNMandatory(component, event, depQuestionConditionListMap,'PreDefault');
                }else if(depQuestionConditionMapkey.includes("Mandatory")){
                    helper.loadDependentQuestionsForPicklistFilteringNPreDefaultNMandatory(component, event, depQuestionConditionListMap,'Mandatory');
                }
            }
            
            var conditionalDependencyEvent = component.getEvent("conditionalDependencyEvent");        
            conditionalDependencyEvent.setParams({selectedQuestionId: selectedQuestionId,                                 		
                                                  selectedAnswer:selectedAnswer,                                                                                       
                                                  dependentTab:dependentTab,
                                                  dependentSubtab:dependentSubtab,
                                                  metaDataMap:metaDataMap
                                                 });
            conditionalDependencyEvent.fire();    
            
            helper.loadQuestions(component, event, helper, true);    
            $A.util.addClass(component.find("spinner"), "slds-hide");     
            //end
            
            
            /*var selectedQuestionIdArray = [];
            selectedQuestionIdArray.push(selectedQuestionId);
            
            //Calling server-side action
            var action = component.get("c.returnDependentQuestionsConditionList");
            action.setParams({ 
                questionIdArray : selectedQuestionIdArray                
            });
            
            //Create a callback that is executed after the server-side action returns
            action.setCallback(this, function(response){
                var state = response.getState();
                debugger;
                if(state === "SUCCESS"){
                    var depQuestionConditionMap = response.getReturnValue();                   
                    for(var depQuestionConditionMapkey in depQuestionConditionMap){
                        console.log('depQuestionConditionMapkey..'+depQuestionConditionMapkey);
                        var depQuestionConditionListMap = depQuestionConditionMap[depQuestionConditionMapkey];
                        if(depQuestionConditionMapkey.includes("Show or Hide")){                           
                            helper.loadDependentQuestionsForShowOrHide(component, event, depQuestionConditionListMap);
                        }else if(depQuestionConditionMapkey.includes("Picklist Filtering")){
                            helper.loadDependentQuestionsForPicklistFilteringNPreDefaultNMandatory(component, event, depQuestionConditionListMap,'Picklist Filtering');
                        }else if(depQuestionConditionMapkey.includes("PreDefault")){
                            helper.loadDependentQuestionsForPicklistFilteringNPreDefaultNMandatory(component, event, depQuestionConditionListMap,'PreDefault');
                        }else if(depQuestionConditionMapkey.includes("Mandatory")){
                            helper.loadDependentQuestionsForPicklistFilteringNPreDefaultNMandatory(component, event, depQuestionConditionListMap,'Mandatory');
                        }
                    }
                    
                    var conditionalDependencyEvent = component.getEvent("conditionalDependencyEvent");        
                    conditionalDependencyEvent.setParams({selectedQuestionId: selectedQuestionId,                                 		
                                                          selectedAnswer:selectedAnswer,                                                                                       
                                                          dependentTab:dependentTab,
                                                          dependentSubtab:dependentSubtab,
                                                          metaDataMap:metaDataMap
                                                         });
                    conditionalDependencyEvent.fire();    
                    
                    helper.loadQuestions(component, event, helper, true);    
                }else if(state === "ERROR"){
                    console.log('Error ..in loadDependentQuestions ');
                }
                $A.util.addClass(component.find("spinner"), "slds-hide");     
            });        
            $A.enqueueAction(action);*/
        }else{
            var conditionalDependencyEvent = component.getEvent("conditionalDependencyEvent");        
            conditionalDependencyEvent.setParams({selectedQuestionId: selectedQuestionId,                                 		
                                                  selectedAnswer:selectedAnswer,                                                                                       
                                                  dependentTab:dependentTab,
                                                  dependentSubtab:dependentSubtab,
                                                  metaDataMap:metaDataMap
                                                 });
            conditionalDependencyEvent.fire();    
        }        
    }, 
    
    accordionHideShowQuestionSections:function(component, event, helper){
        console.log('Inside accordionHideShowQuestionSections..');
        var src = event.getSource();
        var val = event.getSource().get("v.value");
        var icon = event.getSource().get("v.iconName");
        var rcrd = document.getElementById(val);
        var divClass = rcrd.getAttribute("class");
        if(divClass == "" || divClass == undefined || divClass == null){
            rcrd.setAttribute("class","slds-hide");
            src.set("v.iconName","utility:chevronup");
        }else{
            rcrd.removeAttribute("class");        
            src.set("v.iconName","utility:chevrondown");
        }
    },
    deleteRecordDetails:function(component, event, helper){
        var val = event.getSource().get("v.value");
        var questionRecordIdAndIndex = val.split(":");
        var questionRecordId = questionRecordIdAndIndex[0];
        console.log('questionRecordId'+questionRecordId);
        var questionRowIndex = questionRecordIdAndIndex[1];
        var orgRecordIndex = questionRecordIdAndIndex[2];
        if(questionRecordId != undefined && questionRecordId != null && questionRecordId != ""){
            //Delete from DB
            helper.deleteRecordDetails(component, event, helper, questionRecordId, orgRecordIndex, questionRowIndex); 
        }else{
            //Delete from List
            var wizardQuestionList = component.get("v.wizardQuestionList");
            wizardQuestionList.splice(questionRowIndex,1);
            component.set("v.wizardQuestionList",wizardQuestionList);            
            helper.showToastMsg(component,event,helper,"Success","Record Deleted Successfully");            
        }     
    }
})