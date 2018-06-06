({
    /*
Method Name : doInit
Usage       : This method is used to load tabs and filetring picklist values on page load.
*/
    doInit : function(component, event, helper) {
        var ConditionList = component.get("v.ConditionList");
        var conditionalColumn = component.get("v.conditionalColumn");
        console.log('ConditionList in doinit..'+JSON.stringify(ConditionList));
        console.log('conditionalColumn in doinit..'+JSON.stringify(conditionalColumn));
        helper.loadTabs(component, event, helper);
        var dependenceType = component.get("v.dependenceType");
        if(dependenceType == 'question'){
            debugger;
            helper.filteringPicklistValues(component, event, helper); 
        }
    },
    
    
    /*
Method Name : handleTabChange
Usage       : This method is used, to get selected the tabId from the dropdown picklist tab
*/
    handleTabChange : function(component,event,helper){
        component.set("v.tabIdDep",component.find("tabListSelect").get("v.value"));
        helper.loadSubTabs(component, event);        
    },
    
    /*
Method Name : handleSubTabChange
Usage       : This method is used, to get selected the subTabId from the dropdown picklist subtab
*/    
    handleSubTabChange : function(component,event,helper){
        component.set("v.subTabIdDep",component.find("subTabListSelect").get("v.value"));
        helper.loadQuestions(component, event, helper);
    },
    
    /*
Method Name : handleSubTabChange
Usage       : This method is used, to get selected the depndentQuestionId from the dropdown picklist Dependent Question
*/
    
    handleDependentQuestionChange : function(component,event,helper){
        var conditionalQuestionId = component.find("questionName").get("v.value");
        console.log('conditionalQuestionId'+conditionalQuestionId);
        component.set("v.conditionalQuestionId",conditionalQuestionId);
        helper.getDependentQuestionFieldType(component, event, helper);
        
    },
    
    
    /*
Method Name : hideOrShowPreDefault
Usage       : Hide or Showing PreDefault field base on type field
 */    
    hideOrShowPreDefault : function(component, event, helper){
        
        var type = component.find("type").get("v.value");
        //For type PreDefault
        if(type == 'PreDefault'){
            component.set("v.preDefaultShowOrHide",true);//Enabling predefault field
        }
        else{
            component.set("v.preDefaultShowOrHide",false);//Disabling predefault field
            component.set("v.staticValueField",false);
            component.set("v.CopyFromDependentQuestionField",false);
        }
        
        //For type Picklist Filtering
        if(type == 'Picklist Filtering'){
            component.set('v.hideOrShowfilteringPicklistField',true);
        }else{
            component.set('v.hideOrShowfilteringPicklistField',false);
        }
        
         //For type Mandatory
        if(type == 'Mandatory'){
            component.set('v.mandatoryShowOrHide',true);
        }else{
            component.set('v.mandatoryShowOrHide',false);
        }
        
    },
    /*
Method Name : hideOrShowStaticAndCopyValue
Usage       : Hide or Show static and CopyValue fields
 */     
    hideOrShowStaticAndCopyValue : function(component, event, helper){
        var preDefault = component.find("preDefault").get("v.value");
        
        if(preDefault == 'Static'){
            component.set("v.staticValueField",true);
            component.set("v.CopyFromDependentQuestionField",false);
        }
        else if(preDefault == 'Copy from Dependent Question'){
            component.set("v.CopyFromDependentQuestionField",true);
            component.set("v.staticValueField",false);
            var selectedQuestionId = component.find("questionName").get("v.value");
            
            //Fetching Question Label from Question Id
            var allQuestions = component.get("v.allQuestions");
            var questionObj
            for(var i=0;i< allQuestions.length;i++){
                questionObj= allQuestions[i];
                var Id = questionObj.Id;
                if(Id == selectedQuestionId){
                    var questionLabel = questionObj.Question_Label__c   
                    component.set("v.copyQuestionValue",questionLabel);
                }      
            }
        }    
    },
    /*
 Method Name : addingConditionsToTable
 Usage       : Adding Conditional Logic to the Data Table
 */    
    addingConditionsToTable : function(component, event, helper){
        debugger;
        helper.validations(component,event,helper);
        helper.avoidingDuplicateDependentQuestion(component,event,helper); 
        
        var errorMessage = component.get("v.errorMessage"); 
        var duplicateDependentQuestion = component.get("v.duplicateDependentQuestion");
        
        if(errorMessage != "" && errorMessage != null && errorMessage != undefined && errorMessage != 'Please Select'){            
            helper.showToastMsg(component,event,helper,"Error","error",errorMessage);                                    
        }else if(duplicateDependentQuestion == 'Yes'){
            helper.showToastMsg(component,event,helper,"Warning","warning","Dependent Question already exist,please choose another one...!"); 
        }else{
            
            //Fetching field value Type starts
            var type;
            if(component.get("v.dependenceType") == 'question'){
                type = component.find("type").get("v.value");
            }
            else if(component.get("v.dependenceType") == 'tab'){
                type = component.find("tabType").get("v.value");
            }
                else if(component.get("v.dependenceType") == 'subTab'){
                    type = component.find("subTabType").get("v.value");  
                }
            console.log("type.."+type);
            
            //Fetching filteringValues 
            var filteringValues; 

            if(component.get("v.staticValueField") == true){
                filteringValues = component.find("staticValue").get("v.value");
            }else if( component.get("v.CopyFromDependentQuestionField") == true){
                filteringValues = component.find("questionName").get("v.value");
            }else if(component.get("v.hideOrShowfilteringPicklistField") == true){
                //Fetching filtering values field selected values
                filteringValues = component.find("conditionValues").get("v.value");
            }else if(component.get("v.mandatoryShowOrHide") == true){
                //Fetching filtering values field selected values
                filteringValues = component.find("Mandatory").get("v.value");
            }
            
            console.log("filteringValues b4 replace..."+filteringValues);
            if(filteringValues != null && filteringValues != '')
               filteringValues = filteringValues.replace(new RegExp(';', 'gi'), ',');

            console.log("filteringValues after replace..."+filteringValues)
            
            //Fetching questionId
            var questionId = component.find("questionName").get("v.value");
            //Fetching Question Label from above Question Id
            var allQuestions = component.get("v.allQuestions");
            var questionObj
            
            for(var i=0;i< allQuestions.length;i++){
                questionObj= allQuestions[i];
                var Id = questionObj.Id;
                if(Id == questionId){
                    var questionLabel = questionObj.Question_Label__c
                    console.log(' questionLabel inside if..'+ questionLabel);  
                }      
            }
            
            //Fetching operator value
            var operatorName = component.find("operatorName").get("v.value");
            
            //Fetching DependentQuestionValue value
            var dependentQuestionValue;
            if(component.get("v.enableMultiSelectPicklist")==true){
                dependentQuestionValue = component.find("DependentQuesPicklistValue").get("v.value");
            }
            else if(component.get("v.enableTextBox")==true){
                dependentQuestionValue = component.find("DependentQuesValue").get("v.value");
            }
             else if(component.get("v.picklistForBoolean")==true){
                dependentQuestionValue = component.find("DependentQuesBooleanPicklistValue").get("v.value");
            }
            var selectedTabId = component.find("tabListSelect").get("v.value"); 
            var selectedSubTabId = component.find("subTabListSelect").get("v.value");
            console.log('questionLabel..'+questionLabel+'..questionId..'+questionId+'..operatorName..'+operatorName+'dependentQuestionValue'+dependentQuestionValue+'selectedTabId..'+selectedTabId+'selectedSubTabId..'+selectedSubTabId);
            
            //Building sequence for data table
            var rowindex = component.get("v.rowIndex");
            var serialNo = rowindex + 1;
            component.set("v.rowIndex",serialNo);
            var finalRowindex = component.get("v.rowIndex");
            
            //Calling ConditionList attribute
            var RowItemList = component.get("v.ConditionList");
            console.log('RowItemList length...'+RowItemList.length);
            
            //ConditionLogic [AND/OR], should not append to the last low
            if(type == 'Show or Hide'){
                for(var RowItemListkey in RowItemList){
                    var rowItemList = RowItemList[RowItemListkey];
                    var sequence = rowItemList.Sequence__c;
                    var conditiontype = rowItemList.Type__c;
                    var logic = rowItemList.Conditional_Logic__c;
                    if(sequence < RowItemList.length && conditiontype == 'Show or Hide' && logic == ''){ //Last before records in list [show or hide]
                        rowItemList.Conditional_Logic__c = 'AND';
                    }
                    if(sequence == RowItemList.length && conditiontype == 'Show or Hide'){ //Last record in list [show or hide]
                        console.log('sequence..'+sequence);
                        rowItemList.Conditional_Logic__c = 'AND';   
                    }   
                }
            }
            RowItemList.push({
                'sobjectType': 'Condition__c',
                'Dependent_Question_Name__c': questionLabel,          //Selected question Label 
                'Conditional_Operaor__c': operatorName,               //Selected Operator
                'Condition_Value__c': dependentQuestionValue,         //ConditionalValue
                'Conditional_Logic__c' : '',                          //ConditionLogic   
                'Dependent_Question__c' : questionId,                 //Selected question Id 
                'Sequence__c':finalRowindex,                          //Sequence
                'Type__c': type,                                      //selected type
                'Filtered_PickList_Values__c': filteringValues,
                'Dependent_Tabs__c' : selectedTabId,                  //Selected Tab
                'Dependent_SubTab__c' : selectedSubTabId              //Selected Subtab
            });
            // set the updated list to attribute (ConditionList)    
            component.set("v.ConditionList", RowItemList);
            helper.updatingDependentConditionLogic(component, event, helper);
           /* component.set("v.tabListDep",""); 
            component.set("v.subTabListDep","");
            component.set("v.allQuestions","");
            component.find("operatorName").set("v.value","");
            component.set("v.dependentQuestionPickListValuesList","");*/
             //helper.loadTabs(component, event, helper);
            component.find("tabListSelect").set("v.value","");
            component.find("subTabListSelect").set("v.value","");
            component.find("questionName").set("v.value","");
            component.find("operatorName").set("v.value","");
            
            if(component.get("v.dependenceType") == 'question')
                component.find("type").set("v.value","");
            component.set("v.enableMultiSelectPicklist",false)
            component.set("v.enableTextBox",false)
            component.set("v.picklistForBoolean",false)
            
            if(component.get("v.dependenceType") == 'question'){
                component.set("v.preDefaultShowOrHide",false);//Disabling predefault field
                component.set("v.staticValueField",false);
                component.set("v.CopyFromDependentQuestionField",false); 
                component.set("v.hideOrShowfilteringPicklistField",false);
                component.set("v.mandatoryShowOrHide",false);
            }
                   
        }
    },
    /*
 Method Name : updateDependentConditionLogic
 Usage       : This method is used to build the dependentConditionLogic
 */   
    updateDependentConditionLogic : function(component, event, helper){
        helper.updatingDependentConditionLogic(component, event, helper);
        
    },
    
    /*
 Method Name : deleteDepCondition
 Usage       : This method is used to delete the Dependent Condition
 */ 
    deleteDepCondition : function(component, event, helper){
        
        var selectedDepCondition = event.currentTarget;
        var selectedDepConditionID = selectedDepCondition.dataset.record;
        component.set("v.selectedDepdconditionIdForDelete",selectedDepConditionID);
        
        if(selectedDepConditionID != null && selectedDepConditionID != '' && selectedDepConditionID != undefined){
            helper.deleteDependentCondition(component, event, helper);
        }
        //New Code
        var sequence = selectedDepCondition.dataset.seq;
        var indexRow = sequence - 1;        
        var ConditionList = component.get("v.ConditionList");
        ConditionList.splice(indexRow,1);
        ConditionList.forEach(function(condition,index){
            console.log(ConditionList.Sequence__c);
            if(index >= indexRow)
                condition.Sequence__c = condition.Sequence__c - 1;                    
        });
        
        for(var ConditionListkey in ConditionList){
            var conditionobj = ConditionList[ConditionListkey];
            var sequence = conditionobj.Sequence__c;
            var conditiontype = conditionobj.Type__c;
            if(sequence < ConditionList.length && conditiontype == 'Show or Hide')   //If last record is picklistFiltering or predefault geting last record of show or hide
                component.set("v.ConditionObj",conditionobj);
            if(sequence == ConditionList.length && conditiontype == 'Show or Hide'){ //Last record in list [show or hide]
                conditionobj.Conditional_Logic__c = ''; 
                component.set("v.lastRecordOfTypePicklistOrPredefault",false);
            }   
        }
        //If last record is of type,Hide or show, in the conditionList no need to executive below for loop 
        if(component.get("v.lastRecordOfTypePicklistOrPredefault") == true){
            var condtnObj = component.get("v.ConditionObj");
            for(var ConditionListkey in ConditionList){
                var depCondition = ConditionList[ConditionListkey];
                if(depCondition == condtnObj){
                    depCondition.Conditional_Logic__c = '';
                }   
            }
        }
        component.set("v.ConditionList",ConditionList);
        component.set("v.rowIndex",ConditionList.length);
        helper.updatingDependentConditionLogic(component, event, helper);
        
       
    },
    
    /*
Method Name : saveDependentConditions
Usage       : This method is used to save dependent Conditions
*/       
    saveDependentQuestions : function(component, event, helper) {
        helper.saveDependentConditions(component, event, helper);   
    },
    
    /*
Method Name : goToPrevious
Usage       : This method is used for back navigation
*/       
    goToPrevious : function(component, event, helper) {
        helper.navigateToCmp(component, event, helper);   
    },
    
    
})