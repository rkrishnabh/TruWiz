({
     scriptLoaded : function(component, event, helper) {
        console.log('ScriptLoaded...');
        var $j = jQuery.noConflict();
        console.log('tabListSeq'+JSON.stringify(component.get('v.tabListSeq')));
        $j( document ).ready(function() {
            var sortTable = $j("#sortable");
            sortTable.sortable({
                activate: function( event, ui ) {
                    console.log("activate event jqueryui");
                },                
                change: function( event, ui ) {
                    console.log("change event jqueryui");
                },
                out: function( event, ui ) {
                    console.log("out event jqueryui");
                },
                start: function( event, ui ) {
                    console.log("start event jqueryui");
                },
                stop: function( event, ui ) {
                    console.log("stop event jqueryui");
                },
                update: function( event, ui ){
                    console.log("update event jqueryui");
                    console.log(event);
                    var v = component.get("v.bropped");
                    console.log('bropped value..'+v);
                    component.set("v.bropped",!v);
                    console.log('After bropped set...'+JSON.stringify(component.get("v.bropped")));
                },                
                deactivate: function( event, ui ) {
                    console.log("deactivate event jqueryui");
                },
                over: function( event, ui ) {
                    console.log("over event jqueryui");
                }                
            });
        });
        
    },
    /* Method Name: upDateTabSequence
     * Comments : This method is used for updating sequnce. 
     */
    upDateTabSequence: function(component,event,helper){  
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        var templateId = component.get("v.templateId");
        console.log('dropped');
        var sts= [];
        var $ = jQuery.noConflict();
        $('tr').each(function(i){
            var Idis = $(this).find('#tab_id')[0].outerText;
            var cue = component.get("v.tabListSeq").length;
            for(var j=0;j<component.get("v.tabListSeq").length;j++){
                var eachstd = component.get("v.tabListSeq");
                console.log(JSON.stringify(eachstd[j]));
                if(eachstd[j].Id == Idis){
                    component.set("v.tabListSeq["+j+"].Sequence__c",i+1);
                    console.log('sequneceee--'+component.get("v.tabListSeq[j].Sequence__c"));
                }
            }                        
            
        });
        var actionnew = component.get("c.tabSequenceSort");
        console.log('component.get("v.tabListSeq") ',component.get("v.tabListSeq"));
        actionnew.setParams({
            "tabList" :component.get("v.tabListSeq"),
            "templateId" : templateId
        });
        //action.setStorable();
        actionnew.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS"){ 
                $A.util.addClass(component.find("spinner"), "slds-hide");
                component.set('v.tabListSeq',response.getReturnValue());
                if (typeof jQuery != 'undefined') {
                    var $j = jQuery.noConflict();             
                    $j("#sortable").sortable("refresh"); 
                    console.log('refresh sortable');
                }                
                var showToast = $A.get('e.force:showToast');
                showToast.setParams({
                    'title': 'Sequence',
                    'type': 'success',
                    'message': 'Tab Sequence updated successfully'
                });            
                showToast.fire();
            }
        });
        $A.enqueueAction(actionnew);
    },
     /* Method Name: navigateToCmp
     * Comments : This method is used for navigating back to TabHomePage. 
     */
    navigateToCmp: function(component,event,helper){
        component.set("v.loadSortableForSecndTime",true)
        var paramsBack = {}, cmpBack = '';
        var cmpInvocationStack = component.get("v.cmpInvocationStack");
        cmpInvocationStack.shift();        
        component.set("v.cmpInvocationStack",cmpInvocationStack);        
        paramsBack["cmpInvocationStack"] = cmpInvocationStack;
        cmpBack = "c:adminTabHomePageCmp";
        paramsBack["templateId"] = component.get("v.templateId");;
        paramsBack["sfObjectsList"] = component.get("v.sfObjectsList");
        paramsBack["userChoice"] = component.get("v.userChoice");
        paramsBack["loadSortableForSecndTime"] = true
        if(typeof jQuery != 'undefined'){
            debugger;
            var $j = jQuery.noConflict();            
            $j("#sortable").sortable("destroy");
        }        
        $A.createComponents([[cmpBack,paramsBack]],        
                            function(tabSequence, status){
                                if (component.isValid() && status === 'SUCCESS'){
                                    component.set("v.body", tabSequence);
                                }
                                else{
                                    var showToast = $A.get('e.force:showToast');
                                    showToast.setParams({
                                        'title': 'tabSequence',
                                        'message': 'Error while calling tabSequence component. Please try again.', });            
                                    showToast.fire();
                                }
                            });        
    }    
    
})