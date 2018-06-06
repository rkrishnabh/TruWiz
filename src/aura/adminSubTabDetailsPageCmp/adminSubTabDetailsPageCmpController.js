({
    /* Method Name: doInit
     * Comments : This method used for display subtabDetails based on subtabId. 
     */ 
    doInit : function(component, event, helper){
        console.log('doInit');
        helper.editSubTabData(component, event, helper);
       },
    
    /* Method Name: goToPrevious
     * Comments : This method used for navigating back to SubTabhomePage. 
     */ 
    goToPrevious: function(component,event,helper){
        console.log('goToPrevious');
        $A.util.removeClass(component.find("createSubTab"), "unhideElement");
        $A.util.addClass(component.find("createSubTab"), "hideElement");
        $A.util.removeClass(component.find("subTabLists"), "hideElement");
        $A.util.addClass(component.find("subTabLists"), "unhideElement");
        helper.navigateToCmp(component,event,helper);
    },
    /* Method Name: handleFormTypeChange
     * Comments : This method used for while onchange get the formtype. 
     */ 
    handleFormTypeChange : function(component,event,helper){
        console.log('handleFormTypeChange');
        var selctedformType = component.find("formType").get("v.value");
        var subTabObj = component.get("v.subTabObj");
        subTabObj["Form_Type__c"] = selctedformType;
        component.set("v.subTabObj",subTabObj);
    },
   
    /* Method Name: handleLayoutTypeChange
     * Comments : This method used for while onchange get the layouttype. 
     */ 
    handleLayoutTypeChange : function(component,event,helper){
        console.log('handleLayoutTypeChange');
        var selctedLayoutType = component.find("layoutType").get("v.value");
        var subTabObj = component.get("v.subTabObj");
        subTabObj["Layout_Type__c"] = selctedLayoutType;
        component.set("v.subTabObj",subTabObj);
    },
      /* Method Name: handleParentObjectChange
     * Comments : This method is user for saving and updating subtab. 
     */
    handleParentObjectChange : function(component,event,helper){
        console.log('handleParentObjectChange');
        //debugger;
        var val = component.find("dynamicParentSobject").get("v.value");
        var subTabObj = component.get("v.subTabObj");
        subTabObj["Parent_Object_API_Name__c"] = val;
		component.set("v.subTabObj",subTabObj);        
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
            
            var subTabObj = component.get("v.subTabObj");
            subTabObj["Parent_Object_Name__c"] = label;
            //subTabObj["Parent_Object_API_Name__c"] = val;            
            component.set("v.subTabObj",subTabObj);
        
            var action;
            if(subTabObj.Relationship__c != undefined && subTabObj.Relationship__c != "None" && subTabObj.Relationship__c != ""){
                if(subTabObj.Relationship__c == "1:M")
                    action = component.get("c.getsObjectRelatedChildObjects");
                else if(subTabObj.Relationship__c == "1:1")
                    action = component.get("c.getSobjectRelatedParentLookUp");
                action.setParams({
                    selctedObjectValue:subTabObj.Org_Parent_Object_API_Name__c
                });          
                action.setCallback(this, function(a) {
                    var state = a.getState(); 
                    if(state == "SUCCESS"){
                        var sfObjectsList = a.getReturnValue();
                        component.set("v.sfObjectsNameList",sfObjectsList);                
                    }else{
                        component.set("v.sfObjectsNameList",[]);                        
                    }
                    var subTabObj = component.get("v.subTabObj");                        
                    subTabObj.Object_Name__c = "--None--";
                    subTabObj.Object_API_Name__c = "None";
                    component.set("v.subTabObj",subTabObj);                    
                    /*Start Reset dependent objects*/
                    component.set("v.sfFieldsList",[]);            
                    /*End Reset dependent objects*/            
                });
                $A.enqueueAction(action);                 
            }else{
                //ParentObjectAPI name chosen but Relationship Type is none or blank
                component.set("v.sfObjectsNameList",[]);
                var subTabObj = component.get("v.subTabObj");                        
                subTabObj.Object_Name__c = "--None--";
                subTabObj.Object_API_Name__c = "None";
                component.set("v.subTabObj",subTabObj);                 
                /*Start Reset dependent objects*/
                component.set("v.sfFieldsList",[]);            
                /*End Reset dependent objects*/                 
            }
           
            
        }else{
            //Scenario: If parentObject picklist is None, Reset ObjectName to TemplateObjectName
            component.find("relationship").set("v.disabled",true);                        
            component.set("v.sfObjectsNameList",component.get("v.sfObjectsList"));
            var subTabObj = component.get("v.subTabObj");            
            subTabObj.Relationship__c = "None";
            subTabObj.Parent_Object_Name__c = "--None--";
            subTabObj.Object_Name__c = "--None--";
            subTabObj.Object_API_Name__c = "None";
            component.set("v.subTabObj",subTabObj);             
            /*Start Reset dependent objects*/
            component.set("v.sfFieldsList",[]);            
            /*End Reset dependent objects*/             
        }        
        
      },    
     /* Method Name: handleRelationshipChange
     * Comments : This method used for based on relationship we are displaying related object. 
     */
        handleRelationshipChange : function(component,event,helper){
            console.log('handleRelationshipChange');
            //debugger;
            var subTabObj = component.get("v.subTabObj");
            var action;
            
            if(subTabObj.Relationship__c != "None"){
                if(subTabObj.Org_Parent_Object_API_Name__c != undefined && subTabObj.Org_Parent_Object_API_Name__c != null && subTabObj.Org_Parent_Object_API_Name__c != ""){
                    if(subTabObj.Relationship__c == "1:M")
                        action = component.get("c.getsObjectRelatedChildObjects");
                    else if(subTabObj.Relationship__c == "1:1")
                        action = component.get("c.getSobjectRelatedParentLookUp");
                    action.setParams({
                        selctedObjectValue:subTabObj.Org_Parent_Object_API_Name__c
                    });
                    action.setCallback(this, function(a) {
                        var state = a.getState(); 
                        if(state == "SUCCESS"){
                            var sfObjectsList = a.getReturnValue();
                            component.set("v.sfObjectsNameList",sfObjectsList);
                        }else{
                            component.set("v.sfObjectsNameList",[]);                             
                        }
                        var subTabObj = component.get("v.subTabObj");                        
                        subTabObj.Object_Name__c = "--None--";
                        subTabObj.Object_API_Name__c = "None";
                        component.set("v.subTabObj",subTabObj);                        
                        /*Start Reset dependent objects*/
                        component.set("v.sfFieldsList",[]);            
                        /*End Reset dependent objects*/                
                    });
                    $A.enqueueAction(action);                
                }else{
                    //No ParentObjectAPIName exists
                    component.set("v.sfObjectsNameList",[]);
                    var subTabObj = component.get("v.subTabObj");                        
                    subTabObj.Object_Name__c = "--None--";
                    subTabObj.Object_API_Name__c = "None";
                    component.set("v.subTabObj",subTabObj);                     
                    /*Start Reset dependent objects*/
                    component.set("v.sfFieldsList",[]);             
                    /*End Reset dependent objects*/            
                }                
                
            }else{
                var subTabObj = component.get("v.subTabObj");                
                if(subTabObj.Org_Parent_Object_API_Name__c != undefined && subTabObj.Org_Parent_Object_API_Name__c != null && subTabObj.Org_Parent_Object_API_Name__c != ""){
                    component.set("v.sfObjectsNameList",[]);                     
                }else{
                    component.set("v.sfObjectsNameList",component.get("v.sfObjectsList"));                     
                }
                  
                var subTabObj = component.get("v.subTabObj");                        
                subTabObj.Object_Name__c = "--None--";
                subTabObj.Object_API_Name__c = "None";
                component.set("v.subTabObj",subTabObj);                
                //component.set("v.sfObjectsNameList",component.get("v.sfObjectsList"));
                
                /*Start Reset dependent objects*/
                component.set("v.sfFieldsList",[]);            
                /*End Reset dependent objects*/                
            }            
                        
        },     
    /* Method Name: handleObjectChange
     * Comments : This method is user for saving and updating subtab. 
     */
    handleObjectChange : function(component,event,helper){
        console.log('handleObjectChange');
        //debugger;
        var selctedObjectValue = component.find("dynamicObjectName").get("v.value");
        console.log('selctedObjectValue'+selctedObjectValue);
        var name,label;
        
        if(selctedObjectValue != "None"){
            Object.keys(component.get("v.sfObjectsNameList")).forEach(function(index){
                if(component.get("v.sfObjectsNameList")[index].Name == selctedObjectValue){
                    name = component.get("v.sfObjectsNameList")[index].Name;
                    label = component.get("v.sfObjectsNameList")[index].Label;
                    return false;
                }
            })
            
            var subTabObj = component.get("v.subTabObj");
            subTabObj["Object_Name__c"] = label;            
            component.set("v.subTabObj",subTabObj); 
            component.set("v.selctedObjectValue",selctedObjectValue);
            helper.getSobjeFields(component, event, helper);            
        }else{
            var subTabObj = component.get("v.subTabObj");            
            subTabObj.Object_Name__c = "--None--";
            component.set("v.subTabObj",subTabObj);             
            /*Start Reset dependent objects*/
            component.set("v.sfFieldsList",[]);            
            /*End Reset dependent objects*/              
        }
        
    },
      /* Method Name: handleFieldName
     * Comments : This method is user for saving and updating fieldname. 
     */
    handleFieldName : function(component,event,helper){
        console.log('handleFieldName');
        //debugger;
        var val = component.find("dynamicSobjectField").get("v.value");
        var name,label;
        
        if(val != "None"){
            Object.keys(component.get("v.sfFieldsList")).forEach(function(index){
                if(component.get("v.sfFieldsList")[index].Name == val){
                    name = component.get("v.sfFieldsList")[index].Name;
                    label = component.get("v.sfFieldsList")[index].Label;
                    return false;
                }
            })
            
            var subTabObj = component.get("v.subTabObj");
            subTabObj["Field_Name__c"] = label;
            component.set("v.subTabObj",subTabObj);             
        }else{
            var subTabObj = component.get("v.subTabObj");
            subTabObj["Field_Name__c"] = "--None--";
            component.set("v.subTabObj",subTabObj);
        }
               
    },
     /* Method Name: handleProfile
     * Comments : This method is user for saving and updating Profile Name. 
     */
    handleProfile : function(component,event,helper){
        console.log('Inside handleProfile');
        var val = component.find("profile").get("v.value");
        var allProfileNames = component.get("v.allProfileNames");
        var name,label;
        Object.keys(component.get("v.allProfileNames")).forEach(function(index){
            if(component.get("v.allProfileNames")[index].Id == val){
                name = component.get("v.allProfileNames")[index].Name;
                label = component.get("v.allProfileNames")[index].Id;
                return false;
            }
        })
        var subTabObj = component.get("v.subTabObj");
        subTabObj["Profile__c"] = name;
        component.set("v.subTabObj",subTabObj);        
    },
    /* Method Name: save
     * Comments : This method used for saving and updatpng subtabs. 
     */ 
    save : function(component, event, helper){
        console.log('save');
        helper.save(component, event, helper);
    },
    
    /* Method Name: tabPopup
     * Comments : This method used for display subTabRelated tabsDataTable onclick. 
     */ 
    tabPopup : function(component, event, helper){
        console.log('tabPopup');
        var subTabId = component.get("v.subTabId");
        var tabId = component.get("v.tabId");      
        if(subTabId == '' || subTabId == null || subTabId == undefined){ 
            if(tabId == '' || tabId == null || tabId == undefined){ 
                component.set("v.tabPopupBoolean",true);
                var templateId = component.get("v.templateId");
                var action = component.get("c.getTabs");
                //Displaying selected tab fields as Configuration data for the table
                action.setParams({
                    templateId:templateId
                });   
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
                var self = this;
                action.setCallback(this, function(response){
                    var state = response.getState();
                    if(component.isValid() && state === 'SUCCESS'){
                       var tabList = response.getReturnValue();
                       component.set("v.tabList", tabList);
                       component.set("v.tabColumnsList",tabColumns);
                       component.set("v.tabTableConfigurationMap",tabTableConfiguration);
                       window.setTimeout($A.getCallback(function(){ 
                            component.find("tabListTable").initialize({"itemMenu":[5]});
            			}),500);
                    }else
                        helper.showToastMsg(component,event,helper,"Error","Error while calling tabsList. Please try again.");
    			});        
    			$A.enqueueAction(action);                
			}
    	}
    },
     /* Method Name: closedPopUp
     * Comments : This method used for closing the popup. 
     */ 
 	closedPopUp : function(component, event, helper){
        console.log('closedPopUp');
        component.set("v.tabPopupBoolean",false);
        component.set("v.templatePopupBoolean",false);
	},
    /* Method Name: templatePopup
     * Comments : This method used for display all templates onclick. 
     */ 
    templatePopup : function(component, event, helper){
        console.log('templatePopup');
        component.set("v.templatePopupBoolean",true);
        var action = component.get("c.getTemplates");
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
            var self = this;
            action.setCallback(this, function(response) {
            	var state = response.getState();
                if(component.isValid() && state === 'SUCCESS'){
                	var templateList = response.getReturnValue();
                    console.log('templateList'+JSON.stringify(templateList));
                    component.set("v.templateList", templateList);
                    component.set("v.templateColumnsList",templateColumns);
                    component.set("v.templateTableConfigurationMap",templateTableConfiguration);
                    window.setTimeout($A.getCallback(function(){ 
                    	component.find("templateListTable").initialize({"itemMenu":[5]});
                    }),500);
         		}else
       				helper.showToastMsg(component,event,helper,"Error","Error while calling templateList. Please try again.");
       		});        
       		$A.enqueueAction(action);                
	},
    
    /* Method Name: dtActionClicked
     * Comments : This method used for on popups selecting tab and template. 
     */
    dtActionClicked : function(component,event,helper){ 
        console.log('dtActionClicked');
        var actionId = event.getParam('actionId');
        if(actionId !="" && actionId != null && actionId != undefined){        
            if(actionId == 'viewTab'){
                var clickedRow = event.getParam('row');
                var selectedTabId = clickedRow.Id;
                console.log('selectedTabId'+selectedTabId);
                var recordName = clickedRow.Tab_Name__c;
                console.log('recordName'+recordName);
                component.set("v.tabPopupBoolean",false);
                //Start Change 2032018 for popup enabling after first click also
                //component.set("v.tabId",selectedTabId);
                //End Change 2032018
                component.set("v.selectedTabName",recordName);
                var subTabObj = component.get("v.subTabObj");
                subTabObj.Tabs__c = selectedTabId;
                component.set("v.subTabObj",subTabObj);                
            }else if(actionId == 'viewTemplate'){
                var clickedRow = event.getParam('row');
                var selectedTemplateId = clickedRow.Id;
                var recordName = clickedRow.Template_Name__c;
                component.set("v.templatePopupBoolean",false);
                component.set("v.templateId",selectedTemplateId);   
                component.set("v.selectedTemplateName",recordName);
                var subTabObj = component.get("v.subTabObj");
                subTabObj.Template__c = selectedTemplateId;
                
                //Added 29032018
                var templateObjectName = clickedRow.Object_Name__c;
                var templateObjectAPIName = clickedRow.Object_API_Name__c;
                var sfObjectsList = [{Label : templateObjectName, Name : templateObjectAPIName}];
                component.set("v.sfObjectsList",sfObjectsList);
                helper.preselectTheParentSFobject(component, event);                
                helper.preselectTheSFobjectOnLoad(component, event);
                component.set("v.subTabObj",subTabObj);                
            }
            event.setParam("actionId","");            
        }
    },
    /* Method Name: hideElements
     * Comments : This method used for hiding Elements during Navigation by trigerring hideElementsEvnt. 
     */
    hideElements : function (component, event, helper){
        //debugger;
        var eventExecuted = event.getParam("eventExecuted");
        if(eventExecuted != "true"){
            console.log('hideElements in adminSubTabDetailsPageCmp');            
            var auraIdListToHide = event.getParam("auraIdListToHide");
            auraIdListToHide.forEach(function(auraId){
                $A.util.removeClass(component.find(auraId), "unhideElement");
                $A.util.addClass(component.find(auraId), "hideElement");             
            });            
            event.setParam("eventExecuted","true");
        }
    },
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
            var revisedSelectedLookUpIdValues =  event.getParam("revisedSelectedLookUpIdValues");
            console.log('revisedSelectedLookUpIdValues'+revisedSelectedLookUpIdValues);
            var subTabObj = component.get("v.subTabObj");
            subTabObj.Profile__c = revisedSelectedLookUpValues;
            subTabObj.ProfileId__c = revisedSelectedLookUpIdValues;
            component.set("v.subTabObj",subTabObj); 
        }
})