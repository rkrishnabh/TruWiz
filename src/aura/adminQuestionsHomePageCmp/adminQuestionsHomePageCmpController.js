({
    /* Method Name: doInit
     * Comments : This method used for display allquestuinos related to template  while page loading. 
     */ 
    doInit: function (component,event, helper){
        console.log('doInit');
        helper.loadQuestions(component, event);
    },
    /* Method Name: questionActionClicked
     * Comments : This method is used for  clicking based on ActiondId it navigate to different Pages. 
     */
    questionActionClicked : function(component,event,helper){
        console.log('questionActionClicked');
        //get the id of the action being fired        
        var actionId = event.getParam("actionId");
        if(actionId != "" && actionId != null && actionId != undefined){
            var createComponentFlag = true;
            var cmp;
            var cmpParams = {}; 

            if(actionId == 'editQuestion'){
                var clickedRow = event.getParam('row');
                cmpParams["questionId"] = clickedRow.Id;
                //cmpParams["subTabId"] = clickedRow.Section1__c;
                cmpParams["subTabId"] = clickedRow.SubTab1__c; 
                cmpParams["name"] = clickedRow.Question_Label__c;
                cmpParams["selectedLookUpValues"] = clickedRow.SelectLookupValues__c;
                cmp = "c:adminQuestionDetailsPageCmp";
            }else if(actionId == 'addQuestion'){                
                cmp = "c:adminQuestionDetailsPageCmp";
            }else if(actionId == 'copyQuestion'){                
                cmpParams["selectedSubTabId"] = component.get("v.subTabId");  
                cmp = "c:adminCloneQuestionsPageCmp";
            }else if(actionId == 'deleteQuestion'){
                createComponentFlag = false;
                var rowIdx = event.getParam("index");
                var clickedRow = event.getParam('row');
                var selectedDeletedQuestionId = clickedRow.Id;
                var selectedQuestionRelatedSubTabId = clickedRow.SubTab1__c;
                component.set("v.selectedDeletedQuestionId", selectedDeletedQuestionId);
                component.set("v.selectedQuestionRelatedSubTabId", selectedQuestionRelatedSubTabId);
                helper.deleteQuestions(component, event); 
                var allquestionsList = component.get("v.questionsList")
                allquestionsList.splice(rowIdx, 1);
                allquestionsList.forEach(function(question,index){
                    console.log(question.Sequence__c);
                    if(index >= rowIdx)
                        question.Sequence__c = question.Sequence__c - 1;
                });
                component.set("v.questionsList", allquestionsList);
                component.find("questionsListTable").rerenderRows();
            }else if(actionId == 'questionSequence'){                                          
                cmp = "c:adminQuestionSequencePageCmp";
            }
          
            cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
            cmpParams["userChoice"] = component.get("v.userChoice");       
            cmpParams["templateId"] = component.get("v.templateId");
            cmpParams["tabId"] = component.get("v.tabId");
            cmpParams["tabName"] = component.get("v.tabName");
            cmpParams["subtabName"] = component.get("v.subtabName");
            if(!cmpParams.hasOwnProperty("subTabId"))
            	cmpParams["subTabId"] = component.get("v.subTabId");
            cmpParams["selectedSubTabName"] = component.get("v.selectedSubTabName");
            cmpParams["selectedSubTabName"] = component.get("v.selectedSubTabName");
            cmpParams["selectedSubTabObjectName"] = component.get("v.selectedSubTabObjectName");
            cmpParams["selectedSubTabObjectApiName"] = component.get("v.selectedSubTabObjectApiName");
            cmpParams["selectedSubTabParentObjectName"] = component.get("v.selectedSubTabParentObjectName");
            cmpParams["selectedSubTabParentObjectApiName"] = component.get("v.selectedSubTabParentObjectApiName");
            cmpParams["selectedSubTabOrgParentObjectApiName"] = component.get("v.selectedSubTabOrgParentObjectApiName");            
            cmpParams["selectedSubTabRelationship"] = component.get("v.selectedSubTabRelationship");
            cmpParams["selectedSubTabFieldName"] = component.get("v.selectedSubTabFieldName");
            cmpParams["selectedSubTabFieldApiName"] = component.get("v.selectedSubTabFieldApiName");
            cmpParams["tabList"] = component.get("v.tabList");
            cmpParams["subTabList"] = component.get("v.subTabList");            
            
           event.setParam("actionId","");            
            if(createComponentFlag){
                debugger;
                var cmpNavigationList = component.get("v.cmpNavigationList");
                cmpNavigationList.unshift(cmp);
                component.set("v.cmpNavigationList",cmpNavigationList);            
                cmpParams["cmpNavigationList"] = component.get("v.cmpNavigationList"); 
                console.log('cmpNavigationList in ques Home..'+JSON.stringify(component.get("v.cmpNavigationList")));
                
                $A.util.removeClass(component.find("spinner"), "slds-hide");
                
                //Hide current component
                $A.util.removeClass(component.find("questionsLists"),"unhideElement");
                $A.util.addClass(component.find("questionsLists"),"hideElement");
				//Trigger hideElements event
                var hideElementsEvnt = component.getEvent("hideElementsEvnt");
                var auraIdListToHide = component.get("v.auraIdListToHide");
                hideElementsEvnt.setParams({"auraIdListToHide":auraIdListToHide});
                hideElementsEvnt.fire();
                
                helper.createComponent(component,event,helper,cmp,cmpParams);
            }
        }          
    },
    /* Method Name: goToPrevious
     * Comments : This method used for navigating back to SubtabdetailsPage. 
     */ 
    goToPrevious: function(component,event,helper){
        console.log('goToPrevious');
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        component.set("v.pathToSet","Sub Tabs");
        helper.triggerPathEvent(component, event);        
        $A.util.removeClass(component.find("questionsLists"), "unhideElement");
        $A.util.addClass(component.find("questionsLists"), "hideElement");
                
        //Set cmp and cmpParams
        var cmp;
        var cmpParams = {};      
        cmpParams["templateId"] = component.get("v.templateId");
        cmpParams["tabList"] = component.get("v.tabList");        
        var cmpNavigationList = component.get("v.cmpNavigationList");
        cmpNavigationList.shift();
        component.set("v.cmpNavigationList",cmpNavigationList);
        cmpParams["cmpNavigationList"] = cmpNavigationList;        
        cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
        cmpParams["userChoice"] = component.get("v.userChoice");
        cmpParams["tabName"] = component.get("v.tabName");
        cmpParams["subtabName"] = component.get("v.subtabName");
        cmp = "c:adminSubTabHomePageCmp";
        helper.createComponent(component,event,helper,cmp,cmpParams);        
    } ,
    /* Method Name: navigateToHomePage
     * Comments : This method used for navigating back to admin home page. 
     */ 
    navigateToHomePage : function(component) {
        var newEvent = $A.get("e.force:navigateToComponent");
        newEvent.setParams({
            componentDef: "c:adminHomePageCmp",
            componentAttributes: {
                //Set you attributes here if required.
            }
        });
        newEvent.fire();
    }     
})