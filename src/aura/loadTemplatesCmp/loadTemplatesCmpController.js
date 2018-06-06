({
    loadAllTemplatesRelToObject : function(component, event, helper) {
        helper.loadAllTemplatesRelToObject(component, event, helper);        
    },
    
    templateActionClicked : function(component,event,helper){
        var recordId = component.get("v.recordId");
        var actionId = event.getParam('actionId');
        
        if(actionId == 'editTemplate')
        {  
            $A.util.removeClass(component.find("spinner"), "slds-hide");
            var rowIdx = event.getParam("index");
            var templateList = component.get("v.templateList");
            var clickedRow = event.getParam('row');
            console.log('Selected template id..'+JSON.stringify(clickedRow));
            var action = component.get("c.createTemplateDraftRecord");
            var templateId = clickedRow.Id;
            var templateName;
            for(var i = 0; i < templateList.length; i++){
                var template = templateList[i];
                if(template.Id === templateId)
                    templateName =  template.Template_Name__c;
            }
            console.log('templateName..'+templateName);
            action.setParams({ 
                recordId : recordId,
                templateId : templateId,               
                templateName : templateName
            });
            
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var Id = response.getReturnValue(); 
                    console.log('updated Record Id..'+Id);
                    $A.util.addClass(component.find("spinner"), "slds-hide"); 
                    $A.util.toggleClass(component.find("templateLists"), "slds-hide");
                    $A.createComponents([["c:globalTabsCmp",{  recordId : recordId,templateId:clickedRow.Id}]],
                                        function(templateDetailPage, status){
                                            if (component.isValid() && status === 'SUCCESS'){ 
                                                component.set("v.body", templateDetailPage);
                                            }  
                                        });
                    
                }else if (state === "ERROR"){
                    console.log('Error while loading dynamic wizard..');
                }
            });        
            $A.enqueueAction(action);            
        }  
    }
})