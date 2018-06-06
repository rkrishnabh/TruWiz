({
    /* Method Name: doInit
     * Comments : This method used for display tabDetails based on tabId. 
     */ 
    doInit: function(component,event,helper){   
        console.log('doInit');
    
        helper.editTabData(component, event, helper);
    },
    /* Method Name: goToPrevious
     * Comments : This method used for navigating back to TabhomePage. 
     */ 
    goToPrevious: function(component,event,helper){
        console.log('goToPrevious');
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        $A.util.removeClass(component.find("createTab"), "unhideElement");
        $A.util.addClass(component.find("createTab"), "hideElement");
        $A.util.removeClass(component.find("tabLists"), "hideElement");
        $A.util.addClass(component.find("tabLists"), "unhideElement");
        helper.navigateToCmp(component,event,helper);        
    },
    /* Method Name: save
     * Comments : This method used for saving and updatpng tabs. 
     */ 
    save : function(component, event, helper) {
        console.log('save');
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        helper.save(component, event, helper);
    },
    
    
    /* Method Name: templatePopup
     * Comments : This method used for display all templates onclick. 
     */ 
    templatePopup : function(component, event, helper){
        console.log('templatePopup');
        component.set("v.templatePopupBoolean",true);
        var action = component.get("c.getTemplates");
        console.log('action'+JSON.stringify(action));
        var templateColumns = [
            {
                'label':'Template',
                'name':'Template_Name__c',
                'value':'string'
            }
        ];
        
        //Configuration data for the table to enable actions in the table
        var templateTableConfiguration = 
            {
                "searchBox":true,
                "searchByColumn":true,
                "rowAction":
                [
                    {
                        "label":"Select",
                        "type":"url",
                        "id":"viewTemplate"
                    }                    
                ]   
            };
                    
        //Set up the callback
        //Callback the action, to set the result into attributes for displaying the data in Table
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var templateList = response.getReturnValue();
                component.set("v.templateList", templateList);
                component.set("v.templateColumnsList",templateColumns);
                component.set("v.templateTableConfigurationMap",templateTableConfiguration);
                window.setTimeout($A.getCallback(function(){ 
                    component.find("templateListTable").initialize({"itemMenu":[5]});
                }),500);    
            }else
                helper.showToastMsg(component,event,helper,"Error","Error while calling templateList. Please try again.");
        });        
        $A.enqueueAction(action);                
        
    },
    /* Method Name: closedPopUp
     * Comments : This method used for closing the popup. 
     */ 
    closedPopUp : function(component, event, helper) 
    {
        console.log('closedPopUp');
        component.set("v.templatePopupBoolean",false);
    },
    /* Method Name: templateClickAction
     * Comments : This method used for displaying templates onclick. 
     */
    templateClickAction : function(component,event,helper){ 
        console.log('templateClickAction'); 
        //get the id of the action being fired
        var actionId = event.getParam('actionId');
        if(actionId !="" && actionId != null && actionId != undefined){        
            if(actionId == 'viewTemplate'){
                var clickedRow = event.getParam('row');
                var selectedTemplateId = clickedRow.Id;
                var recordName = clickedRow.Template_Name__c;
                component.set("v.templatePopupBoolean",false);
                component.set("v.templateId",selectedTemplateId);   
                component.set("v.selectedTemplateName",recordName);
                var tabObj = component.get("v.tabObj");
                tabObj.Template__c = selectedTemplateId;
                component.set("v.tabObj",tabObj);                
            }
            event.setParam("actionId","");
        }
    },
    /* Method Name: handleProfile
     * Comments : This method is user for saving and updating Profile Name. 
     */
    handleProfile : function(component,event,helper){
        console.log('Inside handleProfile');
        var val = component.find("profile").get("v.value");
        var allProfileNames = component.get("v.allProfileNames");
        var name,label;
        Object.keys(component.get("v.allProfileNames")).forEach(function(index){
            if(component.get("v.allProfileNames")[index].Id == val){
                name = component.get("v.allProfileNames")[index].Name;
                label = component.get("v.allProfileNames")[index].Id;
                return false;
            }
        })
        var tabObj = component.get("v.tabObj");
        tabObj["Profile__c"] = name;
        component.set("v.tabObj",tabObj);        
    },
     
   
    /* Method Name: hideElements
     * Comments : This method used for hiding Elements. 
     */
    hideElements : function (component, event, helper){
        //debugger;
        var eventExecuted = event.getParam("eventExecuted");
        if(eventExecuted != "true"){
            console.log('hideElements in adminTabDetailsPageCmp');            
            var auraIdListToHide = event.getParam("auraIdListToHide");
            auraIdListToHide.forEach(function(auraId){
                $A.util.removeClass(component.find(auraId), "unhideElement");
                $A.util.addClass(component.find(auraId), "hideElement");             
            });            
            event.setParam("eventExecuted","true");
        }
    },
    /* Method Name: captureSelectedLookUpValEvent
     * Comments : This method used for getting the lookup values from customlookupcomponent. 
     */
    captureSelectedLookUpValEvent : function(component, event, helper){
        console.log('Inside captureSelectedLookUpValEvent..');
        var revisedSelectedLookUpValues =  event.getParam("revisedSelectedLookUpValues");
        console.log('revisedSelectedLookUpValues'+revisedSelectedLookUpValues);
        if(revisedSelectedLookUpValues != undefined){
            revisedSelectedLookUpValues = revisedSelectedLookUpValues.replace(new RegExp(',', 'gi'), ';')                                
        }
        var revisedSelectedLookUpIdValues =  event.getParam("revisedSelectedLookUpIdValues");
        console.log('revisedSelectedLookUpIdValues'+revisedSelectedLookUpIdValues);
        var tabObj = component.get("v.tabObj");
        tabObj.Profile__c = revisedSelectedLookUpValues;
        tabObj.ProfileId__c = revisedSelectedLookUpIdValues;
        component.set("v.tabObj",tabObj); 
    }
})