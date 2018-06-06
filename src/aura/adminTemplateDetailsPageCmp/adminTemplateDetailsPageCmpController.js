({
    /* Method Name: doInit
     * Comments : This method fetch template details  while page loading. 
     */  
    doInit : function(component, event, helper) {
        console.log('doInit');
        helper.editTemplateData(component, event, helper);
    },
    /* Method Name: navigateToTabs
     * Comments : This method is used for navigating to tabDetailsPage. 
     */
    navigateToTabs : function(component, event, helper) {
        console.log('navigateToTabs');
        component.set("v.btnSaveOrNext","SaveNext");
        component.set("v.pathToSet","Tabs");        
        helper.save(component, event, helper);
    },
    /* Method Name: save
     * Comments : This method is user for saving and updating template. 
     */
    save : function(component, event, helper) {
        console.log('save');
        component.set("v.btnSaveOrNext","Save");      
        helper.save(component, event, helper);
    },
    /* Method Name: handleObjectChange
     * Comments : This method is user for saving and updating template. 
     */
    handleObjectChange : function(component,event,helper){
        console.log('handleObjectChange');
        var val = component.find("dynamicObjectName").get("v.value");
        var name,label;
        Object.keys(component.get("v.sfObjectsList")).forEach(function(index){
            if(component.get("v.sfObjectsList")[index].Name == val){
                name = component.get("v.sfObjectsList")[index].Name;
                label = component.get("v.sfObjectsList")[index].Label;
                return false;
            }
        })
        
        var templateObj = component.get("v.templateObj");
        templateObj["Object_Name__c"] = label;
        component.set("v.templateObj",templateObj);        
    },
    /* Method Name: goToPrevious
     * Comments : This method is used for navigating to templateHomePage. 
     */
    goToPrevious: function(component,event,helper){
        console.log('goToPrevious');     
        //Conditional Back
        var userChoice = component.get("v.userChoice");
        var sfObjectsList = component.get("v.sfObjectsList");
        var cmpNavigationList = component.get("v.cmpNavigationList");
        cmpNavigationList.shift();
        var cmpBack = cmpNavigationList[0];        
        component.set("v.cmpNavigationList",cmpNavigationList);        
        if(cmpBack==null || cmpBack==undefined)
            cmpBack = "c:adminTemplateHomePageCmp";
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef : cmpBack,
            componentAttributes: {
                userChoice:userChoice,
                cmpNavigationList:cmpNavigationList,
                sfObjectsList:sfObjectsList
            }             
        });
        evt.fire();   
    } 
})