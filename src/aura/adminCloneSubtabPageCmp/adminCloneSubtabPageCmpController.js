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
        helper.loadDatatableForSubatbs(component, event);        
    },
   
    /* Method Name: save
     * Comments : This method is used for saving  the cloned question records. 
     */
    save : function(component, event, helper) {
        var selectedSubtabs = component.find("subtabListTable").get("v.selectedRows");
        console.log('selectedSubtabs'+selectedSubtabs);
        var listSubatbIds = [];
        var oId,oVal;
        selectedSubtabs.forEach(function(d){
            listSubatbIds.push(d.Id);
        });         
       var selectedTabId = component.get("v.selectedTabId");
        var action = component.get("c.insertCloneSubtabs");
        action.setParam("selectedTabId", selectedTabId);
        action.setParam("listSubatbIds", listSubatbIds);
        action.setCallback(this,function(a){
            var state = a.getState();
            console.log('state:',state);
            if (state == "SUCCESS") {
                var showToast = $A.get('e.force:showToast');
                showToast.setParams({
                    'title': 'Subtabs',
                    'message': 'Subtabs Copied Successfully',
                    'type': 'success'
                });            
                showToast.fire();
                
                $A.util.removeClass(component.find("cloneSubtab"), "unhideElement");
                $A.util.addClass(component.find("cloneSubtab"), "hideElement");
                $A.util.removeClass(component.find("subTabLists"), "hideElement");
                $A.util.addClass(component.find("subTabLists"), "unhideElement");
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
        $A.util.removeClass(component.find("cloneSubtab"), "unhideElement");
        $A.util.addClass(component.find("cloneSubtab"), "hideElement");
        $A.util.removeClass(component.find("subTabLists"), "hideElement");
        $A.util.addClass(component.find("subTabLists"), "unhideElement");
        helper.navigateToCmp(component,event,helper);
        
    }
})