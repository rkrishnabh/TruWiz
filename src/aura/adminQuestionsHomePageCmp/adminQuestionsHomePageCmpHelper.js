({
    /* Method Name: loadQuestions
     * Comments : This method used for display allquestions related template  while page loading. 
     */   
    loadQuestions: function(component,event,helper) { 
        console.log('loadQuestions');
      
        var userChoice = component.get("v.userChoice");
        var subTabList = component.get("v.subTabList");
        var subTabId = component.get("v.subTabId");
        var subTabObj = component.get("v.subTabObj");
        var tabId = component.get("v.tabId");
        if(subTabId != '' && subTabId != null && subTabId != undefined){  
            subTabObj.Id = subTabId;
            subTabList.push(subTabObj);
            component.set("v.showButtonsNavigation",false);
            var action = component.get("c.getSubTabRelatedQuestions");
            action.setParams({
                subTabList:subTabList
            });
         }else if(tabId != '' && tabId != null && tabId != undefined){
            component.set("v.showButtonsNavigation",false);
            var action = component.get("c.getAllQuestionsRelatedToTab");
            action.setParams({
                tabId:tabId
            });
        }else{  
            var action = component.get("c.getSubTabRelatedQuestions");
            action.setParams({
                subTabList:subTabList
            });
         }
        //Displaying selected question fields as Configuration data for the table
        var questionsColumns = [
            {
                'label':'Tab Name',
                'name':'Tab_Name__c',
                'value':'string'
            },
            {
                'label':'SubTab Name',
                'name':'SubTab1__r.SubTab__c',
                'type':'string'
            },
             
            {
                'label':'Question',
                'name':'Question_Label__c',
                'type':'string'
            },
            {
                'label':'Sequence',
                'name':'Sequence__c',
                'type':'string'
            }
            
        ];
        
        //Configuration data for the table to enable actions in the table
        var subTabId = component.get("v.subTabId"); 
        console.log('subTabId'+subTabId);
        var tabId = component.get("v.tabId"); 
        var questionsTableConfiguration ="";
        if(subTabId != '' && subTabId != null && subTabId != undefined){
            questionsTableConfiguration = 
                {
                "searchBox":true,
                "searchByColumn":true,
                "globalAction":[
                    
                    {
                        "label":"New Question",
                        "type":"button",
                        "id":"addQuestion",
                        "class":"slds-button slds-button--neutral"
                    },
                    
                    {
                        "label":"Copy Question",
                        "type":"button",
                        "id":"copyQuestion",
                        "class":"slds-button slds-button--neutral"
                    },
                                   
                ],
                "rowAction":
                [
                    {
                        "label":"Edit",
                        "type":"url",
                        "id":"editQuestion"
                    },
                    {
                        "label":"Delete",
                        "type":"url",
                        "id":"deleteQuestion"
                    }                   
                ]   
            };
        }
         else if(tabId != '' && tabId != null && tabId != undefined){
            questionsTableConfiguration = 
                {
                "searchBox":true,
                "searchByColumn":true,
                "globalAction":[
                    
                    {
                        "label":"New Question",
                        "type":"button",
                        "id":"addQuestion",
                        "class":"slds-button slds-button--neutral"
                    },
                       
                ],
                "rowAction":
                [
                    {
                        "label":"Edit",
                        "type":"url",
                        "id":"editQuestion"
                    },
                    {
                        "label":"Delete",
                        "type":"url",
                        "id":"deleteQuestion"
                    }                   
                ]   
            };
        }
        else{
            questionsTableConfiguration = 
                {
                "searchBox":true,
                "searchByColumn":true,
                "globalAction":[
                    
                    {
                        "label":"New Question",
                        "type":"button",
                        "id":"addQuestion",
                        "class":"slds-button slds-button--neutral"
                    },
                    
                    {
                        "label":"Sequence",
                        "type":"button",
                        "id":"questionSequence",
                        "class":"slds-button slds-button--neutral"
                    }                  
                ],
                "rowAction":
                [
                    {
                        "label":"Edit",
                        "type":"url",
                        "id":"editQuestion"
                    },
                    {
                        "label":"Delete",
                        "type":"url",
                        "id":"deleteQuestion"
                    }                   
                ]   
            };
        }
        //Callback the action, to set the result into attributes for displaying the data in Table
        action.setCallback(this, function(response){
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var questionsList = response.getReturnValue();
                component.set("v.questionsList", questionsList);
                component.set("v.questionsColumnsList",questionsColumns);
                component.set("v.questionsTableConfigurationMap",questionsTableConfiguration);
                window.setTimeout($A.getCallback(function(){ 
                    component.find("questionsListTable").initialize({"order":[3, "asc"],"itemMenu":[5]});
                }),500);
            }else
                this.showToastMsg(component,event,helper,"Error","Error while calling questionsList. Please try again.");
        });        
        $A.enqueueAction(action);                
    },
    /* Method Name: deleteQuestions
     * Comments : This method used for deleting questions. 
     */ 
    deleteQuestions : function(component, event, helper){
        console.log('deleteQuestions');
        $A.util.removeClass(component.find("spinner"), "slds-hide");   
        var selectedDeletedQuestionId=component.get("v.selectedDeletedQuestionId");;
        console.log('selectedDeletedQuestionId'+selectedDeletedQuestionId);
        var selectedQuestionRelatedSubTabId=component.get("v.selectedQuestionRelatedSubTabId");
        var action = component.get('c.deleteQuestionDetails');
        action.setParams({
            selectedDeletedQuestionId:selectedDeletedQuestionId,
            selectedQuestionRelatedSubTabId:selectedQuestionRelatedSubTabId
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            $A.util.addClass(component.find("spinner"), "slds-hide");            
            if(state == "SUCCESS"){
                this.showToastMsg(component,event,helper,"Success","Question Deleted Successfully.");
                this.updateQuestionSequence(component,event,helper);
            } else{
              this.showToastMsg(component,event,helper,"Error","Error while calling deleteQuestions. Please try again.");   
            }
               
        });
        $A.enqueueAction(action);
    },
    /* Method Name: updateQuestionSequence
     * Comments : This method used for deleting questions and update the questionsequence. 
     */ 
    updateQuestionSequence : function(component, event, helper){
        var questionsList = component.get("v.questionsList");
        var action = component.get('c.updateQuestionSequence');
        action.setParams({
            questionsList:questionsList
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                $A.util.addClass(component.find("spinner"), "slds-hide");
              }else{
                $A.util.addClass(component.find("spinner"), "slds-hide");
                this.showToastMsg(component,event,helper,"Error","Error while Question Sequence Update. Please try again.");
            }
        });
        $A.enqueueAction(action);
    },
    
    
    /* Method Name: triggerPathEvent
     * Comments : This method is used for higlighting lightning Path during navigation
     */    
    triggerPathEvent : function(component,event,helper){
        console.log('triggerPathEvent');
        var pathDataEvnt = component.getEvent("pathDataEvnt");        
        pathDataEvnt.setParams({"Name":component.get("v.pathToSet")});
        pathDataEvnt.fire();        
        
    } ,
    /* Method Name: createComponent
     * Comments : Refactored code to seperate Method for calling $A.createComponents.
     * Parameters : cmpName and cmpParams 
     */
    createComponent : function(component,event,helper,cmpName,cmpParams){
        $A.createComponents([[cmpName,cmpParams]],
                            function(cmp, status){
                                $A.util.addClass(component.find("spinner"), "slds-hide");
                                if (component.isValid() && status === 'SUCCESS')
                                    component.set("v.body", cmp);
                                else
                                    this.showToastMsg(component,event,helper,"Error","Error while calling component. Please try again.");
                            });        
    },    
    /* Method Name: showToastMsg
     * Comments : Unique method for displaying errormessages. 
     */ 
    showToastMsg : function(component,event,helper,title,msg){
        console.log('showToastMsg');
        var showToast = $A.get('e.force:showToast');            
        showToast.setParams({
            'title': title,
            'message': msg});
        showToast.fire();        
    }   
})