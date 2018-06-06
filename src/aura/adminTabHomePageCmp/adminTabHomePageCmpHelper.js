({
    /* Method Name: loadTabs
     * Comments : This method used for display alltabs related to template  while page loading. 
     */ 
    loadTabs: function(component,event,helper){ 
        console.log('loadTabs');
        var templateId = component.get("v.templateId");
        var action = component.get("c.getTabs");
        action.setParams({
            templateId:templateId
        });
        //Displaying selected tab fields as Configuration data for the table
        var tabColumns = [
            {
                'label':'Tab Name',
                'name':'Tab_Name__c',
                'value':'string'
                
            },
            {
                'label':'Sequence',
                'name':'Sequence__c',
                'value':'number'
            },
            {
                'label':'Template Name',
                'name':'Tabs_Template__c',
                'value':'string'
            }
            
        ];
        
        //Configuration data for the table to enable actions in the table
        var tabTableConfiguration = 
            {
                "searchBox":true,
                "searchByColumn":true,
                "itemsPerPage":5,
                "globalAction":[
                    {
                        "label":"New",
                        "type":"button",
                        "id":"addTab",
                        "class":"slds-button slds-button--neutral"
                    },
                   	{
                        "label":"Sequence",
                        "type":"button",
                        "id":"sequenceChange",
                        "class":"slds-button slds-button--neutral"
                    }
                ],
                "rowAction":
                [
                    {
                        "label":"Edit",
                        "type":"url",
                        "id":"editTab"
                    },
                    {
                        "label":"Delete",
                        "type":"url",
                        "id":"removeRow"
                    }
                ]   
            };
        //Callback the action, to set the result into attributes for displaying the data in Table
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){	
                var tabList = response.getReturnValue();
                component.set("v.tabList", tabList);
                component.set("v.tabColumnsList",tabColumns);
                component.set("v.tabTableConfigurationMap",tabTableConfiguration);
                window.setTimeout($A.getCallback(function(){
                    component.find("tabListTable").initialize({"order":[1, "asc"],"itemMenu":[5]});                    
                }),500);
            }
        });        
        $A.enqueueAction(action);                
    },
    /* Method Name: navigateToSubTabs
     * Comments : This method used for navigating to SubTabs. 
     */ 
    navigateToSubTabs : function(component, event, helper){
        console.log('navigateToSubTabs');        
         var tabList = component.get("v.tabList");
        if(tabList != null && tabList != "" && tabList != undefined && tabList.length > 0){
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        component.set("v.pathToSet","Sub Tabs");
        this.triggerPathEvent(component, event);        
        $A.util.removeClass(component.find("tabLists"), "unhideElement");
        $A.util.addClass(component.find("tabLists"), "hideElement");
        //Set cmp and cmpParams
        var cmp;
        var cmpParams = {};
        cmpParams["tabList"] = component.get("v.tabList");        
        cmpParams["templateId"] = component.get("v.templateId");
        var cmpNavigationList = component.get("v.cmpNavigationList");
        cmpNavigationList.unshift('c:adminSubTabHomePageCmp');
        component.set("v.cmpNavigationList",cmpNavigationList);
        cmpParams["cmpNavigationList"] = cmpNavigationList;        
        cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
        cmpParams["userChoice"] = component.get("v.userChoice");
        cmp = "c:adminSubTabHomePageCmp";
        this.createComponent(component,event,helper,cmp,cmpParams);
        }
         else
            this.showToastMsg(component,event,helper,"","There are no Tabs available.Please create");
    },
    /* Method Name: deleteTabs 
     * Comments : This method used for deleting tabs. 
     */ 
    deleteTabs : function(component, event, helper){
        console.log('deleteTabs');
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        var selectedDeletedTabId = component.get("v.selectedDeletedTabId");
        var action = component.get('c.deleteTabDetails');
        action.setParams({
            selectedDeletedTabId:selectedDeletedTabId
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){ 
                this.showToastMsg(component,event,helper,"Success","Tab Deleted Successfully");
                this.updateTabSequence(component,event,helper); 
            }else{
                $A.util.addClass(component.find("spinner"), "slds-hide");
                this.showToastMsg(component,event,helper,"Error","Error while Deleting Tabs. Please try again.");                
            }
        });
        $A.enqueueAction(action);            
    },        
    /* Method Name: updateTabSequence
     * Comments : This method used for deleting tabs and update the tabsequence. 
     */ 
    updateTabSequence : function(component, event, helper){
        console.log('updateTabSequence');
        var tabList = component.get("v.tabList");
        var action = component.get('c.updateTabSequence');
        action.setParams({
            tabList:tabList
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){ 
                $A.util.addClass(component.find("spinner"), "slds-hide");
               }else{
                $A.util.addClass(component.find("spinner"), "slds-hide");
                this.showToastMsg(component,event,helper,"Error","Error while Tab Sequence Update. Please try again.");                
            }
        });
        $A.enqueueAction(action);
    },
    /* Method Name: triggerPathEvent
     * Comments : This method is used for higlighting lightning Path during navigation
     */    
    triggerPathEvent : function(component,event,helper){
        console.log('triggerPathEvent');
        var pathDataEvnt = component.getEvent("pathDataEvnt");        
        pathDataEvnt.setParams({"Name":component.get("v.pathToSet")});
        pathDataEvnt.fire();        
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
                                    this.showToastMsg(component,event,helper,"Error","Error while calling component. Please try again.");
                            });        
    },   
    /* Method Name: showToastMsg
     * Comments : Unique method for displaying toastmessages. 
     */ 
    showToastMsg : function(component,event,helper,title,msg){
        console.log('showToastMsg');
        var showToast = $A.get('e.force:showToast');            
        showToast.setParams({
            'title': title,
            'message': msg});
        showToast.fire();        
    }    
})