({
    subTabOnLoad : function(component, event, helper) {
        console.log('Inside subTabOnLoad');        
        helper.loadSubTabs(component, event, helper, false);        
    },
    
    loadDependentSubtabs : function(component, event, helper){       
        console.log('Inside loadDependentSubtabs..');
        var dependentSubTabFlag = event.getParam("dependentSubtab"); 
        var metaDataMap = event.getParam("metaDataMap"); 
        component.set("v.metaDataMap", metaDataMap);
        
        if(dependentSubTabFlag == true){            
            console.log('Inside if dependentSubTabFlag ');
            $A.util.removeClass(component.find("spinner"), "slds-hide");
            
            var dependentSubtabsConditionsMap = component.get("v.dependentSubtabsConditionsMap");
            helper.showOrHideDependentSubtabs(component, event, dependentSubtabsConditionsMap);
            
            var tabsSubTabsMap = component.get("v.tabsSubTabsMap");
            console.log('Within tabsSubTabsMap..'+JSON.stringify(tabsSubTabsMap));
            
            var tabSubTabUpdateEvent = component.getEvent("tabSubTabUpdateEvent");        
            tabSubTabUpdateEvent.setParams({tabsSubTabsMap:tabsSubTabsMap
                                           });
            tabSubTabUpdateEvent.fire();    
            helper.loadSubTabs(component, event, helper, true);    
            $A.util.addClass(component.find("spinner"), "slds-hide");     
           
            /*var selectedQuestionId = event.getParam("selectedQuestionId");                         
            var selectedQuestionIdArray = [];
            selectedQuestionIdArray.push(selectedQuestionId);
            
            //Calling server-side action
            var action = component.get("c.returnDependentQuestionsConditionListForSubTab");
            action.setParams({ 
                questionIdArray : selectedQuestionIdArray                
            });
            
            //Create a callback that is executed after the server-side action returns
            action.setCallback(this, function(response){
                var state = response.getState();
                if(state === "SUCCESS"){
                    var depQuestionConditionMap = response.getReturnValue();
                    helper.showOrHideDependentSubtabs(component, event, depQuestionConditionMap);
                    var tabsSubTabsMap = component.get("v.tabsSubTabsMap");
                    console.log('Within tabsSubTabsMap..'+JSON.stringify(tabsSubTabsMap));
                    
                    var tabSubTabUpdateEvent = component.getEvent("tabSubTabUpdateEvent");        
                    tabSubTabUpdateEvent.setParams({tabsSubTabsMap:tabsSubTabsMap
                                                   });
                    tabSubTabUpdateEvent.fire();    
                    helper.loadSubTabs(component, event, helper, true);    
                }else if (state === "ERROR") {
                    console.log('Error ..in loadDependentSubtabs ');
                }
                $A.util.addClass(component.find("spinner"), "slds-hide");     
            });        
            $A.enqueueAction(action);*/
        }    
    }, 
    
    changeSubTab : function(component,event,helper){
        console.log('Inside changeSubTab');
        var subTabIdNameArray = {};
        var tab = event.getSource();
        var subTabIdName = tab.get('v.id');
        subTabIdNameArray = subTabIdName.split('#');
        var tabId = component.get("v.tabId");
        var tabName = component.get("v.tabName");
        var prevSubTabId = component.get("v.subTabId");
        var prevSubTabName = component.get("v.subTabName");
        var metaDataMap = component.get("v.metaDataMap");
        var depQuestionsConditionsMap = component.get("v.depQuestionsConditionsMapMaster");
        var questionsProfileSetttingsMap = component.get("v.questionsProfileSetttingsMap"); 
        var loggedInUserProfileId = component.get('v.userProfile');
        var tabsSubTabsMap = component.get("v.tabsSubTabsMap");
        var subTabList = component.get("v.subTabList");
        var subTabId = subTabIdNameArray[0];
        var subTabName = subTabIdNameArray[1];
        
        component.set("v.tabId", tabId);
        component.set("v.tabName", tabName);
        component.set("v.subTabId", subTabId);
        component.set("v.subTabName", subTabName);  
        component.set("v.prevSubTabId", prevSubTabId);                
        component.set("v.prevSubTabName", prevSubTabName);
        component.set("v.metaDataMap", metaDataMap);
        
		var validationError = component.get("v.validationError");
        
        var questComponent = component.get("v.questionsComponent");
        //if(questComponent != null || questComponent != undefined){
        if((questComponent != null || questComponent != undefined) && !validationError){        
            console.log('changeSubTab launch existing questComponent');
            questComponent = questComponent[component.get("v.questionsComponentId")];
            questComponent.invokeGlobalTabsFromQuestionsForm(false,true,false,false,tabsSubTabsMap);
        }else{
            console.log('changeSubTab create new questComponent');
            $A.createComponents([["c:questionsCmp",{tabId:tabId,tabName:tabName,subTabId:subTabId,subTabName:subTabName,metaDataMap:metaDataMap,tabsSubTabsMap:tabsSubTabsMap,subTabList:subTabList,depQuestionsConditionsMapMaster:depQuestionsConditionsMap, questionsProfileSetttingsMap:questionsProfileSetttingsMap, userProfile:loggedInUserProfileId}]],
                                function(questionsCmp, status)
                                {
                                    if (component.isValid() && status === 'SUCCESS')
                                    { console.log("status");
                                     var questionsComponent = {};
                                     for(var i=0; i < questionsCmp.length; i++) {
                                         var quesCmp = questionsCmp[i];
                                         questionsComponent[quesCmp.getLocalId()] = quesCmp;
                                     }
                                     component.set("v.questionsComponent", questionsComponent);
                                     component.set("v.questionsComponentId", quesCmp.getLocalId());
                                     component.set("v.body", questionsCmp);
                                    }else{
                                        var showToast = $A.get('e.force:showToast');
                                        showToast.setParams({
                                            'title': 'dynamicWizardSubTab',
                                            'message': 'Error while calling dynamicWizardSubTab. Please try again.', });            
                                        showToast.fire();
                                    }
                                });
			component.set("v.validationError",false);            
        }
    },
    
    invokeQuestionsForm:function(component, event, helper){
        console.log('Inside invokeQuestionsForm');
        var params = event.getParam('arguments');
        var questComponent = component.get("v.questionsComponent");
        if(questComponent != null && questComponent != undefined){
            questComponent = questComponent[component.get("v.questionsComponentId")];
            questComponent.invokeGlobalTabsFromQuestionsForm(params.isGlobalTab,params.isSubTab,params.saveAsDraft,params.globalSave,params.tabsSubTabsMap); 
        }
    },
    
    TabChangeEvnt:function(component, event, helper){
        console.log('Inside TabChangeEvnt');
        
        var validationError = event.getParam("validationError");
        var isSubTab = event.getParam("isSubTab");
        
        
        if(!validationError){ 
            var metaDataMap = event.getParam("metaDataMap");  
            console.log('metaDataMap..'+JSON.stringify(metaDataMap));                
            component.set("v.metaDataMap",metaDataMap);
            
            if(isSubTab == true){            
                var questionsProfileSetttingsMap = event.getParam("questionsProfileSetttingsMap");
                var userProfile = event.getParam("userProfile");
                
                console.log('userProfile..'+userProfile+'..TabChangeEvnt questionsProfileSetttingsMap..'+JSON.stringify(questionsProfileSetttingsMap));    
                var tabId = component.get("v.tabId");
                var tabName = component.get("v.tabName");
                var subTabId = component.get("v.subTabId");
                var subTabName = component.get("v.subTabName");
                var prevSubTabId = component.get("v.prevSubTabId");
                var prevSubTabName = component.get("v.prevSubTabName");                        
                var tabsSubTabsMap = component.get("v.tabsSubTabsMap");            
                var subTabList = component.get("v.subTabList");           
                
                $A.createComponents([["c:questionsCmp",{tabId:tabId,tabName:tabName,subTabId:subTabId,subTabName:subTabName,metaDataMap:metaDataMap,tabsSubTabsMap:tabsSubTabsMap,subTabList:subTabList, questionsProfileSetttingsMap:questionsProfileSetttingsMap, userProfile:userProfile}]],
                                    function(questionsCmp, status){
                                        if(component.isValid() && status === 'SUCCESS'){ 
                                            var questionsComponent = {};
                                            for(var i=0; i < questionsCmp.length; i++) {
                                                var quesCmp = questionsCmp[i];
                                                questionsComponent[quesCmp.getLocalId()] = quesCmp;
                                            }
                                            component.set("v.questionsComponent", questionsComponent);
                                            component.set("v.questionsComponentId", quesCmp.getLocalId());
                                            component.set("v.body", questionsCmp);
                                        }else{
                                            var showToast = $A.get('e.force:showToast');
                                            showToast.setParams({
                                                'title': 'dynamicWizardSubTab',
                                                'message': 'Error while calling dynamicWizardSubTab. Please try again.', });            
                                            showToast.fire();
                                        }
                                    });
                
            }            
        }else{
            if(isSubTab){
                component.set("v.validationError",true);				                
                var draftSubTabIdName = component.get("v.prevSubTabId") + "#" + component.get("v.prevSubTabName");       
                component.set("v.draftSubTabIdName",draftSubTabIdName);                
            }            
        }
    }
})