({
    /* Method Name: loadDatatable
     * Comments : This method fetch templateList  while page loading. 
     */  
    loadTemplates: function(component,event,helper){ 
        console.log('loadTemplates');
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        var action = component.get("c.getTemplates");
        //Displaying selected template fields as Configuration data for the table
        var templateColumns = [
            {
                'label':'Template Name',
                'name':'Template_Name__c',
                'value':'string'
            },
            {
                'label':'Description',
                'name':'Template_Description__c',
                'value':'string'
            },
            {
                'label':'Expiry Date',
                'name':'Expiry_DateFormula__c',
                'value':'string'
            }
        ];
        
        //Configuration data for the table to enable actions in the table
        var userChoice = component.get("v.userChoice"); 
        
        var templateTableConfiguration ="";
        if(userChoice == "EditTemplate"){
            
            templateTableConfiguration = 
                {
                "searchBox":true,
                "searchByColumn":true,
                "globalAction":[
                    {
                        "label":"New",
                        "type":"button",
                        "id":"New",
                        "class":"slds-button slds-button--neutral"
                    },
                ],
                    "rowAction":
                    [
                    {
                    "label":"Select",
                    "type":"url",
                    "id":"editTemplate"
                    },
                    {
                    "label":"Delete",
                    "type":"url",
                    "id":"deleteTemplate"
                    },
                ]   
            };
        }else if(userChoice == "CopyTemplate"){
            templateTableConfiguration = 
                {
                "searchBox":true,
                "searchByColumn":true,
                "globalAction":[
                    {
                        "label":"New",
                        "type":"button",
                        "id":"New",
                        "class":"slds-button slds-button--neutral"
                    },
                ],
                    "rowAction":
                    [
                    {
                    "label":"Copy",
                    "type":"url",
                    "id":"editTemplate"
                    },
                ]   
            }; 
        }
      
        action.setCallback(this, function(response) {
            var state = response.getState();
            $A.util.addClass(component.find("spinner"), "slds-hide");            
            if(component.isValid() && state === 'SUCCESS'){
                var templateList = response.getReturnValue();
                component.set("v.templateList", templateList);
                component.set("v.templateColumnsList",templateColumns);
                component.set("v.templateTableConfigurationMap",templateTableConfiguration);
                
                window.setTimeout($A.getCallback(function(){  
                    component.find("templateListTable").initialize({"itemMenu":[5]});                    
                }),200);
                
                $A.util.removeClass(component.find("templateLists"), "hideElement");
                $A.util.addClass(component.find("templateLists"), "unhideElement");
            }else                                      
                this.showToastMsg(component,event,helper,"Error","Error while calling Global Template Page. Please try again.");
        });        
        
        $A.enqueueAction(action); 
    },
   /* Method Name: deleteTemplates 
     * Comments : This method used for deleting templates. 
     */ 
    deleteTemplates : function(component, event, helper, selectedDeletedTemplateId, rowIdx){
        console.log('deleteTemplates');
        var action = component.get('c.deleteTemplateDetails');
        action.setParams({
            selectedDeletedTemplateId:selectedDeletedTemplateId
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            $A.util.addClass(component.find("spinner"), "slds-hide");            
            if(state == "SUCCESS"){             
                this.showToastMsg(component,event,helper,"Success","Template Deleted Successfully");
                
                var allTemplateList = component.get("v.templateList")
                allTemplateList.splice(rowIdx, 1);
                component.set("v.templateList", allTemplateList);
                component.find("templateListTable").rerenderRows();                
                
            }else{
                this.showToastMsg(component,event,helper,"Error","Error while Deleting Templates. Please try again.");                
            }
        });
        $A.enqueueAction(action);            
    },
    /* Method Name: createComponent
     * Comments : Refactored code to seperate Method for calling $A.createComponents.
     * Parameters : cmpName and cmpParams 
     */
    createComponent : function(component,event,helper,cmpName,cmpParams) {
        /*$A.createComponents([[cmpName,cmpParams]],
                            function(cmp, status){
                                $A.util.addClass(component.find("spinner"), "slds-hide");
                                if (component.isValid() && status === 'SUCCESS') 
                                    component.set("v.body", cmp);
                                else
                                    this.showToastMsg(component,event,helper,"Error","Error while calling component. Please try again.");
                            });*/

            /*Navigate to Component*/
            var evt=$A.get("e.force:navigateToComponent");           
            evt.setParams({
                componentDef:cmpName,
                componentAttributes: cmpParams           
            });
            evt.fire();
        
    },
    /* Method Name: showToastMsg
     * Comments : This method is used to show Toast Message.
     * Parameters : title and msg 
     */
    showToastMsg : function(component,event,helper,title,msg) {
        console.log('showToastMsg');
        var showToast = $A.get('e.force:showToast');            
        showToast.setParams({
            'title': title,
            'message': msg});
        showToast.fire();        
    }    
    
})