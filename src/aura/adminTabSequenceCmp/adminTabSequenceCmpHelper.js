({
	upDateTabSequence: function(component,event,helper) 
    {   //alert('upDateTabSequence'); 
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        var templateId = component.get("v.templateId");
        console.log('dropped');
        var sts= [];
        var $ = jQuery.noConflict();
        $('tr').each(function(i){
            
            
            var Idis = $(this).find('#tab_id')[0].outerText;
            //alert('Idis..'+Idis);
            var cue = component.get("v.tabList").length;
            //alert('length--'+cue);
            for(var j=0;j<component.get("v.tabList").length;j++){
                //  alert('Inside For..');
                var eachstd = component.get("v.tabList");
                console.log(JSON.stringify(eachstd[j]));
                if(eachstd[j].Id == Idis){
                    // alert('Inside If..');
                    component.set("v.tabList["+j+"].Sequence__c",i+1);
                    console.log('sequneceee--'+component.get("v.tabList[j].Sequence__c"));
                }
            }
            
        });
        
        var actionnew = component.get("c.tabSequenceSort");
        console.log('component.get("v.tabList") ',component.get("v.tabList"));
        actionnew.setParams({
            "tabList" :component.get("v.tabList"),
            "templateId" : templateId
        });
        actionnew.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS"){ 
                $A.util.addClass(component.find("spinner"), "slds-hide");
                component.set('v.tabList',response.getReturnValue());
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
	navigateToCmp: function(component,event,helper){//For Navigation
        //Conditional Back
        debugger;
        //var cmpBack = component.get("v.cmpBack");
        //cmpBack = "c:admin_NewQuestionsCmp";        
        //var cmpBackParent = component.get("v.cmpBackParent");        
        var paramsBack = {};
        var cmpInvocationStack = component.get("v.cmpInvocationStack");
        cmpInvocationStack.shift();
        var cmpBack = cmpInvocationStack[0];        
        component.set("v.cmpInvocationStack",cmpInvocationStack);        
        paramsBack["cmpInvocationStack"] = cmpInvocationStack;        
        switch(cmpBack){
            case "c:adminTabHomePageCmp":
                var tabList = component.get("v.tabList");
                var templateId = component.get("v.templateId");                                
                paramsBack["templateId"] = templateId;
                paramsBack["tabList"] = tabList;                                
                break;                
        }       
        $A.createComponents([[cmpBack,paramsBack]],        
                            function(questions, status)
                            {
                                if (component.isValid() && status === 'SUCCESS') 
                                {
                                    component.set("v.body", questions);
                                   
                                }
                                else
                                {
                                    var showToast = $A.get('e.force:showToast');
                                    showToast.setParams({
                                        'title': 'questionsList',
                                        'message': 'Error while calling questionsList component. Please try again.', });            
                                    showToast.fire();
                                }
                            });        
    }    
   
})