({
    /* Method Name: doInit
     * Comments : This method is used for getting all tabs while page loading. 
     */
    doInit: function (component,event, helper){
        helper.loadDataForTabs(component, event);  
    },
    /* Method Name: handleTabChange
     * Comments : This method is used for getting all tabs while onchenge. 
     */
    handleTabChange : function(component,event,helper){
        component.set("v.tabIdClone",component.find("tabListSelect").get("v.value"));
        helper.loadDataForSubTabs(component, event);           
    },
    /* Method Name: handleSubTabChange
     * Comments : This method is used for getting all subtabs while onchenge. 
     */
    handleSubTabChange : function(component,event,helper){
        component.set("v.subTabIdClone",component.find("subTabListSelect").get("v.value"));
        helper.loadDatatableForQuestions(component, event);
    },
     /* Method Name: scriptLoaded
     * Comments : This method is used for dragiging and droping sequence. 
     */
    scriptLoaded : function(component, event, helper) {
        var $ = jQuery.noConflict();
        var myEvent = $A.get("e.c:sortevent");
        $( "#sortable" ).sortable({
            update: function( ) {
                var v = component.get("v.bropped");
                component.set("v.bropped",!v);
            }
        });
    },
     /* Method Name: upDateSequence
     * Comments : This method is used for updating sequence. 
     */
    upDateSequence: function(component, event,helper) {
        helper.upDatequestionSequence(component, event);
    },
    /* Method Name: goToPrevious
     * Comments : This method is used for navigate back to QuestionHomePage. 
     */
    goToPrevious: function(component,event,helper) {
        component.set("v.pathToSet","Template");
        $A.util.removeClass(component.find("questionSequence"), "unhideElement");
        $A.util.addClass(component.find("questionSequence"), "hideElement"); 
        helper.navigateToCmp(component,event,helper);
    }  

        })