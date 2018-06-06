({
    /* Method Name: doInit
     * Comments : This method used for display questiondetails  while page loading. 
     */ 
    doInit : function(component, event, helper){
        console.log('doInit');
        helper.editQuestionData(component, event, helper);
    },
    /* Method Name: goToPrevious
     * Comments : This method used for navigating to subtabHomePage. 
     */ 
    goToPrevious: function(component,event,helper){
        console.log('goToPrevious');
        $A.util.removeClass(component.find("createQuestion"), "unhideElement");
        $A.util.addClass(component.find("createQuestion"), "hideElement");
        $A.util.removeClass(component.find("questionsLists"), "hideElement");
        $A.util.addClass(component.find("questionsLists"), "unhideElement");
        helper.navigateToCmp(component,event,helper);
    },
    
    /* Method Name: save
     * Comments : This method used for save and update the questions. 
     */
    save : function(component,event,helper){
        console.log('save');
        var subTabId = component.get("v.subTabId");
        var questionObj = component.get("v.questionObj");
        var selectedFieldType = component.get("v.selectedFieldType");
        var selectedPicklistValue = component.get("v.allPickListValues"); 
        var selectedFieldReference = "";
        selectedFieldReference = component.get("v.selectedFieldReference");
        if(selectedFieldReference != null && selectedFieldReference != undefined)
            selectedFieldReference = selectedFieldReference.toString();
        else
            selectedFieldReference = "";
        if(selectedFieldType == 'REFERENCE'){
            console.log('selectedFieldType>>>>>>>>'+selectedFieldType);
            questionObj.Object_API_Used_for_Lookup__c = selectedFieldReference.toString();
          }
        questionObj.Field_Type__c = selectedFieldType;
        helper.validations(component,event,helper);      
        var errorMessage = component.get("v.errorMessage");
        if(errorMessage != "" && errorMessage != null && errorMessage != undefined){
            $A.util.addClass(component.find("spinner"), "slds-hide");            
            helper.showToastMsg(component,event,helper,"Error",errorMessage);                                    
        }
        else{
            //Since validations passed insert/update record here
            /*Start Reset None Parent Objects Name to blank*/
            var questionObj = component.get("v.questionObj");             
            if(questionObj.Org_Parent_Object_API_Name__c == "None"){
                questionObj.Org_Parent_Object_API_Name__c = "";
                questionObj.Parent_Object_API_Name__c = "";
                questionObj.Parent_Object_Name__c = "";            
            }        
            /*End Reset None Parent Parent Objects Name to blank*/
            
            var actionInsertUpdate = component.get('c.insertUpdateQuestions');
            actionInsertUpdate.setParams({
                questionObj : questionObj
               });
            actionInsertUpdate.setCallback(this,function(response){
                var state = response.getState();
                if(state == "SUCCESS"){
                    var result = response.getReturnValue();
                    var questionId = component.get("v.questionId");
                    if(questionId != "" && questionId != undefined){
                        helper.showToastMsg(component,event,helper,"Success","Question has been updated successfully");                                    
                    }
                    else{
                        helper.showToastMsg(component,event,helper,"Success","Question has been created successfully");                                                                        
                    }
                    $A.util.removeClass(component.find("createQuestion"), "unhideElement");
                    $A.util.addClass(component.find("createQuestion"), "hideElement");
                    $A.util.removeClass(component.find("questionsLists"), "hideElement");
                    $A.util.addClass(component.find("questionsLists"), "unhideElement");                         
                    helper.navigateToCmp(component,event,helper);                            
                }
                else if(state == "ERROR"){
                    $A.util.addClass(component.find("spinner"), "slds-hide");
                    helper.showToastMsg(component,event,helper,"Error","Error in calling server side insertUpdateQuestions action");
                }                        
            });
            $A.enqueueAction(actionInsertUpdate);//insertUpdateQuestions Action invocation                    
        }
        
    },
    /* Method Name: handleParentObjectChange
     * Comments : This method used for prepopulating parentobjectname. 
     */
    handleParentObjectChange : function(component,event,helper){
        console.log('handleParentObjectChange');
        var val = component.find("dynamicSobject").get("v.value");
        var name,label;
        
        if(val != "None"){
            component.find("relationship").set("v.disabled",false);            
            Object.keys(component.get("v.sfParentObjectsList")).forEach(function(index){
                if(component.get("v.sfParentObjectsList")[index].Name == val){
                    name = component.get("v.sfParentObjectsList")[index].Name;
                    label = component.get("v.sfParentObjectsList")[index].Label;
                    return false;
                }
            })
            
            var questionObj = component.get("v.questionObj");
            questionObj["Parent_Object_Name__c"] = label;
            questionObj["Parent_Object_API_Name__c"] = val;            
            component.set("v.questionObj",questionObj);
            
            //Check whether SubTab has ObjectName
            var orgSubTabObjectApiName = component.get("v.OrgSubTabObjectApiName");
            var orgSubTabObjectName = component.get("v.OrgSubTabObjectName");            
            
            if(orgSubTabObjectApiName != undefined && orgSubTabObjectApiName != null && orgSubTabObjectApiName != "None" && orgSubTabObjectApiName != ""){
                /*var questionObj = component.get("v.questionObj");
                questionObj["Object_Name__c"] = orgSubTabObjectName;
                questionObj["Object_API_Name__c"] = orgSubTabObjectApiName;                
                component.set("v.questionObj",questionObj);*/                 
                component.set("v.sfObjectsNameList",[{Label: orgSubTabObjectName, Name: orgSubTabObjectApiName, Selected : false}]);               
                //component.find("dynamicSobjectChild").set("v.disabled",true);
                component.find("relationship").set("v.disabled",true);
                /*Start Reset dependent objects*/
                component.set("v.sfFieldsList",[]);
                component.set("v.selectedFieldType",null);            
                var questionObj = component.get("v.questionObj");
                questionObj.Object_Name__c = "--None--";
                questionObj.Object_API_Name__c = "None";                
                questionObj.Question_Label__c = '';
                questionObj.Values__c = '';
                questionObj.Field_API_Name__c = 'None';
                component.set("v.questionObj",questionObj);            
                /*End Reset dependent objects*/                
            }else{
                component.find("dynamicSobjectChild").set("v.disabled",false);                
                var action;
                if(questionObj.Relationship__c != undefined && questionObj.Relationship__c != null && questionObj.Relationship__c != "None" && questionObj.Relationship__c != ""){
                    
                    if(questionObj.Relationship__c == "1:M")
                        action = component.get("c.getsObjectRelatedChildObjects");
                    else if(questionObj.Relationship__c == "1:1")
                        action = component.get("c.getSobjectRelatedParentLookUp");
                    action.setParams({
                        selctedObjectValue:questionObj.Org_Parent_Object_API_Name__c
                    });          
                    action.setCallback(this, function(a) {
                        var state = a.getState(); 
                        if(state == "SUCCESS"){
                            var sfObjectsList = a.getReturnValue();
                            component.set("v.sfObjectsNameList",sfObjectsList);                
                        }else{
                            component.set("v.sfObjectsNameList",[]);               
                        }
                        /*Start Reset dependent objects*/
                        component.set("v.sfFieldsList",[]);
                        component.set("v.selectedFieldType",null);            
                        var questionObj = component.get("v.questionObj");                        
                        questionObj.Object_Name__c = "--None--";
                        questionObj.Object_API_Name__c = "None";                    
                        questionObj.Question_Label__c = '';
                        questionObj.Values__c = '';
                        questionObj.Field_API_Name__c = 'None';
                        component.set("v.questionObj",questionObj);            
                        /*End Reset dependent objects*/            
                    });
                    $A.enqueueAction(action);                
                    
                }else{
                    //ParentObjectAPI name chosen but Relationship Type is none or blank
                    component.set("v.sfObjectsNameList",[]);
                    /*Start Reset dependent objects*/
                    component.set("v.sfFieldsList",[]);
                    component.set("v.selectedFieldType",null);            
                    var questionObj = component.get("v.questionObj");
                    questionObj.Object_Name__c = "--None--";
                    questionObj.Object_API_Name__c = "None";                
                    questionObj.Question_Label__c = '';
                    questionObj.Values__c = '';
                    questionObj.Field_API_Name__c = 'None';
                    component.set("v.questionObj",questionObj);            
                    /*End Reset dependent objects*/                 
                }                
            }        
        }else{
            //Scenario: If parentObject picklist is None, Reset ObjectName to TemplateObjectName
            component.find("relationship").set("v.disabled",true);
            component.find("dynamicSobjectChild").set("v.disabled",false);            
            component.set("v.sfObjectsNameList",component.get("v.sfObjectsList"));
            /*Start Reset dependent objects*/
            component.set("v.sfFieldsList",[]);
            component.set("v.selectedFieldType",null);            
            var questionObj = component.get("v.questionObj");
            questionObj.Parent_Object_Name__c = "--None--";
            questionObj.Parent_Object_API_Name__c = "None";            
            questionObj.Relationship__c = "None";
            questionObj.Object_Name__c = "--None--";
            questionObj.Object_API_Name__c = "None";            
            questionObj.Question_Label__c = '';
            questionObj.Values__c = '';
            questionObj.Field_API_Name__c = 'None';
            component.set("v.questionObj",questionObj);            
            /*End Reset dependent objects*/            
        }
                
    },
    /* Method Name: handleRelationshipChange
     * Comments : This method used for based on relationship we are displaying related object. 
     */
    handleRelationshipChange : function(component,event,helper){
        console.log('handleRelationshipChange');
        var questionObj = component.get("v.questionObj");
        var action;
        
        if(questionObj.Relationship__c != "None"){
            if(questionObj.Org_Parent_Object_API_Name__c != undefined && questionObj.Org_Parent_Object_API_Name__c != null && questionObj.Org_Parent_Object_API_Name__c != ""){
                if(questionObj.Relationship__c == "1:M")
                    action = component.get("c.getsObjectRelatedChildObjects");
                else if(questionObj.Relationship__c == "1:1")
                    action = component.get("c.getSobjectRelatedParentLookUp");
                action.setParams({
                    selctedObjectValue:questionObj.Org_Parent_Object_API_Name__c
                });
                action.setCallback(this, function(a) {
                    var state = a.getState(); 
                    if(state == "SUCCESS"){
                        var sfObjectsList = a.getReturnValue();
                        component.set("v.sfObjectsNameList",sfObjectsList);
                    }else{
                        component.set("v.sfObjectsNameList",[]);               
                    }
                    /*Start Reset dependent objects*/
                    component.set("v.sfFieldsList",[]);
                    component.set("v.selectedFieldType",null);            
                    var questionObj = component.get("v.questionObj");
                    questionObj.Object_Name__c = "--None--";
                    questionObj.Object_API_Name__c = "None";                    
                    questionObj.Question_Label__c = '';
                    questionObj.Values__c = '';
                    questionObj.Field_API_Name__c = 'None';
                    component.set("v.questionObj",questionObj);            
                    /*End Reset dependent objects*/                 
                });
                $A.enqueueAction(action);            
                
            }else{
                //No ParentObjectAPIName exists
                component.set("v.sfObjectsNameList",[]);
                /*Start Reset dependent objects*/
                component.set("v.sfFieldsList",[]);
                component.set("v.selectedFieldType",null);            
                var questionObj = component.get("v.questionObj");
                questionObj.Object_Name__c = "--None--";
                questionObj.Object_API_Name__c = "None";                
                questionObj.Question_Label__c = '';
                questionObj.Values__c = '';
                questionObj.Field_API_Name__c = 'None';
                component.set("v.questionObj",questionObj);            
                /*End Reset dependent objects*/            
            }            
        }else{
            var questionObj = component.get("v.questionObj");            
            if(questionObj.Org_Parent_Object_API_Name__c != undefined && questionObj.Org_Parent_Object_API_Name__c != null && questionObj.Org_Parent_Object_API_Name__c != ""){
                component.set("v.sfObjectsNameList",[]);
            }else{
                component.set("v.sfObjectsNameList",component.get("v.sfObjectsList"));                    
            }            
            
            //component.set("v.sfObjectsNameList",component.get("v.sfObjectsList"));
            /*Start Reset dependent objects*/
            component.set("v.sfFieldsList",[]);
            component.set("v.selectedFieldType",null);            
            var questionObj = component.get("v.questionObj");
            questionObj.Object_Name__c = "--None--";
            questionObj.Object_API_Name__c = "None";            
            questionObj.Question_Label__c = '';
            questionObj.Values__c = '';
            questionObj.Field_API_Name__c = 'None';
            component.set("v.questionObj",questionObj);            
            /*End Reset dependent objects*/                
        }        
            
    },    
    /* Method Name: handleObjectChange
     * Comments : This method used for prepopulating objectname. 
     */
    handleObjectChange : function(component,event,helper){
        console.log('handleObjectChange');
        var selctedObjectValue = component.find("dynamicSobjectChild").get("v.value");
        var name,label;
        
        if(selctedObjectValue != "None"){
            Object.keys(component.get("v.sfObjectsNameList")).forEach(function(index){
                if(component.get("v.sfObjectsNameList")[index].Name == selctedObjectValue){
                    name = component.get("v.sfObjectsNameList")[index].Name;
                    label = component.get("v.sfObjectsNameList")[index].Label;
                    return false;
                }
            })
            var questionObj = component.get("v.questionObj");
            questionObj["Object_Name__c"] = label;
            component.set("v.questionObj",questionObj);
            component.set("v.selctedObjectValue",selctedObjectValue);
            helper.getSobjeFields(component, event, helper);            
        }else{
            /*Start Reset dependent objects*/
            component.set("v.sfFieldsList",[]);
            component.set("v.selectedFieldType",null);            
            var questionObj = component.get("v.questionObj");
            questionObj.Object_Name__c = "--None--"            
            questionObj.Question_Label__c = '';
            questionObj.Values__c = '';
            questionObj.Field_API_Name__c = 'None';
            component.set("v.questionObj",questionObj);            
            /*End Reset dependent objects*/            
        }
        
    },
    /* Method Name: handleFieldType
     * Comments : This method used for prepopulating field type. 
     */
    handleFieldType : function(component,event,helper){
        console.log('handleFieldType');
        // component.set('v.valuesValidations',false);
        var selctedObjectValue = component.get("v.selctedObjectValue");
        var selectedFieldValue = component.find("dynamicSobjectField").get("v.value");
        console.log('selectedFieldValue'+selectedFieldValue);
        var questionObj = component.get("v.questionObj");
        var name,label;
        
        if(selectedFieldValue != "None"){
            Object.keys(component.get("v.sfFieldsList")).forEach(function(index){
                if(component.get("v.sfFieldsList")[index].Name == selectedFieldValue){
                    name = component.get("v.sfFieldsList")[index].Name;
                    label = component.get("v.sfFieldsList")[index].Label;
                    component.set("v.questionObj.Question_Label__c",label);
                    return false;
                }
            })
            
            questionObj["Field_Name__c"] = label;
            component.set("v.questionObj",questionObj);
            component.set("v.selectedFieldValue",selectedFieldValue);
            helper.loadPicklistValues(component, event, helper);
            helper.getSobjeFieldType(component, event, helper);
            helper.getSelectedFieldProperties(component, event, selectedFieldValue);            
        }else{
            /*Start Reset dependent objects*/
            //component.set("v.sfFieldsList",[]);
            component.set("v.selectedFieldType",null);            
            var questionObj = component.get("v.questionObj");
            questionObj.Field_Name__c = "--None--";
            questionObj.Question_Label__c = '';
            questionObj.Values__c = '';
            //questionObj.Field_API_Name__c = 'None';
            component.set("v.questionObj",questionObj);            
            /*End Reset dependent objects*/            
        }

    },
    /* Method Name: subTabPopup
     * Comments : This method used for displaying subtabs. 
     */
    subTabPopup: function(component,event,helper){
        console.log('subTabPopup');
        var subTabId = component.get("v.subTabId");
        console.log('subTabId'+subTabId);
        var userChoice = component.get("v.userChoice");
        var questionId = component.get("v.questionId");
        if(questionId == '' || questionId == null || questionId == undefined){
            if(subTabId == '' || subTabId == null || subTabId == undefined){
                component.set("v.subtabPopupBoolean",true);
                var tabList = component.get("v.tabList");
                console.log('tabList'+tabList);
                var tabId = component.get("v.tabId");
                var tabObj = component.get("v.tabObj");
                if(userChoice == "NewQuestion"){
                    tabId = component.get("v.tabIdPopup");                    
                }
                if(tabId != undefined && tabId != null && tabId != ''){
                    tabObj.Id = tabId;
                    tabList.push(tabObj);
                }
                var action = component.get("c.getAllSubTabs");
                action.setParams({
                    tabList:tabList
                });
                
                //Displaying selected subtab fields as Configuration data for the table
                var subTabColumns = [
                    {
                        'label':'SubTab Name',
                        'name':'SubTab__c',
                        'value':'string'
                    },
                    {
                        'label':'Tab Name',
                        'name':'Subtabs_Tab__c',
                        'value':'string'
                    }
                ];
                //Configuration data for the table to enable actions in the table
                var subTabTableConfiguration =
                    {
                        "searchBox":true,
                        "searchByColumn":true,
                        
                        "rowAction":
                        [
                            {
                                "label":"select",
                                "type":"url",
                                "id":"viewSubtab"
                            },
                        ]  
                     };
                 //Callback the action, to set the result into attributes for displaying the data in Table
                 action.setCallback(this, function(response){
                     var state = response.getState();
                     if(component.isValid() && state === 'SUCCESS'){
                            var subTabsList = response.getReturnValue();
                            component.set("v.subTabsList", subTabsList);
                            component.set("v.subTabColumnsList",subTabColumns);
                            component.set("v.subTabTableConfigurationMap",subTabTableConfiguration);
                            window.setTimeout($A.getCallback(function(){ 
                            component.find("subTabListTable").initialize({"itemMenu":[5]});
                        }),500); 
                    }        
    			});       
    			$A.enqueueAction(action);                
			}
 		}
 	},
     /* Method Name: tabPopup
     * Comments : This method used for display subTabRelated tabsDataTable onclick. 
     */ 
    tabPopup : function(component, event, helper){
        console.log('tabPopup');
        component.set("v.tabPopupBoolean",true);
        var templateId = component.get("v.templateIdPopup");
        console.log('templateId'+templateId);
        if(templateId !== '' || templateId !== null || templateId !== undefined){
        var action = component.get("c.getTabs");
        //Displaying selected tab fields as Configuration data for the table
        action.setParams({
            templateId:templateId
        }); 
           }
           var tabColumns = [
                    {
                        'label':'Tab',
                        'name':'Tab_Name__c',
                        'value':'string'
                    }
                ];
                //Configuration data for the table to enable actions in the table
            var tabTableConfiguration = 
                    {
                        "searchBox":true,
                        "searchByColumn":true,
                        "rowAction":
                        [
                            {
                                "label":"Select",
                                "type":"url",
                                "id":"viewTab"
                            }, 
                            
                        ]   
                            };
                            
                //Set up the callback
                //Callback the action, to set the result into attributes for displaying the data in assetList Table
               
                action.setCallback(this, function(response){
                    var state = response.getState();
                    if(component.isValid() && state === 'SUCCESS'){
                       var tabList = response.getReturnValue();
                       component.set("v.tabsListPopup", tabList);
                       component.set("v.tabColumnsList",tabColumns);
                       component.set("v.tabTableConfigurationMap",tabTableConfiguration);
                       window.setTimeout($A.getCallback(function(){ 
                            component.find("tabListTable").initialize({"itemMenu":[5]});
            			}),500);
                    }else
                        helper.showToastMsg(component,event,helper,"Error","Error while calling tabsList. Please try again.");
    			});        
    			$A.enqueueAction(action);                
		},
 
    /* Method Name: templatePopup
     * Comments : This method used for display templates onclick. 
     */ 
    templatePopup : function(component, event, helper){
        console.log('templatePopup');
        component.set("v.templatePopupBoolean",true);
        var action = component.get("c.getTemplates");
        //Displaying selected tab fields as Configuration data for the table
        var templateColumns = [
            {
                'label':'Template',
                'name':'Template_Name__c',
                'value':'string'
            }
        ];
        
        //Configuration data for the table to enable actions in the table
        var templateTableConfiguration = 
            {
                "searchBox":true,
                "searchByColumn":true,
                "rowAction":
                [
                    {
                        "label":"Select",
                        "type":"url",
                        "id":"viewTemplate"
                    }, 
                    
                    
                ]   
                    };
                    
                    //Set up the callback
                    //Callback the action, to set the result into attributes for displaying the data in assetList Table
                   
                    action.setCallback(this, function(response){
                    var state = response.getState();
                    if(component.isValid() && state === 'SUCCESS'){
                    var templateList = response.getReturnValue();
                    console.log('templateList'+JSON.stringify(templateList));
                    component.set("v.templateList",templateList);
                    component.set("v.templateColumnsList",templateColumns);
                    component.set("v.templateTableConfigurationMap",templateTableConfiguration);
                    window.setTimeout($A.getCallback(function(){ 
                       component.find("templateListTable").initialize({"itemMenu":[5]});
                    }),500);
                 }else{
                    helper.showToastMsg(component,event,helper,"Error","Error while calling templateList. Please try again.");
                 }
              });        
                  $A.enqueueAction(action);                
         },
    /* Method Name: dtClickAction
     * Comments : This method used for navigating to dtClickActionClicked. 
     */
    dtClickAction : function(component,event,helper){
        console.log('dtClickAction');
        helper.dtClickActionClicked(component,event,helper);
    },        
    /* Method Name: closedPopUp
    * Comments : This method used for closing the popup. 
    */   
    closedPopUp : function(component, event, helper){
        console.log('closedPopUp');
        component.set("v.subtabPopupBoolean",false);
        component.set("v.tabPopupBoolean",false);
        component.set("v.templatePopupBoolean",false);
    },
    /* Method Name: hideElements
     * Comments : This method used for hiding Elements. 
     */
    hideElements : function (component, event, helper){
        //debugger;
        console.log('hideElements');
        var eventExecuted = event.getParam("eventExecuted");
        if(eventExecuted != "true"){
            var auraIdListToHide = event.getParam("auraIdListToHide");
            auraIdListToHide.forEach(function(auraId){
                $A.util.removeClass(component.find(auraId), "unhideElement");
                $A.util.addClass(component.find(auraId), "hideElement");             
            });            
            event.setParam("eventExecuted","true");
        }
    } ,
  
/* Method Name: captureSelectedLookUpValEvent
 * Comments : This method used for getting the lookup values from customlookupcomponent. 
*/
            captureSelectedLookUpValEvent : function(component, event, helper){
                console.log('Inside captureSelectedLookUpValEvent..');
                var revisedSelectedLookUpValues =  event.getParam("revisedSelectedLookUpValues");
                console.log('revisedSelectedLookUpValues'+revisedSelectedLookUpValues);
                if(revisedSelectedLookUpValues != undefined){
                    revisedSelectedLookUpValues = revisedSelectedLookUpValues.replace(new RegExp(',', 'gi'), ';')                                
                }
                
                var questionObj = component.get("v.questionObj");
                questionObj.SelectLookupValues__c = revisedSelectedLookUpValues;
                component.set("v.questionObj",questionObj); 
            }          

})