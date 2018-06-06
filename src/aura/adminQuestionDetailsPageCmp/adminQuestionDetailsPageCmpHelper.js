({
    /* Method Name: editQuestionData
     * Comments : This method used for display questionDetails based on questionId. 
     */ 
    editQuestionData : function(component, event){
        console.log('editQuestionData');
        $A.util.removeClass(component.find("spinner"), "slds-hide");  
        var questionId = component.get("v.questionId");
        var action = component.get('c.getQuestionDetails');
        action.setParams({
            questionId:questionId
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                var questionObj = response.getReturnValue();
                console.log('questionObj'+JSON.stringify(questionObj));
                component.set('v.questionObj',questionObj);
              }
            //For SubTab Popup
            var subTabId = component.get("v.subTabId");
            if(subTabId != "" && subTabId != undefined && subTabId != null){
                var questionObj = component.get('v.questionObj');
                questionObj.SubTab1__c = subTabId;
                component.set('v.questionObj',questionObj);
            }
            //while creating question from subtabdetails page for prepopulating object and parent object names
            if(questionId == '' || questionId == undefined || questionId == null){
                if(subTabId != "" && subTabId != undefined && subTabId != null){
                    var questionObj = component.get('v.questionObj');
                    questionObj.SubTab1__c = subTabId;
                    questionObj.Object_Name__c = component.get('v.selectedSubTabObjectName');
                    questionObj.Object_API_Name__c = component.get('v.selectedSubTabObjectApiName');
                    component.set("v.OrgSubTabObjectApiName",component.get('v.selectedSubTabObjectApiName'));
                    component.set("v.OrgSubTabObjectName",component.get('v.selectedSubTabObjectName'));                    
                    questionObj.Parent_Object_Name__c =component.get('v.selectedSubTabParentObjectName');
                    questionObj.Parent_Object_API_Name__c = component.get('v.selectedSubTabParentObjectApiName');                    
                    questionObj.Org_Parent_Object_API_Name__c = component.get('v.selectedSubTabOrgParentObjectApiName');
                    questionObj.Relationship__c = component.get('v.selectedSubTabRelationship');                    
                    questionObj.Field_Name__c =component.get('v.selectedSubTabFieldName');
                    questionObj.Field_API_Name__c = component.get('v.selectedSubTabFieldApiName');
                    questionObj.Question_Label__c =component.get('v.selectedSubTabFieldName');
                    component.set("v.selctedObjectValue",questionObj.Object_API_Name__c);
                    component.set("v.selectedFieldValue",questionObj.Field_API_Name__c);
                    this.loadPicklistValues(component, event);
                    component.set('v.questionObj',questionObj);
                }
            }
            
            //Disbaling Org Parent Object API and Object API picklist
            var questionObj = component.get('v.questionObj');
            var disablePicklists = false;
            if(questionObj.Org_Parent_Object_API_Name__c != undefined && questionObj.Org_Parent_Object_API_Name__c != "None" && questionObj.Org_Parent_Object_API_Name__c != null && questionObj.Org_Parent_Object_API_Name__c != ""){
               disablePicklists = true;                 
            }
            if(questionObj.Object_API_Name__c != undefined && questionObj.Object_API_Name__c != "None" && questionObj.Object_API_Name__c != null && questionObj.Object_API_Name__c != ""){
               disablePicklists = true;                 
            }
            if(disablePicklists){
                //component.find("dynamicSobject").set("v.disabled",true);
                component.find("dynamicSobjectChild").set("v.disabled",true);
            }                
            component.find("relationship").set("v.disabled",true);            
            
            //Start Change for Picklists 07022018
            this.preselectTheParentSFobject(component, event);            
            this.preselectTheSFobjectOnLoad(component, event);
            //End Change for Picklists 07022018 
           
            //Start Change for ProfileAdiing 25042018
            if(questionId != "" && questionId != undefined && questionId != null){
            this.loadQuestionRelatedProfiles(component, event);
            }
            //End Change for ProfileAdiing 25042018
        });
        $A.enqueueAction(action);
    },
    /* Method Name: preselectTheParentSFobject
     * Comments : This method used for prepopulating parentobject picklistvalues. 
     */ 
    preselectTheParentSFobject : function(component){
       
        console.log('preselectTheParentSFobject');       
        var questionObj = component.get("v.questionObj");
        var sfParentObjectsList = component.get("v.sfObjectsList");
        var objData = [];
        var label,name,selctd;
        component.find("relationship").set("v.disabled",true);        
        if(sfParentObjectsList != null && sfParentObjectsList != undefined && sfParentObjectsList != ""){
            if(questionObj != "" && questionObj != undefined && questionObj.Org_Parent_Object_API_Name__c != "" && questionObj.Org_Parent_Object_API_Name__c != undefined && questionObj.Org_Parent_Object_API_Name__c != "None"){
                Object.keys(sfParentObjectsList).forEach(function(index){
                    name = sfParentObjectsList[index].Name;
                    label = sfParentObjectsList[index].Label;
                    if(name == questionObj.Org_Parent_Object_API_Name__c){
                        selctd = true;
                    }else
                        selctd = false;
                    objData.push({Label: label, Name: name, Selected: selctd});            
                });
                //component.find("relationship").set("v.disabled",false);                
            }
            else{
                Object.keys(sfParentObjectsList).forEach(function(index){
                    name = sfParentObjectsList[index].Name;
                    label = sfParentObjectsList[index].Label;
                    selctd = false;                        
                    objData.push({Label: label, Name: name, Selected: selctd});                
                });
                component.set("v.questionObj",questionObj);
            } 
            component.set("v.sfParentObjectsList",objData);            
        }                        
    },
    /* Method Name: preselectTheSFobjectOnLoad
     * Comments : This method used for prepopulating object picklistvalues on editmode. 
     */ 
    preselectTheSFobjectOnLoad : function(component){
        //debugger;
        console.log('preselectTheSFobjectOnLoad'); 
        var questionObj = component.get("v.questionObj");

        if(questionObj != null && questionObj != undefined && questionObj != "" && questionObj.Org_Parent_Object_API_Name__c != null && questionObj.Org_Parent_Object_API_Name__c != undefined && questionObj.Org_Parent_Object_API_Name__c != "" && questionObj.Org_Parent_Object_API_Name__c != "None" && questionObj.Relationship__c != null && questionObj.Relationship__c != undefined && questionObj.Relationship__c != "" && questionObj.Relationship__c != "None"){
            //Scenario when ParentObjectName exists
            
            
            //Added 28032018
            //Retrieve all child ObjectNames
            /*var selctedObjectValue = component.get("v.selctedObjectValue");
            var action = component.get("c.getsObjectRelatedChildObjects");
            action.setParams({
                selctedObjectValue:questionObj["Org_Parent_Object_API_Name__c"]
            });*/
            var action;
            if(questionObj.Relationship__c == "1:M")
                action = component.get("c.getsObjectRelatedChildObjects");
            else if(questionObj.Relationship__c == "1:1")
                action = component.get("c.getSobjectRelatedParentLookUp");
            action.setParams({
                selctedObjectValue:questionObj.Org_Parent_Object_API_Name__c
            });            
            action.setCallback(this, function(a) {
                var state = a.getState();
                var sfObjectsList = null;
                if(state == "SUCCESS"){
                    sfObjectsList = a.getReturnValue();
                    component.set("v.sfObjectsNameList",sfObjectsList);                
                }else{
                    component.set("v.sfObjectsNameList",[]);               
                }
                
                if(sfObjectsList != null && sfObjectsList != undefined && sfObjectsList != ""){
                    var objData = [];
                    var label,name,selctd;
                    if(questionObj != "" && questionObj != undefined && questionObj.Object_API_Name__c != "" && questionObj.Object_API_Name__c != undefined){
                        Object.keys(sfObjectsList).forEach(function(index){
                            name = sfObjectsList[index].Name;
                            label = sfObjectsList[index].Label;
                            if(name == questionObj.Object_API_Name__c){
                                selctd = true;
                            }else
                                selctd = false;
                            objData.push({Label: label, Name: name, Selected: selctd});            
                        });
                        if(questionObj.Object_API_Name__c != "None" && questionObj.Object_API_Name__c != "--None--"){
                            component.set("v.selctedObjectValue",questionObj.Object_API_Name__c);
                            //Commented 27032018
                            //this.getSobjeFieldsOnLoad(component, event, questionObj.Object_API_Name__c);
                            //Added 27032018
                            this.getSobjeFieldsOnLoad(component, event);                
                        }            
                    }
                    else{
                        Object.keys(sfObjectsList).forEach(function(index){
                            name = sfObjectsList[index].Name;
                            label = sfObjectsList[index].Label;
                            selctd = false;                        
                            objData.push({Label: label, Name: name, Selected: selctd});                
                        });
                        //Added 27032018 for scenario where ObjectName does not exist for the question or for the subtab which we chose
                        component.set("v.selctedObjectValue","");
                        this.getSobjeFieldsOnLoad(component, event);            
                    } 
                    component.set("v.sfObjectsNameList",objData);                    
                }else{
                    if(questionObj != "" && questionObj != null && questionObj != undefined){
                        if(questionObj.Org_Parent_Object_API_Name__c != null && questionObj.Org_Parent_Object_API_Name__c != "" && questionObj.Org_Parent_Object_API_Name__c != undefined)                    
                            component.set("v.sfObjectsNameList",[{Label: questionObj["Parent_Object_Name__c"], Name: questionObj["Org_Parent_Object_API_Name__c"], Selected : false}]);
                        else
                            component.set("v.sfObjectsNameList",[]);    
                    }                    
                    else
                        component.set("v.sfObjectsNameList",[]);
                }
                
            });
            $A.enqueueAction(action);             
            
        }else{
            //Scenario when ParentObjectName does not exist
            var sfObjectsList = component.get("v.sfObjectsList");
            
            var objData = [];
            var label,name,selctd;
            if(sfObjectsList != null && sfObjectsList != undefined && sfObjectsList != ""){
                
                if(questionObj != "" && questionObj != undefined && questionObj.Object_API_Name__c != "" && questionObj.Object_API_Name__c != undefined){
                    Object.keys(sfObjectsList).forEach(function(index){
                        name = sfObjectsList[index].Name;
                        label = sfObjectsList[index].Label;
                        if(name == questionObj.Object_API_Name__c){
                            selctd = true;
                        }else
                            selctd = false;
                        objData.push({Label: label, Name: name, Selected: selctd});            
                    });
                    if(questionObj.Object_API_Name__c != "None" && questionObj.Object_API_Name__c != "--None--"){
                        component.set("v.selctedObjectValue",questionObj.Object_API_Name__c);
                        //Commented 27032018
                        //this.getSobjeFieldsOnLoad(component, event, questionObj.Object_API_Name__c);
                        //Added 27032018
                        this.getSobjeFieldsOnLoad(component, event);                
                    }            
                }
                else{
                    Object.keys(sfObjectsList).forEach(function(index){
                        name = sfObjectsList[index].Name;
                        label = sfObjectsList[index].Label;
                        selctd = false;                        
                        objData.push({Label: label, Name: name, Selected: selctd});                
                    });
                    //Added 27032018 for scenario where ObjectName does not exist for the question or for the subtab which we chose
                    component.set("v.selctedObjectValue","");
                    this.getSobjeFieldsOnLoad(component, event);            
                } 
                component.set("v.sfObjectsNameList",objData);                
                
            }else{
                if(questionObj != "" && questionObj != null && questionObj != undefined){
                    if(questionObj.Object_API_Name__c != null && questionObj.Object_API_Name__c != "" && questionObj.Object_API_Name__c != undefined)                    
                        component.set("v.sfObjectsNameList",[{Label: questionObj["Object_API_Name__c"], Name: questionObj["Object_API_Name__c"], Selected : false}]);
                    else
                        component.set("v.sfObjectsNameList",[]);    
                }                    
                else
                    component.set("v.sfObjectsNameList",[]);
            }
                        
        }               
    },
    /* Method Name: getSobjeFields
     * Comments : This method used for prepopulating field picklistvalues. 
     */ 
    getSobjeFields : function(component,event,helper){
        //debugger;
        console.log('getSobjeFields'); 
        var selctedObjectValue = component.get("v.selctedObjectValue");
        var action = component.get("c.getsObjectRelatedFields");
        action.setParams({
            selctedObjectValue:selctedObjectValue
        });
        action.setCallback(this, function(a){
            var state = a.getState(); 
            if(state == "SUCCESS"){                                      
                var questionObj = component.get("v.questionObj");
                var sfFieldsList = a.getReturnValue();                
                var objData = [];
                var label,name,selctd;
                //Start Change 07022018
                Object.keys(sfFieldsList).forEach(function(index){
                    name = sfFieldsList[index].Name;
                    label = sfFieldsList[index].Label;
                    selctd = false;
                    objData.push({Label: label, Name: name, Selected: selctd});            
                });
                //Reset the Field Type and Picklist Values                
                component.set('v.allPickListValues','');
                //component.set('v.stringPickListValues','');                
                var questionObj = component.get("v.questionObj");
                questionObj.Values__c = '';
                questionObj.Field_API_Name__c = 'None';
                //Start Change 20032018
                questionObj.Field_Type__c = '';
                questionObj.Question_Label__c = '';
                //End Change 20032018 
                component.set("v.questionObj",questionObj);
                component.set("v.selectedFieldType",null);                
                //End Change 07022018
                component.set("v.sfFieldsList",objData);
            }
        });
        $A.enqueueAction(action);
    },
    /* Method Name: getSobjeFields
     * Comments : This method used for prepopulating field picklistvalues on editmode. 
     */ 
    getSobjeFieldsOnLoad : function(component,event){
        //debugger;
        console.log('getSobjeFieldsOnLoad'); 
        var selctedObjectValue = component.get("v.selctedObjectValue");
        var action = component.get("c.getsObjectRelatedFields");
        action.setParams({
            selctedObjectValue:selctedObjectValue
        });
        action.setCallback(this, function(a) {
            var state = a.getState(); 
            if(state == "SUCCESS"){                                      
                var questionObj = component.get("v.questionObj");
                var sfFieldsList = a.getReturnValue();                
                var objData = [];
                var label,name,selctd;
                
                //Code Modified on 28032018
                if(sfFieldsList != "" && sfFieldsList != undefined && sfFieldsList != null){                
                    if(questionObj != "" && questionObj != undefined && questionObj.Field_API_Name__c != "" && questionObj.Field_API_Name__c != undefined){
                        Object.keys(sfFieldsList).forEach(function(index){
                            name = sfFieldsList[index].Name;
                            label = sfFieldsList[index].Label;
                            if(name == questionObj.Field_API_Name__c){
                                selctd = true;
                            }else
                                selctd = false;
                            objData.push({Label: label, Name: name, Selected: selctd});            
                        });
                        if(questionObj.Field_API_Name__c != "None" && questionObj.Field_API_Name__c != "--None--"){
                            component.set("v.selectedFieldValue",questionObj.Field_API_Name__c);
                            var selectedFieldValue=component.get("v.selectedFieldValue");
                            this.loadPicklistValuesOnLoad(component, event);                        
                            this.getSobjeFieldType(component, event);
                            this.getSelectedFieldProperties(component, event, selectedFieldValue);                        
                        }                     
                    }
                    else{
                        Object.keys(sfFieldsList).forEach(function(index){
                            name = sfFieldsList[index].Name;
                            label = sfFieldsList[index].Label;
                            selctd = false;                        
                            objData.push({Label: label, Name: name, Selected: selctd});                
                        });
                        //Added on 28032018
                        component.set("v.selectedFieldValue","");
                        var selectedFieldValue=component.get("v.selectedFieldValue");
                        this.loadPicklistValuesOnLoad(component, event);                        
                        this.getSobjeFieldType(component, event);
                        this.getSelectedFieldProperties(component, event, selectedFieldValue);                         
                    }  
                    component.set("v.sfFieldsList",objData);                    
                }else{
                    component.set("v.sfFieldsList",[]);                    
                    component.set("v.selectedFieldValue","");
                    var selectedFieldValue=component.get("v.selectedFieldValue");
                    this.loadPicklistValuesOnLoad(component, event);                        
                    this.getSobjeFieldType(component, event);
                    this.getSelectedFieldProperties(component, event, selectedFieldValue);                    
                }                
            }else{
                component.set("v.sfFieldsList",[]);                    
                component.set("v.selectedFieldValue","");
                var selectedFieldValue=component.get("v.selectedFieldValue");
                this.loadPicklistValuesOnLoad(component, event);                        
                this.getSobjeFieldType(component, event);
                this.getSelectedFieldProperties(component, event, selectedFieldValue);                
            }
        });
        $A.enqueueAction(action);
    }, 
    /* Method Name: getSobjeFieldType
     * Comments : This method used for getting salesforce fields field type. 
     */ 
    getSobjeFieldType : function(component,event){
       // debugger;
        console.log('getSobjeFieldType'); 
        var selctedObjectValue = component.get("v.selctedObjectValue");
        var selectedFieldValue = component.get("v.selectedFieldValue");;
        var action = component.get("c.getsObjectFieldsType");
        action.setParams({
            selctedObjectValue:selctedObjectValue,
            selectedFieldValue:selectedFieldValue
        });
        action.setCallback(this, function(a) {
            var state = a.getState();
            if(state == "SUCCESS"){               
                //Code modified 28032018
                var fieldType = a.getReturnValue();
                if(fieldType != "" && fieldType != undefined && fieldType != null)
                    component.set("v.selectedFieldType", a.getReturnValue());
                else
                    component.set("v.selectedFieldType","");                    
                   }else
                component.set("v.selectedFieldType","");  
        });
        $A.enqueueAction(action);
    },
    /* Method Name: getSelectedFieldProperties
     * Comments : This method used for getting salesforce fiels field validations. 
     */ 
    getSelectedFieldProperties : function(component,event,selectedFieldValue){
        console.log('getSelectedFieldProperties'); 
        var selctedObjectValue = component.get("v.selctedObjectValue");
        var selectedFieldValue = selectedFieldValue;
        var questionObj = component.get("v.questionObj");
        var action = component.get("c.getSelectedFieldPropertyValues");
        action.setParams({
            selctedObjectValue:selctedObjectValue,
            selectedFieldValue:selectedFieldValue
        });
        action.setCallback(this, function(a) {
            var state = a.getState();
            if(state == "SUCCESS"){                                     
                var result = a.getReturnValue();
                var fieldLength = result.length;
                var fieldSize = result.precision;
                component.set("v.fieldPropertiesMap",result);
                if(fieldSize != null && fieldSize != 0){
                    component.set("v.questionObj.Size__c",fieldSize);
                }else{
                    component.set("v.questionObj.Size__c",fieldLength);
                }
                var helpText = component.get("v.fieldPropertiesMap.inlineHelpText");
                if(helpText == "" || helpText == undefined || helpText == null)
                    var helpText = questionObj.Help_Text__c;
                component.set("v.questionObj.Help_Text__c",helpText);
                var checkbox = component.get("v.fieldPropertiesMap.nillable");
                if(checkbox == true){
                    checkbox = false;
                    component.set("v.questionObj.IsMandatory__c",checkbox);
                }else{
                    checkbox = true;
                    component.set("v.questionObj.IsMandatory__c",checkbox);
                }
                var scale = component.get("v.fieldPropertiesMap.scale");
                component.set("v.questionObj.Decimal__c",scale);
                var defaultValue = component.get("v.fieldPropertiesMap.defaultValueFormula");
                component.set("v.questionObj.Default_Value__c",defaultValue);
                var referenceto = component.get("v.fieldPropertiesMap.referenceTo");
                component.set("v.selectedFieldReference",referenceto);
                component.set("v.questionObj",questionObj);
            }
        });
        $A.enqueueAction(action);
    }
    ,
    /* Method Name: loadPicklistValues
     * Comments : This method used for if field type is picklist prepoulating the field picklist values. 
     */ 
    loadPicklistValues : function(component, event,helper){
        //debugger;
        console.log('loadPicklistValues'); 
        var selctedObjectValue = component.get("v.selctedObjectValue");
        var selectedFieldValue = component.get("v.selectedFieldValue");
        var action = component.get("c.getAllPicklistValuesBasedOnType");
        action.setParams({
            selctedObjectValue:selctedObjectValue,
            selectedFieldValue:selectedFieldValue
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                var questionPicklistValues = response.getReturnValue(); 
                console.log('questionPicklistValues'+questionPicklistValues);
                component.set('v.allPickListValues',questionPicklistValues);
                /*if(questionPicklistValues != null && questionPicklistValues != undefined && questionPicklistValues != ""){
                    var questionId = component.get("v.questionId");
                    if(questionId != null && questionId != undefined && questionId != ""){
                        var questionObj = component.get("v.questionObj");
                        questionObj.Values__c = questionPicklistValues.join(',');
                        component.set("v.questionObj",questionObj);
                    }else
                        component.set('v.stringPickListValues',questionPicklistValues.join(','));
                }else{
                    var questionId = component.get("v.questionId");
                    if(questionId != null && questionId != undefined && questionId != ""){
                        var questionObj = component.get("v.questionObj");
                        questionObj.Values__c = ''; 
                        component.set("v.questionObj",questionObj);
                    }else
                        component.set('v.stringPickListValues','');                        
                }*/
                var questionObj = component.get("v.questionObj");
                questionObj.Values__c = questionPicklistValues.join(',');
                component.set("v.questionObj",questionObj);                
            }
        });
        $A.enqueueAction(action);
    },
    /* Method Name: loadPicklistValues
     * Comments : This method used for if field type is picklist prepoulating the field picklist values on edit mode. 
     */ 
    loadPicklistValuesOnLoad : function(component, event,helper) {
        //debugger;
        console.log('loadPicklistValuesOnLoad');
        var questionObj = component.get("v.questionObj");
        var savedPicklistValues = questionObj.Values__c;
        var fieldType = questionObj.Field_Type__c;
        if(fieldType == "PICKLIST"){
            if(savedPicklistValues != null && savedPicklistValues != undefined){
                component.set('v.allPickListValues',savedPicklistValues.split(","));
                //component.set('v.stringPickListValues',savedPicklistValues);
            }
        }
    },
    /* Method Name: validations
     * Comments : This method is used for client side validation.
     * Validations : Mandatory Fields
     */
    validations : function(component,event,helper){
        console.log('validations');
        var questionObj = component.get("v.questionObj");
        var subTabId = component.get("v.subTabId");
        var tabId = component.get("v.tabId");
        var templateId = component.get("v.templateId");
        var userChoice = component.get("v.userChoice");
        var selectedFieldType = component.get("v.selectedFieldType"); 
        //var selectedFieldValueQuestion = component.get("v.selectedFieldValueQuestion");
        var errMsg = "";        
        if(questionObj.Object_API_Name__c == "" || questionObj.Object_API_Name__c == undefined || questionObj.Object_API_Name__c == "--None--" || questionObj.Object_API_Name__c == "None"){
            errMsg = (errMsg == "" ? errMsg : errMsg + ", ");                
            errMsg += "Please select Object name";
        }
        if(questionObj.Field_API_Name__c == "" || questionObj.Field_API_Name__c == undefined || questionObj.Field_API_Name__c == "--None--" || questionObj.Field_API_Name__c == "None"){
            errMsg = (errMsg == "" ? errMsg : errMsg + ", ");  
            errMsg += "Please select Field Name";
        }
        if(questionObj.Question_Label__c == "" || questionObj.Question_Label__c == undefined || questionObj.Question_Label__c == null){   
            errMsg = (errMsg == "" ? errMsg : errMsg + ", ");  
            errMsg += "Please enter Question Name";
        }
        if(subTabId == null || subTabId == undefined || subTabId == ""){        
            if(questionObj.SubTab1__c == "" || questionObj.SubTab1__c == undefined){
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");  
                errMsg += "Please enter SubTab";
            }
        }
        if(selectedFieldType == "PICKLIST"){
            var allPickListValues = component.get("v.allPickListValues");
            var questionId = component.get("v.questionId");
            var stringPickListValues;
            /*if(questionId != null && questionId != undefined && questionId != ""){
                stringPickListValues = questionObj.Values__c;
                //selectedPicklistValue = questionObj.Values__c;            
            }
            else{        
                stringPickListValues = component.get("v.stringPickListValues");
                //selectedPicklistValue = component.get("v.stringPickListValues");
            }*/
            stringPickListValues = questionObj.Values__c;
            if(stringPickListValues != "" && stringPickListValues != null && stringPickListValues != undefined){
                var userEnteredFieldValues = stringPickListValues.split(',');
                for(var cnt = 0; cnt < userEnteredFieldValues.length ; cnt++){
                    if(allPickListValues.indexOf(userEnteredFieldValues[cnt]) == -1){
                        //helper.showToastMsg(component,event,helper,"Error","Please enter valid Field picklist values");
                        errMsg = (errMsg == "" ? errMsg : errMsg + ", ");  
                        errMsg += "Please enter valid Field picklist values";                              
                        break;
                    }                          
                }                      
                /*userEnteredFieldValues.forEach(function(val){
                          if(allPickListValues.indexOf(val) == -1){
                              this.showToastMsg(component,event,helper,"Error","Please enter valid Field picklist values"); 
                              return false;
                          }
                      });*/
            }else{
                //helper.showToastMsg(component,event,helper,"Error","Picklist values cannot be empty");                                             
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");  
                errMsg += "Picklist values cannot be empty";                       
            }
        }
  
        component.set("v.errorMessage",errMsg);
    },    
    /* Method Name: navigateToCmp
     * Comments : This method used for navigating back to questions list. 
     */ 
    navigateToCmp: function(component,event,helper){
        console.log('navigateToCmp');
        //Check for navigation through Home
        if(component.get("v.userChoice") == "NewQuestion"){
            var evt=$A.get("e.force:navigateToComponent");
            evt.setParams({
                componentDef:"c:adminHomePageCmp",
                componentAttributes: {
                    sfObjectsList:component.get("v.sfObjectsList")
                }                
            });
            evt.fire();            
        }
        else{
            var cmpBack;
            var cmpParams = {};
            var cmpNavigationList = component.get("v.cmpNavigationList");
            cmpNavigationList.shift();
            var cmpBack = cmpNavigationList[0];  
            console.log('cmpBack...'+cmpBack);
            component.set("v.cmpNavigationList",cmpNavigationList);
            cmpParams["cmpNavigationList"] = cmpNavigationList;
            cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
            cmpParams["userChoice"] = component.get("v.userChoice"); 
            cmpParams["templateId"] = component.get("v.templateId");
            cmpParams["tabId"] = component.get("v.tabId");
            cmpParams["subTabList"] = component.get("v.subTabList"); 
            cmpParams["name"] = component.get("v.name"); 
            cmpParams["tabName"] = component.get("v.tabName");
            cmpParams["subtabName"] = component.get("v.subtabName");
            
            switch(cmpBack){
                case "c:adminTabDetailsPageCmp":
                    break;
                case "c:adminSubTabDetailsPageCmp":
                    var subTabId = component.get("v.subTabId");
                    var tabList = component.get("v.tabList");
                    cmpParams["subTabId"] = subTabId;
                    cmpParams["tabList"] = tabList; 
                    break;
                case "c:adminQuestionsHomePageCmp":
                    var tabList = component.get("v.tabList");
                    cmpParams["tabList"] = tabList;
                    break;               
            }  
            this.createComponent(component,event,helper,cmpBack,cmpParams);            
        }           
    },
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
    
    /* Method Name: dtClickActionClicked
     * Comments : This method used for navigating to different pages based on actionIds. 
     */
    dtClickActionClicked : function(component,event,helper){
        console.log('dtClickActionClicked');
        var actionId = event.getParam('actionId');
        if(actionId !="" && actionId != null && actionId != undefined){  
            if(actionId == 'viewSubtab')
            {
               var clickedRow = event.getParam('row');
                var recordName = clickedRow.SubTab__c;
                component.set("v.subtabPopupBoolean",false);
                //Start Change 2032018 for popup enabling after first click also                
                //component.set("v.subTabId",selectedSubTabId);
                //End Change 2032018                
                component.set("v.selectedSubTabNamePopup",recordName);
                var questionObj = component.get("v.questionObj");
                questionObj.SubTab1__c = clickedRow.Id;
                questionObj.Parent_Object_Name__c = clickedRow.Parent_Object_Name__c;
                questionObj.Parent_Object_API_Name__c = clickedRow.Parent_Object_API_Name__c;
                questionObj.Org_Parent_Object_API_Name__c = clickedRow.Org_Parent_Object_API_Name__c;                
                questionObj.Relationship__c = clickedRow.Relationship__c;                
                questionObj.Object_Name__c = clickedRow.Object_Name__c;
                questionObj.Object_API_Name__c = clickedRow.Object_API_Name__c;
                component.set("v.OrgSubTabObjectApiName",clickedRow.Object_API_Name__c);
                component.set("v.OrgSubTabObjectName",clickedRow.Object_Name__c);                
                questionObj.Field_Name__c = clickedRow.Field_Name__c;
                questionObj.Field_API_Name__c = clickedRow.Field_API_Name__c;
                questionObj.Question_Label__c = clickedRow.Field_Name__c;
                component.set("v.questionObj",questionObj);
                //Disbaling Org Parent Object API and Object API picklist
                var disablePicklists = false;
                if(questionObj.Org_Parent_Object_API_Name__c != undefined && questionObj.Org_Parent_Object_API_Name__c != "None" && questionObj.Org_Parent_Object_API_Name__c != null && questionObj.Org_Parent_Object_API_Name__c != ""){
                    disablePicklists = true;                 
                }
                if(questionObj.Object_API_Name__c != undefined && questionObj.Object_API_Name__c != "None" && questionObj.Object_API_Name__c != null && questionObj.Object_API_Name__c != ""){
                    disablePicklists = true;                 
                }
                if(disablePicklists){
                    //component.find("dynamicSobject").set("v.disabled",true);
                    component.find("dynamicSobjectChild").set("v.disabled",true);
                }                
                component.find("relationship").set("v.disabled",true);
                
                this.preselectTheParentSFobject(component, event);
                component.set("v.selctedObjectValue",questionObj.Object_API_Name__c);
                component.set("v.selectedFieldValue",questionObj.Field_API_Name__c);                
                this.preselectTheSFobjectOnLoad(component, event);
                //component.set("v.selectedFieldValue",questionObj.Field_API_Name__c);
                this.loadPicklistValues(component, event);
                 }
            else if(actionId == 'viewTab'){
                var clickedRow = event.getParam('row');
                var selectedTabId = clickedRow.Id;
                var recordName = clickedRow.Tab_Name__c;
                component.set("v.tabPopupBoolean",false);
                component.set("v.tabIdPopup",selectedTabId);  
                component.set("v.selectedTabName",recordName);
            }
            else if(actionId == 'viewTemplate'){
                console.log('actionId'+actionId);
                var clickedRow = event.getParam('row');
                var selectedTemplateId = clickedRow.Id;
                var recordName = clickedRow.Template_Name__c;
                component.set("v.templatePopupBoolean",false);
                component.set("v.templateIdPopup",selectedTemplateId);  
                component.set("v.selectedTemplateName",recordName);
                
                //Added 29032018
                var templateObjectName = clickedRow.Object_Name__c;
                var templateObjectAPIName = clickedRow.Object_API_Name__c;
                var sfObjectsList = [{Label : templateObjectName, Name : templateObjectAPIName}];
                component.set("v.sfObjectsList",sfObjectsList);
                this.preselectTheParentSFobject(component, event);
				this.preselectTheSFobjectOnLoad(component, event);                
            }
            else if(actionId == 'addProfile'){
                var cmpParams = {};
                var questionProfilesList = component.get("v.questionProfilesList");
                var cmpNavigationList = component.get("v.cmpNavigationList");
                cmpNavigationList.unshift("c:adminNewProfileCmp");       
                component.set("v.cmpNavigationList",cmpNavigationList);
                
                cmpParams["cmpNavigationList"] = component.get("v.cmpNavigationList");              
                cmpParams["templateId"] = component.get("v.templateId");
                cmpParams["questionId"] = component.get("v.questionId");
                cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
                cmpParams["userChoice"] = component.get("v.userChoice");
                cmpParams["tabId"] = component.get("v.tabId");
                cmpParams["tabList"] = component.get("v.tabList");
                cmpParams["subTabId"] = component.get("v.subTabId");                
                cmpParams["subTabList"] = component.get("v.subTabList");
                cmpParams["questionProfilesList"] = component.get("v.questionProfilesList");
                //Hide current component
                $A.util.removeClass(component.find("createQuestion"), "unhideElement");
                $A.util.addClass(component.find("createQuestion"), "hideElement");
                
                $A.createComponents([["c:adminNewProfileCmp",cmpParams]],                
                                    function(adminNewProfileCmp, status){
                                        if (component.isValid() && status === 'SUCCESS'){
                                            component.set("v.body", adminNewProfileCmp);
                                        } else{
                                            var showToast = $A.get('e.force:showToast');
                                            showToast.setParams({
                                                'title': 'adminNewProfileCmp',
                                                'message': 'Error while calling adminNewProfileCmp component. Please try again.', });           
                                            showToast.fire();
                                        }
                                    });    
                
                
            } 
            else if(actionId == 'deleteRow'){
                    
                var rowIdx = event.getParam("index");
                var clickedRow = event.getParam('row');
                var selectedProfileID = clickedRow.Id;
                component.set("v.selectedProfileID",selectedProfileID);
                if(selectedProfileID != null && selectedProfileID != '' && selectedProfileID != undefined){
                    this.deleteQuestionRelatedProfile(component, event, helper);
                }
                  
            }
            
            event.setParam("actionId","");            
        }        
    },
     /* Method Name: loadQuestionRelatedProfiles
     * Comments : This method is used for loading question related profiles. 
     */
    loadQuestionRelatedProfiles: function(component,event,helper){ 
        console.log('loadTabs');
        var questionId = component.get("v.questionId");
        var action = component.get("c.getQuestionRelatedProfiles");
        action.setParams({
            questionId:questionId
        });
        //Displaying selected tab fields as Configuration data for the table
        var profileColumns = [
            {
                'label':'Profile Name',
                'name':'Profile_Name__c',
                'value':'string'
                
            },
            {
                'label':'Read Only',
                'name':'Read_Only_Value__c',
                'value':'Boolean'
            }
            
        ];
        
        //Configuration data for the table to enable actions in the table
        var profileTableConfiguration = 
            {
                "searchBox":true,
                "searchByColumn":true,
                "itemsPerPage":5,
                "globalAction":[
                    {
                        "label":"New",
                        "type":"button",
                        "id":"addProfile",
                        "class":"slds-button slds-button--neutral"
                    },
                   	
                ],
                "rowAction":
                [
                   
                    {
                        "label":"Delete",
                        "type":"url",
                        "id":"deleteRow"
                    }
                ]   
            };
        //Callback the action, to set the result into attributes for displaying the data in Table
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){	
                var questionProfilesList = response.getReturnValue();
                component.set("v.questionProfilesList", questionProfilesList);
                component.set("v.questionProfilesColumnList",profileColumns);
                component.set("v.questionProfilesConfigurationMap",profileTableConfiguration);
                window.setTimeout($A.getCallback(function(){
                    component.find("questionProfilesListTable").initialize({"order":[1, "asc"],"itemMenu":[5]});                    
                }),500);
            }
             
        });        
        $A.enqueueAction(action);                
    },

     /*
Method Name : deleteQuestionRelatedProfile
Usage       : This method is used to delete the Profile
*/     
    deleteQuestionRelatedProfile : function(component, event, helper){
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        var selectedProfileID = component.get("v.selectedProfileID");
        //Calling server-side action
        var action = component.get('c.deleteQuestionRelatedProfile');
        action.setParams({
            selectedProfileID : selectedProfileID
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                    $A.util.addClass(component.find("spinner"), "slds-hide");
                    this.showToastMsg(component,event,helper,"Success","Question Related Profile Deleted Successfully");
                     this.loadQuestionRelatedProfiles(component, event);  
            }else{
                 $A.util.addClass(component.find("spinner"), "slds-hide");
                this.showToastMsg(component,event,helper,"Error","Error while Deleting Question Related Profile. Please try again.");                
            }
        });
        $A.enqueueAction(action);
        
    },
    /* Method Name: showToastMsg
     * Comments : Unique method used for dispalying errormessages. 
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