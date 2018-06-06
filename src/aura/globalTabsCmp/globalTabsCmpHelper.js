({
    loadDynamicWizardData : function(component,event,helper,tabIdNameAfterSave,subTabIdNameAfterSave) {
        console.log('Inside loadDynamicWizardData');
        var recordId=component.get("v.recordId");
        var action = component.get("c.loadDynamicWizardData");       
        console.log('loadDynamicWizardData recordId..'+recordId);        
        
        action.setParams({ 
            recordId : recordId
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('loadDynamicWizardData SUCCESS');
                var wizardList = response.getReturnValue();
                
                if(wizardList.length > 0){
                    console.log('wizardList..'+JSON.stringify(wizardList));
                    var metaDataMap = wizardList[0];
                    var tabsMap = wizardList[1];
                    var tabsSubTabsMap = wizardList[2];
                    var saveAsDraftMap = wizardList[3];
                    var templateName = wizardList[4];
                    var dependentTabsConditionsMap = wizardList[5]; 
                    var dependentSubtabsConditionsMap = wizardList[6]; 
                    var depQuestionsConditionsMap = wizardList[7];   
                    var questionsProfileSetttingsMap = wizardList[8];   
                    var saveAsDraftId = wizardList[9];
                    
                    console.log('dependentTabsConditionsMap..'+JSON.stringify(dependentTabsConditionsMap));
                    console.log('dependentSubtabsConditionsMap..'+JSON.stringify(dependentSubtabsConditionsMap));
                    console.log('depQuestionsConditionsMap..'+JSON.stringify(depQuestionsConditionsMap));
                    console.log('questionsProfileSetttingsMap..'+JSON.stringify(questionsProfileSetttingsMap));
                    
                    //Reload After Save
                    if(tabIdNameAfterSave != undefined && tabIdNameAfterSave != "" && tabIdNameAfterSave != null){
                        saveAsDraftMap = {};
                        saveAsDraftMap['tab'] = tabIdNameAfterSave;
                        saveAsDraftMap['subTab'] = subTabIdNameAfterSave;
                    }                   
                    
                    //code to retain the state of wizard when save as draft was clicked
                    var draftTab, draftSubTab;
                    var tabIdName = saveAsDraftMap['tab'];
                    if(tabIdName != null && tabIdName != undefined){
                        var tabIdNameArray = tabIdName.split(':');
                        draftTab = tabIdNameArray[1];
                    }
                    
                    console.log('draftTab..'+draftTab);
                    // End code to retain the state of wizard when save as draft was clicked
                    
                    var tabList = new Array();                
                    for(var tabName in tabsMap){
                        var tabObj = tabsMap[tabName];

                        if(tabObj.Tab_Name__c == draftTab)
                            tabObj.Selected = true;
                        else
                            tabObj.Selected = false;
                        
                        //To show/hide tab based on the user profile access
                        this.matchProfile(component,tabObj);
                        tabList.push(tabObj);
                    }

                    if(draftTab == undefined){
                        tabList[0].Selected = true;
                    }
                    component.set("v.tabList",tabList);   
                    component.set("v.metaDataMap",metaDataMap);
                    
                    this.showOrHideDependentTabs(component, event, dependentTabsConditionsMap);

                    if(tabList[0].Template__r.tabOrientation__c == undefined || tabList[0].Template__r.tabOrientation__c == null || tabList[0].Template__r.tabOrientation__c == "")
                        component.set("v.tabOrientation","Top");
                    else
                        component.set("v.tabOrientation",tabList[0].Template__r.tabOrientation__c);
                    
                    this.setTabOrientation(component, event);                    
                    
                    component.set("v.tabsMap",tabsMap);
                    component.set("v.tabsSubTabsMap",tabsSubTabsMap);
                    component.set("v.saveAsDraftMap",saveAsDraftMap);
                    component.set("v.saveAsDraftId",saveAsDraftId);
                    component.set("v.dependentTabsConditionsMap", dependentTabsConditionsMap);                    
                    component.set("v.dependentSubtabsConditionsMap", dependentSubtabsConditionsMap);                    
                    component.set("v.depQuestionsConditionsMapMaster", depQuestionsConditionsMap);                    
                    component.set("v.questionsProfileSetttingsMap",questionsProfileSetttingsMap);                    
                    component.set("v.templateName",templateName);
                    component.set("v.onLoad",true);
                    component.set("v.recordId",recordId);
                    
                   
                    this.replaceWithDraftAnswers(component,event);
                    this.navigateToSubTabs(component,event,helper,saveAsDraftMap);
                }else{
                    var showToast = $A.get('e.force:showToast');
                    showToast.setParams({
                        'title': 'Dynamic Wizard',
                        'message': 'Please Configure Template Id.', });            
                    showToast.fire();
                    
                }
            }else if (state === "ERROR") {
                var errors = response.getError();
                console.log('loadDynamicWizardData ERROR'+errors);               
            }
        });
        $A.enqueueAction(action);
    },
    
    navigateToSubTabs:function(component, event, helper, saveAsDraftMap) {
        console.log('Inside navigateToSubTabs');
        var subTabsComponent = component.get("v.subTabsComponent");        
        var onLoad = component.get("v.onLoad");         
        var tabsList = component.get("v.tabList");        
        var tabsSubTabsMap = component.get("v.tabsSubTabsMap");
        var metaDataMap = component.get("v.metaDataMap");
        var dependentSubtabsConditionsMap = component.get("v.dependentSubtabsConditionsMap");
        var depQuestionsConditionsMap = component.get("v.depQuestionsConditionsMapMaster");
        var questionsProfileSetttingsMap = component.get("v.questionsProfileSetttingsMap");        

        var tabId, tabName;
        var userProfile = component.get('v.userProfile');
        if(onLoad){
            for(var index in tabsList){
                if(tabsList[index].Selected){
                    tabId = tabsList[index].Id;
                    tabName = tabsList[index].Tab_Name__c;
                    component.set("v.tabId", tabsList[index].Id);
                    component.set("v.tabName", tabsList[index].Tab_Name__c);
                    break;                    
                }                 
            } 
        }else{
            this.currentPathHighlighter(component,event);        
            var selectedTabID = event.currentTarget;
            var tab = selectedTabID.dataset.record;
            var tabIdNameArray = {};        
            tabIdNameArray = tab.split('#');
            tabId = tabIdNameArray[0];
            tabName = tabIdNameArray[1];  
            
            component.set("v.prevTabName", component.get("v.tabName"));
            component.set("v.tabName", tabName);            
        }              
        
        //$A.createComponents([["c:subTabsCmp",{tabId:tabId,tabName:tabName,subTabId:subTabId,subTabName:subTabName,metaDataMap:metaDataMap,tabsSubTabsMap:tabsSubTabsMap,userProfile:userProfile, depQuestionsConditionsMapMaster:depQuestionsConditionsMap, dependentSubtabsConditionsMap:dependentSubtabsConditionsMap}]],
        $A.createComponents([["c:subTabsCmp",{tabId:tabId,tabName:tabName,metaDataMap:metaDataMap,tabsSubTabsMap:tabsSubTabsMap,userProfile:userProfile, depQuestionsConditionsMapMaster:depQuestionsConditionsMap, dependentSubtabsConditionsMap:dependentSubtabsConditionsMap,saveAsDraftMap:saveAsDraftMap,onLoad:onLoad, questionsProfileSetttingsMap:questionsProfileSetttingsMap}]],                
                                function(subTabsCmp, status)
                                {
                                    if (component.isValid() && status === 'SUCCESS'){
                                        console.log("status");
                                        var subTabsComponent = {};
                                        for(var i=0; i < subTabsCmp.length; i++) {
                                            var subTabCmp = subTabsCmp[i];
                                            subTabsComponent[subTabCmp.getLocalId()] = subTabCmp;
                                        }
                                        component.set("v.body",[]);
                                        component.set("v.subTabsComponent", subTabsComponent);
                                        component.set("v.subTabsComponentId", subTabCmp.getLocalId());
                                        component.set("v.body", subTabsCmp);
                                    }else{
                                        /*var showToast = $A.get('e.force:showToast');
                                        showToast.setParams({
                                            'title': 'subTabsCmp',
                                            'message': 'Error while calling subTabsCmp. Please try again.', });            
                                        showToast.fire();*/
                                        component.set("v.body",[]);
                                    }
                                });
        
        if(subTabsComponent != null && subTabsComponent != undefined){
            console.log('navigateToSubTabs trigger event');
            subTabsComponent = subTabsComponent[component.get("v.subTabsComponentId")];
            subTabsComponent.invokeSubTabs(true,false,false,false,tabsSubTabsMap);           	
        }        
        
    },
    
    currentPathHighlighter : function(component,event) {
        console.log('currentPathHighlighter..start');
        if(event.currentTarget != null && event.currentTarget != undefined){
            var selectedTabID = event.currentTarget;
            var tab = selectedTabID.dataset.record;
            var tabIdNameArray = tab.split('#');
            var tabId = tabIdNameArray[0];
            var tabName = tabIdNameArray[1];
            var tabsList = component.get("v.tabList");            
            for(var index in tabsList){
                if(tabsList[index].Id === tabId)
                    tabsList[index].Selected = true;
                else
                    tabsList[index].Selected = false;                   
            }             
            component.set("v.tabList", tabsList);             
        }
    },
    updateSelectedTabInList : function(component,event,helper,tabNme) {
        console.log('updateSelectedTabInList..start');
        var tabsList = component.get("v.tabList");
        var tabName;
        for(var index in tabsList){
            tabName = tabsList[index].Tab_Name__c;
            if(tabName == tabNme)
                tabsList[index].Selected = true;
            else
                tabsList[index].Selected = false;         
        }
        component.set("v.tabList",tabsList);
    },    
    
    replaceWithDraftAnswers : function(component, event){
        console.log('Inside replaceWithDraftAnswers');
        var metaDataMap = component.get("v.metaDataMap");
        var saveAsDraftMap = component.get("v.saveAsDraftMap");
        
        console.log('saveAsDraftMap..'+saveAsDraftMap.length);
        
        for (var tabsSubTabsName in metaDataMap){ 
            var quesAnsMapList = metaDataMap[tabsSubTabsName]; 
            for(var i = 0 ; i < quesAnsMapList.length; i++){
                var quesAnsMap = quesAnsMapList[i];
                for (var apiNamekey in quesAnsMap){
                    var questionObj = quesAnsMap[apiNamekey];
                    var answerDraft = saveAsDraftMap[apiNamekey];
                    if(answerDraft != null && answerDraft != '')
                        questionObj.Answer__c = answerDraft;
                    quesAnsMap[apiNamekey] = questionObj;
                }
            }
        }
        component.set("v.metaDataMap",metaDataMap);
    },
    
    globalSaveToDB : function(component,event,helper){
        console.log('Inside globalSaveToDB');
        var metaDataMap = component.get("v.metaDataMap");
        var questionAnsMapByObj = component.get("v.questionAnsMapByObj");
        var recordId = component.get("v.recordId");
        var tabsSubTabsMap = component.get("v.tabsSubTabsMap");
        var draftId = component.get("v.saveAsDraftId");
        
        console.log('draftId..'+draftId);
        
        var recordsMapByObject = {};
        
        var questionChildRecordAdded, tabIdAfterSave, tabNameAfterSave,subTabIdAfterSave,subTabNameAfterSave;

        questionChildRecordAdded = event.getParam("questionChildRecordAdded");        
        tabIdAfterSave = event.getParam("tabId");
        tabNameAfterSave = event.getParam("tabName");
        subTabIdAfterSave = event.getParam("subTabId");
        subTabNameAfterSave = event.getParam("subTabName");                     
        
        //For Validation
        var saveOrSubmitFlag = component.get("v.saveOrSubmitFlag");
        if(saveOrSubmitFlag == "Submit"){
            this.validateAllQuestions(component, event)            
        }
        /*var errorMessage = component.get("v.errorMessage");
        if(errorMessage!=null && errorMessage!=undefined && errorMessage!=""){
            var showToast = $A.get('e.force:showToast');
            showToast.setParams({
                'mode': 'sticky',
                'title': 'Validations are missing',
                'type': 'error',
                'message': errorMessage, });            
            showToast.fire();
            component.set("v.errorMessage",'');
            $A.util.addClass(component.find("spinner"), "slds-hide");            
            return;            
        }*/
        
        for(var tabsNameKey in tabsSubTabsMap){
            var subTabsList = tabsSubTabsMap[tabsNameKey];
            for(var j = 0; j < subTabsList.length; j++){
                var subTab = subTabsList[j];
                var subTabName = subTab.SubTab__c;
                var dataView = subTab.Data_View__c;
                /*var filteringValue = subTab.Filtering_Value__c;
                var filteringFieldAPIName = subTab.Field_API_Name__c;
                var insertUpdateRecord = false;*/
                console.log('dataView..'+dataView);
                console.log('key..'+tabsNameKey+':'+subTabName);
                if(tabsNameKey+':'+subTabName != 'Summary:Summary'){                    
                    var quesAnsMapList = metaDataMap[tabsNameKey+':'+subTabName];
                    console.log('quesAnsMapList Length..'+quesAnsMapList.length);
                    console.log('quesAnsMapList ..'+JSON.stringify(quesAnsMapList));
                    
                    var childRecordsList = new Array();                    
                    for(var i = 0 ; i < quesAnsMapList.length; i++){
                        var childRecordsMap = {};
                        //var objectName;                        
                        var parentNObjectNamekey;
                        var questionAnsMap = quesAnsMapList[i];
                        for (var apiNameKey in questionAnsMap){               
                            var question = questionAnsMap[apiNameKey];
                            var objectName = question.Object_API_Name__c;
                            /*if(question.Object_API_Name__c != undefined)
                                objectName = question.Object_API_Name__c;*/                            
                            var parentObjectName = question.Parent_Object_API_Name__c;
                            var apiName = question.Field_API_Name__c;
                            /*if(filteringFieldAPIName == undefined || filteringValue == undefined){
                                insertUpdateRecord = true;
                            }else if(filteringFieldAPIName != undefined && apiName == filteringFieldAPIName 
                                     && filteringValue != undefined && question.Answer__c == filteringValue){
                                insertUpdateRecord = true;
                            }*/                            
                            
                            if(parentObjectName != undefined && parentObjectName != 'None')
                                parentNObjectNamekey = objectName+':'+parentObjectName;
                            else
                                parentNObjectNamekey = objectName;
                            
                            var apiName = question.Field_API_Name__c;
                            var fieldType = question.Field_Type__c;
                            var answer = question.Answer__c;
                            
							/*console.log('objectName....'+objectName);
							console.log('apiName.....'+apiName);
                            console.log('Has_Condition__c.....'+question.Has_Condition__c);
                            if(apiName == 'BOOLEAN'){
                                console.log('BOOLEAN.. globalSaveToDB');
                                if(question.Answer__c == true){
                                    question.Answer__c = 'true';
                                    
                                }else if(question.Answer__c == false){
                                    question.Answer__c = 'false';
                                }
                            }*/                            
                            
                            if(fieldType == 'BOOLEAN'){
                                answer = (answer)?"true":"false";
                            }else if(fieldType == 'MULTIPICKLIST'){
                                answer = question.SelectedMultiPickListValues__c;
                                if(answer != undefined)
                                    answer = answer.replace(new RegExp(',', 'gi'), ';')                                
                            }
                            
                            //set the answers to the questions which are not shown in the wizard to empty
                            if(question.Has_Condition__c === 'true' && apiName != 'Id'){
                                if(fieldType == 'BOOLEAN')
                                    answer = "false";
                                else
                                    answer = '';
                            }
                            
                            if(dataView == undefined || dataView == 'Single Record View'){
                                if(answer != undefined){                
                                    if(questionAnsMapByObj[parentNObjectNamekey]){
                                        var myMap1  = questionAnsMapByObj[parentNObjectNamekey];
                                        myMap1[apiName] = answer;
                                        questionAnsMapByObj[parentNObjectNamekey] = myMap1; 
                                    }else{
                                        var myMap = {};                       
                                        myMap[apiName] = answer;
                                        questionAnsMapByObj[parentNObjectNamekey] = myMap;                         
                                    }                
                                }
                            }else{
                                if(answer != null && answer != '')
                                    childRecordsMap[apiName] = answer;	    
                            }
                        }
                        
                        if(dataView == 'Multiple Record View'){
                            if(recordsMapByObject[parentNObjectNamekey]){
                                var childRecordsListExt = recordsMapByObject[parentNObjectNamekey];
                                childRecordsListExt.push(childRecordsMap);
                                recordsMapByObject[parentNObjectNamekey] = childRecordsListExt;    
                            }else{
                                childRecordsList.push(childRecordsMap);
                                recordsMapByObject[parentNObjectNamekey] = childRecordsList;    
                            }                          
                        }                        
                    }
                }
            }
        }
        
        for (var parentNObjectNamekey in questionAnsMapByObj){ 
            var questionsWithAnswerMap = questionAnsMapByObj[parentNObjectNamekey];
            if(recordsMapByObject[parentNObjectNamekey]){
                var recordsListExt = recordsMapByObject[parentNObjectNamekey];
                recordsListExt.push(questionsWithAnswerMap);
                recordsMapByObject[parentNObjectNamekey] = recordsListExt;    
            }else{
                var recordsList = new Array();     
                recordsList.push(questionsWithAnswerMap);
                recordsMapByObject[parentNObjectNamekey] = recordsList;    
            }                      
        }
        
        console.log('recordsMapByObject after..'+JSON.stringify(recordsMapByObject));
        
        for (var parentNObjectNamekey in recordsMapByObject){ 
            var recordsList = recordsMapByObject[parentNObjectNamekey];
            for(var i = 0 ; i < recordsList.length; i++){
                var questionsWithAnswerMap = recordsList[i];
                console.log('parentNObjectNamekey..'+parentNObjectNamekey+'..questionsWithAnswerMap..'+JSON.stringify(questionsWithAnswerMap));
                var parentNObjectNamekeyArray = parentNObjectNamekey.split(':');
                console.log('parentNObjectNamekeyArray..'+parentNObjectNamekeyArray);
                var objectName = parentNObjectNamekeyArray[0]
                console.log('objectName..'+objectName);
                var parentObjectName = parentNObjectNamekeyArray[1]
                console.log('parentObjectName..'+parentObjectName);
                
                if(parentObjectName == 'Related_Deal_Request__c')
                    parentObjectName = 'Deal_Request__c';

                console.log('parentObjectName after..'+parentObjectName);
                
                var action = component.get("c.saveWizardData");
                action.setParams({ 
                    recordId : recordId,
                    objectName : objectName,
                    parentObjectName : parentObjectName,
                    questionsWithAnswerMap : questionsWithAnswerMap,
                    recordsMapByObject : recordsMapByObject,
                    draftId : draftId
                });                
                action.setCallback(this, function(response){
                    var state = response.getState();
                    if (state === "SUCCESS"){
                        console.log(objectName+'..globalSaveToDB SUCCESS..');                      
                        var showToast = $A.get('e.force:showToast');
                        showToast.setParams({
                            'title': 'Dynamic Wizard',
                            'type': 'success',
                            'message': 'Data Saved Successfully.', });            
                        showToast.fire();
                        $A.util.addClass(component.find("spinner"), "slds-hide"); 
                    }else if (state === "ERROR") {
                        var errors = response.getError();
                        console.log(objectName+'..globalSaveToDB ERROR..'+errors);    
                        $A.util.addClass(component.find("spinner"), "slds-hide"); 
                    }
                });
                $A.enqueueAction(action);                
            }
        }       
        
        if(questionChildRecordAdded)
            this.loadDynamicWizardData(component,event,helper,tabIdAfterSave + ":" + tabNameAfterSave,subTabIdAfterSave + ":" + subTabNameAfterSave);
    },
    
    createSaveAsDraftRecord : function(component, event){
        console.log('Inside saveAsDraft');
        
        var recordId = component.get("v.recordId");        
        var templateDraftId = component.get("v.saveAsDraftId");    
        var metaDataMap = component.get("v.metaDataMap");
        var saveAsDraftMap = component.get("v.saveAsDraftMap");                
        var tabId = component.get('v.tabId');
        var tabName = component.get('v.tabName');
        var subTabId = component.get('v.subTabId');
        var subTabName = component.get('v.subTabName');
        
        console.log('templateDraftId..'+templateDraftId+'..tabId:tabName..'+tabId+':'+tabName+'..subTabId:subTabName..'+subTabId+':'+subTabName);
        
        //to retain the state of the tab & subtabs when the user reloads the same record
        saveAsDraftMap['tab'] = tabId+':'+tabName;
        saveAsDraftMap['subTab'] = subTabId+':'+subTabName;
        
        for (var tabSubTabName in metaDataMap){
            if(tabSubTabName != 'Summary:Summary'){                
                var quesAnsMapList = metaDataMap[tabSubTabName]; 
                for(var i = 0 ; i < quesAnsMapList.length; i++){
                    var quesAnsMap = quesAnsMapList[i];
                    for (var apiNameKey in quesAnsMap){ 
                        var questionObj = quesAnsMap[apiNameKey]; 
                        saveAsDraftMap[apiNameKey] = questionObj.Answer__c; 
                    }
                }
            }
        }
        
        console.log('saveAsDraftMap ..'+JSON.stringify(saveAsDraftMap));
        
        var action = component.get("c.saveAsDraft");
        action.setParams({ 
            recordId : recordId,  
            templateDraftId : templateDraftId,
            saveAsDraftMap : saveAsDraftMap
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('saveAsDraft SUCCESS..'); 
                console.log('Return Draft Attachment record id..'+response.getReturnValue());                
                $A.util.addClass(component.find("spinner"), "slds-hide");
                var showToast = $A.get('e.force:showToast');
                showToast.setParams({
                    'title': 'Dynamic Wizard',
                    'type': 'success',
                    'message': 'Data Saved As Draft Successfully.', });            
                showToast.fire();
            }else if (state === "ERROR") {
                var errors = response.getError();
                console.log('saveAsDraft ERROR..'+errors); 
                $A.util.addClass(component.find("spinner"), "slds-hide"); 
            }
        });
        $A.enqueueAction(action);        
    },
    /*
Method Name : showOrHideDependentTabs
Comments    : This method is used to check the condition logic for dependent tab.
 */    
    showOrHideDependentTabs : function(component, event, dependentTabsConditionsMap){
        console.log('Inside showOrHideDependentTabs');
        console.log('dependentTabsConditionsMap..'+JSON.stringify(dependentTabsConditionsMap));
        var conditionalOperationsArray =  component.get("v.conditionalOperationsArray");
        var metaDataMap = component.get("v.metaDataMap");
        var selectedQuestionId = event.getParam("selectedQuestionId"); 
        var selectedAnswer = event.getParam("selectedAnswer");
        var conditionalColumvalue = false;
        var conditionalCheckResp;
        var conditionResultsTabsMap = {};
        var conditionalOperationsArray = component.get("v.conditionalOperationsArray");
        
        if(conditionalOperationsArray == null || conditionalOperationsArray == undefined || conditionalOperationsArray == ''){
            //this.loadConditionalOperations(component, event);
            var comparatorCmp = component.find("comparatorCmp");
            comparatorCmp.loadConditionalOperations(function(conditionalOperations) {
                component.set("v.conditionalOperationsArray",conditionalOperations);
            });            
        }
        conditionalOperationsArray =  component.get("v.conditionalOperationsArray");
        
        for(var dependentTabsConditionsMapKey in dependentTabsConditionsMap){
            var depQuestionConditionList = dependentTabsConditionsMap[dependentTabsConditionsMapKey];
            console.log('depQuestionConditionList..'+JSON.stringify(depQuestionConditionList));
            if(depQuestionConditionList != null && depQuestionConditionList.length > 0){                
                for(var i = 0; i < depQuestionConditionList.length; i++){
                    var dependentQuesId = depQuestionConditionList[i].Dependent_Question__c; 
                    var conditionOperator = depQuestionConditionList[i].Conditional_Operaor__c;
                    var sequence = depQuestionConditionList[i].Sequence__c;   
                    var conditionVal = depQuestionConditionList[i].Condition_Value__c;
                    var tabSubTabName = depQuestionConditionList[i].Dependent_Tabs__r.Tab_Name__c + ':' + depQuestionConditionList[i].Dependent_SubTab__r.SubTab__c;
                    var tabId = depQuestionConditionList[i].Tab__c;
                    
                    if(i == 0){
                        conditionalColumvalue = depQuestionConditionList[i].Tab__r.Conditional_Logic__c;    
                    }
                    console.log('tabSubTabName...'+tabSubTabName+'..tabId...'+tabId+'dependentQuesId...'+dependentQuesId+'conditionOperator...'+conditionOperator+'sequence...'+sequence+'conditionVal'+conditionVal);
                    
                    var questionsAnsList = metaDataMap[tabSubTabName];
                    for(var j = 0; j < questionsAnsList.length; j++){
                        var questionsMap = questionsAnsList[j];
                        for (var questionsMapKey in questionsMap){
                            var questionObj = questionsMap[questionsMapKey]; 
                            var quesId = questionObj.Id;
                            var answer = questionObj.Answer__c;
                            if(quesId == selectedQuestionId){
                                answer = selectedAnswer;
                                if(questionObj.Field_Type__c === 'BOOLEAN')
                                    answer = (selectedAnswer)?"true":"false"; 
                                questionObj.Answer__c = answer;   
                            }  
                            if(quesId == dependentQuesId){
                                answer = questionObj.Answer__c;
                                conditionalCheckResp = conditionalOperationsArray[0][conditionOperator](answer,conditionVal);
                                console.log('Label..'+questionObj.Question_Label__c+'..answer..'+answer+'..conditionalCheckResp..'+conditionalCheckResp);
                                break;
                            }   
                        }
                    }
                    
                    if(conditionalCheckResp == true)
                        conditionalColumvalue = conditionalColumvalue.replace(depQuestionConditionList[i].Sequence__c,'true');    
                    else
                        conditionalColumvalue = conditionalColumvalue.replace(depQuestionConditionList[i].Sequence__c,'false'); 
                    
                    console.log('conditionalColumvalue..'+conditionalColumvalue);
                }
                // Calling helper method for condition evaluation which returns boolean based on the conditionalColumvalue
                //var conditionResult = this.evaluateFinalCondition(component, event, conditionalColumvalue); 
                var conditionResult = "";
                var evaluateFinalConditionCmp = component.find("evaluateFinalConditionCmp");
                evaluateFinalConditionCmp.evaluateFinalCondition(conditionalColumvalue, function(reslt) {
                    conditionResult = reslt;
                });                 
                conditionResultsTabsMap[tabId] = conditionResult;
                console.log('conditionResult..'+conditionResult);
            } 
        }
        console.log('conditionResultsTabsMap..'+JSON.stringify(conditionResultsTabsMap));
        
        var tabsList = component.get("v.tabList");
        for(var k = 0; k < tabsList.length; k++){
            var tabObj = tabsList[k];
            var tabId = tabObj.Id                
            if((conditionResultsTabsMap[tabId] === 'true') || selectedAnswer === '--None--'){
                tabObj.Has_Condition__c = false;
            }else{
                if(conditionResultsTabsMap[tabId] != undefined)
                    tabObj.Has_Condition__c = true;  
            }    
            
        }                        
        component.set("v.tabList", tabsList);     
    },
    /*
     Method Name : loadUserProfile
     Comments    : This method is used to getting current user profile.
    */     
    loadLoggedInUserProfile : function(component, event, helper) {
        console.log('Inside loadLoggedInUserProfile..');   
        var action = component.get('c.getLoggedInUserProfile');
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                var userProfile = response.getReturnValue();
                component.set('v.userProfile',userProfile);
            }
        });
        $A.enqueueAction(action);
    },
    /*
     Method Name : matchProfile
     Comments    : This method is used to getting current users matched profiles.
    */     
    matchProfile : function(component, obj) {
        console.log('Inside matchProfile..');
        var profileIds = obj.ProfileId__c;
        var loggedInUserProfileId = component.get('v.userProfile');        
        obj.profileMatch = false;
        
        if(profileIds !== undefined){
            var profileIdsArray = profileIds.split(",");
            for(var i = 0; i< profileIdsArray.length; i++){
                var profileId = profileIdsArray[i]; 
                if(profileId === loggedInUserProfileId){
                    obj.profileMatch = true;
                    break;
                }
            }
        }
    },
    /*
     Method Name : validateAllQuestions
     Comments    : This method is used to validate all Question's answers when Submit button is clicked.
    */     
    validateAllQuestions : function(component, event) {
        console.log('Inside validateAllQuestions..');
        var validationsCmp = component.find("validationsCmp");
        var displayErrorMessage = '';        
        var metaDataMap = component.get("v.metaDataMap");        
        var tabsSubTabsMap = component.get("v.tabsSubTabsMap");
        var tabsList = component.get("v.tabList");
		var tabName, tabHasCondition = false;
        var subTabHasCondition, errSectionName, errSectionAdded = false;
        for(var tabsNameKey in tabsSubTabsMap){
			//Check for Tab Has Condition
			tabHasCondition = false;
			for(var index in tabsList){
				tabName = tabsList[index].Tab_Name__c;
				if(tabName == tabsNameKey){
					tabHasCondition = tabsList[index].Has_Condition__c;
					break;
				}         
			}
			if(!tabHasCondition){			
				var subTabsList = tabsSubTabsMap[tabsNameKey];
				for(var j = 0; j < subTabsList.length; j++){
                    errSectionAdded = false;displayErrorMessage = "";
					var subTab = subTabsList[j];
					subTabHasCondition = subTab.Has_Condition__c;
					if(!subTabHasCondition){
						var subTabName = subTab.SubTab__c;
						var dataView = subTab.Data_View__c;
						console.log('dataView..'+dataView);
						console.log('key..'+tabsNameKey+':'+subTabName);
						if(tabsNameKey+':'+subTabName != 'Summary:Summary'){                    
							var quesAnsMapList = metaDataMap[tabsNameKey+':'+subTabName];
							console.log('quesAnsMapList Length..'+quesAnsMapList.length);
							console.log('quesAnsMapList ..'+JSON.stringify(quesAnsMapList));
							
							var childRecordsList = new Array();                    
							for(var i = 0 ; i < quesAnsMapList.length; i++){
								var tabSubTabQuestionAnsMap = quesAnsMapList[i];
								for (var tabSubTabQuestionAnsMapKey in tabSubTabQuestionAnsMap){
									var questionObj = tabSubTabQuestionAnsMap[tabSubTabQuestionAnsMapKey];
									if(!questionObj.Has_Condition__c){
										validationsCmp.validation('',questionObj, function(result){
											//var result = result;
                                            if(result != ""){
                                                if(!errSectionAdded){
                                                    errSectionAdded = true;
                                                    errSectionName = tabName + ":" + subTabName;
                                                    displayErrorMessage = (displayErrorMessage == "" ? "[" + errSectionName + "] " : displayErrorMessage + " :: " + "[" + errSectionName + "] "); 
                                                }
                                            }
											displayErrorMessage += result;
											//component.set("v.errorMessage",displayErrorMessage);
										});                        
									}
								}				
							}
                            //show Toast Message for each subtab
                            if(errSectionAdded){
                                
                            }
                            if(displayErrorMessage != ""){
                                var showToast = $A.get('e.force:showToast');
                                showToast.setParams({
                                    'mode': 'sticky',
                                    'title': 'Missing Validations',
                                    'type': 'error',
                                    'message': displayErrorMessage, });            
                                showToast.fire();
                                $A.util.addClass(component.find("spinner"), "slds-hide");           
                            }                            
						}
					}
				}				
			}
        }
        component.set("v.errorMessage",displayErrorMessage);
    },    
    /*
     Method Name : setTabOrientation
     Comments    : This method is used to dynamically change the Orientation of the Tab.
    */     
    setTabOrientation : function(component, event){
        $A.util.addClass(component.find("kanban"), "slds-m-bottom_small");                
        //which layout
        switch(component.get("v.tabOrientation")){
            case "Left":
                $A.util.addClass(component.find("divContainer"), "slds-grid");
                component.set("v.menuType","Vertical");
                $A.util.addClass(component.find("divNavigation"), "slds-p-right_small");                 
                break;                
            case "Right":
                $A.util.addClass(component.find("divContainer"), "slds-grid"); 
                $A.util.addClass(component.find("divContainer"), "slds-grid_reverse");
                component.set("v.menuType","Vertical");
                $A.util.addClass(component.find("divContent"), "slds-p-right_small");                 
                break;
            case "Top":
                component.set("v.menuType","Horizontal");
                $A.util.addClass(component.find("divContainer"), "slds-m-top_large");
                $A.util.addClass(component.find("divContent"), "customNegativeXSmallMargin");                
                break;
            case "Bottom":
                $A.util.addClass(component.find("divContainer"), "slds-grid");
                $A.util.addClass(component.find("divContainer"), "slds-grid_vertical-reverse");                
                component.set("v.menuType","Horizontal");
                $A.util.addClass(component.find("divContent"), "slds-m-bottom_small");
                break;                
        }

        var menuType = component.get("v.menuType");
        //which menu
        switch(menuType){
            case "Vertical": 
                $A.util.addClass(component.find("divNavigation"), "slds-col");
                $A.util.addClass(component.find("divNavigation"), "slds-size--1-of-6");
                $A.util.addClass(component.find("divContent"), "slds-col");
                $A.util.addClass(component.find("divContent"), "slds-size--5-of-6");                
                break;
        }
    }    
})