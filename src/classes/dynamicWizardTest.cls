@isTest
public class dynamicWizardTest {
    /*
Method Name : loadTemplatesRelatedToObject
comments    : This method is used for cover the test class code coverage for loadTemplatesRelatedToObject method in dynamicWizard class 
*/ 
    static testMethod  void loadTemplatesRelatedToObjectTest(){
        Test.startTest();
        //Inserting Account
        Account accountObj = new Account();
        accountObj.Name = 'Global Media';
        insert accountObj;
        
        WizardHeader__c [] loadTemplatesRelatedToObject = dynamicWizard.loadTemplatesRelatedToObject(accountObj.Id);
        Test.stopTest();
    }
    /*
Method Name : updateTemplateInfoInParentObject
comments    : This method is used for cover the test class code coverage for updateTemplateInfoInParentObject method in dynamicWizard class 
*/ 
    static testMethod  void updateTemplateInfoInParentObjectTest(){
        Test.startTest();
        //Inserting Account
        Account accountObj = new Account();
        accountObj.Name = 'Global Media';
        insert accountObj;
        //Inserting template
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        insert templateObj;
        Id updateTemplateInfoInParentObject = dynamicWizard.updateTemplateInfoInParentObject(accountObj.Id,templateObj.Id,templateObj.Template_Name__c);
        Id updateTemplateInfoInParentObject1 = dynamicWizard.updateTemplateInfoInParentObject(templateObj.Id,templateObj.Id,templateObj.Template_Name__c);
        Test.stopTest();
        
        System.assertNotEquals(null, updateTemplateInfoInParentObject);
    }
    /*
Method Name : loadDynamicWizardDataTest
comments    : This method is used for cover the test class code coverage for loadDynamicWizardData method in dynamicWizard class 
*/ 
    static testMethod  void loadDynamicWizardDataTest(){
        Test.startTest();
        
        //Inserting Template Object
        RecordType recordTypeObj = [select id,Name from RecordType where RecordType.Name = 'Template'];
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        templateObj.RecordTypeId = recordTypeObj.Id;
        insert templateObj;
        
        //Insering tab
        RecordType recordTypeTab = [select id,Name from RecordType where RecordType.Name = 'Tab'];
        WizardHeader__c wizradHeader = new WizardHeader__c();
        wizradHeader.Tab_Name__c = 'Deal Information';
        wizradHeader.Template__c = templateObj.Id;
        wizradHeader.Sequence__c = 1;
        wizradHeader.Has_Condition__c = false;
        wizradHeader.RecordTypeId = recordTypeTab.Id;
        //wizradHeader.Tabs_Template__c = 'Dynamic Wizard';
        insert wizradHeader;
        
        //Insering tab
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'contacts';
        tabObj.Template__c = templateObj.Id;
        tabObj.Sequence__c =2;
        tabObj.Has_Condition__c = false;
        tabObj.RecordTypeId = recordTypeTab.Id;
        //tabObj.Tabs_Template__c = 'Dynamic Wizard';
        insert tabObj;
        
        //Inserting subtab
        RecordType recordTypeSubTab = [select id,Name from RecordType where RecordType.Name = 'SubTab'];
        WizardHeader__c SubTab = new WizardHeader__c();
        SubTab.SubTab__c = 'Project Information';
        SubTab.RecordTypeId = recordTypeSubTab.Id;
        SubTab.Tabs__c =tabObj.Id;
        insert SubTab;
        
        //Inserting subtab
        WizardHeader__c SubTabobj = new WizardHeader__c();
        SubTabobj.SubTab__c = 'Excecutive Information';
        SubTabobj.RecordTypeId = recordTypeSubTab.Id;
        SubTabobj.Tabs__c =tabObj.Id;
        insert SubTabobj;
        
        //Insert Question
        /* Question__c questionObj = new Question__c();
         questionObj.SubTab1__c = SubTabobj.Id;
         questionObj.Question_Label__c = 'Deal Status';
         insert questionObj;*/
        
        //Inserting templateDraft Object
        Template_draft__c draft = new Template_draft__c();
        insert draft;
        
        //Inserting Account Object
        Account account = new Account();
        account.Name = 'Global Media';
        account.Template_Id__c = templateObj.Id;
        account.Template_Name__c = templateObj.Template_Name__c;
        account.Draft_Id__c = draft.Id;
        insert account;
        
        //Inserting Account Object
        Account accountObj = new Account();
        accountObj.Name = 'Global Media';
        //dealRequestObj.Template_Id__c = templateObj.Id;
        //dealRequestObj.Template_Name__c = templateObj.Template_Name__c;
        accountObj.Draft_Id__c = draft.Id;
        insert accountObj;
        
        //List<Object> loadDynamicWizardData = dynamicWizard.loadDynamicWizardData(dealRequest.Id);
        dynamicWizard.loadDynamicWizardData(account.Id);
        dynamicWizard.loadDynamicWizardData(accountObj.Id);
        Test.stopTest();
        //System.assertNotEquals(null, loadDynamicWizardData);
    }    
    
    /*
Method Name : readWizardDataFromDraft
comments    : This method is used for cover the test class code coverage for readWizardDataFromDraft method in dynamicWizard class 
*/ 
    static testMethod  void readWizardDataFromDraftTest(){
        Test.startTest();
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        insert templateObj;
        string draftId = templateObj.Id;
        List<Attachment> attachment = new  List<Attachment>();
        Map <string,object> saveAsDraftMap = new Map <string,object>();
        saveAsDraftMap = dynamicWizard.readWizardDataFromDraft(draftId,saveAsDraftMap);
        Test.stopTest();
        System.assertNotEquals(null, saveAsDraftMap);
    }
    /*
Method Name : groupQuestionByObject
comments    : This method is used for cover the test class code coverage for groupQuestionByObject method in dynamicWizard class 
*/ 
    static testMethod  void groupQuestionByObjectTest(){
        Test.startTest();
        
        List<Question__c> questionsList = new List<Question__c>();
        //Inserting question
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        questionObj.Object_API_Name__c = 'Account';
        insert questionObj; 
        //Inserting question
        Question__c questionObj1 = new Question__c();
        questionObj1.Question_Label__c = 'Deal Status';
        questionObj1.Object_API_Name__c = 'Account';
        insert questionObj1; 
        questionsList.add(questionObj);
        questionsList.add(questionObj1);
        dynamicWizard.groupQuestionByObject(questionsList);
        
        Test.stopTest();
        // System.assertNotEquals(null, groupQuestionByObject);
    }
    /*
Method Name : fieldToBeQuried
comments    : This method is used for cover the test class code coverage for fieldToBeQuried method in dynamicWizard class 
*/ 
    static testMethod  void fieldToBeQuriedTest(){
        Test.startTest();
        List<Question__c> questionsList = new List<Question__c>();
        Question__c question = new Question__c();
        question.Field_Type__c = 'REFERENCE';
        question.Field_API_Name__c = 'Agent Name__c';
        insert question;
        questionsList.add(question);
        string fieldType = question.Field_Type__c;
        string fieldAPIName = question.Field_API_Name__c;
        
        // string fieldToBeQuried = dynamicWizard.fieldToBeQuried(questionsList);
        //dynamicWizard.fieldToBeQuried(questionsList);
        Test.stopTest();
        //System.assertNotEquals(null, fieldToBeQuried);
    }
    /*
Method Name : isParentChildQuery
comments    : This method is used for cover the test class code coverage for isParentChildQuery method in dynamicWizard class 
*/ 
    static testMethod  void isParentChildQueryTest(){
        Test.startTest();
        List<Question__c> questionListByObject = new List<Question__c>();
        Question__c question = new Question__c();
        question.Parent_Object_API_Name__c = 'Account';
        insert question;
        questionListByObject.add(question);
        string isParentChildQuery = dynamicWizard.isParentChildQuery(questionListByObject);
        Test.stopTest();
        System.assertNotEquals(null, isParentChildQuery);
    }
    /*
Method Name : readQuestionsAnswer
comments    : This method is used for cover the test class code coverage for readQuestionsAnswer method in dynamicWizard class 
*/ 
    static testMethod  void readQuestionsAnswerTest(){
        Test.startTest();
        
        List<Map<String, Object>> questionsAnswerMapList;
        string fieldsToBeQuried = 'Draft_Id__c';
        string parentObjectName = '';
        string objectName = 'Account';
        
        string parentObjectName1 = 'Digital_Linear_Right__c'; //Digital_Linear_Right__c
        string objectName1 = '';
         //Inserting Account
        Account accountObj = new Account();
        accountObj.Name = 'Global Media';
        insert accountObj;
        
     
        questionsAnswerMapList = dynamicWizard.readQuestionsAnswer(fieldsToBeQuried,parentObjectName,objectName,accountObj.Id);
        //questionsAnswerMapList = dynamicWizard.readQuestionsAnswer(fieldsToBeQuried,parentObjectName1,objectName1,dealRequest.Id);
        Test.stopTest();
        System.assertNotEquals(null, questionsAnswerMapList);
    }
    /*
Method Name : buildIDQuestionObject
comments    : This method is used for cover the test class code coverage for buildIDQuestionObject method in dynamicWizard class 
*/ 
    static testMethod  void buildIDQuestionObjectTest(){
        Test.startTest();
        Map<String, Object> quesWithAnsDataMap = new Map<String, Object>();
        Map<string, Question__c> newQuestionMap = new Map<string, Question__c>();
        string type = 'Test';
        //Inserting Question
        Question__c newQuestionObj = new Question__c();     
        newQuestionObj.Field_API_Name__c = 'Negotiation_Type__c';
        newQuestionObj.Question_Label__c = 'Negotiation Type';
        newQuestionObj.Object_API_Name__c = 'Account';
        newQuestionObj.Parent_Object_API_Name__c = '';
        //newQuestionObj.SubTab1__c = subTab.Id;                                
        newQuestionObj.Sequence__c = 1;
        newQuestionObj.Values__c = 'Yes,No';
        newQuestionObj.Size__c = 1;
        newQuestionObj.Decimal__c = 0;
        newQuestionObj.Read_Only__c = true;
        newQuestionObj.Field_Type__c = 'REFERENCE';
        newQuestionObj.IsMandatory__c = true;
        newQuestionObj.Has_Condition__c = true;
        newQuestionObj.Dependent_Question__c = true;
        newQuestionObj.Dependent_Tab__c = true;
        newQuestionObj.Dependent_Subtab__c = true;
        newQuestionObj.Has_Dependency__c = true;
        insert newQuestionObj;  
        
        newQuestionMap = dynamicWizard.buildIDQuestionObject(newQuestionMap,newQuestionObj,quesWithAnsDataMap,type);
        Test.stopTest();
        System.assertNotEquals(null, newQuestionMap);
    }
    
    /*
Method Name : saveQuestionsAns
comments    : This method is used for cover the test class code coverage for saveQuestionsAns method in dynamicWizard class 
*/ 
    static testMethod  void saveQuestionsAnsTest(){
        Test.startTest();
        map<string,string> questionsWithAnswerMap = new map<string,string>();
        map<string,list<map<string,string>>> recordsMapByObject = new map<string,list<map<string,string>>>();
        string objectName = 'Account';
        
        //Inserting Account
        Account accountObj = new Account();
        accountObj.Name = 'Global Media';
        insert accountObj;
         
        //Inserting Template
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        insert templateObj;
        
        boolean saveQuestionsAns = dynamicWizard.saveQuestionsAns(accountObj.Id,objectName,questionsWithAnswerMap,recordsMapByObject);
        Test.stopTest();
        System.assertNotEquals(null, saveQuestionsAns);
    }
    /*
Method Name : buildChildRecordDataTest
comments    : This method is used for cover the test class code coverage for buildChildRecordData method in dynamicWizard class 
*/ 
    static testMethod  void buildChildRecordDataTest(){
        Test.startTest();
        Map<String, Object> quesWithAnsDataMap = new Map<String, Object>();
        Map<string,Question__c> newQuestionMap = new Map<string,Question__c>();
        List<Question__c> questionList = new  List<Question__c>();
        
        //Inserting Template Object
        RecordType recordTypeObj = [select id,Name from RecordType where RecordType.Name = 'Template'];
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        templateObj.RecordTypeId = recordTypeObj.Id;
        insert templateObj;
        
        //Insering tab
        RecordType recordTypeTab = [select id,Name from RecordType where RecordType.Name = 'Tab'];
        WizardHeader__c wizradHeader = new WizardHeader__c();
        wizradHeader.Tab_Name__c = 'Deal Information';
        wizradHeader.Template__c = templateObj.Id;
        wizradHeader.Sequence__c = 1;
        wizradHeader.Has_Condition__c = false;
        wizradHeader.RecordTypeId = recordTypeTab.Id;
        //wizradHeader.Tabs_Template__c = 'Dynamic Wizard';
        insert wizradHeader;
        //Insering Subtab
        RecordType recordTypeSubTab = [select id,Name from RecordType where RecordType.Name = 'SubTab'];
        WizardHeader__c subTab = new WizardHeader__c();
        subTab.SubTab__c = 'Deal Information';
        subTab.RecordTypeId = recordTypeSubTab.Id;
        insert subTab;
        
        //Inserting Question
        Question__c newQuestionObj = new Question__c();     
        newQuestionObj.Field_API_Name__c = 'Negotiation_Type__c';
        newQuestionObj.Question_Label__c = 'Negotiation Type';
        newQuestionObj.Object_API_Name__c = 'Account';
        newQuestionObj.Parent_Object_API_Name__c = '';
        newQuestionObj.SubTab1__c = subTab.Id;                                
        newQuestionObj.Sequence__c = 1;
        newQuestionObj.Values__c = 'Yes,No';
        newQuestionObj.Size__c = 1;
        newQuestionObj.Decimal__c = 0;
        newQuestionObj.Read_Only__c = true;
        newQuestionObj.Field_Type__c = 'REFERENCE';
        newQuestionObj.IsMandatory__c = true;
        newQuestionObj.Has_Condition__c = true;
        newQuestionObj.Dependent_Question__c = true;
        newQuestionObj.Dependent_Tab__c = true;
        newQuestionObj.Dependent_Subtab__c = true;
        newQuestionObj.Has_Dependency__c = true;
        insert newQuestionObj;  
        
        //Inserting Question
        Question__c newQuestionObj1 = new Question__c();     
        newQuestionObj1.Field_API_Name__c = 'Show_Status__c';
        newQuestionObj1.Question_Label__c = 'Show Status';
        newQuestionObj1.Object_API_Name__c = 'Account';
        newQuestionObj1.Parent_Object_API_Name__c = '';
        newQuestionObj1.SubTab1__c = subTab.Id;                                
        newQuestionObj1.Sequence__c = 2;
        newQuestionObj1.Values__c = 'Yes,No';
        newQuestionObj1.Size__c = 1;
        newQuestionObj1.Decimal__c = 0;
        newQuestionObj1.Read_Only__c = true;
        newQuestionObj1.Field_Type__c = 'PICKLIST';
        newQuestionObj1.IsMandatory__c = true;
        newQuestionObj1.Has_Condition__c = true;
        newQuestionObj1.Dependent_Question__c = true;
        newQuestionObj1.Dependent_Tab__c = true;
        newQuestionObj1.Dependent_Subtab__c = true;
        newQuestionObj1.Has_Dependency__c = true;
        insert newQuestionObj1; 
        
        questionList.add(newQuestionObj);
        questionList.add(newQuestionObj1);
        
        for(Question__c question:questionList){
            string apiName = question.Field_API_Name__c;
            if(!newQuestionMap.containsKey(apiName))
                newQuestionMap.put(apiName,question);
            if(!quesWithAnsDataMap.containsKey(apiName))
                quesWithAnsDataMap.put(apiName,question);
        }
        
        dynamicWizard.buildChildRecordData(newQuestionMap,newQuestionObj,quesWithAnsDataMap);
        Test.stopTest();
    }
    
    /*
Method Name : updateAnswerForMultipleRecordViewTest
comments    : This method is used for cover the test class code coverage for updateAnswerForMultipleRecordView method in dynamicWizard class 
*/ 
    static testMethod  void updateAnswerForMultipleRecordViewTest(){
        Test.startTest();
        
        Map<string,List<Map<String, Object>>> quesAnsDataMap = new Map<string,List<Map<String, Object>>>();
        Map<string, List<Map<String,Question__c>>> metaDataMap = new  Map<string, List<Map<String,Question__c>>>(); 
        Map <string,List<WizardHeader__c>> tabsSubTabsMap = new Map <string,List<WizardHeader__c>>(); 
        List<WizardHeader__c> subTabsList = new List<WizardHeader__c>();
        //Inserting Template Object
        RecordType recordTypeObj = [select id,Name from RecordType where RecordType.Name = 'Template'];
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        templateObj.RecordTypeId = recordTypeObj.Id;
        insert templateObj;
        
        //Insering tab
        RecordType recordTypeTab = [select id,Name from RecordType where RecordType.Name = 'Tab'];
        WizardHeader__c wizradHeader = new WizardHeader__c();
        wizradHeader.Tab_Name__c = 'Deal Information';
        wizradHeader.Template__c = templateObj.Id;
        wizradHeader.Sequence__c = 1;
        wizradHeader.Has_Condition__c = false;
        wizradHeader.RecordTypeId = recordTypeTab.Id;
        insert wizradHeader;
        
        //Insering tab
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'contacts';
        tabObj.Template__c = templateObj.Id;
        tabObj.Sequence__c =2;
        tabObj.Has_Condition__c = false;
        tabObj.RecordTypeId = recordTypeTab.Id;
        insert tabObj;
        
        //Inserting subtab
        RecordType recordTypeSubTab = [select id,Name from RecordType where RecordType.Name = 'SubTab'];
        WizardHeader__c SubTab = new WizardHeader__c();
        SubTab.SubTab__c = 'Project Information';
        SubTab.RecordTypeId = recordTypeSubTab.Id;
        SubTab.Tabs__c =tabObj.Id;
        SubTab.Data_View__c = 'Multiple Record View';
        insert SubTab;
        subTabsList.add(SubTab);
        //Insert Question
        Question__c questionObj = new Question__c();
        questionObj.SubTab1__c = SubTab.Id;
        questionObj.Question_Label__c = 'Deal Status';
        insert questionObj;
        
        tabsSubTabsMap.put('Deal Information', subTabsList);
        
        dynamicWizard.updateAnswerForMultipleRecordView(quesAnsDataMap,metaDataMap,tabsSubTabsMap);
        
        Test.stopTest();
        //System.assertNotEquals(null, loadDynamicWizardData);
    } 
    
    /*
Method Name : returnDependentQuestionsConditionList
comments    : This method is used for cover the test class code coverage for returnDependentQuestionsConditionList method in dynamicWizard class 
*/ 
    static testMethod  void returnDependentQuestionsConditionListTest(){
        Test.startTest();
        
        //Inserting Question
        RecordType recordTypeQuestion = [select id,name from RecordType where Recordtype.Name = 'Dependent_Question_Condition'];
        Question__c questionObj = new Question__c(); 
        questionObj.Question_Label__c = 'Deal status';
        questionObj.Field_Type__c = 'PICKLIST';
        questionObj.Parent_Object_API_Name__c = 'Account';
        questionObj.Object_API_Name__c = 'Account';
        insert questionObj;
        
        Question__c questionObj1 = new Question__c(); 
        questionObj1.Question_Label__c = 'Show Status';
        questionObj1.Field_Type__c = 'PICKLIST';
        questionObj1.Parent_Object_API_Name__c = 'Account';
        questionObj1.Object_API_Name__c = 'Account';
        insert questionObj1;
        
        Question__c questionObj2 = new Question__c(); 
        questionObj2.Question_Label__c = 'Priority';
        questionObj2.Field_Type__c = 'PICKLIST';
        questionObj2.Parent_Object_API_Name__c = 'Account';
        questionObj2.Object_API_Name__c = 'Account';
        insert questionObj2;
        
        //Inserting Condition
        Condition__c condition = new Condition__c();
        condition.Dependent_Question__c = questionObj.Id;
        condition.Question__c = questionObj1.Id;
        condition.Type__c = 'Show or Hide';
        condition.Sequence__c = 1;
        condition.RecordTypeId = recordTypeQuestion.Id;
        insert condition;
        
        //Inserting Condition
        Condition__c condition1 = new Condition__c();
        condition1.Dependent_Question__c = questionObj.Id;
        condition1.Question__c = questionObj1.Id;
        condition1.Type__c = 'Show or Hide';
        condition1.Sequence__c = 2;
        condition1.RecordTypeId = recordTypeQuestion.Id;
        insert condition1;
        
        //Inserting Condition
        Condition__c condition2 = new Condition__c();
        condition2.Dependent_Question__c = questionObj.Id;
        condition2.Question__c = questionObj2.Id;
        condition2.Type__c = 'Show or Hide';
        condition2.Sequence__c = 3;
        condition2.RecordTypeId = recordTypeQuestion.Id;
        insert condition2;
        dynamicWizard.returnDependentQuestionsConditionList(questionObj.Id);
        Test.stopTest();
        ///System.assertNotEquals(null, newQuestionMap);
    }
    
    /*
Method Name : returnDependentQuestionsConditionListForSubTabTest
comments    : This method is used for cover the test class code coverage for returnDependentQuestionsConditionListForSubTab method in dynamicWizard class 
*/ 
    static testMethod  void returnDependentQuestionsConditionListForSubTabTest(){
        Test.startTest();
        
        //Insering tab
        RecordType recordTypeTab = [select id,Name from RecordType where RecordType.Name = 'Tab'];
        WizardHeader__c wizradHeader = new WizardHeader__c();
        wizradHeader.Tab_Name__c = 'Deal Information';
        //wizradHeader.Template__c = templateObj.Id;
        wizradHeader.Sequence__c = 1;
        wizradHeader.Has_Condition__c = false;
        wizradHeader.RecordTypeId = recordTypeTab.Id;
        //wizradHeader.Tabs_Template__c = 'Dynamic Wizard';
        insert wizradHeader;
        
        //Inserting subtab
        RecordType recordTypeSubTab = [select id,Name from RecordType where RecordType.Name = 'SubTab'];
        WizardHeader__c SubTabobj = new WizardHeader__c();
        SubTabobj.SubTab__c = 'Excecutive Information';
        SubTabobj.RecordTypeId = recordTypeSubTab.Id;
        SubTabobj.Tabs__c =wizradHeader.Id;
        insert SubTabobj;
        
        //Inserting Question
        RecordType recordTypeDepSubTab = [select id,name from RecordType where Recordtype.Name = 'Dependent_Subtab_Condition'];
        Question__c questionObj = new Question__c(); 
        questionObj.Question_Label__c = 'Deal status';
        questionObj.Field_Type__c = 'PICKLIST';
        questionObj.Parent_Object_API_Name__c = '';
        questionObj.Object_API_Name__c = 'Account';
        insert questionObj;
        
        Question__c questionObj1 = new Question__c(); 
        questionObj1.Question_Label__c = 'Show Status';
        questionObj1.Field_Type__c = 'PICKLIST';
        questionObj1.Parent_Object_API_Name__c = '';
        questionObj1.Object_API_Name__c = 'Account';
        insert questionObj1;
        
        //Inserting Condition
        Condition__c condition = new Condition__c();
        condition.Dependent_Question__c = questionObj.Id;
        //condition.Question__c = questionObj1.Id;
        condition.Type__c = 'Show or Hide';
        condition.Sequence__c = 1;
        condition.SubTab__c = SubTabobj.Id;
        condition.RecordTypeId = recordTypeDepSubTab.Id;
        insert condition;
        
        //Inserting Condition
        Condition__c condition1 = new Condition__c();
        condition1.Dependent_Question__c = questionObj.Id;
        // condition1.Question__c = questionObj1.Id;
        condition1.Type__c = 'Show or Hide';
        condition1.Sequence__c = 2;
        condition.SubTab__c = SubTabobj.Id;
        condition1.RecordTypeId = recordTypeDepSubTab.Id;
        insert condition1;
        
        //Inserting Condition
        Condition__c condition2 = new Condition__c();
        condition2.Dependent_Question__c = questionObj.Id;
        //condition2.Question__c = questionObj1.Id;
        condition2.Type__c = 'Show or Hide';
        condition2.Sequence__c = 3;
        condition.SubTab__c = SubTabobj.Id;
        condition1.RecordTypeId = recordTypeDepSubTab.Id;
        insert condition2;
        dynamicWizard.returnDependentQuestionsConditionListForSubTab(questionObj.Id);
        Test.stopTest();
        ///System.assertNotEquals(null, newQuestionMap);
    }
    
    /*
Method Name : returnDependentQuestionsConditionListForTabTest
comments    : This method is used for cover the test class code coverage for returnDependentQuestionsConditionListForTab method in dynamicWizard class 
*/ 
    static testMethod  void returnDependentQuestionsConditionListForTabTest(){
        Test.startTest();
        
        //Insering tab
        RecordType recordTypeTab = [select id,Name from RecordType where RecordType.Name = 'Tab'];
        WizardHeader__c wizradHeader = new WizardHeader__c();
        wizradHeader.Tab_Name__c = 'Deal Information';
        wizradHeader.Sequence__c = 1;
        wizradHeader.Has_Condition__c = false;
        wizradHeader.RecordTypeId = recordTypeTab.Id;
        insert wizradHeader;
        
        /* WizardHeader__c wizradHeader1 = new WizardHeader__c();
wizradHeader1.Tab_Name__c = 'contacts';
wizradHeader1.Sequence__c = 1;
wizradHeader1.Has_Condition__c = false;
wizradHeader1.RecordTypeId = recordTypeTab.Id;
insert wizradHeader1;*/
        
        //Inserting subtab
        RecordType recordTypeSubTab = [select id,Name from RecordType where RecordType.Name = 'SubTab'];
        WizardHeader__c SubTabobj = new WizardHeader__c();
        SubTabobj.SubTab__c = 'Excecutive Information';
        SubTabobj.RecordTypeId = recordTypeSubTab.Id;
        SubTabobj.Tabs__c =wizradHeader.Id;
        insert SubTabobj;
        
        //Inserting Question
        RecordType recordTypeDepTab = [select id,name from RecordType where Recordtype.Name = 'Dependent_Tab_Condition'];
        Question__c questionObj = new Question__c(); 
        questionObj.Question_Label__c = 'Deal status';
        questionObj.Field_Type__c = 'PICKLIST';
        questionObj.Parent_Object_API_Name__c = '';
        questionObj.Object_API_Name__c = 'Account';
        insert questionObj;
        
        Question__c questionObj1 = new Question__c(); 
        questionObj1.Question_Label__c = 'Show Status';
        questionObj1.Field_Type__c = 'PICKLIST';
        questionObj1.Parent_Object_API_Name__c = '';
        questionObj1.Object_API_Name__c = 'Account';
        insert questionObj1;
        
        //Inserting Condition
        Condition__c condition = new Condition__c();
        condition.Dependent_Question__c = questionObj.Id;
        //condition.Question__c = questionObj1.Id;
        condition.Type__c = 'Show or Hide';
        condition.Sequence__c = 1;
        condition.Tab__c = wizradHeader.Id;
        condition.RecordTypeId = recordTypeDepTab.Id;
        insert condition;
        
        //Inserting Condition
        Condition__c condition1 = new Condition__c();
        condition1.Dependent_Question__c = questionObj1.Id;
        // condition1.Question__c = questionObj1.Id;
        condition1.Type__c = 'Show or Hide';
        condition1.Sequence__c = 2;
        condition.Tab__c = wizradHeader.Id;
        condition1.RecordTypeId = recordTypeDepTab.Id;
        insert condition1;
        
        //Inserting Condition
        Condition__c condition2 = new Condition__c();
        condition2.Dependent_Question__c = questionObj.Id;
        condition2.Question__c = questionObj1.Id;
        condition2.Type__c = 'Show or Hide';
        condition2.Sequence__c = 2;
        condition2.Tab__c = wizradHeader.Id;
        condition2.RecordTypeId = recordTypeDepTab.Id;
        insert condition2;
        dynamicWizard.returnDependentQuestionsConditionListForTab(questionObj.Id);
        Test.stopTest();
        ///System.assertNotEquals(null, newQuestionMap);
    }
    
    /*
Method Name : fetchLookUpValuesList
comments    : This method is used for cover the test class code coverage for fetchLookUpValues method in dynamicWizard class 
*/ 
    static testMethod  void fetchLookUpValuesTest(){
        string searchKeyWord = 'Request';
        string ObjectName = 'Account';
       
        dynamicWizard.fetchLookUpValues(searchKeyWord, ObjectName);
    }
    
    
    /*
Method Name : deleteTempleteDraftRecordTest
comments    : This method is used for cover the test class code coverage for deleteTempleteDraftRecord method in dynamicWizard class 
*/ 
    static testMethod  void deleteTempleteDraftRecordTest(){
        //Inserting templateDraft Object
        Template_draft__c draft = new Template_draft__c();
        insert draft;
        
        //Inserting Account
        Account accountObj = new Account();
        accountObj.Name = 'Global Media';
        insert accountObj;
        
        dynamicWizard.deleteTempleteDraftRecord(accountObj.Id);
    }
    
    /*
Method Name :createDraftRecordTest
comments    : This method is used for cover the test class code coverage for createDraftRecord method in dynamicWizard class 
*/ 
    static testMethod  void createDraftRecordTest(){
        //Inserting templateDraft Object
        Template_draft__c draft = new Template_draft__c();
        insert draft;
        
        //Inserting Account
        Account accountObj = new Account();
        accountObj.Name = 'Global Media';
        insert accountObj;
      
        dynamicWizard.createDraftRecord(accountObj.Id);
    }
    
    /*
Method Name :createUpdateSaveAsDraftRecordsTest
comments    : This method is used for cover the test class code coverage for createUpdateSaveAsDraftRecords method in dynamicWizard class 
*/ 
    static testMethod  void createUpdateSaveAsDraftRecordsTest(){
        Map<string,object> saveAsDraftMap = new Map<string,object>();
        string templateDraftId;
        //Inserting templateDraft Object
        Template_draft__c draft = new Template_draft__c();
        insert draft;
        
        //Inserting Attachment under template draft obj
        Attachment attachmnt = new Attachment();
        attachmnt.ParentId = draft.Id;
        attachmnt.Name = 'Draft';
        attachmnt.Body = Blob.valueOf('DraftDetails');
        insert attachmnt;
        
        //Inserting Account
        Account accountObj = new Account();
        accountObj.Name = 'Global Media';
        insert accountObj;
       
        dynamicWizard.createUpdateSaveAsDraftRecords(accountObj.Id,templateDraftId,saveAsDraftMap);
        dynamicWizard.createUpdateSaveAsDraftRecords(accountObj.Id,draft.Id,saveAsDraftMap);
    }
    
    /*
Method Name :groupQuestionAnsByObjectTest
comments    : This method is used for cover the test class code coverage for groupQuestionAnsByObject method in dynamicWizard class 
*/ 
    static testMethod  void groupQuestionAnsByObjectTest(){
        List<Map<String, Object>> questionsAnswerMapList = new List<Map<String, Object>>();
        Map<string, List<Map<String, Object>>> quesAnsDataMap = new Map<string, List<Map<String, Object>>>();
        string fieldsToBeQuried = 'Draft_Id__c';
        string parentObjectName = '';
        string objectName = 'Account';
        
        string parentObjectName1 = 'Digital_Linear_Right__c'; 
        string objectName1 = '';
        
         //Inserting Account
        Account accountObj = new Account();
        accountObj.Name = 'Global Media';
        insert accountObj;
      
        
        questionsAnswerMapList = dynamicWizard.readQuestionsAnswer(fieldsToBeQuried,parentObjectName,objectName,accountObj.Id);
       
        dynamicWizard.groupQuestionAnsByObject(objectName,questionsAnswerMapList,quesAnsDataMap);
        
    }
    
    /*
Method Name :fieldsToBeQueriedTest
comments    : This method is used for cover the test class code coverage for fieldsToBeQueried method in dynamicWizard class 
*/ 
    static testMethod  void fieldsToBeQueriedTest(){
        List<Question__c> questionList = new List<Question__c>();
        //Inserting Question
        Question__c questionObj = new Question__c(); 
        questionObj.Question_Label__c = 'Deal status';
        questionObj.Field_Type__c = 'REFERENCE';
        questionObj.Parent_Object_API_Name__c = '';
        questionObj.Object_API_Name__c = 'Account';
        questionObj.Field_API_Name__c = 'CreativeExecutive__c';
        insert questionObj;
        questionList.add(questionObj);
        dynamicWizard.fieldsToBeQueried(questionList);
    }
    
}