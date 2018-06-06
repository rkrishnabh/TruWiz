({
    /* Method Name: getAllSfObjects
     * Comments : This method is used for fetch all sobjects in the org. 
     */   
    getAllSfObjects : function(component,event,helper) {        
        console.log('getAllSfObjects');      
        var action = component.get("c.getAllSfObjectNames");//get data from controller
        action.setCallback(this, function(a) {
            $A.util.addClass(component.find("spinner"), "slds-hide");            
            var state = a.getState(); 
            if(state == "SUCCESS"){
                console.log('Value'+JSON.stringify(a.getReturnValue()));
                var sfObjectsList = a.getReturnValue();
                console.log('Value'+JSON.stringify(sfObjectsList)); 
                component.set("v.sfObjectsList",sfObjectsList);                
            }else
                this.showToastMsg(component,event,helper,"Error","Error in loading all Salesforce Objects");
        });
        $A.enqueueAction(action);           
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