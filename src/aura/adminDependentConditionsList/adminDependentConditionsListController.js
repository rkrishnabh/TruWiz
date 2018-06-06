({
      /*
Method Name : doInit
Comments    : This method used to load existing DependentConditions in data table
 */
    doInit : function(component, event, helper){
        var name = component.get("v.name");
        console.log('dependnt list...'+name);
        helper.loadDependentConditions(component,event,helper);
       
    }, 
    
    /*
Method Name : dtClickAction
Comments    : This method is handled by event
 */     
    dtClickAction : function(component,event,helper){ 
        helper.dtClickActionClicked(component,event,helper);
    },
})