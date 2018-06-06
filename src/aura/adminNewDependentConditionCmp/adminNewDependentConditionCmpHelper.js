({ 
       
   /*
Method Name : loadTabs
Usage       : loadTabs in picklistDropDown
*/      
    
    loadTabs: function(component,event,helper) 
    { 
        var templateId = component.get("v.templateId");
        //Calling Server-Side action
        var action = component.get("c.getTabs");
        action.setParams({
            templateId:templateId
        });
        //Create a callback that is executed after the server-side action returns
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var tabList = response.getReturnValue();
                component.set("v.tabListDep", tabList); 
                var tabListDep = component.get("v.tabListDep");
                console.log('before tabListDep'+JSON.stringify(tabListDep));
                var selectedTabId = component.get("v.Id");
                console.log('selectedTabId'+selectedTabId);
                for(var i = 0; i < tabListDep.length; i++){
                    if(selectedTabId == tabListDep[i].Id){
                        tabListDep.splice(i, 1);
                    }
                }
            }   
        });
        $A.enqueueAction(action);                
    },
    
    /*
Method Name : loadSubTabs
Usage       : loadSubTabs in picklistDropDown
*/
    loadSubTabs: function(component,event,helper) 
    { 
        var tabId = component.get("v.tabIdDep");
        //Calling Server-Side action
        var action = component.get("c.getTabRelatedSubtabs");
        action.setParams({
            tabId:tabId
        });
        //Create a callback that is executed after the server-side action returns 
        action.setCallback(this, function(response){
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var subTabList = response.getReturnValue();
                component.set("v.subTabListDep", subTabList);
                var subTabListDep = component.get("v.subTabListDep");;
                console.log('before subTabListDep'+JSON.stringify(subTabListDep));
                var selectedSubTabId = component.get("v.Id");
                console.log('selectedSubTabId'+selectedSubTabId);
                for(var i = 0; i < subTabListDep.length; i++){
                    if(selectedSubTabId == subTabListDep[i].Id){
                        subTabListDep.splice(i, 1);
                    }
                }
                if(subTabList != '')
                this.loadQuestions(component, event);                 
            }   
        }); 
        $A.enqueueAction(action);                
    },
    
    
    /*
Method Name : loadQuestions
Usage       : loadQuestions in picklistDropDown
*/
    loadQuestions : function(component, event) {
        
        var subTabId = component.get("v.subTabIdDep");
        //Calling Server-Side action
        var action = component.get('c.getSubTabsRelatedQuestions');
        console.log('action'+action);
        action.setParams({
            subTabId:subTabId
        });
        //Create a callback that is executed after the server-side action returns 
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                var questions = response.getReturnValue();
                 component.set('v.allQuestions',questions); 
                var allQuestions = component.get("v.allQuestions");;
                console.log('before allQuestions'+JSON.stringify(allQuestions));
                var selectedQuestionId = component.get("v.Id");
                console.log('selectedQuestionId'+selectedQuestionId);
                for(var i = 0; i < allQuestions.length; i++){
                    if(selectedQuestionId == allQuestions[i].Id){
                        allQuestions.splice(i, 1);
                    }
                }
            }
        });
        $A.enqueueAction(action);
    },

 /*
Method Name : filteringPicklistValues
Usage       : This method is used, to get picklist values for the question picklist type .
*/     
    filteringPicklistValues : function(component, event, helper) {
        
        var questionId = component.get("v.Id");
        //Calling Server-Side action
        var action = component.get('c.getParentDepQuestionFilteringValues'); 
        action.setParams({
            questionId:questionId
        });
        
        //Create a callback that is executed after the server-side action returns
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                var questionPicklistValues = response.getReturnValue();
                component.set('v.filteringPicklistValuesList',questionPicklistValues);
                component.set('v.hideOrShowTypePicklistFiltering',true);
            }else{
                console.log('No PicklistValues');
            }
        });
        $A.enqueueAction(action);
    },
            
    
      /*
Method Name : getDependentQuestionFieldType
Usage       : This method is used to get type for, selected dependent question 
*/
    getDependentQuestionFieldType : function(component, event, helper) {
       
        console.log('getDependentQuestionFieldType');
        var conditionalQuestionId = component.get("v.conditionalQuestionId");
        
        var action = component.get('c.getDependentQuestionFieldType');
        action.setParams({
            conditionalQuestionId:conditionalQuestionId
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS")
            {
                var dependentQuestionFieldType = response.getReturnValue();
                component.set('v.dependentQuestionFieldType',dependentQuestionFieldType);//BOOLEAN
                if(dependentQuestionFieldType == 'PICKLIST' && dependentQuestionFieldType !="" && dependentQuestionFieldType !=undefined){
                    component.set("v.enableMultiSelectPicklist",true);
                    component.set("v.picklistForBoolean",false);
                    component.set("v.enableTextBox",false);
                    this.loadDependentQuestionPicklistValues(component, event);
                }
                else if(dependentQuestionFieldType=='BOOLEAN'){
                    component.set("v.picklistForBoolean",true);
                    component.set("v.enableTextBox",false);
                    component.set("v.enableMultiSelectPicklist",false);
                    //this.loadDependentQuestionPicklistValues(component, event);
                    
                }
                else if((dependentQuestionFieldType != 'PICKLIST') || (dependentQuestionFieldType != 'BOOLEAN')) {
                    component.set("v.enableTextBox",true);
                    component.set("v.enableMultiSelectPicklist",false);
                    component.set("v.picklistForBoolean",false);
                }
            }
        });
        $A.enqueueAction(action);
    },
  /*
Method Name : loadDependentQuestionPicklistValues
Usage       : This method is used to get picklist values for selected dependent question,if type is picklist 
*/   
    loadDependentQuestionPicklistValues : function(component, event, helper) {
        
        console.log('loadDependentQuestionPicklistValues values');
        var conditionalQuestionId = component.get("v.conditionalQuestionId");
        console.log('conditionalQuestionId'+conditionalQuestionId);
        var action = component.get('c.getDependentQuestionPicklistValues');
        console.log('action'+action);
        action.setParams({
            conditionalQuestionId:conditionalQuestionId
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS")
            {
                var questionPicklistValues = response.getReturnValue();
                console.log('questionPicklistValues'+JSON.stringify(questionPicklistValues));
                component.set('v.dependentQuestionPickListValuesList',questionPicklistValues);
            }
        });
        $A.enqueueAction(action);
    },
    
   
 /* Method Name: validations
* Comments : This method is used for client side validation.
* Validations : Mandatory Fields
*/
    validations : function(component,event,helper){
        
        var selectedTabId = component.find("tabListSelect").get("v.value");
        var selectedSubTabId = component.find("subTabListSelect").get("v.value");
        var dependentQuestion = component.find("questionName").get("v.value");
        var operatorName = component.find("operatorName").get("v.value");
        var errMsg = "Please Select";
        
        if(selectedTabId == null || selectedTabId ==''){   
            errMsg = (errMsg == "" ? errMsg : errMsg + ", ");
            errMsg += "Tab";    
        }
        if(selectedSubTabId == null || selectedSubTabId ==''){   
            errMsg = (errMsg == "" ? errMsg : errMsg + ", ");
            errMsg += "SubTab";    
        }
        if(dependentQuestion == null || dependentQuestion ==''){   
            errMsg = (errMsg == "" ? errMsg : errMsg + ", ");
            errMsg += "Dependent Question";    
        }
        if(operatorName == null || operatorName ==''){   
            errMsg = (errMsg == "" ? errMsg : errMsg + ", ");
            errMsg += "Operator";    
        }
        if(component.get("v.dependenceType") == 'question'){
            var type = component.find("type").get("v.value");
            if(type == null || type ==''){   
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");
                errMsg += "Type";    
            }
        }
        if(component.get("v.enableMultiSelectPicklist") == true){
            var DependentQuesPicklistValue = component.find("DependentQuesPicklistValue").get("v.value");
            if(DependentQuesPicklistValue == null || DependentQuesPicklistValue ==''){   
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");
                errMsg += "Dependent Question Value";    
            }
        }
        if(component.get("v.enableTextBox") == true){
            var DependentQuesValue = component.find("DependentQuesValue").get("v.value");
            if(DependentQuesValue == null || DependentQuesValue ==''){   
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");
                errMsg += "Dependent Question Value";    
            }
        }
         if(component.get("v.picklistForBoolean") == true){
            var DependentQuesValue = component.find("DependentQuesBooleanPicklistValue").get("v.value");
            if(DependentQuesValue == null || DependentQuesValue ==''){   
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");
                errMsg += "Dependent Question Value";    
            }
        }
        if(component.get("v.preDefaultShowOrHide") == true){
            var preDefault = component.find("preDefault").get("v.value");
            if(preDefault == null || preDefault ==''){   
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");
                errMsg += "PreDefault Value";    
            }
        }
        if(component.get("v.staticValueField") == true){
            var staticValue = component.find("staticValue").get("v.value");
            if(staticValue == null || staticValue ==''){   
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");
                errMsg += "Static Value";    
            }
        }
        if(component.get("v.CopyFromDependentQuestionField") == true){
            var copyValue = component.find("copyValue").get("v.value");
            if(copyValue == null || copyValue ==''){   
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");
                errMsg += "Copy Value";    
            }
        } 
        component.set("v.errorMessage",errMsg);
    }, 
    
    
  /*
 Method Name : avoidingDuplicateDependentQuestion
 Usage       : This method is used to avoid the dependent question[duplicate], which already added to the table.
 */   
    avoidingDuplicateDependentQuestion : function(component, event, helper){
        debugger;
        //Fetching field value Type
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
        
        if(type == 'Show or Hide'){ 
            
            var dependentCondList = component.get("v.ConditionList");
            var dependentQuesId = component.find("questionName").get("v.value");
            
            for(var dependentCondListKey in dependentCondList){
                var conditionObj = dependentCondList[dependentCondListKey];
                var Id = conditionObj.Dependent_Question__c;
                if(Id == dependentQuesId){
                    component.set("v.duplicateDependentQuestion",'Yes');
                    break;     
                } 
                else{
                    component.set("v.duplicateDependentQuestion",'No');
                }
            }
        }else{
            component.set("v.duplicateDependentQuestion",'No');
        }    
    }, 
    
    
   /*
 Method Name : updatingDependentConditionLogic
 Usage       : This method is used to build the dependentConditionLogic from the ConditionList
 */   
    updatingDependentConditionLogic : function(component, event, helper){
        
        //Building Conditional Logic string from ConditionList
        var ConditionList = component.get("v.ConditionList");
        console.log('ConditionList final..'+JSON.stringify(ConditionList));
        var condtnLst;
        var dependentConditionLogic = '';
        
        for(var i=0;i< ConditionList.length;i++){
            condtnLst = ConditionList[i];
            //Only for type Show or Hide Dependent Conditional Logic will build
            if(condtnLst.Type__c == 'Show or Hide'){
                var sequence = condtnLst.Sequence__c;
                var conditionalLogic = condtnLst.Conditional_Logic__c;
                var ConditionLogic = sequence+' '+conditionalLogic+' ';
                dependentConditionLogic += ConditionLogic;
            }
        }
        console.log('dependentConditionLogic...'+dependentConditionLogic);
        component.set("v.conditionalColumn",dependentConditionLogic);
       
        
    },
    
    /*
Method Name : deleteDependentCondition
Usage       : This method is used to delete the DependentCondition
*/     
    deleteDependentCondition : function(component, event, helper){
        
        debugger;
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        var dependenceType = component.get("v.dependenceType");
        var Id = component.get("v.Id");
        var selectedDepdconditionIdForDelete = component.get("v.selectedDepdconditionIdForDelete");
        //Calling server-side action
        var action = component.get('c.updatingDepQuestionAndDeletingDepCondition');
        action.setParams({
            dependenceType : dependenceType,
            Id : Id,
            dependentConditionId : selectedDepdconditionIdForDelete
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                    $A.util.addClass(component.find("spinner"), "slds-hide");
                    this.showToastMsg(component,event,helper,"Success","success","Dependent Condition Deleted Successfully");
                    this.updateDependentConditionSequence(component, event, helper);
            }else{
                 $A.util.addClass(component.find("spinner"), "slds-hide");
                this.showToastMsg(component,event,helper,"Error","error","Error while Deleting Dependent Condition. Please try again.");                
            }
        });
        $A.enqueueAction(action);
        
    },

 /*
Method Name : updateTabDependentConditionSequence
Usage       : This method is used to update Dependent Condition Sequence.
*/     
    updateDependentConditionSequence :function(component, event, helper){
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        var dependenceType = component.get("v.dependenceType");
        var Id = component.get("v.Id"); 
        //Calling server-side action
        var action = component.get("c.updatingDependentConditionSequenceAfterDelete");
        action.setParams({
            dependenceType : dependenceType,
            Id : Id
        });
        
        //Callback the action, to set the result into attributes for displaying the data in Table
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){ 
                 //this.reloadDataForTable(component, event, helper); 
                 $A.util.addClass(component.find("spinner"), "slds-hide");
                this.showToastMsg(component,event,helper,"Success","success","Dependent condition sequence updated successfully");
            }else{
                 $A.util.addClass(component.find("spinner"), "slds-hide");
                this.showToastMsg(component,event,helper,"Error","error","Error while updating sequence for Dependent Condition.");                 
            }
        });
        $A.enqueueAction(action);
    },
    
     /*
Method Name : reloadDataForTable
Comments    : This method is used to reload the data after deleting the Dependent Condition
 */     
    reloadDataForTable : function(component,event){ 
         $A.util.removeClass(component.find("spinner"), "slds-hide");
        var dependenceType;
        dependenceType = component.get("v.dependenceType");
        var Id = component.get("v.Id"); 
        
        if(dependenceType == 'tab'){
            //Calling server-side action
            var action = component.get("c.getTabDependentConditions");
            action.setParams({
                tabId : Id
            });
        }else if(dependenceType == 'subTab'){
            //Calling server-side action
            var action = component.get("c.getSubTabDependentConditions");
            action.setParams({
                subTabId : Id
            }); 
        }else if(dependenceType == 'question'){
            //Calling server-side action
            var action = component.get("c.getQuestionDependentConditions");
            action.setParams({
                questionId:Id
            }); 
        }
        
        //Callback the action, to set the result into attributes for displaying the data in Table
        var self = this;
        action.setCallback(this, function(response){
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var conditionsList = response.getReturnValue();    
                component.set("v.rowIndex",conditionsList.length); 
                var dependentConditionLogic;
                
                for(var i = 0; i < conditionsList.length; i++){
                    var condition = conditionsList[i];
                    if(dependenceType == 'question')
                        dependentConditionLogic = condition.Question__r.Conditional_Column__c;
                    if(dependenceType == 'tab')
                        dependentConditionLogic = condition.Tab__r.Conditional_Logic__c;
                    if(dependenceType == 'subTab')
                        dependentConditionLogic = condition.SubTab__r.Conditional_Logic__c;
                }
                
                console.log('dependentConditionLogic..'+dependentConditionLogic);
                component.set("v.conditionalColumn", dependentConditionLogic);
                component.set("v.ConditionList", conditionsList);
                 $A.util.addClass(component.find("spinner"), "slds-hide");
                
            }else{
                $A.util.addClass(component.find("spinner"), "slds-hide");
               this.showToastMsg(component,event,helper,"Error","Error","Error while reloading the data after deleting sequence");                    
            }
               });        
               $A.enqueueAction(action);
},
 
    
      /*
Method Name : saveDependentConditions
Usage       : This method is used to save dependent Conditions
*/   
    saveDependentConditions : function(component, event, helper){
        
        var Id = component.get("v.Id");
        var dependenceType = component.get("v.dependenceType");
        var conditionColumn = component.get("v.conditionalColumn");
        var conditionsList = component.get("v.ConditionList");
        console.log('Id..'+Id+'...conditionsList..'+conditionsList+'...dependenceType..'+dependenceType+'...conditionColumn...'+conditionColumn);
        
        //Calling serve-side action 
        var action = component.get("c.insertDependentConditions");
        //Setting the Apex Parameter
        action.setParams({
            Id               : Id,
            dependenceType   : dependenceType,
            conditionColumn  : conditionColumn,
            conditionsList    : conditionsList    
        });
        
        //Create a callback that is executed after the server-side action returns
        action.setCallback(this,function(response){
            
            var state = response.getState();
            if(state == "SUCCESS"){
                var result = response.getReturnValue();
                if(result == true)
                    this.showToastMsg(component,event,helper,"Success","success","Dependent Conditions Created or Updated successfully");                                
                else
                    this.showToastMsg(component,event,helper,"Error","Error","Error while Creating or Updating Dependent Conditions");                    
            } 
            else if(state == "ERROR"){
                console.log('Error in calling server side insertConditionQuestionNew action');
                this.showToastMsg(component,event,helper,"Error","Error","Error in calling server side action");                
            }
            this.navigateToCmp(component, event, helper);             
        });
        //adds the server-side action to the queue        
        $A.enqueueAction(action);
        
    },
    
    /* Method Name: showToastMsg
* Comments : This is unique method for displaying errormessages
*/    
    showToastMsg : function(component,event,helper,title,type,msg) {
        debugger;
        console.log('showToastMsg');
        var showToast = $A.get('e.force:showToast');            
        showToast.setParams({
            'title': title,
            'type': type,
            'message': msg});
        showToast.fire();        
    },
  
    
  /* Method Name: navigateToCmp
* Comments : This method used for navigating to adminTabHomePageCmp. 
*/
    navigateToCmp : function(component,event,helper){
        console.log('navigateToCmp');
        debugger;        
        //Set cmp and cmpParams
        var cmp;
        var cmpParams = {};    
        cmpParams["templateId"] = component.get("v.templateId");
        cmpParams["name"] = component.get("v.name");
       
        var cmpNavigationList = component.get("v.cmpNavigationList");
        cmpNavigationList.shift();
        cmp = cmpNavigationList[0];
        component.set("v.cmpNavigationList",cmpNavigationList);
        cmpParams["cmpNavigationList"] = cmpNavigationList;
        var dependenceType = component.get("v.dependenceType");        
        var IdType;
        switch(dependenceType){
            case "tab" : IdType = "tabId";
                
                break;
            case "subTab" : IdType = "subTabId";
                /*switch(cmp){
                                case "adminTabDetailsPageCmp":
                                    cmpParams["tabId"] = component.get("v.tabId");
                                    break;
                                case "adminSubTabHomePageCmp":
                                    cmpParams["tabList"] = component.get("v.tabList");
                                    break;                        
                            }*/
                cmpParams["tabId"] = component.get("v.tabId");
                cmpParams["tabList"] = component.get("v.tabList");
               
                break;
            case "question" : IdType = "questionId";
                /*switch(cmp){
                                case "adminTabDetailsPageCmp":
                                    cmpParams["tabId"] = component.get("v.tabId");
                                    break;
                                case "adminSubTabDetailsPageCmp":
                                    cmpParams["subTabId"] = component.get("v.subTabId");                                    
                                    cmpParams["tabId"] = component.get("v.tabId");
                                    cmpParams["tabList"] = component.get("v.tabList");                                    
                                    break;                                    
                                case "adminQuestionsHomePageCmp":
                                    cmpParams["subTabList"] = component.get("v.subTabList");
                                    break;                        
                            }*/ 
                cmpParams["tabId"] = component.get("v.tabId");
                cmpParams["tabList"] = component.get("v.tabList");
                cmpParams["subTabId"] = component.get("v.subTabId");
                cmpParams["subTabList"] = component.get("v.subTabList");                
                break;            
        }
        cmpParams["dependenceType"] = dependenceType;
        cmpParams[IdType] = component.get("v.Id");         
        
        cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
        cmpParams["userChoice"] = component.get("v.userChoice");
        cmpParams["tabName"] = component.get("v.tabName");
        cmpParams["subtabName"] = component.get("v.subtabName");
        //Hide current component
        $A.util.removeClass(component.find("createConditionalDependency"), "unhideElement");
        $A.util.addClass(component.find("createConditionalDependency"), "hideElement");        
        helper.createComponent(component,event,helper,cmp,cmpParams);
    },
    
 /* Method Name: createComponent
* Comments : Refactored code to seperate Method for calling $A.createComponents.
* Parameters : cmpName and cmpParams 
*/
    createComponent : function(component,event,helper,cmpName,cmpParams){
        $A.createComponents([[cmpName,cmpParams]],
                            function(cmp, status){
                                $A.util.addClass(component.find("spinner"), "slds-hide");
                                if (component.isValid() && status === 'SUCCESS')
                                    component.set("v.body", cmp);
                                else
                                    this.showToastMsg(component,event,helper,"Error","Error","Error while calling component. Please try again.");
                            });        
    },
    
   
})