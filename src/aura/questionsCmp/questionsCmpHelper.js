({
    loadQuestions : function(component, event, helper, reload){
        console.log('Inside loadQuestions'+reload);
        var questionsProfileSetttingsMap = component.get("v.questionsProfileSetttingsMap"); 
        var loggedInUserProfileId = component.get('v.userProfile');
        console.log('userProfile..'+loggedInUserProfileId+'..loadQuestions questionsProfileSetttingsMap..'+JSON.stringify(questionsProfileSetttingsMap));            
        var tabName = component.get("v.tabName");
        var subTabName = component.get("v.subTabName");
        var tabSubTabName = tabName+':'+subTabName;
        var questionsListInkeyValFormat = [];        
        var questionsMap = {};        
        var questionsList;
        if(!reload)
            this.evalDepQuestionsConditionsOnLoad(component, event, tabSubTabName);              
        
        var metaDataMap = component.get("v.metaDataMap");        
        var quesAnsMapList = metaDataMap[tabSubTabName];
        //console.log('quesAnsMapList length..'+quesAnsMapList.length);
        console.log('tabSubTabName..'+tabSubTabName+'..quesAnsMapList..'+JSON.stringify(quesAnsMapList));
        console.log('metaDataMap after final update..'+JSON.stringify(metaDataMap));
        for(var i = 0 ; i < quesAnsMapList.length; i++){
            var questionsMap = quesAnsMapList[i];
            questionsList = new Array();            
            for (var questionsMapKey in questionsMap){
                var questionObj = questionsMap[questionsMapKey];
                console.log('questionObj ..In Load questions'+questionObj);

                if(questionObj.Has_Condition__c == false)
                    this.showOrHideQuestionBasedOnProfileAccess(component, questionObj, questionsProfileSetttingsMap, loggedInUserProfileId);
                
                if(questionObj.Field_Type__c == "BOOLEAN"){
                    if(questionObj.Answer__c == "true")                        
                        questionObj.Answer__c = true;                    
                    else
                        questionObj.Answer__c = false;
                }else if(questionObj.Field_Type__c == "DATE"){
                    var answer = questionObj.Answer__c;
                    if(answer != undefined){
                        var dateTimeArray = answer.split(" ");
                        questionObj.Answer__c = dateTimeArray[0];
                    }
                }
                questionsList.push(questionObj);
            }
            questionsListInkeyValFormat.push({value:questionsList, key:i});              
        }        
        
        this.getWizardDisplayLayoutTypeInfo(component);        
        this.setWizardLayoutCols(component,questionsListInkeyValFormat);        
        this.loadPickList(component, event, questionsList);
        //this.updateMetadataMapWithQuestionRecrdsDisplayed(component,event,questionsListInkeyValFormat);        
        
        var wizardDisplayLayoutType = component.get('v.wizardDisplayLayoutType');        
        if(wizardDisplayLayoutType === 'Table'){
            $A.util.addClass(component.find("formLayout"), "slds-hide");
            //this.initializeEditableQuestionsDatatable(component,event,questionsListInkeyValFormat);
        }else{
            $A.util.addClass(component.find("tabularLayout"), "slds-hide");
            component.set('v.questionsListInkeyValFormat',questionsListInkeyValFormat);
        }               
        console.log('Final Questions..'+JSON.stringify(component.get('v.questionsListInkeyValFormat')));       
    },
    
    evalDepQuestionsConditionsOnLoad : function(component, event, tabSubTabName){
        console.log('Inside evalDepQuestionsConditionsOnLoad');
        var metaDataMap = component.get("v.metaDataMap");        
        var depQuestionsConditionsMap = component.get("v.depQuestionsConditionsMapMaster");
        var depQuesIdAnsMap = {};       
        
        for(var depQuestionConditionMapkey in depQuestionsConditionsMap){
            var depQuestionConditionListMap = depQuestionsConditionsMap[depQuestionConditionMapkey];
            
            if(depQuestionConditionMapkey.includes("Show or Hide")){   
                this.loadDependentQuestionsForShowOrHide(component, event, depQuestionConditionListMap);
            }else if(depQuestionConditionMapkey.includes("Picklist Filtering")){
                this.loadDependentQuestionsForPicklistFilteringNPreDefaultNMandatory(component, event, depQuestionConditionListMap,'Picklist Filtering');
            }else if(depQuestionConditionMapkey.includes("PreDefault")){
                this.loadDependentQuestionsForPicklistFilteringNPreDefaultNMandatory(component, event, depQuestionConditionListMap,'PreDefault');
            }
        }
    },
    
    /*
Method Name : showOrHideQuestionBasedOnProfileAccess
Parameter   : questionObj,questionsProfileSetttingsMap,loggedInUserProfileId
Comments    : This method is used to render the question hide or show 
 */
    showOrHideQuestionBasedOnProfileAccess : function(component, questionObj, questionsProfileSetttingsMap, loggedInUserProfileId){  
        console.log('Inside showOrHideQuestionBasedOnProfileAccess');
        //console.log('questionObj..'+questionObj);
        var questionId = questionObj.Id;
        //console.log('questionId..'+questionId+'..questionObj.Field_API_Name__c..'+questionObj.Field_API_Name__c);
        var readOnly = false;
        var profileMatchFound = false;
        if(questionsProfileSetttingsMap[questionId]){
            var questionsProfileSetttingsMapList = questionsProfileSetttingsMap[questionId];
            for(var i = 0; i < questionsProfileSetttingsMapList.length; i++){
                var profileID = questionsProfileSetttingsMapList[i].Profile_ID__c;
                //console.log('profileID..'+profileID+'..loggedInUserProfileId..'+loggedInUserProfileId);
                //match the profiles returned in the list with the current user profile id
                if(profileID === loggedInUserProfileId){
                    profileMatchFound = true;
                    readOnly = questionsProfileSetttingsMapList[i].Read_Only__c;  
                    break;
                }
            }
        }
        //console.log('questionObj.Field_API_Name__c..'+questionObj.Field_API_Name__c+'..profileMatchFound..'+profileMatchFound+'..readOnly..'+readOnly);
        
        if(profileMatchFound){
            //console.log('Inside profileMatchFound');
            questionObj.Has_Condition__c = false;
            questionObj.Read_Only__c = readOnly;
        }else{
            questionObj.Has_Condition__c = true;
        }     
    },
    
    getWizardDisplayLayoutTypeInfo : function(component){  
        console.log('Inside getWizardDisplayLayoutTypeInfo');
        var wizardDisplayLayoutType;
        var formLayoutCols;
        var formLayout;
        var dataView;
        var tabsSubTabsMap = component.get("v.tabsSubTabsMap");
        var tabName = component.get("v.tabName");
        var subTabName = component.get('v.subTabName');
        var subTabsMap = tabsSubTabsMap[tabName];
        var subTabFieldApiName, subTabFilteringValue; 
        
        for(var cnt = 0; cnt <= subTabsMap.length; cnt++){
            var subTabObj = subTabsMap[cnt];
            if(subTabObj.SubTab__c == subTabName){
                //formLayout = subTabObj.Form_Layout__c;
                formLayout = subTabObj.Layout_Type__c;
                formLayoutCols = subTabObj.Form_Type__c;
                dataView = subTabObj.Data_View__c;
                subTabFieldApiName = subTabObj.Field_API_Name__c;
                subTabFilteringValue = subTabObj.Filtering_Value__c;
                break;
            }                
        }
        
        switch(formLayout){
            case "Form Layout" : wizardDisplayLayoutType = 'Form';
                break;
            case "Tabular Layout" : wizardDisplayLayoutType = 'Table';               
        }
        
        console.log('formLayout..'+formLayout+'..formLayoutCols..'+formLayoutCols+'..wizardDisplayLayoutType..'+wizardDisplayLayoutType);
        
        component.set('v.wizardDisplayLayoutType',wizardDisplayLayoutType);
        component.set('v.formLayoutCols',formLayoutCols);        
        component.set('v.dataView',dataView);
        component.set('v.subTabFieldApiName',subTabFieldApiName);
        component.set('v.subTabFilteringValue',subTabFilteringValue);        
    },
    
    setWizardLayoutCols : function(component,questionsListInkeyValFormat){
        console.log('Inside setWizardLayoutCols');                     
        var formLayoutCols = component.get('v.formLayoutCols');        
        formLayoutCols = (formLayoutCols == "One" ? "1" : "2");
        //Added for childCmp through Tabular Layout
        if(formLayoutCols == undefined || formLayoutCols == "" || formLayoutCols == null)
            formLayoutCols = "2";
        var cssClasses = "slds-grid mainQuestionContainer slds-grid_reverse slds-p-horizontal--small  slds-m-bottom--small" + " slds-size--1-of-" + formLayoutCols + " slds-large-size--1-of-" + formLayoutCols + " slds-medium-size--1-of-" + formLayoutCols + " slds-small-size--1-of-" + formLayoutCols;
        questionsListInkeyValFormat.forEach(function(questionList){
            questionList.CssClasses = cssClasses;  
        });         
    },
    
    /* Method Name: initializeQuestionsDatatable
     * Comments : This method sets the attributes required for Questions Datatable and initializes it.
     */    
    initializeQuestionsDatatable :function(component,event,questionsListForDisplay){
        console.log('initializeQuestionsDatatable');
        console.log(questionsListForDisplay);
        debugger;
        
        var subTabFieldApiName  = component.get('v.subTabFieldApiName');
        var subTabFilteringValue = component.get('v.subTabFilteringValue');        
        
        var wizardQuestionColumnsList = [];
        var wizardQuestionList = [];        
        var questionColumn, questionRow, questionLabel, questionName, questionValue, questionFilteringVal;
        //For DataTable Header
        var firstRecord = questionsListForDisplay[Object.keys(questionsListForDisplay)[0]];            
        firstRecord.value.forEach(function(questionObj){
            questionColumn = {};
            if(questionObj.Field_API_Name__c != "Id"){
                if(!questionObj.Has_Condition__c){
                    questionLabel =	questionObj.Question_Label__c;
                    questionColumn["label"] = questionLabel;
                    questionColumn["name"] = questionLabel.replace(/ /g,"_");	
                    questionColumn["value"] = "string";
                    wizardQuestionColumnsList.push(questionColumn);
                }
            }
        });
        //For DataTable Rows
        var dataExist = false;
        var insertRowFlag;
        var recordId;
        questionsListForDisplay.forEach(function(questionList){
            questionRow = {};
            insertRowFlag = false;
            questionFilteringVal = '';
            questionValue = '';            
            questionList.value.forEach(function(questionObj,count){
                if(subTabFilteringValue != undefined && subTabFilteringValue != null && subTabFilteringValue != ""){
                    if(questionObj.Field_Type__c == "REFERENCE")
                        questionFilteringVal =	questionObj.LookUpName__c;
                    else
                        questionFilteringVal =	questionObj.Answer__c;                    
                    
                    if(questionObj.Field_API_Name__c == subTabFieldApiName){
                        //if(questionObj.LookUpName__c == subTabFilteringValue){
                        if(questionFilteringVal == subTabFilteringValue){                        
                            insertRowFlag = true;
                        }
                    }
                }else
                    insertRowFlag = true;
                if(questionObj.Field_API_Name__c != "Id"){
                    if(questionObj.Field_Type__c == "REFERENCE")
                        questionValue =	questionObj.LookUpName__c;
                    else
                        questionValue =	questionObj.Answer__c;                    
                    if(!questionObj.Has_Condition__c){
                        questionLabel =	questionObj.Question_Label__c;
                        //questionValue =	questionObj.Answer__c;
                        if(questionValue == null || questionValue == undefined || questionValue == '')
                            questionValue = '';                            
                        else                           
                            dataExist = true;                        
                        questionRow[questionLabel.replace(/ /g,"_")] = questionValue;
                    }
                }
            });
            //For generating Sequence No
            
            if(insertRowFlag){
                console.log('Sequence Id..'+questionList.key);
                questionRow["Id"] = parseInt(questionList.key);
                wizardQuestionList.push(questionRow);
            }
        });
        //Update all records with Sequence Nos
        //component.set('v.questionsListInkeyValFormat',questionsListForDisplay);        
        console.log('dataExist..'+dataExist);
        var wizardQuestionConfigurationMap = {};
        if(dataExist){
            wizardQuestionConfigurationMap = 
                {
                //"searchBox":true,
                //"searchByColumn":false,
                //"itemsPerPage":5,
                "rowAction":
                [
                    {
                        "label":"Edit",
                        "type":"url",
                        "id":"editQuestion"
                    },
                    {
                        "label":"Delete",
                        "type":"url",
                        "id":"deleteQuestion"
                    }                    
                ]   
            };
        }
        //Initialize Questions Datatable
        var questionTable = component.find("wizardQuestionListTable");
        component.set('v.wizardQuestionColumnsList',wizardQuestionColumnsList);                    
        component.set('v.wizardQuestionList',wizardQuestionList);
        component.set('v.wizardQuestionConfigurationMap',wizardQuestionConfigurationMap);                    
        if(questionTable != undefined && questionTable != null && questionTable != "")
            questionTable.initialize({"order":[]});                    
    },
    
    /* Method Name: updateMetadataMapWithQuestionRecrdsDisplayed
     * Comments : This method updates the metadataMap with questionRecords to be displayed.
     */    
    updateMetadataMapWithQuestionRecrdsDisplayed :function(component,event,questionsListForDisplay){
        console.log('updateMetadataMapWithQuestionRecrdsDisplayed');
        console.log(questionsListForDisplay);
        debugger;
        
        var subTabFieldApiName  = component.get('v.subTabFieldApiName');
        var subTabFilteringValue = component.get('v.subTabFilteringValue');        
        
        var wizardQuestionColumnsList = [];
        var wizardQuestionList = []      
        var questionColumn, questionRow = [], questionLabel, questionName, questionValue, questionFilteringVal, questionRowObj = {}, questionRecordId;
        //For DataTable Header
        var firstRecord = questionsListForDisplay[Object.keys(questionsListForDisplay)[0]];            
        firstRecord.value.forEach(function(questionObj){
            questionColumn = {};
            if(questionObj.Field_API_Name__c != "Id"){
                if(!questionObj.Has_Condition__c){
                    questionLabel =	questionObj.Question_Label__c;
                    questionColumn["label"] = questionLabel;
                    questionColumn["name"] = questionLabel.replace(/ /g,"_");	
                    questionColumn["value"] = "string";
                    wizardQuestionColumnsList.push(questionColumn);
                }
            }
        });
        //For DataTable Rows
        var dataExist = false;
        var insertRowFlag;
        var recordId;
        var rwIndex = 0;
        var questionOrgRecordIndexInserted = [];
        questionsListForDisplay.forEach(function(questionList,cntRw){
            questionRow = [];
            insertRowFlag = false;
            questionFilteringVal = '';
            questionValue = '';
            questionRecordId = '';            
            questionList.value.forEach(function(questionObj,count){
				questionRowObj = {};
                if(subTabFilteringValue != undefined && subTabFilteringValue != null && subTabFilteringValue != ""){
                    if(questionObj.Field_Type__c == "REFERENCE")
                        questionFilteringVal =	questionObj.LookUpName__c;
                    else
                        questionFilteringVal =	questionObj.Answer__c;                    
                    
                    if(questionObj.Field_API_Name__c == subTabFieldApiName){
                        //if(questionObj.LookUpName__c == subTabFilteringValue){
                        if(questionFilteringVal == subTabFilteringValue){                        
                            insertRowFlag = true;
                        }
                    }
                }else
                    insertRowFlag = true;
                
                //if(questionObj.Field_API_Name__c != "Id"){
                    if(questionObj.Field_Type__c == "REFERENCE")
                        questionValue =	questionObj.LookUpName__c;
                    else
                        questionValue =	questionObj.Answer__c; 
                    console.log('questionValue'+questionValue);
                    //if(!questionObj.Has_Condition__c){
                        questionLabel =	questionObj.Question_Label__c;
                        if(questionValue == null || questionValue == undefined || questionValue == '')
                            questionValue = '';                            
                        else                           
                            dataExist = true;                        

                        questionRowObj["Id"] = questionObj.Id;
                        questionRowObj["Question_Label__c"] = questionLabel;
                        questionRowObj["Answer__c"] = questionValue;
                        questionRowObj["Field_Type__c"] = questionObj.Field_Type__c;
                        questionRowObj["Help_Text__c"] = questionObj.Help_Text__c;                        
                        questionRowObj["Has_Condition__c"] = questionObj.Has_Condition__c;
                        questionRowObj["IsMandatory__c"] = questionObj.IsMandatory__c;
                        questionRowObj["Lower_Value_Limit__c"] = questionObj.Lower_Value_Limit__c;
                        questionRowObj["Higher_Value_Limit__c"] = questionObj.Higher_Value_Limit__c;
                        questionRowObj["Read_Only__c"] = questionObj.Read_Only__c;
                        questionRowObj["Size__c"] = questionObj.Size__c;
                        questionRowObj["Input_Pattern__c"] = questionObj.Input_Pattern__c;
                        questionRowObj["Values__c"] = questionObj.Values__c;
                        questionRowObj["Object_API_Used_for_Lookup__c"] = questionObj.Object_API_Used_for_Lookup__c;
                        questionRowObj["Object_API_Name__c"] = questionObj.Object_API_Name__c;
                        questionRowObj["Parent_Object_API_Name__c"] = questionObj.Parent_Object_API_Name__c;                        
                        questionRowObj["SubTab1__c"] = questionObj.SubTab1__c;
                        questionRowObj["Sequence__c"] = questionObj.Sequence__c;
                        questionRowObj["Decimal__c"] = questionObj.Decimal__c;
                        questionRowObj["Dependent_Question__c"] = questionObj.Dependent_Question__c;
                        questionRowObj["Dependent_Subtab__c"] = questionObj.Dependent_Subtab__c;
                        questionRowObj["Has_Dependency__c"] = questionObj.Has_Dependency__c;
                        questionRowObj["LookUpName__c"] = questionObj.LookUpName__c;
                        questionRowObj["Number_Data_Val__c"] = questionObj.Number_Data_Val__c;
                        questionRowObj["Input_Placeholder__c"] = questionObj.Input_Placeholder__c;
                         if(questionObj.Field_API_Name__c == "Id"){
                            questionRecordId = questionObj.Answer__c;; 
                         }
                        questionRow.push(questionRowObj);
                    //}
                /*}else{
                    //For record deletion
                    if(questionObj.Has_Condition__c){
                        questionRecordId = questionObj.Answer__c; 
                        console.log('questionRecordId'+questionRecordId);
                    }
                }*/
            });
            
            if(insertRowFlag){
                console.log('Sequence Id..'+questionList.key);
                questionRow["Id"] = parseInt(questionList.key);
                questionRow["orgRecordIndex"] = cntRw;
                questionOrgRecordIndexInserted.push(cntRw);
                questionRow["formattedRecordIndex"] = rwIndex;                
                questionRow["questionRecordId"] = questionRecordId;
                questionRow["questionRecordIdAndIndex"] = questionRecordId + ":" + rwIndex;
                wizardQuestionList.push(questionRow);
                rwIndex++;
            }
        });
       
        console.log('dataExist..'+dataExist);

        //Delete from metadataMap for handling Subtab FilteringValue and FieldApiName scenario
        if(subTabFilteringValue != undefined && subTabFilteringValue != null && subTabFilteringValue != ""){
            var tabName = component.get("v.tabName");
            var subTabName = component.get("v.subTabName");
            var tabSubTabName = tabName + ":" + subTabName;               
            var metaDataMap = component.get("v.metaDataMap");        
            var quesAnsMapList = metaDataMap[tabSubTabName];
            var questionRecordMap = [];
            quesAnsMapList.forEach(function(questionRecord,index){
                if(questionOrgRecordIndexInserted.indexOf(index) != -1)
                    questionRecordMap.push(questionRecord);
            });
            metaDataMap[tabSubTabName] = questionRecordMap;
            component.set("v.metaDataMap",metaDataMap);
        }
        
        component.set('v.wizardQuestionColumnsList',wizardQuestionColumnsList);                    
        component.set('v.wizardQuestionList',wizardQuestionList);
    },    
    
    loadPickList:function(component,event,questionObjList){
        //console.log('Inside loadPickList..');
        var pickListDataList = [];
        
        for(var i = 0;i < questionObjList.length; i++){ 
            
            var questionObject = questionObjList[i];     
            if(questionObject.Field_Type__c == "PICKLIST"){
                
                var pickListData;
                if(questionObject.Picklist_Filtering__c != null && questionObject.Picklist_Filtering__c != '')
                    pickListData = questionObject.Picklist_Filtering__c;
                else
                    pickListData = questionObject.Values__c;
                
                var pickListValues = [];
                if(pickListData != null && pickListData != ''){
                    pickListValues.push(pickListData.split(","));
                    for(var j = 0;j < pickListValues.length; j++){
                        
                        pickListDataList.push({value:pickListValues[j], key:questionObject.Question_Label__c});
                    }
                }     
            }   
        }
        // console.log('pickListDataList..'+JSON.stringify(pickListDataList));
        component.set("v.pickListDataList", pickListDataList);
    },
    
    transformAndPassValuesToParentComponents : function(component,event){
        console.log('Inside transformAndPassValuesToParentComponents');
        //Attributes for Validation start
        var displayErrorMessage = '';
        var validationsCmp = component.find("validationsCmp");
        //Attributes for Validation end
        var params = event.getParam('arguments');                
        var tabsSubTabsMap = params.tabsSubTabsMap;        
        var isGlobalTab = params.isGlobalTab;
        var isSubValue = params.isSubTab;
        var saveAsDraft = params.saveAsDraft;
        var globalSave = params.globalSave;        
        var metaDataMap = component.get("v.metaDataMap");
        var questionsProfileSetttingsMap = component.get("v.questionsProfileSetttingsMap"); 
        var userProfile = component.get("v.userProfile");         
        
        console.log('Before metaDataMap..'+JSON.stringify(metaDataMap));    
        console.log('userProfile..'+userProfile+'..transform questionsProfileSetttingsMap..'+JSON.stringify(questionsProfileSetttingsMap));    
        
        if(tabsSubTabsMap == null || tabsSubTabsMap == undefined)
            tabsSubTabsMap = component.get("v.tabsSubTabsMap");
        
        var tabId = component.get("v.tabId");        
        var tabName = component.get("v.tabName");        
        var subTabId = component.get("v.subTabId");        
        var subTabName = component.get("v.subTabName");
        var textboxValues = component.find('answer');
        var formDataMap = {};
        var formValArray = new Array();
        
        console.log('isGlobalTab..'+params.isGlobalTab+'..isSubValue..'+params.isSubTab+'..saveAsDraft..'+params.saveAsDraft+'..globalSave..'+params.globalSave);
        console.log('tabId..'+tabId+'..tabName..'+tabName+'..subTabId..'+subTabId+'..subTabName..'+subTabName);
        
        
        if(textboxValues != undefined && textboxValues.length > 0){            
            for (var i = 0; i < textboxValues.length; i++){
                formValArray.push(textboxValues[i].get("v.value"));
            }
        }
        
        if(formValArray != undefined && formValArray.length > 0){            
            var quesAnsMapList = metaDataMap[tabName+':'+subTabName];            
            var count = 0;
            for(var j = 0; j < quesAnsMapList.length; j++){            
                var quesAnsMap = quesAnsMapList[j];                        
                for (var quesAnsMapKey in quesAnsMap){
                    var questionObj = quesAnsMap[quesAnsMapKey];        
                    var showOnScreen = questionObj.Has_Condition__c;
                    if(showOnScreen == true){
                        formValArray.splice(count, 0,'hidden');                
                    }
                    count++;
                }
            }            
            console.log('formValArray.. question cmp..'+JSON.stringify(formValArray)); 
            var errorMessage='';          
            count = 0;
            for(var i = 0 ; i < quesAnsMapList.length; i++){            
                var tabSubTabQuestionAnsMap = quesAnsMapList[i];
                for (var tabSubTabQuestionAnsMapKey in tabSubTabQuestionAnsMap){
                    var questionObj = tabSubTabQuestionAnsMap[tabSubTabQuestionAnsMapKey]; 
                    var selectedAns = formValArray[count];                
                    
                    if(questionObj.Field_Type__c != 'REFERENCE' && questionObj.Field_Type__c != 'MULTIPICKLIST' && selectedAns != undefined && selectedAns != 'hidden')                         
                        questionObj.Answer__c = selectedAns; 
                    
                    if(questionObj.Field_Type__c === 'BOOLEAN' && selectedAns != undefined && selectedAns != 'hidden')
                        questionObj.Answer__c = (selectedAns)?"true":"false";                     
                    
                    tabSubTabQuestionAnsMap[tabSubTabQuestionAnsMapKey] = questionObj;
                    if(questionObj.Field_API_Name__c != 'Id')
                        formDataMap[questionObj.Field_API_Name__c] = questionObj.Answer__c;
                    count ++;
                    
                    if(!questionObj.Has_Condition__c && !globalSave){
                        validationsCmp.validation('',questionObj, function(result){
                            var result = result;
                            displayErrorMessage += result;
                            component.set("v.errorMessage",displayErrorMessage);
                        });                        
                    }
                }
                quesAnsMapList[i] = tabSubTabQuestionAnsMap;          
            }
            //Code for Showing error message start
            var errorMessage = component.get("v.errorMessage");
            var validationError = false;
            if(errorMessage != null && errorMessage != '' && errorMessage != undefined && !globalSave){
                var showToast = $A.get('e.force:showToast');
                showToast.setParams({
                    'title': 'Validations are missing',
                    'type': 'error',
                    'message': errorMessage, });            
                showToast.fire();          
                component.set("v.errorMessage",'');
                validationError = true;
            }    
            
            console.log('formDataMap.. question cmp..'+JSON.stringify(formDataMap));
            metaDataMap[tabName+':'+subTabName] = quesAnsMapList; 
            component.set("v.formDataMap",formDataMap);          
        }
        
        console.log('Updated metaDataMap..'+JSON.stringify(metaDataMap));        
        
        component.set("v.metaDataMap",metaDataMap);                
        metaDataMap = component.get("v.metaDataMap");            
        var questionChildRecordAdded = component.get("v.questionChildRecordAdded");        
        var dataCommuEvnt = component.getEvent("dataCommuEvnt");        
        dataCommuEvnt.setParams({isGlobalTab:isGlobalTab,
                                 isSubTab:isSubValue,
                                 saveAsDraft:saveAsDraft,
                                 globalSave:globalSave,
                                 tabId:tabId,
                                 tabName:tabName,
                                 subTabId:subTabId,
                                 subTabName:subTabName,
                                 metaDataMap:metaDataMap,    
                                 formDataMapForSummary:formDataMap,
                                 tabsSubTabsMap:tabsSubTabsMap,
                                 questionsProfileSetttingsMap:questionsProfileSetttingsMap,
                                 userProfile:userProfile,
                                 validationError : validationError,
                                 questionChildRecordAdded : questionChildRecordAdded
                                });        
        dataCommuEvnt.fire();        
    },
    /*
Method Name : loadDependentQuestionsForShowOrHide
Parameter   : dependentQuestionConditonList
Comments    : This method is used to render the question
 */
    loadDependentQuestionsForShowOrHide : function(component, event, depQuestionConditionListMap){      
        console.log('Inside loadDependentQuestionsForShowOrHide');
        var selectedQuestionId = '';
        var selectedAnswer = '';
        if(event.getSource().get("v.value") != undefined){
            selectedQuestionId = component.get("v.questionId");
            selectedAnswer = event.getSource().get("v.value");
        }
        var metaDataMap = component.get("v.metaDataMap");
        
        var conditionalOperationsArray = component.get("v.conditionalOperationsArray");    
        if(conditionalOperationsArray == null || conditionalOperationsArray == undefined || conditionalOperationsArray == ''){
            //this.loadConditionalOperations(component);
            var comparatorCmp = component.find("comparatorCmp");
            comparatorCmp.loadConditionalOperations(function(conditionalOperations) {
                component.set("v.conditionalOperationsArray",conditionalOperations);
            });            
        }
        conditionalOperationsArray = component.get("v.conditionalOperationsArray");    
        
        console.log('selectedQuestionId..'+selectedQuestionId+'..selectedAnswer..'+selectedAnswer); 
        
        for(var depQuestionConditionListMapkey in depQuestionConditionListMap){            
            var depQuestionConditionList = depQuestionConditionListMap[depQuestionConditionListMapkey];
            var conditionalColumvalue;
            var conditionalCheckResp = false;
            var tabSubTabName;
            var questionId;
            var tabSubTabNameList = [];   
            
            for(var i = 0; i < depQuestionConditionList.length; i++){
                var sequence = depQuestionConditionList[i].Sequence__c;
                var conditionVal = depQuestionConditionList[i].Condition_Value__c;
                var dependentQuesId = depQuestionConditionList[i].Dependent_Question__c;
                var conditionOperator = depQuestionConditionList[i].Conditional_Operaor__c;
                questionId = depQuestionConditionList[i].Question__c;
                
                tabSubTabName = depQuestionConditionList[i].Dependent_Tabs__r.Tab_Name__c + ':' + depQuestionConditionList[i].Dependent_SubTab__r.SubTab__c;
                if(i == 0)
                    conditionalColumvalue = depQuestionConditionList[i].Question__r.Conditional_Column__c;  
                
                console.log('questionId..'+questionId+'tabSubTabName..'+tabSubTabName+'dependentQuesId..'+dependentQuesId+'conditionOperator..'+conditionOperator+'sequence..'+sequence+'conditionVal..'+conditionVal);
                tabSubTabNameList.push(tabSubTabName);
                
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
                            var type =  questionObj.Field_Type__c;  
                            if(answer != undefined)
                                conditionalCheckResp = conditionalOperationsArray[0][conditionOperator](answer,conditionVal);
                            console.log('Question_Label__c..'+questionObj.Question_Label__c+'..answer..'+answer+'..conditionVal..'+conditionVal+'..conditionOperator..'+conditionOperator+'..conditionalCheckResp..'+conditionalCheckResp);                        
                            
                            if(questionObj.Has_Condition__c == true)
                                conditionalCheckResp = false;
                            break;
                        }    
                    }
                }
                
                
                if(conditionalCheckResp == true)
                    conditionalColumvalue = conditionalColumvalue.replace(sequence,'true');    
                else
                    conditionalColumvalue = conditionalColumvalue.replace(sequence,'false');                         
                
                console.log('conditionalCheckResp..'+conditionalCheckResp+'..sequence..'+sequence+'..conditionalColumvalue..'+conditionalColumvalue);                        
            }
            console.log('conditionalColumvalue..'+conditionalColumvalue);
            
            if(conditionalColumvalue != null && conditionalColumvalue != ''){
                // Calling helper method for condition evaluation, which returns boolean based on the conditionalColumvalue
                //var conditionResult= this.evaluateFinalCondition(component, event, conditionalColumvalue);
                var conditionResult = "";
                var evaluateFinalConditionCmp = component.find("evaluateFinalConditionCmp");
                evaluateFinalConditionCmp.evaluateFinalCondition(conditionalColumvalue, function(reslt) {
                    conditionResult = reslt;
                });                
                console.log('conditionResult..'+conditionResult);
                
                for(var tabSubTabNamesKey in metaDataMap){
                    var questionsAnsList = metaDataMap[tabSubTabNamesKey];
                    for(var l = 0; l < questionsAnsList.length; l++){
                        var questionsMap = questionsAnsList[l];
                        for (var questionsMapKey in questionsMap){
                            var questionObj = questionsMap[questionsMapKey];
                            var quesId = questionObj.Id;
                            var answer = questionObj.Answer__c;
                            
                            if(questionId == quesId){
                                if(conditionResult == 'true'){
                                    questionObj.Has_Condition__c = false;
                                }else{
                                    questionObj.Has_Condition__c = true;  
                                }     
                                console.log('Question_Label__c..'+questionObj.Question_Label__c+'..Has_Condition__c..'+questionObj.Has_Condition__c+'..answer..'+answer);
                                break;                                
                            }                                     
                        }
                    }                             
                    metaDataMap[tabSubTabNamesKey] = questionsAnsList;
                }                   
                //Resetting the metadatamap
                component.set("v.metaDataMap",metaDataMap); 
            }
        }
    },
    
    /*
Method Name : loadDependentQuestionsForPicklistFilteringNPreDefaultNMandatory
Parameter   : dependentQuestionConditonList
Comments    : This method is used to render the picklist & predefault values
 */
    loadDependentQuestionsForPicklistFilteringNPreDefaultNMandatory : function(component, event, depQuestionConditionListMap, dependencyType){
        console.log('Inside loadDependentQuestionsForPicklistFiltering');     
        var selectedQuestionId = '';
        var selectedAnswer  = '';
        if(event.getSource().get("v.value") != undefined){            
            selectedQuestionId = component.get("v.questionId");
            selectedAnswer = event.getSource().get("v.value");
        }
        
        var metaDataMap = component.get("v.metaDataMap");
        var conditionResultsQuestionsMap = {};
        var conditionalOperationsArray = component.get("v.conditionalOperationsArray");    
        if(conditionalOperationsArray == null || conditionalOperationsArray == undefined || conditionalOperationsArray == ''){
            //this.loadConditionalOperations(component);
            var comparatorCmp = component.find("comparatorCmp");
            comparatorCmp.loadConditionalOperations(function(conditionalOperations) {
                component.set("v.conditionalOperationsArray",conditionalOperations);
            });            
        }
        conditionalOperationsArray = component.get("v.conditionalOperationsArray");    
        
        console.log('selectedQuestionId..'+selectedQuestionId+'..selectedAnswer..'+selectedAnswer); 
        
        for(var depQuestionConditionListMapkey in depQuestionConditionListMap){            
            var depQuestionConditionList = depQuestionConditionListMap[depQuestionConditionListMapkey];
            var conditionalCheckResp = false;            
            for(var i = 0; i < depQuestionConditionList.length; i++){
                var questionId = depQuestionConditionList[i].Question__c;
                var tabSubTabName = depQuestionConditionList[i].Dependent_Tabs__r.Tab_Name__c + ':' + depQuestionConditionList[i].Dependent_SubTab__r.SubTab__c;
                var dependentQuesId = depQuestionConditionList[i].Dependent_Question__c; 
                var conditionOperator = depQuestionConditionList[i].Conditional_Operaor__c; 
                var sequence = depQuestionConditionList[i].Sequence__c;
                var conditionVal = depQuestionConditionList[i].Condition_Value__c; 
                var filteringPicklistValues = depQuestionConditionList[i].Filtered_PickList_Values__c;
                console.log('filteringPicklistValues..'+filteringPicklistValues+'conditionVal..'+conditionVal+'sequence..'+sequence+'conditionOperator..'+conditionOperator+'dependentQuesId..'+dependentQuesId+'tabSubTabName..'+tabSubTabName+'questionId..'+questionId);
                
                var questionsAnsList = metaDataMap[tabSubTabName];
                for(var j = 0; j < questionsAnsList.length; j++){
                    var questionsMap = questionsAnsList[j];
                    for (var questionsMapKey in questionsMap){
                        var questionObj = questionsMap[questionsMapKey]; 
                        var quesId = questionObj.Id;
                        var answer = questionObj.Answer__c;
                        
                        if(quesId == selectedQuestionId)
                            answer = selectedAnswer;
                        
                        if(questionObj.Field_Type__c === 'BOOLEAN')
                            answer = (selectedAnswer)?"true":"false"; 
                        
                        questionObj.Answer__c = answer;
                        
                        if(quesId == dependentQuesId){
                            conditionalCheckResp = conditionalOperationsArray[0][conditionOperator](answer,conditionVal);                                                       
                            conditionResultsQuestionsMap[questionId] = conditionalCheckResp;
                            break;
                        }                                                
                        console.log('conditionalCheckResp..'+conditionalCheckResp+'..answer..'+answer+'..conditionVal..'+conditionVal);
                    }
                }
            }
            
            console.log('conditionResultsQuestionsMap..'+JSON.stringify(conditionResultsQuestionsMap)+'..conditionResultsQuestionsMap..'+conditionResultsQuestionsMap.length);
            
            for(var k = 0; k < questionsAnsList.length; k++){
                var questionsMap = questionsAnsList[k];                        
                for (var questionsMapKey in questionsMap){
                    var questionObj = questionsMap[questionsMapKey];
                    var quesId = questionObj.Id;
                    var answer = questionObj.Answer__c;
                    console.log('conditionResultsQuestionsMap[quesId]..'+conditionResultsQuestionsMap[quesId]);
                    if(conditionResultsQuestionsMap[quesId]){
                        if(dependencyType === 'Picklist Filtering')
                            questionObj.Picklist_Filtering__c = filteringPicklistValues;    
                        else if(dependencyType === 'PreDefault')
                            questionObj.Answer__c = filteringPicklistValues;
                        //New code vinod 24/04/18
                            else if(dependencyType === 'Mandatory')
                                questionObj.IsMandatory__c = filteringPicklistValues;
                    }else{
                        if(conditionResultsQuestionsMap[quesId] != undefined){
                            if(dependencyType === 'Picklist Filtering')
                                questionObj.Picklist_Filtering__c = '';
                            //New code vinod 24/04/18
                            if(dependencyType === 'Mandatory')
                                questionObj.IsMandatory__c = '';
                        }
                    }     
                    console.log('dependencyType..'+dependencyType+'..Question_Label__c..'+questionObj.Question_Label__c+'..answer..'+answer+'..Picklist_Filtering__c..'+questionObj.Picklist_Filtering__c+'..questionObj.Answer__c..'+questionObj.Answer__c);                            
                }     
            } 
            
            //Resetting the metadatamap
            metaDataMap[tabSubTabName] = questionsAnsList; 
            component.set("v.metaDataMap",metaDataMap);
        }
        
    },
    readLookupQuesAnswer : function(component, event, helper, recordId, tabSubTabName, objectName, metaDataMap, fieldsToBeQueried){
        console.log('Inside readLookupQuesAnswer..'); 
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        var action = component.get("c.readLookupQuestionsAnswer");            
        action.setParams({ 
            recordId : recordId,
            objectName : objectName,
            fieldsToBeQueried : fieldsToBeQueried
        });
        
        action.setCallback(this, function(response){           
            var state = response.getState();
            if (state === "SUCCESS"){ 
                var questionsAnswerMap = response.getReturnValue();                
                console.log('questionsAnswerMap..'+JSON.stringify(questionsAnswerMap)); 
                
                var questionsMapList = metaDataMap[tabSubTabName];
                for(var i = 0; i < questionsMapList.length; i++){
                    var questionAnsMap = questionsMapList[i];                    
                    for (var apiNameKey in questionAnsMap){    
                        var answer = questionsAnswerMap[apiNameKey];
                        var questionObj = questionAnsMap[apiNameKey];
                        if(answer != undefined)
                            questionObj.Answer__c = answer; 
                        console.log('Answer..'+questionObj.Answer__c+'..apiNameKey..'+apiNameKey+'..Parent API Name..'+questionObj.Parent_Object_API_Name__c);
                    }
                    if(!questionAnsMap['Id']){
                        console.log('Not contains id');
                        var idQuestionObj = component.get("v.questionObject");
                        idQuestionObj.Answer__c = questionsAnswerMap['Id'];
                        idQuestionObj.Field_API_Name__c = 'Id';
                        idQuestionObj.Has_Condition__c = true;
                        idQuestionObj.Parent_Object_API_Name__c = questionObj.Parent_Object_API_Name__c;
                        idQuestionObj.Object_API_Name__c = questionObj.Object_API_Name__c;
                        questionAnsMap['Id'] = idQuestionObj;
                    }
                }                
                component.set("v.metaDataMap",metaDataMap);
                this.loadQuestions(component, event, helper);    
                $A.util.addClass(component.find("spinner"), "slds-hide");
            }else if (state === "ERROR"){                              
                var errors = response.getError();
                console.log('readLookupQuestionsAnswer ERROR..'+errors); 
                $A.util.addClass(component.find("spinner"), "slds-hide");
            }
        });
        $A.enqueueAction(action);                
    } ,
     /* Method Name: deleteRecordDetails 
     * Comments : This method used for deleting Questions. 
     */ 
    deleteRecordDetails : function(component, event, helper, questionRecordId, orgRecordIndex, questionRowIndex){
        console.log('deleteRecordDetails');
       
        var questionRecordId = questionRecordId;
        console.log('questionRecordId'+questionRecordId);
        var action = component.get("c.deleteRecordsDetails");
        action.setParams({
            questionRecordId:questionRecordId
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){                
                //Delete from List
                var wizardQuestionList = component.get("v.wizardQuestionList");
                wizardQuestionList.splice(questionRowIndex,1);
                component.set("v.wizardQuestionList",wizardQuestionList);
                
                this.showToastMsg(component,event,helper,"Success","Record Deleted Successfully");
                //Delete from metadataMap
                var tabName = component.get("v.tabName");
                var subTabName = component.get("v.subTabName");
                var tabSubTabName = tabName + ":" + subTabName;               
                var metaDataMap = component.get("v.metaDataMap");        
                var quesAnsMapList = metaDataMap[tabSubTabName];
                quesAnsMapList.splice(orgRecordIndex,1);
                metaDataMap[tabSubTabName] = quesAnsMapList;
                component.set("v.metaDataMap",metaDataMap);
            }else{
                $A.util.addClass(component.find("spinner"), "slds-hide");
                this.showToastMsg(component,event,helper,"Error","Error while Deleting Record. Please try again.");                
            }
        });
        $A.enqueueAction(action);            
    },   
     /* Method Name: showToastMsg
     * Comments : Unique method for displaying toastmessages. 
     */ 
    showToastMsg : function(component,event,helper,title,msg){
        console.log('showToastMsg');
        var showToast = $A.get('e.force:showToast');            
        showToast.setParams({
            'title': title,
            'type' : "success",
            'message': msg});
        showToast.fire();        
    }    
})