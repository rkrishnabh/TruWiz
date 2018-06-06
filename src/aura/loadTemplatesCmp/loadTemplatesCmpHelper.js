({
    loadAllTemplatesRelToObject: function(component,event,helper){ 
        var recordId = component.get("v.recordId");
        var action = component.get("c.loadTemplatesRelatedToObject");
        action.setParams({ 
            recordId : recordId               
        });
        
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
        var templateTableConfiguration = 
            {
                "searchBox":true,
                "searchByColumn":true,
                "globalAction":[
                    
                ],
                "rowAction":
                [
                    {
                        "label":"Select",
                        "type":"url",
                        "id":"editTemplate"
                    }
                ]   
            };
        //Callback the action, to set the result into attributes for displaying the data in Template Table
        var self = this;
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var templateList = response.getReturnValue();
                component.set("v.templateList", templateList);
                component.set("v.templateColumnsList",templateColumns);
                component.set("v.templateTableConfigurationMap",templateTableConfiguration);              
                component.find("templateListTable").initialize({"itemMenu":[5]});                
                $A.util.removeClass(component.find("templateLists"), "hideElement");
                $A.util.addClass(component.find("templateLists"), "unhideElement");                
            }            
        }); 
         $A.enqueueAction(action);                
     }	 
})