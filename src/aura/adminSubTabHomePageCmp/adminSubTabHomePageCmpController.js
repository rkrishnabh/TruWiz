({
    /* Method Name: doInit
     * Comments : This method used for display subtabList  while page loading. 
     */ 
    doInit: function (component,event, helper){
        console.log('doInit');
        helper.loadSubTabs(component, event);
    },
    /* Method Name: navigateToQuestions
     * Comments : This method used for navigating to Questions. 
     */ 
    navigateToQuestions: function (component,event, helper){
        console.log('navigateToQuestions');
        helper.navigateToQuestions(component,event);
    },
    /* Method Name: subTabActionClicked
     * Comments : This method is used for  clicking based on ActiondId it navigate to different Pages. 
     */
    subTabActionClicked : function(component,event,helper){
        console.log('subTabActionClicked');
        var actionId = event.getParam("actionId");
        if(actionId != "" && actionId != null && actionId != undefined){
            var createComponentFlag = true;
            var cmp;
            var cmpParams = {};            
            
            if(actionId == 'editSubTab'){                
                var clickedRow = event.getParam('row');
                cmpParams["subTabId"] = clickedRow.Id;
                cmpParams["subtabName"] = clickedRow.SubTab__c;
                cmpParams["subTabProfile"] = clickedRow.Profile__c;
                cmpParams["subTabProfileId"] = clickedRow.ProfileId__c;
                cmp = "c:adminSubTabDetailsPageCmp";                 
            }else if(actionId == 'addSubTab'){
                cmp = "c:adminSubTabDetailsPageCmp";
            }else if(actionId == 'copySubTab'){
                cmpParams["selectedTabId"] = component.get("v.tabId"); 
                cmp = "c:adminCloneSubtabPageCmp";
            }else if(actionId == 'deleteSubTab'){
                createComponentFlag = false;                    
                var rowIdx = event.getParam("index");
                var clickedRow = event.getParam('row');
                var selectedDeletedSubTabId = clickedRow.Id;
                component.set("v.selectedDeletedSubTabId", selectedDeletedSubTabId);
                
                helper.deleteSubTab(component, event); 
                
                var allsubTabList = component.get("v.subTabList")
                console.log('allsubTabList'+JSON.stringify(allsubTabList));
                allsubTabList.splice(rowIdx, 1);
                allsubTabList.forEach(function(subTab,index){
                    console.log(subTab.Sequence__c);
                    if(index >= rowIdx)
                        subTab.Sequence__c = subTab.Sequence__c - 1;
                });
                
                component.set("v.subTabList", allsubTabList); 
                component.find("subTabListTable").rerenderRows();
            }else if(actionId == 'subTabTabSequence'){
                    cmp = "c:adminSubTabSequencePageCmp";            
            }
            
            cmpParams["templateId"] = component.get("v.templateId");
            cmpParams["tabId"] = component.get("v.tabId");
            //Start Change for showing default Tab Name on SubTabDetails
            cmpParams["selectedTabName"] = component.get("v.selectedTabName");;
            //End Change for showing default Tab Name on SubTabDetails             
            cmpParams["tabList"] = component.get("v.tabList");
            cmpParams["subTabList"] = component.get("v.subTabList");              
            cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
            cmpParams["userChoice"] = component.get("v.userChoice"); 
            cmpParams["tabName"] = component.get("v.tabName");        
            event.setParam("actionId","");            
            if(createComponentFlag){
                debugger;
                var cmpNavigationList = component.get("v.cmpNavigationList");
                cmpNavigationList.unshift(cmp);
                component.set("v.cmpNavigationList",cmpNavigationList);            
                cmpParams["cmpNavigationList"] = component.get("v.cmpNavigationList");                
                
                $A.util.removeClass(component.find("spinner"), "slds-hide");
                
                //Hide current component
                $A.util.removeClass(component.find("subTabLists"), "unhideElement");
                $A.util.addClass(component.find("subTabLists"), "hideElement");
                //Trigger hideElements event
                var hideElementsEvnt = component.getEvent("hideElementsEvnt");
                var auraIdListToHide = component.get("v.auraIdListToHide");
                hideElementsEvnt.setParams({"auraIdListToHide":auraIdListToHide});
                hideElementsEvnt.fire();				                
                
                helper.createComponent(component,event,helper,cmp,cmpParams);
            }            
        }        
    },
  
    /* Method Name: goToPrevious
     * Comments : This method used for navigating back to TabdetailsPage. 
     */ 
    goToPrevious: function(component,event,helper){
        console.log('goToPrevious');
        $A.util.removeClass(component.find("spinner"), "slds-hide");        
        component.set("v.pathToSet","Tabs");
        helper.triggerPathEvent(component, event);
        $A.util.removeClass(component.find("subTabLists"), "unhideElement");
        $A.util.addClass(component.find("subTabLists"), "hideElement");
          
        //Set cmp and cmpParams
        var cmp;
        var cmpParams = {};      
        cmpParams["templateId"] = component.get("v.templateId");
        var cmpNavigationList = component.get("v.cmpNavigationList");
        cmpNavigationList.shift();
        component.set("v.cmpNavigationList",cmpNavigationList);
        cmpParams["cmpNavigationList"] = cmpNavigationList;        
        cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
        cmpParams["userChoice"] = component.get("v.userChoice");
        cmpParams["tabName"] = component.get("v.tabName");
        cmp = "c:adminTabHomePageCmp";
        helper.createComponent(component,event,helper,cmp,cmpParams);                 
    }
    
    
})