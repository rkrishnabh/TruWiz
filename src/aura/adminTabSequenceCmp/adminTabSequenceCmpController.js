({
    upDateSequence: function (component,event, helper){
        helper.upDateTabSequence(component, event, helper);
    },
    scriptLoaded : function(component, event, helper) {
        console.log('ScriptLoaded...');
        var templateId = component.get("v.templateId");
        var $ = jQuery.noConflict();
        console.log('templateId'+templateId);
        var action = component.get("c.getTabs");
        //alert('action'+JSON.stringify(action));
        action.setParams({
            templateId:templateId
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            //if(component.isValid() && state === 'SUCCESS')
            //{
            var tabList = response.getReturnValue();
            component.set("v.tabList", tabList);
            console.log('tabList'+JSON.stringify(component.get('v.tabList')));
            var myEvent = $A.get("e.c:sortevent");
            
            
            $( "#sortable" ).sortable({
               
                update: function( ) {
                    var v = component.get("v.bropped");
                    console.log('bropped value..'+v);
                    component.set("v.bropped",!v);
                    console.log('After bropped set...'+JSON.stringify(component.get("v.bropped")));
                   // component.set("v.bropped",true);
                   // console.log('After bropped set to true...'+JSON.stringify(component.get("v.bropped")));
                }
            
                                      });
        });
        
        $A.enqueueAction(action);
        // $( "#sortable" ).disableSelection();
        // 
    },
    goToPrevious: function(component,event,helper) 
    {
        component.set("v.pathToSet","Template");
        //helper.triggerPathEvent(component, event);        
        //debugger;
        var templateId = component.get("v.templateId");
        var tabListForBack = component.get("v.tabList");
        $A.util.removeClass(component.find("tabSequence"), "unhideElement");
        $A.util.addClass(component.find("tabSequence"), "hideElement"); 
        /*$A.createComponents([["c:admin_globalTabsCmp",{tabList:tabListForBack,templateId:templateId}]],
                            function(tabList, status)
                            {
                                if (component.isValid() && status === 'SUCCESS') 
                                {
                                    component.set("v.body", tabList);
                                }
                                else
                                {
                                    var showToast = $A.get('e.force:showToast');
                                    showToast.setParams({
                                        'title': 'tabList',
                                        'message': 'Error while calling tabList component. Please try again.', });            
                                    showToast.fire();
                                }
                            });*/
        helper.navigateToCmp(component,event,helper);
       }  
    
    
})