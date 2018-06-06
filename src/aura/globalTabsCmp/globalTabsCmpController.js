({
    globalTabOnLoad: function(component, event, helper) {
        console.log('Inside globalTabOnLoad');
        helper.loadLoggedInUserProfile(component,event);
        helper.loadDynamicWizardData(component, event);
    },
    
    changeGlobalTab:function(component, event, helper) {
        console.log('Inside changeGlobalTab');
        component.set("v.onLoad",false);
        helper.navigateToSubTabs(component, event, helper, undefined);
    },
    /*
Method Name : loadDependentTabs
Usage       : This method handles from event,to check the condition logic for dependent tab.
 */     
    loadDependentTabs : function(component, event, helper){        
        console.log('Inside loadDependentTabs..');
        var dependentTabFlag = event.getParam("dependentTab");
        var metaDataMap = event.getParam("metaDataMap"); 
        //console.log('loadDependentTabs metaDataMap..'+JSON.stringify(metaDataMap)); 
        component.set("v.metaDataMap", metaDataMap);
        
        if(dependentTabFlag == true){ 
            console.log('Inside if dependentTabFlag ');
            $A.util.removeClass(component.find("spinner"), "slds-hide");
            var dependentTabsConditionsMap = component.get("v.dependentTabsConditionsMap");
            helper.showOrHideDependentTabs(component, event, dependentTabsConditionsMap);
            $A.util.addClass(component.find("spinner"), "slds-hide");     
            
            /*var selectedQuestionId = event.getParam("selectedQuestionId");
            var selectedQuestionIdArray = [];
            selectedQuestionIdArray.push(selectedQuestionId);
            
            //Calling server-side action
            var action = component.get("c.returnDependentQuestionsConditionListForTab");
            action.setParams({ 
                questionIdArray : selectedQuestionIdArray                
            });
            
            //Create a callback that is executed after the server-side action returns
            action.setCallback(this, function(response){
                var state = response.getState();
                if(state === "SUCCESS"){
                    var depQuestionConditionMap = response.getReturnValue(); 
                    helper.showOrHideDependentTabs(component, event, depQuestionConditionMap);
                }else if(state === "ERROR"){
                    console.log('Status Error in loadDependentTabs');
                }
                $A.util.addClass(component.find("spinner"), "slds-hide");     
            });        
            $A.enqueueAction(action);*/
        }  
    }, 

    
    saveRecordAsDraft :function(component,event,helper){
        console.log('Inside saveRecordAsDraft');
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        var subTabsComponent = component.get("v.subTabsComponent");
        subTabsComponent = subTabsComponent[component.get("v.subTabsComponentId")];        
        subTabsComponent.invokeSubTabs(true,false,true,false);
    },    
    
    globalSave :function(component,event,helper){
        debugger;
        console.log('Inside globalSave');    
        $A.util.removeClass(component.find("spinner"), "slds-hide");
		var saveOrSubmitFlag = event.currentTarget.dataset.record;
		component.set("v.saveOrSubmitFlag",saveOrSubmitFlag);        
        var subTabsComponent = component.get("v.subTabsComponent");
        subTabsComponent = subTabsComponent[component.get("v.subTabsComponentId")];        
        subTabsComponent.invokeSubTabs(true,false,false,true);
    },  
    
    globalSaveToDBEvent:function(component,event,helper){
        console.log('Inside globalSaveToDBEvent');

        var isGlobalTab = event.getParam("isGlobalTab");        
        var saveAsDraft = event.getParam("saveAsDraft");        
        var globalSave = event.getParam("globalSave");        
        
        var metaDataMap = event.getParam("metaDataMap");
        component.set("v.metaDataMap", metaDataMap);
        
        var tabsSubTabsMap = event.getParam("tabsSubTabsMap"); 
        
        component.set("v.tabsSubTabsMap", tabsSubTabsMap);
        
        if(isGlobalTab == true){            
            var tabId = event.getParam("tabId");
            var tabName = event.getParam("tabName");
            var subTabId = event.getParam("subTabId");
            var subTabName = event.getParam("subTabName");         
            
            component.set('v.tabId',tabId);
            component.set('v.tabName',tabName);
            component.set('v.subTabId',subTabId);
            component.set('v.subTabName',subTabName);
            //For Validation
            var validationError = event.getParam("validationError");		
            if(validationError){
                var prevTabName = event.getParam("tabName");
                var prevSubTabName = event.getParam("subTabName");
                component.set("v.onLoad",true);
                helper.updateSelectedTabInList(component,event,helper,prevTabName);
                var saveAsDraftMap = {subTab : prevSubTabName};
                helper.navigateToSubTabs(component,event,helper,saveAsDraftMap);
            }            
        }
        
        if(globalSave == true){
            helper.globalSaveToDB(component,event,helper);                 
        }
        
        if(saveAsDraft == true){
            helper.createSaveAsDraftRecord(component,event);
        }        
    },
    
    updateTabsSubTabsMapEvent : function(component, event, helper){
        console.log('Inside updateTabsSubTabsMap');
        var tabsSubTabsMap = event.getParam("tabsSubTabsMap");        
        console.log('tabsSubTabsMap..'+JSON.stringify(tabsSubTabsMap));
        component.set("v.tabsSubTabsMap", tabsSubTabsMap);
    },
    
     restart: function(component, event, helper){
        console.log('restart..');
        var draftId = component.get("v.saveAsDraftId");
        var action = component.get("c.deleteDraftAttachmentRecord");
         
        action.setParams({ 
            draftId : draftId
        });
         
        action.setCallback(this, function(response){            
            var state = response.getState();
            if (state === "SUCCESS") {                
                $A.get('e.force:refreshView').fire();
                
                helper.loadDynamicWizardData(component, event);
                
                var showToast = $A.get('e.force:showToast');
                    showToast.setParams({
                        'title': 'Restart',
                        'type': 'success',
                        'message': 'Wizard is now refreshed with the latest data', 
                    });            
                    showToast.fire();                 
            }else{
                console.log('Error in restart.. method');
            }
        });
         $A.enqueueAction(action);
    }
})