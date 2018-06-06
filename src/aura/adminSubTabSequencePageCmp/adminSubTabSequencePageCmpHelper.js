({
    /* Method Name: loadTabsData
     * Comments : This method is used for loading allTabs on  pageload. 
     */
    loadTabsData: function(component,event,helper) { 
        var action = component.get("c.getTemplate");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var templateList = response.getReturnValue();
                var objData = [];
                var oId,oVal;
                templateList.forEach(function(d){
                    console.log(d)
                    oId = d.Id;
                    oVal = d.Template_Name__c;
                    objData.push({value: oId, label: oVal});
                });
                
                component.set("v.templateList", objData);
                if(objData.length>0){
                    component.set("v.templateId", objData[0].value);
                    this.loadDataForTabs(component, event);
                }
                else if(objData.length==0){
                    component.set("v.templateId", "");
                    this.loadDataForTabs(component, event);
                }
            }
            
        });        
        
        $A.enqueueAction(action);                
    },
    /* Method Name: upDatesubTabSequence
     * Comments : This method is used for updating sequnce. 
     */
    upDatesubTabSequence: function(component,event,helper){        
        var subTabSequenceList = component.get("v.subTabSequenceList");
        console.log('dropped');
        var sts= [];
        var $ = jQuery.noConflict();
        $('tr').each(function(i){
            var Idis = $(this).find('#subTab_id')[0].outerText;
            var cue = component.get("v.subTabSequenceList").length;
            for(var j=0;j<component.get("v.subTabSequenceList").length;j++){
                var eachstd = component.get("v.subTabSequenceList");
                console.log(JSON.stringify(eachstd[j]));
                if(eachstd[j].Id == Idis){
                    component.set("v.subTabSequenceList["+j+"].Sequence__c",i+1);
                    console.log('sequneceee--'+component.get("v.subTabSequenceList[j].Sequence__c"));
                }
            }
            
        });
        
        var actionnew = component.get("c.subTabSequenceSort");
        console.log('component.get("v.tabList") ',component.get("v.tabList"));
        actionnew.setParams({
            "tabList" :component.get("v.tabList"),
            "subTabList" : subTabSequenceList
        });
        actionnew.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS"){ 
                component.set('v.subTabList',response.getReturnValue());
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
     * Comments : This method is used for navigating back to QuestionHomePage. 
     */
    navigateToCmp: function(component,event,helper){
        var paramsBack = {}, cmpBack = '';
        var cmpInvocationStack = component.get("v.cmpInvocationStack");
        cmpInvocationStack.shift();        
        component.set("v.cmpInvocationStack",cmpInvocationStack);        
        paramsBack["cmpInvocationStack"] = cmpInvocationStack;
        cmpBack = "c:adminSubTabHomePageCmp";
        paramsBack["templateId"] = component.get("v.templateId");
        paramsBack["tabList"] = component.get("v.tabList");  
        paramsBack["sfObjectsList"] = component.get("v.sfObjectsList");
        paramsBack["userChoice"] = component.get("v.userChoice");
        if(typeof jQuery != 'undefined'){
            debugger;
            var $j = jQuery.noConflict();            
            $j("#sortable").sortable("destroy");
        }        
        $A.createComponents([[cmpBack,paramsBack]],        
                            function(subTabSequence, status){
                                if (component.isValid() && status === 'SUCCESS'){
                                    component.set("v.body", subTabSequence);
                                }
                                else{
                                    var showToast = $A.get('e.force:showToast');
                                    showToast.setParams({
                                        'title': 'subTabSequence',
                                        'message': 'Error while calling subTabSequence component. Please try again.', });            
                                    showToast.fire();
                                }
                            });        
    } 
})