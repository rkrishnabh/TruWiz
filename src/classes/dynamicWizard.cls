public class dynamicWizard {
    
    /*
Method Name : getCurrentUserProfile
Parameters  : null
Return type : string 
comments    : For getting loggedin users profile
*/ 
    @AuraEnabled
    public static Id getLoggedInUserProfile(){
        system.debug('Inside getLoggedInUserProfile - Start');
         Id profileId;
        try{
            //get the logged in user profile id
            profileId = userinfo.getProfileId();
            system.debug('profileId..'+profileId);
            system.debug('Inside getLoggedInUserProfile - End');
        }catch(Exception e){
            system.debug('getLoggedInUserProfile error'+e.getMessage());
        }
        return profileId;
    }
    /*
Method Name : loadTemplatesRelatedToObject
Parameters  : RecordId - Object record id
Return type : List of templates
comments    : This method is used to fetch all templates for the input Object record id
*/
    @AuraEnabled
    public static List<WizardHeader__c> loadTemplatesRelatedToObject(string recordId){
        system.debug('loadTemplatesRelatedToObject - start'+recordId);
        List<WizardHeader__c> templatesList;
        
        try{
            String query = 'select id from Template_draft__c where Record_Id__c'+'=\''+recordId+'\'' ;
            
            list<sobject> sobjectList = Database.query(query);            
            system.debug('recordId..'+recordId+'.. sobjectList size..'+sobjectList.size());
            
            if(sobjectList.size() == 0){                
                String parentObjectName = string.valueof((Id.valueOf(recordId)).getsobjecttype());
                system.debug('parentObjectName..'+parentObjectName); 
                templatesList = new List<WizardHeader__c>([SELECT id,Template_Name__c, Expiry_DateFormula__c, Template_Description__c FROM WizardHeader__c where Object_API_Name__c =:parentObjectName AND RecordType.Name ='Template']);
                system.debug('templatesList..'+templatesList);                                       
            }
            system.debug('loadTemplatesRelatedToObject - End');
        }catch(Exception e){
            system.debug('update error'+e.getMessage());
        }        
        return templatesList;
    }
    
    /*
Method Name : createTemplateDraftRecord
Parameters  : RecordId,templateId 
Return type : 
comments    : 
*/
    @AuraEnabled
    public static id createTemplateDraftRecord(string recordId, string templateId, string templateName){
        system.debug('createTemplateDraftRecord - start');
        system.debug('recordId..'+recordId+'..templateId..'+templateId+'..templateName..'+templateName);
        Template_draft__c templatedraft = new Template_draft__c();
        try{
            templatedraft.Record_Id__c = recordId;
            templatedraft.Template_Id__c = templateId;
            templatedraft.Template_Name__c = templateName;           
            insert templatedraft;
        }catch(Exception e){
            system.debug('Error createTemplateDraftRecord..'+e.getMessage());
        }
        system.debug('createTemplateDraftRecord - End');
        return templatedraft.id;
    }
    
    
    @AuraEnabled
    public static List<Object> loadDynamicWizardData(string recordId){
        system.debug('Inside loadDynamicWizardData - Start'); 
        system.debug('loadDynamicWizardData recordId..'+recordId); 
        string tabName;
        string subTabName;
        string objectAPINameSubtab;
        string parentObjectAPINameSubtab;
        string templateId;
        String draftId;
        String templateName;
        List<map<string,Question__c>>  questionMapList;
        List<Object> wizardList = new List<Object>();
        Map <string,WizardHeader__c> tabsMap = new Map <string,WizardHeader__c>();       
        Map <string,List<WizardHeader__c>> tabsSubTabsMap = new Map <string,List<WizardHeader__c>>();
        Map<string,List<Map<String,Question__c>>> metaDataMap = new Map<string,List<Map<String, Question__c>>>();                
        Map<string,List<Map<String, Object>>> quesAnsDataMap = new Map<string,List<Map<String, Object>>>();        
        Map <string,object> saveAsDraftMap = new Map <string,object>();
        List<Question__c> allQuestionsList = new List<Question__c>();
        List<Id> dependentTabList = new List<Id>();
        List<Id> dependentSubtabList = new List<Id>();
        List<Id> dependentQuestionsList = new List<Id>();
        
        string parentObjectName = string.valueof((Id.valueOf(recordId)).getsobjecttype());       
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(parentObjectName);
        sObject obj = targetType.newSObject();
        
        string query = 'select id, Template_Id__c, Template_Name__c from Template_draft__c where Record_Id__c'+'=\''+recordId+'\'';        
        
        List<sobject> sobjectList = Database.query(query);
        
        if(sobjectList != null && sobjectList.size() > 0){
            for(sobject sobjVal: sobjectList){
                if(sobjval.get('Template_Id__c') == null || sobjval.get('Template_Id__c') == ''){                    
                    system.debug('Template id is null or empty');
                    return wizardList;
                }
                
                templateId = string.valueof(sobjval.get('Template_Id__c'));
                templateName = string.valueof(sobjval.get('Template_Name__c'));
                draftId = string.valueof(sobjval.get('id'));
                saveAsDraftMap = readWizardDataFromDraft(draftId, saveAsDraftMap);
            }            
        }        
        system.debug('templateId..'+templateId+'..templateName..'+templateName+'..saveAsDraftMap..'+ saveAsDraftMap);        
        
        List<WizardHeader__c> tabList = [select id,Tab_Name__c,Help_Text__c,Sequence__c,Has_Condition__c,Tabs_Template__c,Template__c,ProfileId__c,Template__r.tabOrientation__c  from WizardHeader__c where Template__c =: templateId AND RecordType.Name = 'Tab' order by Sequence__c asc]; 
        system.debug('tabList..'+tabList);
        
        for(WizardHeader__c tab:tabList){
            List<WizardHeader__c> subTabsList = new List<WizardHeader__c>();
            tabName = tab.Tab_Name__c;
            tabsMap.put(tabName,tab);
            List<WizardHeader__c> subTabList = [SELECT Id,SubTab__c,Help_Text__c, Subtabs_Tab__c,Has_Condition__c,Sequence__c,Object_Name__c,Object_API_Name__c,
                                               Parent_Object_Name__c,Parent_Object_API_Name__c,Form_Type__c,Data_View__c,Tabular_Layout__c,Form_Layout__c,ProfileId__c,Field_API_Name__c,Filtering_Value__c,Layout_Type__c FROM WizardHeader__c where Tabs__c = :tab.Id AND RecordType.Name = 'SubTab' order by Sequence__c asc ];
            
            for(WizardHeader__c subTab:subTabList){
                subTabName = subTab.SubTab__c;
                objectAPINameSubtab = subTab.Object_API_Name__c;
                parentObjectAPINameSubtab = subTab.Parent_Object_API_Name__c;                
                questionMapList = new List<map<string,Question__c>>();
                if(tabsSubTabsMap.containsKey(tabName)){
                    List<WizardHeader__c> exstSubTabList = tabsSubTabsMap.get(tabName);
                    exstSubTabList.add(subTab);
                    tabsSubTabsMap.put(tabName,exstSubTabList);
                }else{
                    subTabsList.add(subTab);
                    tabsSubTabsMap.put(tabName,subTabsList);
                }
                
                List<Question__c> questionList = [select id,Name,Tab_Name__c,Parent_Object_Name__c,Parent_Object_API_Name__c,Question_Label__c,Object_Name__c,Object_API_Name__c,Answer__c,Field_Name__c,Field_API_Name__c,Field_Type__c,Default_Value__c,
                                                  Description__c,Values__c,SubTab1__c,SubTab1__r.Form_Layout__c,SubTab1__r.Tabular_Layout__c,SubTab1__r.Form_Type__c,SubTab1__r.Data_View__c,SubTab1__r.SubTab__c,Sequence__c,Rows__c,Input_placeholder__c,Cols__c,IsMandatory__c,SubTab1__r.Tab_Name__c,Dependent_Tab__c, Dependent_Subtab__c,
                                                  Higher_Value_Limit__c,LookUpName__c,Number_Data_Val__c,SubTab1__r.Object_API_Name__c,Has_Condition__c,Lower_Value_Limit__c,Has_Default_Value__c,Input_Pattern__c,Has_Dependency__c,Decimal__c,Dependent_Question__c,
                                                  Read_Only__c,Size__c,Object_API_Used_for_Lookup__c,Read_Record_Data__c,SubTab1__r.Template__r.tabOrientation__c,Help_Text__c,Profile_ID__c,Profile_Name__c,Parent_Question_ID__c,SelectLookupValues__c  FROM Question__c where SubTab1__c  =:subTab.Id order by Sequence__c asc];
                
                allQuestionsList.addAll(questionList);
                
                map<string,Question__c> questionMap = new  map<string,Question__c>();
                
                for(Question__c question : questionList){
                    string apiName = question.Field_API_Name__c;

                    if(question.Dependent_Question__c == true)
                        dependentQuestionsList.add(question.Id);
                    if(question.Dependent_Subtab__c == true)
                        dependentSubtabList.add(question.Id);
                    if(question.Dependent_Tab__c == true)
                        dependentTabList.add(question.Id);
                    
                    if(!questionMap.containsKey(apiName))
                        questionMap.put(apiName,question);
                }
                
                questionMapList.add(questionMap);
                metaDataMap.put(tabName+':'+subTabName, questionMapList);                
            }
        }
        
        Map<string,list<sobject>> questionsMapByObject = groupQuestionByObject(allQuestionsList);
        
        for(string objectName : questionsMapByObject.keySet()){
            List<Question__c> questionListByObject = questionsMapByObject.get(objectName);
            
            String fieldsToBeQueried = fieldsToBeQueried(questionListByObject);
            String parentObjectNames = isParentChildQuery(questionListByObject);
            List<Map<String, Object>> questionsAnswerMapList = readQuestionsAnswer(fieldsToBeQueried,parentObjectNames,objectName,recordId);
            
            if(questionsAnswerMapList != null && questionsAnswerMapList.size() > 0)
                quesAnsDataMap = groupQuestionAnsByObject(objectName, questionsAnswerMapList, quesAnsDataMap);                      
        }
        
        metaDataMap = updateAnswerForSingleRecordView(quesAnsDataMap, metaDataMap);        
        metaDataMap = updateAnswerForMultipleRecordView(quesAnsDataMap, metaDataMap, tabsSubTabsMap);
        
        map<string,map<string,list<Condition__c>>> depQuestionsConditionsMap = returnDependentQuestionsConditionList(dependentQuestionsList);
        map<string,list<Condition__c>> dependentSubtabsConditionsMap = returnDependentQuestionsConditionListForSubTab(dependentSubtabList);
        map<string,list<Condition__c>> dependentTabsConditionsMap = returnDependentQuestionsConditionListForTab(dependentTabList);
        map<string,list<Question__c>> questionsProfileSetttings = returnQuestionsProfileSetttings(allQuestionsList);
        
        wizardList.add(metaDataMap);
        wizardList.add(tabsMap);
        wizardList.add(tabsSubTabsMap);
        wizardList.add(saveAsDraftMap);      
        wizardList.add(templateName); 
        wizardList.add(dependentTabsConditionsMap); 
        wizardList.add(dependentSubtabsConditionsMap); 
        wizardList.add(depQuestionsConditionsMap); 
        wizardList.add(questionsProfileSetttings); 
        wizardList.add(draftId);   
        system.debug('metaDataMap .. In LoadDynamicWizardData'+metaDataMap);
        
        system.debug('Inside loadDynamicWizardData - End..'+templateName); 
        return wizardList; 
    }
    
    public static Map <string,object> readWizardDataFromDraft(string draftId,  Map <string,object> saveAsDraftMap){
        system.debug('Inside readWizardDataFromDraft - start');
        List<Attachment> attachment = [select id, name, Body from Attachment where parentId = : draftId];
        if(attachment != null && attachment.size() > 0){
            string jsonData = attachment[0].Body.tostring();
            saveAsDraftMap = (Map <string,object>)JSON.deserializeUntyped(jsonData);  
        } 
        system.debug('Inside readWizardDataFromDraft - end');
        return saveAsDraftMap;
    }
    
    /*
Method Name : groupQuestionByObject
Parameters  : questionsList
Return type : map<string,list<sobject>>
comments    : Grouping all question by object
*/ 
    
    Public static map<string,list<sobject>> groupQuestionByObject(list<Question__c> questionsList){
        system.debug('Inside groupQuestionByObject - Start'); 
        
        Map<string,list<Question__c>> questionsMapByObject = new Map<string,list<Question__c>>();
        for(Question__c question:questionsList){
            if(questionsMapByObject.containsKey(question.Object_API_Name__c)){
                List<Question__c> questionsListByObject = questionsMapByObject.get(question.Object_API_Name__c);
                questionsListByObject.add(question);
            }else{ 
                List<Question__c> questionsListByObject = new List<Question__c>();
                questionsListByObject.add(question);
                questionsMapByObject.put(question.Object_API_Name__c, questionsListByObject);
            }           
        }
        system.debug('Inside groupQuestionByObject - Ends');        
        return questionsMapByObject;
    }
    
    /*
Method Name : fieldsToBeQueried
Parameters  : List of Questions
Return type : String
comments    : Dynamicaly created soql fields for soql query
*/ 
    Public static string fieldsToBeQueried(list<Question__c> questionsList){
        system.debug('Inside fieldsToBeQueried - Start');
        
        string fields = 'id,';
        set<string> uniqueFieldAPINamesSet = new set<string>();
        
        for(Question__c question : questionsList){
            string fieldType = question.Field_Type__c;
            if(fieldType == 'REFERENCE'){
                string fieldAPIName = question.Field_API_Name__c;
                system.debug('fieldAPIName----2'+fieldAPIName);
                fieldAPIName = fieldAPIName.replace('__c', '__r')+'.Name';
                uniqueFieldAPINamesSet.add(fieldAPIName);            
            }
            uniqueFieldAPINamesSet.add(question.Field_API_Name__c);            
        }
        
        for(string fieldsValues : uniqueFieldAPINamesSet){
            fields += fieldsValues+',';
        }
        
        string queryFields=fields.removeEnd(',');
        
        system.debug('Fields to be queried..'+queryFields);
        
        system.debug('Inside fieldsToBeQueried - End');
        return queryFields;        
    }
    
    /*
Method Name : isParentChildQuery
Parameters  : List of Questions
Return type : String (Parent object name)
comments    : to get the parent object api name
*/ 
    public static string isParentChildQuery(list<Question__c> questionListByObject){
        system.debug('Inside isParentChildQuery - start');
        
        for(Question__c question:questionListByObject){
            if((question.Parent_Object_API_Name__c != null)){
                return question.Parent_Object_API_Name__c;
            }
        }
        system.debug('Inside isParentChildQuery - end');
        return '';
    }
    
    /*
Method Name : readQuestionsAnswer
Parameters  : fieldsToBeQuried(string),parentObjectName(string),objectName(string)
Return type : Map<String, Object>
comments    : Read all answers related to questions
*/ 
    @AuraEnabled
    public static List<Map<String, Object>> readQuestionsAnswer(string fieldsToBeQuried, string parentObjectName, string objectName, string recordId){
        system.debug('Inside readQuestionsAnswer - Start');
        
        system.debug('fieldsToBeQuried..'+fieldsToBeQuried+'..parentObjectName....'+parentObjectName+'..objectName..'+objectName+'..recordId..'+recordId);
        
        List<Map<String, Object>> questionsAnswerMapList = new List<Map<String, Object>>();
        Map<String, Object> questionsAnswerMap;        
        String fromQuery;
        
        if(objectName !=null){            
            //if((!(string.isblank(parentObjectName)) && !(string.isEmpty(parentObjectName)) && parentObjectName != 'None')){
            if(parentObjectName != null && parentObjectName != '' && parentObjectName != 'None'){               
                fromQuery = objectName +' where ' +parentObjectName+'=\''+recordId+'\'';
            }else{
                fromQuery = objectName +' where id '+'=\''+recordId+'\'';
            }
        }
        
        String sQuery =  'select '+fieldsToBeQuried+' from ' +fromQuery;
        
        system.debug('Object Name..'+objectName+'..sQuery..'+sQuery);
        
        List<sobject> sobjectList=Database.query(sQuery);
        
        if(sobjectList.size() > 0 ){
            for(sobject sobjVal:sobjectList){
                questionsAnswerMap = sobjVal.getPopulatedFieldsAsMap();
                questionsAnswerMapList.add(questionsAnswerMap);
            }
        }
        system.debug('Object Name..'+objectName+'..questionsAnswerMapList..In Query..'+questionsAnswerMapList);
        system.debug('Inside readQuestionsAnswer - Ends');
        return questionsAnswerMapList;        
    }
    
    public static Map<string, List<Map<String, Object>>> groupQuestionAnsByObject(String objectName, List<Map<String, Object>> questionsAnswerMapList, Map<string, List<Map<String, Object>>> quesAnsDataMap)
    {
        system.debug('Inside groupQuestionAnsByObject - start');
        Map<String, Object> questionsAnswerMap;
        for(Integer count = 0; count < questionsAnswerMapList.size(); count++){
            questionsAnswerMap = questionsAnswerMapList.get(count);
            
            if(quesAnsDataMap.containsKey(objectName)){
                List<Map<String, Object>> quesAnsDataListExst = quesAnsDataMap.get(objectName);
                quesAnsDataListExst.add(questionsAnswerMap);
                quesAnsDataMap.put(objectName,quesAnsDataListExst);                    
            }else{
                List<Map<String, Object>> quesAnsDataList = new List<Map<String, Object>>();
                quesAnsDataList.add(questionsAnswerMap);
                quesAnsDataMap.put(objectName,quesAnsDataList);                    
            }                
        }
        system.debug('Inside groupQuestionAnsByObject - end');
        return quesAnsDataMap;
    }
    
    public static Map<string, List<Map<String,Question__c>>> updateAnswerForSingleRecordView(Map<string,List<Map<String, Object>>> quesAnsDataMap, Map<string, List<Map<String,Question__c>>> metaDataMap){        
        system.debug('Inside updateAnswerForSingleRecordView - Start');
        
        system.debug('quesAnsDataMap..'+quesAnsDataMap);
        system.debug('metaDataMap..'+metaDataMap);
        
        List<map<string,Question__c>>  questionMapList;
        List<map<String, Object>> quesAnsRecordsList;        
        
        for(string tabSubTabName : metaDataMap.keySet()){
            questionMapList =  metaDataMap.get(tabSubTabName);
            if(questionMapList != null && questionMapList.size() > 0){
                for(integer i = 0; i < questionMapList.size(); i++){ 
                    map<string,Question__c> quesAnsMap = questionMapList.get(i);
                    if(quesAnsMap != null && quesAnsMap.size() > 0){
                        integer count = 0;
                        for(string questionMapkey : quesAnsMap.keySet()){ 
                            system.debug('questionMapkey..'+questionMapkey);
                            Question__c questionObj = quesAnsMap.get(questionMapkey);                    
                            system.debug('questionObj..'+questionObj);
                            String objectName = questionObj.Object_API_Name__c;                    
                            String dataView = questionObj.SubTab1__r.Data_View__c;
                            String fieldAPIName = questionObj.Field_API_Name__c;
                            
                            if(objectName != null && (dataView == null || dataView == 'Single Record View')){
                                quesAnsRecordsList = quesAnsDataMap.get(objectName);
                                if(quesAnsRecordsList != null && quesAnsRecordsList.size() > 0){
                                    //system.debug('objectName..'+objectName+'..dataView..'+dataView+'..fieldAPIName..'+fieldAPIName+'1childRecordsList..'+childRecordsList);
                                    Map<String, Object> quesWithAnsMap = quesAnsRecordsList.get(0); 
                                    
                                    system.debug('fieldAPIName..'+fieldAPIName+'..objectName..'+objectName+'..quesWithAnsMap..'+quesWithAnsMap+'...Answer..'+String.valueOf(quesWithAnsMap.get(fieldAPIName)));                                    
                                    String answer;
                                    if(quesWithAnsMap.get(fieldAPIName) != null){
                                        answer = String.valueOf(quesWithAnsMap.get(fieldAPIName));                                                   
                                        questionObj.Answer__c = answer;  
                                    }
                                    
                                    if((answer == null || answer == '') && (questionObj.Default_Value__c != null && questionObj.Default_Value__c != '')){
                                        questionObj.Answer__c = questionObj.Default_Value__c;
                                    }
                                    
                                    if(questionObj.Field_Type__c == 'REFERENCE'){                            
                                        string fieldAPINameForRef = fieldAPIName.replace('__c', '__r');  
                                        if(quesWithAnsMap.get(fieldAPINameForRef) != null){
                                            String lookUpIdName = string.valueof(quesWithAnsMap.get(fieldAPINameForRef));                                                                                
                                            if(lookUpIdName != null){
                                                String lookUpName = lookUpIdName.substringBetween('=', ',');                                    
                                                questionObj.LookUpName__c = lookUpName;  
                                            }
                                        }
                                    }
                                    
                                    if(count == (quesAnsMap.size() - 1)){
                                        quesAnsMap = buildIDQuestionObject(quesAnsMap,  questionObj, quesWithAnsMap,'Single');
                                    }                                    
                                }
                            }
                            count++;
                        }
                    }
                }
            }
        }     
        system.debug('Inside updateAnswerForSingleRecordView - End');
        return metaDataMap;
    }
    
    public static Map<string, List<Map<String,Question__c>>> updateAnswerForMultipleRecordView(Map<string,List<Map<String, Object>>> quesAnsDataMap, Map<string, List<Map<String,Question__c>>> metaDataMap, Map <string,List<WizardHeader__c>> tabsSubTabsMap){        
        system.debug('Inside updateAnswerForMultipleRecordView - start');
        string tabSubtabNameKey;
        string objectName;
        Map<string, Question__c> questionMap;
        Map<String, Object> quesWithAnsDataMap;
        Map<string, Question__c> newQuestionMap;
        List<map<String, Question__c>> childQuestionObjList;
        List<map<string,Question__c>>  questionMapList;
        List<map<String, Object>> quesAnsRecordsList;
        
        for(string tabName : tabsSubTabsMap.keySet()){
            List<WizardHeader__c> subTabsList = tabsSubTabsMap.get(tabName);            
            for(Integer i = 0; i < subTabsList.size(); i++){
                WizardHeader__c subTab = subTabsList.get(i);
                string dataView = subTab.Data_View__c;
                
                if(dataView == 'Multiple Record View'){                    
                    childQuestionObjList = new List<map<String, Question__c>>();
                    objectName = subTab.Object_API_Name__c;
                    tabSubtabNameKey = tabName+':'+subTab.SubTab__c;                   
                    quesAnsRecordsList = quesAnsDataMap.get(objectName);
                    system.debug('Multiple Record View..'+objectName+'..quesAnsRecordsList..'+quesAnsRecordsList);
                    if(quesAnsRecordsList != null && quesAnsRecordsList.size() > 0){                        
                        for(Integer j = 0; j < quesAnsRecordsList.size(); j++){                        
                            newQuestionMap = new map<string,Question__c>();
                            questionMapList =  metaDataMap.get(tabSubtabNameKey);                             
                            questionMap = questionMapList.get(0);
                            system.debug('questionMap..In Multiple Record View'+questionMap);
                            quesWithAnsDataMap = quesAnsRecordsList.get(j);                              
                            Integer count = 0;
                            for(string questionMapkey : questionMap.keySet()){                                
                                Question__c questionObj = questionMap.get(questionMapkey);
                                system.debug('questionObj..In multiple..'+questionObj);
                                
                                newQuestionMap = buildChildRecordData(newQuestionMap,  questionObj, quesWithAnsDataMap);                                
                                system.debug('newQuestionMap..'+newQuestionMap);
                                if(count == (questionMap.size() -1)){
                                    newQuestionMap = buildIDQuestionObject(newQuestionMap,  questionObj, quesWithAnsDataMap,'Multiple');
                                	system.debug('newQuestionMap..in if'+newQuestionMap);
                                }
                                count++;
                            }                            
                            childQuestionObjList.add(newQuestionMap);                           
                        }
                    }    
                    if(childQuestionObjList.size() > 0)
                        system.debug('childQuestionObjList..'+childQuestionObjList);
                        metaDataMap.put(tabSubtabNameKey,childQuestionObjList);
                } 
            }  
        }
        system.debug('Inside updateAnswerForMultipleRecordView - end');
        return metaDataMap;
    }
    
    public static Map<string,Question__c> buildChildRecordData(Map<string,Question__c> newQuestionMap, Question__c questionObj, Map<String, Object> quesWithAnsDataMap){        
        system.debug('buildChildRecordData - start');
        Question__c newQuestionObj = new Question__c(); 
        newQuestionObj.Id = questionObj.Id;
        system.debug('newQuestionObj.Id buildChildRecordData'+newQuestionObj.Id);
        newQuestionObj.Field_API_Name__c = questionObj.Field_API_Name__c;
        newQuestionObj.Question_Label__c = questionObj.Question_Label__c;
        newQuestionObj.Object_API_Name__c = questionObj.Object_API_Name__c;
        newQuestionObj.Parent_Object_API_Name__c = questionObj.Parent_Object_API_Name__c;
        newQuestionObj.Object_API_Used_for_Lookup__c = questionObj.Object_API_Used_for_Lookup__c;
        newQuestionObj.SubTab1__c = questionObj.SubTab1__c;                                
        newQuestionObj.Sequence__c = questionObj.Sequence__c;
        newQuestionObj.Values__c = questionObj.Values__c;
        newQuestionObj.Size__c = questionObj.Size__c;
        newQuestionObj.Decimal__c = questionObj.Decimal__c;
        newQuestionObj.Read_Only__c = questionObj.Read_Only__c;
        newQuestionObj.Field_Type__c = questionObj.Field_Type__c;
        newQuestionObj.IsMandatory__c = questionObj.IsMandatory__c;
        newQuestionObj.Has_Condition__c = questionObj.Has_Condition__c;
        newQuestionObj.LookUpName__c = questionObj.LookUpName__c;
        newQuestionObj.Dependent_Question__c = questionObj.Dependent_Question__c;

        newQuestionObj.Dependent_Subtab__c = questionObj.Dependent_Subtab__c;
        newQuestionObj.Has_Dependency__c = questionObj.Has_Dependency__c;
        
        newQuestionObj.Lower_Value_Limit__c = questionObj.Lower_Value_Limit__c;
        newQuestionObj.Higher_Value_Limit__c = questionObj.Higher_Value_Limit__c;
        newQuestionObj.InPut_Pattern__c = questionObj.InPut_Pattern__c;
        newQuestionObj.Number_Data_Val__c = questionObj.Number_Data_Val__c;
        newQuestionObj.Input_Placeholder__c = questionObj.Input_Placeholder__c;        
        
        String fieldAPIName = questionObj.Field_API_Name__c;
        String answer = String.valueOf(quesWithAnsDataMap.get(fieldAPIName));
        newQuestionObj.Answer__c = answer;
        
        if((answer == null || answer == '') && (questionObj.Default_Value__c != null && questionObj.Default_Value__c != '')){
            questionObj.Answer__c = questionObj.Default_Value__c;
        }
        
        if(questionObj.Field_Type__c == 'REFERENCE'){                            
            string fieldAPINameForRef = fieldAPIName.replace('__c', '__r');  
            if(quesWithAnsDataMap.get(fieldAPINameForRef) != null){
                String lookUpIdName = string.valueof(quesWithAnsDataMap.get(fieldAPINameForRef));                                                                                
                if(lookUpIdName != null){
                    String lookUpName = lookUpIdName.substringBetween('=', ',');                                    
                    newQuestionObj.LookUpName__c = lookUpName;  
                }
            }
        }  
        system.debug('newQuestionObj in buildChildRecordData'+newQuestionObj);
        newQuestionMap.put(fieldAPIName, newQuestionObj);        
        system.debug('buildChildRecordData - end');
        return newQuestionMap;        
    }
    
    public static Map<string, Question__c> buildIDQuestionObject(Map<string,Question__c> newQuestionMap, Question__c questionObj, Map<String, Object> quesWithAnsDataMap, string type){
        system.debug('buildIDQuestionObject - start..'+type);
        system.debug('questionObj..buildIDQuestionObject'+questionObj);
        Question__c newQuestionObj = new Question__c();                                
        newQuestionObj = new Question__c();
        //newQuestionObj.Id = questionObj.Id;
        //system.debug('newQuestionObj.Id'+newQuestionObj.Id);
        newQuestionObj.Field_API_Name__c = 'Id';
        newQuestionObj.Has_Condition__c = true;
        newQuestionObj.Parent_Object_API_Name__c = questionObj.Parent_Object_API_Name__c;
        newQuestionObj.Object_API_Used_for_Lookup__c = questionObj.Object_API_Used_for_Lookup__c;
        newQuestionObj.Object_API_Name__c = questionObj.Object_API_Name__c;
        String answer = String.valueOf(quesWithAnsDataMap.get('Id'));
        system.debug('answer.. In buildIDQuestionObject'+answer);
        newQuestionObj.Answer__c = answer;
        newQuestionMap.put('Id',newQuestionObj);   
        system.debug('newQuestionMap..buildIDQuestionObject '+newQuestionMap);
        system.debug('buildIDQuestionObject - end');
        return newQuestionMap;        
    }    
    
    @AuraEnabled
    public static boolean saveWizardData(string recordId,string objectName,string parentObjectName, map<string,string> questionsWithAnswerMap, map<string,list<map<string,string>>> recordsMapByObject, string draftId){
        system.debug('Inside saveWizardData - Start'); 
        system.debug('recordId..'+recordId);
        system.debug('objectName..'+objectName);
        system.debug('parentObjectName..'+parentObjectName);
        system.debug('questionsWithAnswerMap..'+questionsWithAnswerMap);
        //iterate the recordsMapByObject
        //from recordsMapByObject passing object name as Key, get the list of records
        //from list of records get question and ans map
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objectName);
        sObject obj = targetType.newSObject();        
        list<sobject> sobjectList=new list<sobject>();
        Map <String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        for(String keys : fieldMap.keyset() ){
            for(String keyAns : questionsWithAnswerMap.keyset()){
                if(keys == keyAns) {                     
                    if(questionsWithAnswerMap.get(keyAns)!= null && questionsWithAnswerMap.get(keyAns)!= ''){                        
                        if(fieldMap.get(keys).getDescribe().getType()== Schema.DisplayType.Date){
                            obj.put(keys,Date.valueof(questionsWithAnswerMap.get(keyAns))); // Parsing if the field is of Date type
                        }else if(fieldMap.get(keys).getDescribe().getType()== Schema.DisplayType.DATETIME){
                            system.debug('Date Time questionsWithAnswerMap '+questionsWithAnswerMap.get(keyAns));
                            obj.put(keys,Date.valueof(questionsWithAnswerMap.get(keyAns))); // Parsing if the field is of Date type
                        }else if(fieldMap.get(keys).getDescribe().getType() == Schema.DisplayType.Double
                                 ||fieldMap.get(keys).getDescribe().getType() == Schema.DisplayType.Currency
                                 ||fieldMap.get(keys).getDescribe().getType() == Schema.DisplayType.Percent ){
                                     obj.put(keys,Decimal.valueof(questionsWithAnswerMap.get(keyAns))); // Parsing if the field is of Double or currency type
                                 }else if(fieldMap.get(keys).getDescribe().getType()== Schema.DisplayType.Email){
                                     obj.put(keys,questionsWithAnswerMap.get(keyAns)); // Parsing if the field is of Email 
                                 }else if(fieldMap.get(keys).getDescribe().getType()== Schema.DisplayType.Boolean){
                                     if(questionsWithAnswerMap.get(keyAns) == 'true')
                                         obj.put(keys,true);
                                     if(questionsWithAnswerMap.get(keyAns) == 'false')
                                         obj.put(keys,false);
                                 }else{                              
                                     if((fieldMap.get(keys).getDescribe().getType()== Schema.DisplayType.Picklist || fieldMap.get(keys).getDescribe().getType()== Schema.DisplayType.MultiPicklist) )
                                         if((questionsWithAnswerMap.get(keyAns) == '--None--' || questionsWithAnswerMap .get(keyAns) == '' || questionsWithAnswerMap.get(keyAns) == null)){
                                             obj.put(keys,'');
                                         }else{
                                             obj.put(keys,questionsWithAnswerMap.get(keyAns));
                                         }else
                                             obj.put(keys,questionsWithAnswerMap.get(keyAns)); // Parsing if the field is of Text, TextArea, other types.                          
                                 }                        
                    }  
                }
            }
        }
        
        try{
            string parentObjectAPIName = string.valueof((Id.valueOf(recordId)).getsobjecttype());
            system.debug('recordId'+recordId);
            system.debug('parentObjectAPIName'+parentObjectAPIName);
            system.debug('objectName..'+objectName);
            if(objectName ==  parentObjectAPIName){
                system.debug('Inside Parent Update');
                system.debug('obj'+obj);
                obj.put('ID',recordId);
                update obj;
            }else{
                String childRecordId = String.valueof(obj.get('Id'));
                system.debug('Inside childRecords Data'+childRecordId);
                system.debug('Obj'+Obj);
                system.debug('childRecordId'+childRecordId);
                if(childRecordId != null && childRecordId != ''){
                    system.debug('Inside Child Update');
                    obj.put('ID',childRecordId);
                    //obj.put(parentObjectName, recordId);
                    update obj;
                    system.debug('Updated Child Records..'+obj);
                }else{
                    system.debug('Inside Child Create');
                    obj.put(parentObjectName, recordId);
                    insert obj;
                }            
            }
        }catch(Exception ex){
            system.debug('Error occured..'+ex.getMessage());
        }
        
        if(((draftId != null && draftId != '' && objectName == string.valueof((Id.valueOf(recordId)).getsobjecttype())))){
            deleteDraftAttachmentRecord(draftId);   
        }
        system.debug('Inside saveQuestionsAns - End'); 
        return true;
    }
    
    /*
Method Name : saveAsDraft
Parameters  : 
return type :
Usage       :
*/
    @AuraEnabled
    public static id saveAsDraft(string recordId, string templateDraftId, Map<string,object> saveAsDraftMap) {
        System.debug('saveAsDraft method - Start');
        
        System.debug('recordId..'+recordId+'..templateDraftId..'+templateDraftId+'..saveAsDraftMap..'+saveAsDraftMap);            
        // delete the Save as draft attachement already linked to this record
        
        deleteDraftAttachmentRecord(templateDraftId);

        //convert save as draft to JSON
        String saveAsDraftMapJSONStr = JSON.serialize(saveAsDraftMap);
        system.debug('saveAsDraftMap JSON..'+saveAsDraftMapJSONStr);
        
        //create a new attachment record to store the latest copy of draft
        Attachment attachmentObj = new Attachment();
        attachmentObj.Body = Blob.valueOf(saveAsDraftMapJSONStr);
        attachmentObj.Name = recordId +'-'+ System.now().format('yyyy_MM_dd_hh_mm_ss') + '.txt';
        attachmentObj.parentId = templateDraftId;
        insert attachmentObj;
        
        System.debug('CreateAttachment method - End');
        
        return attachmentObj.Id;        
    }
   
    
    /*
Method Name : DeleteTempleteDraftRecord
Parameters  : DraftId, Object Name
Return type : DraftId
comments    : Delete Templete Draft Record based on recordId, objectName after global save.
*/   @AuraEnabled
    public static void deleteDraftAttachmentRecord(String draftId){
        system.debug('Inside deleteDraftAttachmentRecord - Start'); 
        try{                   
            list<Attachment> attachmentList = new list<Attachment>([select id from Attachment where parentId = : draftId]);
            if(attachmentList.size() > 0){
                delete attachmentList;
            }   
        }catch(Exception e){
            system.debug('deleteDraftAttachmentRecord error..'+e.getMessage());
        }
        system.debug('Inside deleteDraftAttachmentRecord - End'); 
    }   
    
    /*
Method Name : returnDependentQuestionsConditionListForTab
Parameters  : questionId
return type : Map,with Condition Id as key AND list<Condition__c> as value
Usage       : Returns DependentQuestions for tab.
*/
    @AuraEnabled
    public static  map<string,list<Condition__c>> returnDependentQuestionsConditionListForTab(List<Id> questionIdArray){      
        System.debug('returnDependentQuestionsConditionListForTab method - Start');
        system.debug('questionIdArray..'+questionIdArray);
        
        map<string,list<Condition__c>> tabAndConditionlistMap = new  map<string,list<Condition__c>>();
        list<Condition__c> conditionList = new list<Condition__c>();
        set<id> tabSet = new set<Id>();
        
        try{
            list<Condition__c> depQuestionConditionList = [select id,Type__c,Sequence__c,Tab__c,Question__c from Condition__c where Dependent_Question__c in :questionIdArray AND RecordType.Name = 'Dependent_Tab_Condition' AND Type__c='Show or Hide'];
            for(Condition__c condition : depQuestionConditionList){
                tabSet.add(condition.Tab__c);
            }
            
            list<Condition__c> conditionQuestionDetails = [select id,Type__c,Sequence__c,Question_Name__c,Dependent_Question__r.Field_Type__c,Dependent_Question__c, Dependent_Question_Name__c, Condition_Value__c, Conditional_Operaor__c,Tab__c,Tab__r.Conditional_Logic__c,Dependent_Tabs__r.Tab_Name__c,Dependent_SubTab__r.SubTab__c from Condition__c where Tab__c in :tabSet AND Type__c='Show or Hide'];
            
            for(Condition__c condtionObj : conditionQuestionDetails){
                string tabId = condtionObj.Tab__c;                
                if(tabAndConditionlistMap.containsKey(tabId)){
                    List<Condition__c> exstConditionList = tabAndConditionlistMap.get(tabId);
                    exstConditionList.add(condtionObj);
                    tabAndConditionlistMap.put(tabId,exstConditionList);
                }else{
                    conditionList = new list<Condition__c>();
                    conditionList.add(condtionObj);
                    tabAndConditionlistMap.put(tabId,conditionList); 
                }            
            }
            system.debug('tabAndConditionlistMap...'+tabAndConditionlistMap);    
        }catch(Exception e){
            system.debug('returnDependentQuestionsConditionListForTab error'+e.getMessage());
            System.debug('Error line number e '+e.getLineNumber());
        }
        
        System.debug('returnDependentQuestionsConditionListForTab method - End');
        
        return tabAndConditionlistMap;    
    } 
    /*
Method Name : returnDependentQuestionsConditionListForSubTab
Parameters  : questionId
return type : Map,with Condition Id as key AND list<Condition__c> as value
Usage       : Returns DependentQuestions for subtab.
*/
    @AuraEnabled
    public static  map<string,list<Condition__c>> returnDependentQuestionsConditionListForSubTab(List<Id> questionIdArray){      
        System.debug('returnDependentQuestionsConditionListForSubTab method - Start');
        map<string,list<Condition__c>> subTabAndConditionlistMap = new  map<string,list<Condition__c>>();
        list<Condition__c> conditionList = new list<Condition__c>();
        set<id> subTabSet = new set<Id>();
        
        try{
            list<Condition__c> depQuestionConditionList = [select id,Type__c,Sequence__c,SubTab__c,Question__c from Condition__c where Dependent_Question__c in : questionIdArray AND RecordType.Name = 'Dependent_Subtab_Condition' AND Type__c='Show or Hide'];
            for(Condition__c condition : depQuestionConditionList){
                subTabSet.add(condition.SubTab__c);
            }
            
            list<Condition__c> conditionQuestionDetails = [select id,Type__c,Sequence__c,Question_Name__c,Dependent_Question__r.Field_Type__c,Dependent_Question__c, Dependent_Question_Name__c, Condition_Value__c, Conditional_Operaor__c,SubTab__c,SubTab__r.Conditional_Logic__c,Dependent_Tabs__r.Tab_Name__c,Dependent_SubTab__r.SubTab__c from Condition__c where SubTab__c in :subTabSet AND Type__c='Show or Hide'];
            for(Condition__c condtionObj : conditionQuestionDetails){
                string subTabId = condtionObj.SubTab__c;                
                if(subTabAndConditionlistMap.containsKey(subTabId)){
                    List<Condition__c> exstConditionList = subTabAndConditionlistMap.get(subTabId);
                    exstConditionList.add(condtionObj);
                    subTabAndConditionlistMap.put(subTabId,exstConditionList);
                }else{
                    conditionList = new list<Condition__c>();
                    conditionList.add(condtionObj);
                    subTabAndConditionlistMap.put(subTabId,conditionList); 
                }            
            }
            system.debug('subTabAndConditionlistMap...'+subTabAndConditionlistMap);    
        }catch(Exception e){
            system.debug('returnDependentQuestionsConditionListForSubTab error'+e.getMessage());
            System.debug('Error line number e '+e.getLineNumber());
        }        
        System.debug('returnDependentQuestionsConditionListForSubTab method - End');        
        return subTabAndConditionlistMap;        
    }
    
    
    /*
Method Name : returnDependentQuestionsConditionList
Parameters  : QuestionId
return type : Returns Map, key as type AND values as Conditionlist
*/
    @AuraEnabled
    public static  map<string,map<string,list<Condition__c>>> returnDependentQuestionsConditionList(List<Id> questionIdArray){         
        System.debug('returnDependentQuestionsConditionList method - Start');
        system.debug('questionId..'+questionIdArray);
        
        set<id> questionIds = new set<Id>();        
        list<Condition__c> depQuestionConditionList = [select id,Type__c,Filtered_PickList_Values__c,Sequence__c,Question__c from Condition__c where Dependent_Question__c in :questionIdArray AND RecordType.Name = 'Dependent_Question_Condition'];
        system.debug('depQuestionConditionList..'+depQuestionConditionList);
        for(Condition__c condition : depQuestionConditionList){
            questionIds.add(condition.Question__c);
        }
        system.debug('questionIds..'+questionIds);
        
        list<Condition__c> conditionQuestionDetails = [select id,Type__c,Filtered_PickList_Values__c,Sequence__c,Question__c,Question_Name__c,Dependent_Question__r.Field_Type__c,Question__r.Conditional_Column__c, Dependent_Question__c, Dependent_Question_Name__c, Condition_Value__c, Conditional_Operaor__c,Dependent_Tabs__r.Tab_Name__c,Dependent_SubTab__r.SubTab__c from Condition__c where Question__c in :questionIds];
        system.debug('conditionQuestionDetails...'+conditionQuestionDetails);
        
        map<string,map<string,list<Condition__c>>> depQuestionConditionMap = new map<string,map<string,list<Condition__c>>>();
        map<string,list<Condition__c>> conditionListMap = new map<string,list<Condition__c>>();
        list<Condition__c> conditionList;
        
        for(Condition__c condtionObj : conditionQuestionDetails){
            string Id = condtionObj.Question__c;
            string type = condtionObj.Type__c+':'+Id;
            if(depQuestionConditionMap.containsKey(type)){
                map<string,list<Condition__c>> exstConditionListMap = depQuestionConditionMap.get(type);
                if(exstConditionListMap.containsKey(Id)){
                    List<Condition__c> exstConditionList = exstConditionListMap.get(Id);
                    exstConditionList.add(condtionObj);
                    exstConditionListMap.put(Id,exstConditionList);
                    depQuestionConditionMap.put(type,exstConditionListMap);
                }else{
                    conditionListMap = new map<string,list<Condition__c>>();
                    conditionList = new list<Condition__c>();
                    conditionList.add(condtionObj);
                    conditionListMap.put(Id,conditionList); 
                    depQuestionConditionMap.put(type,conditionListMap);
                }   
            }else{
                conditionListMap = new map<string,list<Condition__c>>();
                conditionList = new list<Condition__c>();
                conditionList.add(condtionObj);
                conditionListMap.put(Id,conditionList);
                depQuestionConditionMap.put(type,conditionListMap);
            }   
        }
        
        system.debug('depQuestionConditionMap....'+depQuestionConditionMap);        
        System.debug('returnDependentQuestionsConditionList method - End');
        return depQuestionConditionMap;   
    }
    /*
Method Name : returnQuestionsProfileSetttings
Parameters  : allQuestionsList
return type : Returns Map, key as questionID AND values as child questions
*/
    public static  map<string,list<Question__c>> returnQuestionsProfileSetttings(List<Question__c> allQuestionsList){         
        System.debug('returnQuestionsProfileSetttings method - Start');
        System.debug('allQuestionsList'+allQuestionsList);
        
        map<string,list<Question__c>> questionsProfileSetttingsMap = new map<string,list<Question__c>>();
        set<id> parentIdSet = new set<Id>();
        try{
            for(Question__c quslist :allQuestionsList){
                parentIdSet.add(quslist.Id);
            }
            
            if(parentIdSet.size() > 0){
                //query questions where parent id is equal question id in the all questions list
                list<Question__c> questionsProfileSetttingsDetails = [SELECT id,Profile_ID__c,Read_Only__c,Profile_Name__c,Parent_Question_ID__c from Question__c where Parent_Question_ID__c in :parentIdSet];
                system.debug('questionsProfileSetttingsDetails..'+questionsProfileSetttingsDetails);
                //map will have key as parent question id, value is list of child questions (profile settings)
                for(Question__c questionObj : questionsProfileSetttingsDetails){
                    string parentId = questionObj.Parent_Question_ID__c;                
                    if(questionsProfileSetttingsMap.containsKey(parentId)){
                        List<Question__c> exstquestionList = questionsProfileSetttingsMap.get(parentId);
                        exstquestionList.add(questionObj);
                        questionsProfileSetttingsMap.put(parentId, exstquestionList);
                    }else{
                        list<Question__c> questionsProfileList = new list<Question__c>();
                        questionsProfileList.add(questionObj);
                        questionsProfileSetttingsMap.put(parentId, questionsProfileList); 
                    }            
                }
            }
            system.debug('returnQuestionsProfileSetttingsMap...'+questionsProfileSetttingsMap);    
        }catch(Exception e){
            system.debug('returnQuestionsProfileSetttings error'+e.getMessage());
            System.debug('Error line number e '+e.getLineNumber());
        }
        System.debug('returnQuestionsProfileSetttings method - End');
        
       /* map<string,list<Question__c>> questionsProfileSetttingsMaptest = new map<string,list<Question__c>>();
        List<Question__c> qnlist = [SELECT id,Profile_ID__c,Read_Only__c,Profile_Name__c,Parent_Question_ID__c from Question__c where Parent_Question_ID__c='a061N00000Tg6jtQAB'];
        questionsProfileSetttingsMaptest.put('a061N00000Tg6jtQAB',qnlist);*/
        
        return questionsProfileSetttingsMap;
    }
    
    @AuraEnabled
    public static List < sObject > fetchLookUpValues(String searchKeyWord, String ObjectName,string fieldsToBeQueried) {
        system.debug('Inside fetchLookUpValues');
        system.debug('ObjectName-->' + ObjectName+'..searchKeyWord..'+searchKeyWord);
        system.debug('fieldsToBeQueried-->' + fieldsToBeQueried);
        String searchKey = searchKeyWord + '%';
        
        List < sObject > returnList = new List < sObject > ();
        String sQuery;
        // Create a Dynamic SOQL Query For Fetch Record List with LIMIT 5  
        if(fieldsToBeQueried != null && fieldsToBeQueried != ''){
         sQuery = 'select id,Name,'+fieldsToBeQueried +' from ' +ObjectName + ' where Name LIKE: searchKey order by createdDate DESC limit 5';
        }else{
         sQuery ='select id, Name from ' +ObjectName + ' where Name LIKE: searchKey order by createdDate DESC';
        }
        system.debug('sQuery-->' + sQuery);
        List < sObject > lstOfRecords = Database.query(sQuery);
        for (sObject obj: lstOfRecords) {
            returnList.add(obj);
        }
        system.debug('returnList-->' + returnList);
        return returnList;
    }
    
    
    /*
Method Name : readQuestionsAnswer
Parameters  : fieldsToBeQuried(string),parentObjectName(string),objectName(string)
Return type : Map<String, Object>
comments    : Read all answers related to questions
*/ 
    @AuraEnabled
    public static Map<String, Object> readLookupQuestionsAnswer(String recordId, String objectName, String fieldsToBeQueried){
        system.debug('Inside readLookupQuestionsAnswer - Start');        
        system.debug('objectName..'+objectName+'..recordId..'+recordId+'..fieldsToBeQueried..'+fieldsToBeQueried);        
        
        Map<String, Object> questionsAnswerMap = new Map<String, Object>();
        
        String sQuery =  'select Id,'+fieldsToBeQueried+' from '+objectName +' where id'+'=\''+recordId+'\'';
        system.debug('sQuery..'+sQuery);
        
        List<sobject> sobjectList = Database.query(sQuery);
        if(sobjectList.size() > 0 ){
            sobject sobjVal = sobjectList.get(0);
            questionsAnswerMap = sobjVal.getPopulatedFieldsAsMap();
        }

        system.debug('questionsAnswerMap..'+questionsAnswerMap);
        system.debug('Inside readLookupQuestionsAnswer - Ends');
        return questionsAnswerMap;        
    }
    /*
Method Name : getAllProfileValues
Parameters  : 
Return type : List of profiles
comments    : For dispaying all profiles related to Salesforce Org
*/ 
    @AuraEnabled
    public static List<Profile> getAllProfileValues() 
    {
        system.debug('Inside getAllProfileValues - Start');
        List<Profile> lstProfiles = new List<Profile>();
        lstProfiles = [select id,Name from Profile];
        system.debug('Inside getAllProfileValues - End');
        return lstProfiles;       
    }
    /*
Method Name : getsObjectRelatedFields
Parameters  : selctedChildObjectValue
Return type : List
comments    : For getting dynimically all Sobject related child objects Labels and ApiNames
*/ 
    @AuraEnabled
    public static List<getsobjectFieldsList> getsObjectRelatedFields(string selctedObjectValue){
        system.debug('Inside getsObjectRelatedFields - Start');
        system.debug('selctedObjectValue'+selctedObjectValue);
        List<getsobjectFieldsList> sobjectFieldsList = new  List<getsobjectFieldsList>();
        Map<String,Schema.SObjectType> getsObject = Schema.getGlobalDescribe(); 
        Schema.SObjectType sobjType = getsObject.get(selctedObjectValue);
        system.debug('sobjType'+sobjType);
        Schema.DescribeSObjectResult describeResult = sobjType.getDescribe();
        system.debug('describeResult'+describeResult);
        Map<String,Schema.SObjectField> fieldsMap = describeResult.fields.getMap();  
        try{
            for(Schema.SObjectField sfield : fieldsMap.Values())
            {
                schema.describefieldresult dfield = sfield.getDescribe();
                string  name = dfield.getName();
                string  label = dfield.getLabel();
                sobjectFieldsList.add(new getsobjectFieldsList(label,name));
                sobjectFieldsList.sort();
            }
            system.debug('sobjectFieldsList'+sobjectFieldsList);
            system.debug('Inside getsObjectRelatedFields - End');
        }
        catch(Exception e){
            system.debug('getsObjectRelatedFields error'+e.getMessage());
        }
        return sobjectFieldsList;
    } 
    /*
Method Name : deleteRecordsDetails
Parameters  : questionRecordId
Return type : boolean
comments    : For delete cord 
*/ 
    @AuraEnabled
    public static void deleteRecordsDetails(string questionRecordId)
    {
        system.debug('Inside deleteRecordsDetails - Start');
        system.debug('questionRecordId>>>>>'+questionRecordId);
        string objectName = string.valueof((Id.valueOf(questionRecordId)).getsobjecttype());
        system.debug('objectName'+objectName);  
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objectName);
        sObject obj = targetType.newSObject();
      try{
          if(objectName != null && questionRecordId != ''){
              obj.put('id', questionRecordId);
              system.debug('obj'+obj);
              delete obj;
          }
          system.debug('Inside deleteRecordsDetails - End');
      }
        catch(Exception e){
            system.debug('deleteRecordsDetails error'+e.getMessage());
        }
       
    }
}