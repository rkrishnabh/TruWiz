({
    /*
Method Name : loadDependentConditions
Comments    : This method is used to load Data table with Conditions records related tab,subtab and question
 */     
    loadDependentConditions : function(component,event){ 
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
        
        //Displaying selected asset fields as Configuration data for the table
        var conditionsColumns = [  
            
            {
                'label':'Sequence',
                'name':'Sequence__c',
                'value':'integer'
            },
            {
                'label':'Question Name',
                'name':'Dependent_Question_Name__c',
                'value':'string'
            },
            {
                'label':'Operator',
                'name':'Conditional_Operaor__c',
                'value':'string'
            },
            {
                'label':'Value',
                'name':'Condition_Value__c',  
                'value':'string'
            },
            {
                'label':'Type',
                'name':'Type__c',
                'value':'string'
            },
            
            {
                'label':'Condition',
                'name':'Conditional_Logic__c',
                'value':'string'
            }
            
        ];
        
        //Configuration data for the table to enable actions in the table
        var conditionsConfiguration = 
            {
                "searchBox":true,
                "searchByColumn":true,
                "globalAction":[
                    {
                        "label":"New",
                        "type":"button",
                        "id":"DependentCondition",
                        "class":"slds-button slds-button--neutral"
                    },
                    
                    
                ], 
                    "rowAction":
                    [
                    {
                    "label":"Delete",
                    "type":"url",
                    "id":"deleteRow"
                    }
                ]  
            };
        //Callback the action, to set the result into attributes for displaying the data in Table
        var self = this;
        action.setCallback(this, function(response){
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var conditionsList = response.getReturnValue();    
                component.set("v.rowIndex",conditionsList.length); 
                var compEvent = component.getEvent("conditionLogicUpdateEvent");
                compEvent.setParams({
                    "Id" : Id
                }); 
                compEvent.fire();   
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
                
                component.set("v.dependentConditionLogic", dependentConditionLogic);
                component.set("v.dependentConditionsList", conditionsList);
                component.set("v.dependentConditionsColumnList",conditionsColumns);
                component.set("v.dependentConditionsTablebuttonsList",conditionsConfiguration); 
                
                window.setTimeout($A.getCallback(function(){  
                    component.find("dependentconditionsListTable").initialize({"itemMenu":[5]});
                }),500);        
            }else{
                var showToast = $A.get('e.force:showToast');
                showToast.setParams({
                    'title': 'Error',
                    'message': 'In response from server action', });            
                showToast.fire();
            }
        });        
        $A.enqueueAction(action);
    },
    
    /*
Method Name : dtClickActionClicked
Usage       : Calls ConditionalDependencyNew Cmp when actionId matches.
*/   
    dtClickActionClicked : function(component,event,helper){
        
        var actionId = event.getParam('actionId');
        if(actionId != "" && actionId != null && actionId != undefined){
            if(actionId == 'DependentCondition'){   
                var templateId = component.get("v.templateId");
                var dependenceType = component.get("v.dependenceType");
                var Id = component.get("v.Id");
                var rowIndex = component.get("v.rowIndex");
                var name = component.get("v.name");
                var dependentConditionsList =  component.get("v.dependentConditionsList");                
                var dependentConditionLogic = component.get("v.dependentConditionLogic");                                     
                
                //Pass attributes for navigation
                var cmpBack;
                var cmpParams = {};
                cmpParams["templateId"] = templateId;
                cmpParams["dependenceType"] = dependenceType;
                cmpParams["name"] = name;
                cmpParams["tabName"] = component.get("v.tabName");
                cmpParams["subtabName"] = component.get("v.subtabName");
                cmpParams["Id"] = Id;
                cmpParams["ConditionList"] = dependentConditionsList; 
                cmpParams["rowIndex"] = rowIndex;
                cmpParams["conditionalColumn"] = dependentConditionLogic; 
                var cmpNavigationList = component.get("v.cmpNavigationList");
                cmpNavigationList.unshift("c:adminNewDependentConditionCmp");       
                component.set("v.cmpNavigationList",cmpNavigationList);
                cmpParams["cmpNavigationList"] = cmpNavigationList;
                cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
                cmpParams["userChoice"] = component.get("v.userChoice");
                cmpParams["tabId"] = component.get("v.tabId");
                cmpParams["tabList"] = component.get("v.tabList");
                cmpParams["subTabId"] = component.get("v.subTabId");                
                cmpParams["subTabList"] = component.get("v.subTabList");
                //Hide current component
                $A.util.removeClass(component.find("dependentconditionsListDiv"), "unhideElement");
                $A.util.addClass(component.find("dependentconditionsListDiv"), "hideElement");
                //Trigger hideElements event
                var hideElementsEvnt = component.getEvent("hideElementsEvnt");
                var auraIdListToHide = component.get("v.auraIdListToHide");
                hideElementsEvnt.setParams({"auraIdListToHide":auraIdListToHide});
                hideElementsEvnt.fire();                
                
                //$A.createComponents([["c:newDependentCondition",{templateId:templateId,dependenceType:dependenceType,Id:Id}]],
                $A.createComponents([["c:adminNewDependentConditionCmp",cmpParams]],                
                                    function(conditionalDependency, status){
                                        if (component.isValid() && status === 'SUCCESS'){
                                            component.set("v.body", conditionalDependency);
                                        } else{
                                            var showToast = $A.get('e.force:showToast');
                                            showToast.setParams({
                                                'title': 'ConditionalDependencyNew Cmp',
                                                'message': 'Error while calling ConditionalDependencyNew component. Please try again.', });           
                                            showToast.fire();
                                        }
                                    });    
            } 
            else if(actionId == 'deleteRow'){  
                var rowIdx = event.getParam("index");
                var clickedRow = event.getParam('row');
                var selectedDependentconditionId = clickedRow.Id;
                component.set("v.selectedDepdconditionIdForDelete",selectedDependentconditionId);
                this.deleteDependentCondition(component, event, helper);   
            }
            event.setParam("actionId","");            
        }
    },
    
    /*
Method Name : deleteDependentCondition
Usage       : This method is used to delete the DependentCondition
*/     
    deleteDependentCondition : function(component, event, helper){
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
                this.showToastMsg(component,event,helper,"Success","success","DependentCondition Deleted Successfully");
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
                this.loadDependentConditions(component, event, helper); 
                $A.util.addClass(component.find("spinner"), "slds-hide");
            }else{
                $A.util.addClass(component.find("spinner"), "slds-hide");
                this.showToastMsg(component,event,helper,"Error","error","Error while updating sequence for Dependent Condition.");                 
            }
        });
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
})