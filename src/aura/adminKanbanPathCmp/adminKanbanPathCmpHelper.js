({
    /* Method Name: navigateToTemplate
     * Comments : This method is used for Navigating to templateDetailsPage. 
     */
    navigateToTemplate : function(component,event,helper, cmp, cmpParams, pathToSet) {
        console.log('navigateToTemplate');       
        
        var cmpNavigationList = component.get("v.cmpNavigationList");
        cmpNavigationList.unshift(cmp);
        component.set("v.cmpNavigationList",cmpNavigationList);
        cmpParams["cmpNavigationList"] = cmpNavigationList;        
        cmpParams["userChoice"] = component.get("v.userChoice");
		this.pathSetter(component, event, helper, pathToSet);        
        helper.createComponent(component,event,helper,cmp,cmpParams);        
       },
    /* Method Name: createComponent
     * Comments : For calling $A.createComponents.
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
     * Comments : This is unique method for displaying errormessages
     */    
    showToastMsg : function(component,event,helper,title,msg) {
        console.log('showToastMsg');
        var showToast = $A.get('e.force:showToast');            
        showToast.setParams({
            'title': title,
            'message': msg});
        showToast.fire();        
    },
    pathSetter : function(component,event,helper, pathToSet){
        var tabsList = component.get("v.tabList");
        var name, objData = [], selected = false;
        tabsList.forEach(function(path){
            selected = false;
            if(path.Name == pathToSet)
                selected = true;
            else
                selected = false;
            objData.push({Name: path.Name, Selected: selected});
        });
        component.set("v.tabList",objData);         
    }
})