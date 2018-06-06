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
                    component.set("v.templateIdClone", objData[0].value);
                    this.loadDataForTabs(component, event);
                }
                else if(objData.length==0){
                    component.set("v.templateIdClone", "");
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
        console.log('loadDataForTabs');
        var action = component.get("c.getTabs");
        var templateId = component.get("v.templateIdClone");
        action.setParams({
            templateId:templateId
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS'){
                var tabList = response.getReturnValue();
                var objData = [];
                var oId,oVal;
                tabList.forEach(function(d){
                    console.log(d)
                    oId = d.Id;
                    oVal = d.Tab_Name__c;
                    objData.push({value: oId, label: oVal});
                });
                
                component.set("v.tabListClone", objData);
                if(objData.length>0){
                    component.set("v.tabIdClone", objData[0].value);
                    this.loadDataForSubTabs(component, event);   
                }
                else if(objData.length==0){
                    component.set("v.tabIdClone", "");
                    this.loadDataForSubTabs(component, event);
                }                
            }
            
        });        
        
        $A.enqueueAction(action);                
    },
    /* Method Name: loadDataForSubTabs
     * Comments : This method is used for loading allSubTabs basedon seletced tabid. 
     */
    loadDataForSubTabs: function(component,event,helper){ 
        console.log('loadDataForSubTabs');
        var tabId = component.get("v.tabIdClone");
        console.log('tabId'+tabId);
        var action = component.get("c.getTabRelatedSubtabs");
        action.setParams({
            tabId:tabId
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log('state'+state);
            if(component.isValid() && state === 'SUCCESS'){
                var subTabList = response.getReturnValue();
                var objData = [];
                var oId,oVal;
                subTabList.forEach(function(d){
                    console.log(d)
                    oId = d.Id;
                    oVal = d.SubTab__c;
                    objData.push({value: oId, label: oVal});
                });
                component.set("v.subTabListClone", objData);
                if(objData.length>0){
                    component.set("v.subTabIdClone", objData[0].value);
                    this.loadDatatableForQuestions(component, event);  
                }
                else if(objData.length==0){
                    component.set("v.subTabIdClone", "");
                    this.loadDatatableForQuestions(component, event);
                }                
            }
            
        });        
        
        $A.enqueueAction(action);                
    },
    /* Method Name: loadDatatableForQuestions
     * Comments : This method is used for loading allSubTabs basedon seletced subtabid. 
     */    
    loadDatatableForQuestions: function(component,event,helper){ 
        console.log('loadDatatableForQuestions');
        var subTabId = component.get("v.subTabIdClone");        
        var action = component.get("c.getSubTabsRelatedQuestions");
        action.setParams({
            subTabId:subTabId
        });        
        
        //Displaying selected asset fields as Configuration data for the table
        //Need only Question Name, Object Name, Type and Description
        var questionsColumns =  [
            
            {
                'label':'Question',
                'name':'Question_Label__c',
                'type':'string'
            },
            {
                'label':'Object Name',
                'name':'Object_Name__c',
                'type':'string'
            },
            {
                'label':'Type',
                'name':'Field_Type__c',
                'type':'string'
            },
            {
                'label':'Sequence',
                'name':'Sequence__c',
                'type':'string'
            },
            {
                'label':'Description',
                'name':'Description__c',
                'type':'string'
            }
            
        ];
        
        //Configuration data for the table to enable actions in the table
        var questionsTableConfiguration = 
            {
                "searchBox":true,
                "searchByColumn":true,
                "massSelect":true   
            };
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS')
            {
                var questionsList = response.getReturnValue();
                component.set("v.questionsList", questionsList);
                component.set("v.questionsColumnsList",questionsColumns);
                component.set("v.questionsTableConfigurationMap",questionsTableConfiguration);
                
                window.setTimeout($A.getCallback(function(){  
                    component.find("questionsListTable").initialize({"order":[1, "asc"],"itemMenu":[5]});
                }),500);  
            }
            
        });        
        
        $A.enqueueAction(action);         
    },
    /* Method Name: navigateToCmp
     * Comments : This method is used for navigating different pages based on condition. 
     */
    navigateToCmp: function(component,event,helper){
        //Conditional Back
        var cmpBack;
        var cmp;
        var cmpParams = {};    
        cmpParams["templateId"] = component.get("v.templateId");
        var cmpNavigationList = component.get("v.cmpNavigationList");
        cmpNavigationList.shift();
        cmpBack = cmpNavigationList[0];        
        component.set("v.cmpNavigationList",cmpNavigationList);
        cmpParams["cmpNavigationList"] = cmpNavigationList;
        cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
        cmpParams["userChoice"] = component.get("v.userChoice"); 
        cmpParams["templateId"] = component.get("v.templateId");
        cmpParams["tabId"] = component.get("v.tabId");
        cmpParams["tabList"] = component.get("v.tabList");        
        cmpParams["subTabId"] = component.get("v.subTabId");
        cmpParams["subTabList"] = component.get("v.subTabList");        
        this.createComponent(component,event,helper,cmpBack,cmpParams);       
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
})