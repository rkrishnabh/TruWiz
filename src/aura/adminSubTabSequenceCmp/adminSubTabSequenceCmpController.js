({	 
    upDateSequence: function (component,event, helper){
        helper.upDatesubTabSequence(component, event, helper);
    },
    scriptLoaded : function(component, event, helper) {
        var tabList = component.get("v.tabList");
        var $ = jQuery.noConflict();
        console.log('templateId'+tabList);
        var action = component.get("c.getAllSubTabs");
        //alert('action'+JSON.stringify(action));
        action.setParams({
            tabList:tabList
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            //if(component.isValid() && state === 'SUCCESS')
            //{
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
        // $( "#sortable" ).disableSelection();
        // 
    },
    handleTabChange :function(component,event){
        component.set("v.tabId",component.find("tabListSelect").get("v.value"));
        var selectedTabId = component.get('v.tabId'); 
        console.log('tabId..'+component.get('v.tabId'));
        var subTabListSequencebefore = component.get('v.subTabList');
        //console.log('subtablist..'+JSON.stringify(component.get('v.subTabList')));
        
        var subTabListSequenceAfter = [];
        if(subTabListSequencebefore != null &&  subTabListSequencebefore !='' && subTabListSequencebefore != undefined   && subTabListSequencebefore.length > 0 ){
        for(var i=0; i < subTabListSequencebefore.length;i++){
            //console.log('subTabListSequence..'+subTabListSequence);
            //subTabSequenceList = '';
            if(subTabListSequencebefore[i].Tabs__c == selectedTabId){
                 
                subTabListSequenceAfter.push(subTabListSequencebefore[i]);
                
                 //component.set("v.subTabSequenceList",subTabListSequencebefore);
                //break;
            }
        }
        component.set("v.subTabSequenceList",subTabListSequenceAfter);
         console.log('subTabListSequenceAfter..'+JSON.stringify(subTabListSequenceAfter));
        }else{
            console.log('List has no tab records..');
        }
    },
    goToPrevious: function(component,event,helper) 
    {	
        component.set("v.pathToSet","Template");
        //helper.triggerPathEvent(component, event);        
        //debugger;
        var templateId = component.get("v.templateId");
        var tabListForBack = component.get("v.tabList");
        $A.util.removeClass(component.find("subtabSequence"), "unhideElement");
        $A.util.addClass(component.find("subtabSequence"), "hideElement"); 
        /*$A.createComponents([["c:admin_globalSubTabsCmp",{tabList:tabListForBack,templateId:templateId}]],
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
                            });
                            */
        helper.navigateToCmp(component,event,helper);
       }  
    
    
})