({
      /* Method Name: loadDataForTemplates
     * Comments : This method is used for loading allTemplaets on  pageload. 
     */
    loadDataForTemplates: function(component,event,helper){ 
        
        console.log('loadDataForTemplates');
        var action = component.get("c.getTemplates");
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
   /* Method Name: loadDataForTabs
     * Comments : This method is used for loading allTabs basedon seletced templateid. 
     */
     loadDataForTabs: function(component,event,helper){ 
        var templateId = component.get("v.templateId");
       
        //Calling Server-Side action
        var action = component.get("c.getTabs");
        action.setParams({
            templateId:templateId
        });
        //Create a callback that is executed after the server-side action returns
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var tabList = response.getReturnValue();
                console.log('before tabList'+JSON.stringify(tabList));
                component.set("v.tabListClone", tabList); 
                if(tabList != '')
                    this.loadDataForSubTabs(component, event);      
            } 
            
        });
        $A.enqueueAction(action); 
         
    },
   /* Method Name: loadDataForSubTabs
     * Comments : This method is used for loading allSubTabs basedon seletced tabid. 
     */
    loadDataForSubTabs: function(component,event,helper){ 
        var tabId = component.get("v.tabIdClone");
        //Calling Server-Side action
        var action = component.get("c.getTabRelatedSubtabs");
        action.setParams({
            tabId:tabId
        });
        //Create a callback that is executed after the server-side action returns 
        action.setCallback(this, function(response){
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var subTabList = response.getReturnValue();
                console.log('before subTabList'+JSON.stringify(subTabList));
                component.set("v.subTabListClone", subTabList);
                if(subTabList != '')
                    this.loadDatatableForQuestions(component, event);                 
            }   
        }); 
        $A.enqueueAction(action);                 
    },
     /* Method Name: loadDatatableForQuestions
     * Comments : This method is used for loading all question basedon subtabId. 
     */
    loadDatatableForQuestions: function(component,event,helper){ 
        var subTabId = component.get("v.subTabIdClone");        
        var action = component.get("c.getSubTabsRelatedQuestions");
        action.setParams({
            subTabId:subTabId
        }); 
        action.setCallback(this, function(response){
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var questionsList = response.getReturnValue();
                
                component.set("v.questionsList", questionsList);
            }
        });        
        
        $A.enqueueAction(action);  
    },
     /* Method Name: upDatequestionSequence
     * Comments : This method is used for updating sequnce. 
     */
    upDatequestionSequence: function(component,event,helper){   
        var questionsList = component.get("v.questionsList");
        console.log('dropped');
        var sts= [];
        var $ = jQuery.noConflict();
        $('tr').each(function(i){
            var Idis = $(this).find('#question_id')[0].outerText;
            var cue = component.get("v.questionsList").length;
            for(var j=0;j<component.get("v.questionsList").length;j++){
                var eachstd = component.get("v.questionsList");
                console.log(JSON.stringify(eachstd[j]));
                if(eachstd[j].Id == Idis){
                    component.set("v.questionsList["+j+"].Sequence__c",i+1);
                    console.log('sequneceee--'+component.get("v.questionsList[j].Sequence__c"));
                }
            }
            
        });
        var actionnew = component.get("c.questionSequenceSort");
        var subTabId = component.get("v.subTabId");
        console.log('subTabId..'+subTabId);
        actionnew.setParams({
            "subTabid" :subTabId,
            "questionList" : questionsList
        });
        actionnew.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS"){ 
                component.set('v.questionsList',response.getReturnValue());
                var showToast = $A.get('e.force:showToast');
                showToast.setParams({
                    'title': 'Sequence',
                    'type': 'success',
                    'message': 'Questions Sequence updated successfully'
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
        cmpBack = "c:adminQuestionsHomePageCmp";
        paramsBack["templateId"] = component.get("v.templateId");
        paramsBack["tabList"] = component.get("v.tabList");
        paramsBack["subTabList"] = component.get("v.subTabList");
        paramsBack["sfObjectsList"] = component.get("v.sfObjectsList");
        paramsBack["userChoice"] = component.get("v.userChoice");
        if(typeof jQuery != 'undefined'){
            debugger;
            var $j = jQuery.noConflict();            
            $j("#sortable").sortable("destroy");
        }        
        $A.createComponents([[cmpBack,paramsBack]],        
                            function(questionSequence, status){
                                if (component.isValid() && status === 'SUCCESS'){
                                    component.set("v.body", questionSequence);
                                }
                                else{
                                    var showToast = $A.get('e.force:showToast');
                                    showToast.setParams({
                                        'title': 'questionSequence',
                                        'message': 'Error while calling questionSequence component. Please try again.', });            
                                    showToast.fire();
                                }
                            });        
    }
})