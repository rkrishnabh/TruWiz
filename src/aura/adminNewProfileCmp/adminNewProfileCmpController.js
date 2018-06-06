({
    /*
Method Name : doInit
Usage       : This method is used for loading profiles
*/    
    doInit : function(component, event, helper) {
        helper.loadProfiles(component, event);
    },
    /*
Method Name : save
Usage       : This method is used for save profiles
*/       
    save : function(component, event, helper) {
        helper.save(component, event, helper);   
    },
    /*
Method Name : goToPrevious
Usage       : This method is used for back navigation
*/       
    goToPrevious : function(component, event, helper) {
        helper.navigateToCmp(component, event, helper);   
    }
    
})