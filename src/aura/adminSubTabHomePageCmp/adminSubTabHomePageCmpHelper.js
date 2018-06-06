({
    /* Method Name: loadAllSubTabs
     * Comments : This method used for display allsubtabs related to allTabs in template  while page loading. 
     */ 
    loadSubTabs: function(component,event,helper){ 
        console.log('loadSubTabs'); 
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        var tabId = component.get("v.tabId");
        console.log('tabId'+tabId);
        var tabObj = component.get("v.tabObj");
        var tabList=component.get("v.tabList");
        console.log('tabList'+tabList);
        if(tabId != undefined && tabId != null && tabId != ''){
            tabObj.Id = tabId;
            tabList.push(tabObj);
            console.log('tabList'+tabList);
            component.set("v.showButtonsNavigation",false);
        }
        var action = component.get("c.getAllSubTabs");
       
        action.setParams({
            tabList:tabList
        });
        
        //Displaying selected subtab fields as Configuration data for the table
        var subTabColumns = [
            {
                'label':'Tab Name',
                'name':'Subtabs_Tab__c',
                'type':'string'
            },
            {
                'label':'SubTab Name',
                'name':'SubTab__c',
                'value':'string'
            },
            {
                'label':'Sequence',
                'name':'Sequence__c',
                'type':'number'
            }
        ];
        //Configuration data for the table to enable actions in the table
        var tabId = component.get("v.tabId");
        console.log('tabId'+tabId); 
        var subTabTableConfiguration = "";
          if(tabId != '' && tabId != null && tabId != undefined){
            subTabTableConfiguration = 
                {
                "searchBox":true,
                "searchByColumn":true,
                "globalAction":[
                    
                    {
                        "label":"New SubTab",
                        "type":"button",
                        "id":"addSubTab",
                        "class":"slds-button slds-button--neutral"
                    },
                    {
                        "label":"Copy SubTab",
                        "type":"button",
                        "id":"copySubTab",
                        "class":"slds-button slds-button--neutral"
                    }
                  ],
                "rowAction":
                [
                    {
                        "label":"Edit",
                        "type":"url",
                        "id":"editSubTab"
                    },
                    {
                        "label":"Delete",
                        "type":"url",
                        "id":"deleteSubTab"
                    }                   
                ]   
            };
        }
        else{
        subTabTableConfiguration = 
            {
                "searchBox":true,
                "searchByColumn":true,
                "globalAction":[
                    {
                        "label":"New",
                        "type":"button",
                        "id":"addSubTab",
                        "class":"slds-button slds-button--neutral"
                    },
                    {
                        "label":"Sequence",
                        "type":"button",
                        "id":"subTabTabSequence",
                        "class":"slds-button slds-button--neutral"
                    }
                ],
                "rowAction":
                [
                    {
                        "label":"Edit",
                        "type":"url",
                        "id":"editSubTab"
                    },
                    {
                        "label":"Delete",
                        "type":"url",
                        "id":"deleteSubTab"
                    }
                ]
            }
            };
        //Callback the action, to set the result into attributes for displaying the data in subtabList Table
        action.setCallback(this, function(response) {
            $A.util.addClass(component.find("spinner"), "slds-hide");            
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var subTabList = response.getReturnValue();
                console.log('subTabList'+JSON.stringify(subTabList));
                component.set("v.subTabList", subTabList);
                component.set("v.subTabColumnsList",subTabColumns);
                component.set("v.subTabTableConfigurationMap",subTabTableConfiguration);
                window.setTimeout($A.getCallback(function(){  
                }),500); 
                component.find("subTabListTable").initialize({"order":[2, "asc"],"itemMenu":[5]});
            }else
                this.showToastMsg(component,event,helper,"Error","Error while calling subTabList Cmp. Please try again.");
        });        
        
        $A.enqueueAction(action);                
    },
    
    /* Method Name: navigateToQuestions
     * Comments : This method used for navigating to Questions. 
     */ 
    navigateToQuestions : function(component, event, helper){
        console.log('navigateToQuestions'); 
        var subTabList = component.get("v.subTabList");
        if(subTabList != null && subTabList != "" && subTabList != undefined && subTabList.length>0){
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        component.set("v.pathToSet","Questions");
        this.triggerPathEvent(component, event);         
        $A.util.removeClass(component.find("subTabLists"), "unhideElement");
        $A.util.addClass(component.find("subTabLists"), "hideElement");
        
        //Set cmp and cmpParams
        var cmp;
        var cmpParams = {};
        cmpParams["subTabList"] = component.get("v.subTabList");        
        cmpParams["tabList"] = component.get("v.tabList");        
        cmpParams["templateId"] = component.get("v.templateId");
        var cmpNavigationList = component.get("v.cmpNavigationList");
        cmpNavigationList.unshift('c:adminQuestionsHomePageCmp');
        component.set("v.cmpNavigationList",cmpNavigationList);
        cmpParams["cmpNavigationList"] = cmpNavigationList;        
        cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
        cmpParams["userChoice"] = component.get("v.userChoice");
        cmpParams["tabName"] = component.get("v.tabName");    
        cmp = "c:adminQuestionsHomePageCmp";
        this.createComponent(component,event,helper,cmp,cmpParams);  
        }else
         this.showToastMsg(component,event,helper,"","There are no SubTabs available.Please create");
    
    },
     /* Method Name: save
     * Comments : This method used for deleting subtabs. 
     */ 
    deleteSubTab : function(component, event, helper){
        console.log('deleteSubTab'); 
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        var selectedDeletedSubTabId = component.get("v.selectedDeletedSubTabId");
            console.log('selectedDeletedSubTabId'+selectedDeletedSubTabId);
            var action = component.get('c.deleteSubTabDetails');
            action.setParams({
                selectedDeletedSubTabId:selectedDeletedSubTabId
            });
            action.setCallback(this, function(response){
                var state = response.getState();
                if(state == "SUCCESS"){ 
                   this.showToastMsg(component,event,helper,"Success","Sub Tab Deleted Successfully."); 
                   this.updateSubTabSequence(component,event,helper);   
                }else{
                    $A.util.addClass(component.find("spinner"), "slds-hide");
                    this.showToastMsg(component,event,helper,"Error","Error while calling deleteSubTabs. Please try again."); 
                }
            });
            $A.enqueueAction(action);            
       
    },
    /* Method Name: updateSubTabSequence
     * Comments : This method used for deleting subtabs and update the subtabsequence. 
     */ 
    updateSubTabSequence : function(component, event, helper){
        var subTabList = component.get("v.subTabList");
        var action = component.get('c.updateSubTabSequence');
        action.setParams({
            subTabList:subTabList
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){ 
                 $A.util.addClass(component.find("spinner"), "slds-hide");
               }else{
                $A.util.addClass(component.find("spinner"), "slds-hide");
                this.showToastMsg(component,event,helper,"Error","Error while SubTab Sequence Update. Please try again.");   
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
     * Comments : Unique method for displaying errormessages. 
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