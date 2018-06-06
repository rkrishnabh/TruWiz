({
    /* Method Name: doInit
     * Comments : This method used for display tabList  while page loading. 
     */  
    doInit: function (component,event, helper){
        console.log('doInit');
        helper.loadTabs(component, event);
    },
    /* Method Name: navigateToSubTabs
     * Comments : This method used for navigating to SubTabs. 
     */ 
    navigateToSubTabs: function (component,event, helper){
        console.log('navigateToSubTabs');
        helper.navigateToSubTabs(component,event);
    },
    /* Method Name: tabActionClicked
     * Comments : This method is used for clicking based on ActiondId it navigate to different Pages. 
     */
    tabActionClicked : function(component,event,helper){
        console.log('tabActionClicked');
        //get the id of the action being fired
        var actionId = event.getParam('actionId');        
        if(actionId !="" && actionId != null && actionId != undefined){
            var createComponentFlag = true;
            var cmp;
            var cmpParams = {};                            
            
            if(actionId == 'editTab'){ 
                var clickedRow = event.getParam('row');
                cmpParams["tabId"] = clickedRow.Id;
                console.log('clickedRow.Id tabs...'+clickedRow.Id);
                cmpParams["tabName"] = clickedRow.Tab_Name__c;	
                cmpParams["tabProfile"] = clickedRow.Profile__c;
                cmpParams["tabProfileId"] = clickedRow.ProfileId__c;
                cmp = "c:adminTabDetailsPageCmp";                
            }else if(actionId == 'addTab'){
                cmp = "c:adminTabDetailsPageCmp";                
            }else if(actionId == 'removeRow'){
                createComponentFlag = false;
                var rowIdx = event.getParam("index");
                var clickedRow = event.getParam('row');
                var selectedDeletedTabId = clickedRow.Id;
                console.log('selectedDeletedTabId'+selectedDeletedTabId);
                component.set("v.selectedDeletedTabId", selectedDeletedTabId);
                helper.deleteTabs(component, event); 
                var allTabList = component.get("v.tabList")
                console.log('allTabList'+JSON.stringify(allTabList));
                allTabList.splice(rowIdx, 1);
                allTabList.forEach(function(tab,index){
                    console.log(tab.Sequence__c);
                    if(index >= rowIdx)
                        tab.Sequence__c = tab.Sequence__c - 1;                    
                });
                component.set("v.tabList", allTabList);
                component.find("tabListTable").rerenderRows();
            }else if(actionId == 'sequenceChange')
                cmp = "c:adminTabSequencePageCmp";
            
            cmpParams["templateId"] = component.get("v.templateId");
            cmpParams["tabList"] = component.get("v.tabList");            
            cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
            cmpParams["userChoice"] = component.get("v.userChoice"); 
            cmpParams["loadSortableForSecndTime"] = component.get("v.loadSortableForSecndTime");
            event.setParam("actionId","");            
            if(createComponentFlag){
                var cmpNavigationList = component.get("v.cmpNavigationList");
                cmpNavigationList.unshift(cmp);
                component.set("v.cmpNavigationList",cmpNavigationList);            
                cmpParams["cmpNavigationList"] = component.get("v.cmpNavigationList");                
                $A.util.removeClass(component.find("spinner"), "slds-hide");
                $A.util.removeClass(component.find("tabLists"), "unhideElement");
                $A.util.addClass(component.find("tabLists"), "hideElement");                
                helper.createComponent(component,event,helper,cmp,cmpParams);
            }                
        }
        
    },
   
    /* Method Name: goToPrevious
     * Comments : This method used for navigating back to TemplatedetailsPage. 
     */ 
    goToPrevious: function(component,event,helper) 
    {
        console.log('goToPrevious');
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        component.set("v.pathToSet","Template");
        helper.triggerPathEvent(component, event);        
        $A.util.removeClass(component.find("tabLists"), "unhideElement");
        $A.util.addClass(component.find("tabLists"), "hideElement");

        var cmp;
        var cmpParams = {};
        cmpParams["templateId"] = component.get("v.templateId");
        var cmpNavigationList = component.get("v.cmpNavigationList");
        cmpNavigationList.shift();
        component.set("v.cmpNavigationList",cmpNavigationList);
        cmpParams["cmpNavigationList"] = cmpNavigationList;        
        cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
        cmpParams["userChoice"] = component.get("v.userChoice");
        cmp = "c:adminTemplateDetailsPageCmp";

        helper.createComponent(component,event,helper,cmp,cmpParams);         
    }   
})