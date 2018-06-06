({
    /* Method Name: doInit
     * Comments : This method is used for getting all tabs while page loading. 
     */
    doInit: function (component, event, helper) {
        if(component.get("v.loadSortableForSecndTime")==true)
         helper.scriptLoaded(component, event, helper);  
        console.log("loadSortableForSecndTime..."+component.get("v.loadSortableForSecndTime"));
    },
    /* Method Name: upDateSequence
     * Comments : This method is used for updating sequence. 
     */
    upDateSequence: function (component,event, helper){
        helper.upDateTabSequence(component, event, helper);
    },
    /* Method Name: scriptLoaded
     * Comments : This method is used for dragiging and droping sequence. 
     */
    scriptLoaded : function(component, event, helper) {
        console.log("JavaScript Files..");
        helper.scriptLoaded(component, event, helper);
        
    },
    /* Method Name: goToPrevious
     * Comments : This method is used for navigate back to TabHomePage. 
     */
    goToPrevious: function(component,event,helper){
        component.set("v.pathToSet","Template");
        $A.util.removeClass(component.find("tabSequence"), "unhideElement");
        $A.util.addClass(component.find("tabSequence"), "hideElement"); 
        helper.navigateToCmp(component,event,helper);
    }  
    
    
})