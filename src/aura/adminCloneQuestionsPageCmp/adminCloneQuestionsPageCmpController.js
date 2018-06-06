({
    /* Method Name: doInit
     * Comments : This method is used for getting all templates while page loading. 
     */
    doInit: function (component,event, helper){
        helper.loadDataForTemplates(component, event);
    },
    /* Method Name: handleTemplateChange
     * Comments : This method is used for while changing the template related tabs was displaying. 
     */
    handleTemplateChange : function(component,event,helper){
        component.set("v.templateIdClone",component.find("templateListSelect").get("v.value"));
        helper.loadDataForTabs(component, event);
    },
    /* Method Name: handleTabChange
     * Comments : This method is used for while changing the tab related subtabs was displaying. 
     */
    handleTabChange : function(component,event,helper){
        component.set("v.tabIdClone",component.find("tabListSelect").get("v.value"));
        helper.loadDataForSubTabs(component, event);        
    },
    /* Method Name: handleSubTabChange
     * Comments : This method is used for while changing the subtab related questions was displaying. 
     */
    handleSubTabChange : function(component,event,helper){
        component.set("v.subTabIdClone",component.find("subTabListSelect").get("v.value"));
        helper.loadDatatableForQuestions(component, event);
    },
    /* Method Name: save
     * Comments : This method is used for saving  the cloned question records. 
     */
    save : function(component, event, helper) {
        var selectedQuestions = component.find("questionsListTable").get("v.selectedRows");
        console.log('selectedQuestions'+selectedQuestions);
        var listQuestionIds = [];
        var oId,oVal;
        selectedQuestions.forEach(function(d){
            listQuestionIds.push(d.Id);
        });         
       var selectedSubTabId = component.get("v.selectedSubTabId");
        var action = component.get("c.insertCloneQuestions");
        action.setParam("selectedSubTabId", selectedSubTabId);
        action.setParam("listQuestionIds", listQuestionIds);
        action.setCallback(this,function(a){
            var state = a.getState();
            console.log('state:',state);
            if (state == "SUCCESS") {
                var showToast = $A.get('e.force:showToast');
                showToast.setParams({
                    'title': 'Questions',
                    'message': 'Questions Copied Successfully',
                    'type': 'success'
                });            
                showToast.fire();
                
                $A.util.removeClass(component.find("cloneQuestion"), "unhideElement");
                $A.util.addClass(component.find("cloneQuestion"), "hideElement");
                $A.util.removeClass(component.find("questionsLists"), "hideElement");
                $A.util.addClass(component.find("questionsLists"), "unhideElement");
                helper.navigateToCmp(component,event,helper);                
                
            }
        });
        $A.enqueueAction(action);      
    }, 
    /* Method Name: backToEventList
     * Comments : This method is used calling navigateToCmp. 
     */
    backToEventList: function(component,event,helper) 
    {
        $A.util.removeClass(component.find("cloneQuestion"), "unhideElement");
        $A.util.addClass(component.find("cloneQuestion"), "hideElement");
        $A.util.removeClass(component.find("questionsLists"), "hideElement");
        $A.util.addClass(component.find("questionsLists"), "unhideElement");
        helper.navigateToCmp(component,event,helper);
        
    }
})