({	 
    /* Method Name: upDateSequence
     * Comments : This method is used for updating sequence. 
     */
    upDateSequence: function (component,event, helper){
        helper.upDatesubTabSequence(component, event, helper);
    },
    /* Method Name: scriptLoaded
     * Comments : This method is used for dragiging and droping sequence. 
     */
    scriptLoaded : function(component, event, helper) {
        var tabList = component.get("v.tabList");
        var $ = jQuery.noConflict();
        var action = component.get("c.getAllSubTabs");
        action.setParams({
            tabList:tabList
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            var subTabList = response.getReturnValue();
            component.set("v.subTabList", subTabList);
            console.log('subTabList'+JSON.stringify(component.get('v.subTabList')));
            var myEvent = $A.get("e.c:sortevent");
            $( "#sortable" ).sortable({
                update: function( ) {
                    var v = component.get("v.bropped");
                    component.set("v.bropped",!v);
                }
                
            });
        });
        $A.enqueueAction(action);
    },
    /* Method Name: handleTabChange
     * Comments : This method is used for getting all tabs while onchenge. 
     */
    handleTabChange :function(component,event){
        component.set("v.tabId",component.find("tabListSelect").get("v.value"));
        var selectedTabId = component.get('v.tabId'); 
        console.log('tabId..'+component.get('v.tabId'));
        var subTabListSequencebefore = component.get('v.subTabList');
        var subTabListSequenceAfter = [];
        if(subTabListSequencebefore != null &&  subTabListSequencebefore !='' && subTabListSequencebefore != undefined   && subTabListSequencebefore.length > 0 ){
            for(var i=0; i < subTabListSequencebefore.length;i++){
                if(subTabListSequencebefore[i].Tabs__c == selectedTabId){
                    subTabListSequenceAfter.push(subTabListSequencebefore[i]);
                }
            }
            component.set("v.subTabSequenceList",subTabListSequenceAfter);
            console.log('subTabListSequenceAfter..'+JSON.stringify(subTabListSequenceAfter));
        }else{
            console.log('List has no tab records..');
        }
    },
    /* Method Name: goToPrevious
     * Comments : This method is used for navigate back to QuestionHomePage. 
     */
    goToPrevious: function(component,event,helper) 
    {
        component.set("v.pathToSet","Template");
        $A.util.removeClass(component.find("subtabSequence"), "unhideElement");
        $A.util.addClass(component.find("subtabSequence"), "hideElement"); 
        helper.navigateToCmp(component,event,helper);
    }  
    
})