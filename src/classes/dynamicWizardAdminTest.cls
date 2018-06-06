@isTest
public class dynamicWizardAdminTest {
    /*
Method Name : getTemplatesTest
comments    : This method is used for cover the test class code coverage for getTemplates method in dynamicWizardAdmin class 
*/ 
    static testMethod  void getTemplatesTest(){
        Test.startTest();
        WizardHeader__c [] templateList = dynamicWizardAdmin.getTemplates();
        Test.stopTest();
        System.assertNotEquals(null, templateList);  
    }
    /*
aMethod Name : getTempleteDetailsTest
comments    : This method is used for cover the test class code coverage for getTempleteDetails method in dynamicWizardAdmin class 
*/ 
    static testMethod  void getTempleteDetailsTest(){
        Test.startTest();
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        insert templateObj;
        WizardHeader__c  getTempleteDetails = dynamicWizardAdmin.getTempleteDetails(templateObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, getTempleteDetails);
    }
    /*
Method Name : templateExistTest
comments    : This method is used for cover the test class code coverage for templateExistTest method in dynamicWizardAdmin class
*/ 
    static testMethod  void templateExistTest(){
        Test.startTest();
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        templateObj.Object_Name__c = 'Agreement';
        templateObj.Object_API_Name__c = 'Agreement__c';
        templateObj.Active__c = true;
        templateObj.Template_Description__c = 'Dynamic Wizard';
        insert templateObj;
        //Inserting Template
        WizardHeader__c templateObj1 = new WizardHeader__c();
        templateObj1.Template_Name__c = 'Dynamic Wizard';
        templateObj1.Object_Name__c = 'Agreement';
        templateObj1.Object_API_Name__c = 'Agreement__c';
        templateObj1.Active__c = true;
        templateObj1.Template_Description__c = 'Dynamic Wizard';
        insert templateObj1;
        Boolean  templateObjExist = dynamicWizardAdmin.templateExist(templateObj);
        Test.stopTest();
        System.assertNotEquals(null, templateObjExist);
    }
    /*
Method Name : insertUpdateTemplateTest
comments    : This method is used for cover the test class code coverage for insertUpdateTemplate method in dynamicWizardAdmin class
*/ 
    static testMethod  void insertUpdateTemplateTest(){
        Test.startTest();
        RecordType template = [select id,name from RecordType where name = 'Template'];
        RecordType tab = [select id,name from RecordType where name = 'Tab'];
        RecordType subTab = [select id,name from RecordType where name = 'SubTab'];
        //Inserting Template
        WizardHeader__c templateObj = new WizardHeader__c();
        //templateObj.Tab_Name__c = 'Deal Information';
        templateObj.Template_Name__c = 'Dynamic Wizard';
        templateObj.Object_Name__c = 'Agreement';
        templateObj.Object_API_Name__c = 'Agreement__c';
        templateObj.Expiry_Date__c = Date.newInstance(2016, 12, 9);
        templateObj.Expiry_Date__c = Date.newInstance(2019, 12, 9);
        templateObj.Active__c = true;
        templateObj.Template_Description__c = 'Dynamic Wizard';
        //templateObj.RecordTypeId = '0121N000000qqEf';
        templateObj.RecordTypeId = template.Id;
        string userChoice='CopyTemplate';
        string userChoice1='EditTemplate';
        string userChoice2='NewTemplate';
        insert templateObj;
        //Inserting Tab
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        tabObj.Template__c = templateObj.Id;
        tabObj.RecordTypeId = tab.Id;
        insert tabObj;
        
        //Inserting subTab
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Project Information';
        subTabObj.Tabs__c = tabObj.Id;
        subTabObj.RecordTypeId = subTab.Id;
        insert subTabObj;
        
        //Inserting Question
        /*Question__c questionObj = new Question__c();
questionObj.Question_Label__c = 'Deal Status';
questionObj.SubTab1__c = subTabObj.Id;
insert subTabObj;*/
        
        Id  insertUpdateTemplate = dynamicWizardAdmin.insertUpdateTemplate(templateObj,userChoice);
        Id  insertUpdateTemplate1 = dynamicWizardAdmin.insertUpdateTemplate(templateObj,userChoice1);
        Id  insertUpdateTemplate2 = dynamicWizardAdmin.insertUpdateTemplate(templateObj,userChoice2);
        Test.stopTest();
        System.assertNotEquals(null, insertUpdateTemplate);
    }
    
    /*
Method Name : copyTemplateTest
comments    : This method is used for cover the test class code coverage for copyTemplate method in dynamicWizardAdmin class
*/ 
    static testMethod  void copyTemplateTest(){
        Test.startTest();
        RecordType template = [select id,name from RecordType where name = 'Template'];
        RecordType tab = [select id,name from RecordType where name = 'Tab'];
        RecordType subTab = [select id,name from RecordType where name = 'SubTab'];
        //Inserting Template
        WizardHeader__c templateObj = new WizardHeader__c();
        //templateObj.Tab_Name__c = 'Deal Information';
        templateObj.Template_Name__c = 'Dynamic Wizard';
        templateObj.Object_Name__c = 'Agreement';
        templateObj.Object_API_Name__c = 'Agreement__c';
        templateObj.Expiry_Date__c = Date.newInstance(2016, 12, 9);
        templateObj.Expiry_Date__c = Date.newInstance(2019, 12, 9);
        templateObj.Active__c = true;
        templateObj.Template_Description__c = 'Dynamic Wizard';
        //templateObj.RecordTypeId = '0121N000000qqEf';
        templateObj.RecordTypeId = template.Id;
        string userChoice='CopyTemplate';
        string userChoice1='EditTemplate';
        string userChoice2='NewTemplate';
        insert templateObj;
        //Inserting Tab
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        tabObj.Template__c = templateObj.Id;
        tabObj.RecordTypeId = tab.Id;
        insert tabObj;
        
        //Inserting subTab
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Project Information';
        subTabObj.Tabs__c = tabObj.Id;
        subTabObj.RecordTypeId = subTab.Id;
        insert subTabObj;
        
        //Inserting Question
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Deal Status';
        questionObj.SubTab1__c = subTabObj.Id;
        insert questionObj;
        
        Id  copyTemplate = dynamicWizardAdmin.copyTemplate(templateObj);
        //Id  insertUpdateTemplate1 = dynamicWizardAdmin.insertUpdateTemplate(templateObj,userChoice1);
        // Id  insertUpdateTemplate2 = dynamicWizardAdmin.insertUpdateTemplate(templateObj,userChoice2);
        Test.stopTest();
        System.assertNotEquals(null, copyTemplate);
    }
    
    /*
Method Name : getTabsTest
comments    : This method is used for cover the test class code coverage for getTabs method in dynamicWizardAdmin class 
*/ 
    static testMethod  void getTabsTest(){
        Test.startTest();
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        insert templateObj;
        WizardHeader__c[]  tabObj = dynamicWizardAdmin.getTabs(templateObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, tabObj);
    }
    /*
Method Name : getTabDetails
comments    : This method is used for cover the test class code coverage for getTabDetails method in dynamicWizardAdmin class 
*/ 
    static testMethod  void getTabDetailsTest(){
        Test.startTest();
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        insert tabObj;
        WizardHeader__c  tabDetails = dynamicWizardAdmin.getTabDetails(tabObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, tabDetails);
    }
    /*
Method Name : tabExistTest
comments    : This method is used for cover the test class code coverage for tabExist method in dynamicWizardAdmin class
*/ 
    static testMethod  void tabExistTest(){
        Test.startTest();
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        insert templateObj;
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        tabObj.Has_Condition__c = true;
        tabObj.Condition_Filter_Logic__c = 'Agreement__c';
        tabObj.Template_Name__c = 'Dynamic Wizard';
        tabObj.Conditional_Logic__c = 'Test Condition';
        insert tabObj;
        Boolean  tabObjExist = dynamicWizardAdmin.tabExist(templateObj.Id,tabObj);
        Test.stopTest();
        System.assertNotEquals(null, tabObjExist);
    }
    /*
Method Name : insertUpdateTabTest
comments    : This method is used for cover the test class code coverage for insertUpdateTab method in dynamicWizardAdmin class
*/ 
    static testMethod  void insertUpdateTabTest(){
        Test.startTest();
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        insert templateObj;
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        tabObj.Has_Condition__c = true;
        tabObj.Condition_Filter_Logic__c = 'Agreement__c';
        tabObj.Template_Name__c = 'Dynamic Wizard';
        tabObj.Conditional_Logic__c = 'Test Condition';
        tabObj.Sequence__c = 1;
        tabObj.RecordTypeId = '0121N000000qqEa';
        insert tabObj;
        dynamicWizardAdmin.insertUpdateTab(templateObj.Id, tabObj);
        Test.stopTest();
        // System.assertNotEquals(null, insertUpdateTab);
    }
    /*
Method Name : insertUpdateTabTest1
comments    : This method is used for cover the test class code coverage for insertUpdateTab method in dynamicWizardAdmin class
*/ 
    static testMethod  void insertUpdateTabTest1(){
        Test.startTest();
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        insert templateObj;
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Dynamic Wizard';
        tabObj.Has_Condition__c = true;
        tabObj.Condition_Filter_Logic__c = 'Agreement__c';
        tabObj.Template_Name__c = 'Dynamic Wizard';
        tabObj.Conditional_Logic__c = 'Test Condition';
        tabObj.Sequence__c = 1;
        tabObj.RecordTypeId = '0121N000000qqEa';
        dynamicWizardAdmin.insertUpdateTab(templateObj.Id, tabObj);
        Test.stopTest();
        //System.assertNotEquals(null, insertUpdateTab);
        
    }
    /*
Method Name : deleteTabDetailsTest
comments    : This method is used for cover the test class code coverage for deleteTabDetails method in dynamicWizardAdmin class
*/ 
    static testMethod  void deleteTabDetailsTest(){
        Test.startTest();
        RecordType tab = [select id,name from RecordType where name = 'Tab'];
        RecordType subTab = [select id,name from RecordType where name = 'SubTab'];
        //Inserting tab
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        tabObj.RecordTypeId = tab.Id;
        insert tabObj;
        
        //Inserting subtab
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'project Information';
        subTabObj.Tabs__c = tabObj.Id;
        subTabObj.RecordTypeId = subTab.Id;
        insert subTabObj;
        
        //Inserting Question
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Deal Status';
        questionObj.SubTab1__c = subTabObj.Id;
        insert questionObj;
        
        Boolean  deleteTab = dynamicWizardAdmin.deleteTabDetails(tabObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, deleteTab);
    }
    /*
Method Name : updateTabSequenceTest
comments    : This method is used for cover the test class code coverage for updateTabSequenceTest method in dynamicWizardAdmin class
*/ 
    static testMethod  void updateTabSequenceTest(){
        Test.startTest();
        List<WizardHeader__c> tabList = new List<WizardHeader__c>();
        WizardHeader__c[]  updateTabSequence = dynamicWizardAdmin.updateTabSequence(tabList);
        Test.stopTest();
        System.assertNotEquals(null, updateTabSequence);
    }
    /*
Method Name : getAllSubTabsTest
comments    : This method is used for cover the test class code coverage for getAllSubTabs method in dynamicWizardAdmin class
*/ 
    static testMethod  void getAllSubTabsTest(){
        Test.startTest();
        List<WizardHeader__c> tabList = new List<WizardHeader__c>();
        WizardHeader__c[]  getAllSubTabs = dynamicWizardAdmin.getAllSubTabs(tabList);
        Test.stopTest();
        System.assertNotEquals(null, getAllSubTabs);
    }
    /*
Method Name : getSubTabDetailsTest
comments    : This method is used for cover the test class code coverage for getAllSubTabs method in dynamicWizardAdmin class
*/ 
    static testMethod  void getSubTabDetailsTest(){
        Test.startTest();
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'test Subtab';
        insert subTabObj; 
        WizardHeader__c  getSubTabDetails = dynamicWizardAdmin.getSubTabDetails(subTabObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, getSubTabDetails);
    }
    /*
Method Name : subtabExistTest
comments    : This method is used for cover the test class code coverage for subtabExist method in dynamicWizardAdmin class
*/ 
    static testMethod  void subtabExistTest(){
        Test.startTest();
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        insert tabObj;
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Project Information';
        subTabObj.Tabs__c = tabObj.Id;
        insert subTabObj;
        Boolean  subTabObjExist = dynamicWizardAdmin.subtabExist(subTabObj);
        Test.stopTest();
        System.assertNotEquals(null, subTabObjExist);
    }
    /*
Method Name : insertUpdateSubTabTest
comments    : This method is used for cover the test class code coverage for insertUpdateSubTab method in dynamicWizardAdmin class
*/ 
    static testMethod  void insertUpdateSubTabTest(){
        Test.startTest();
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        insert tabObj;
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Talent';
        subTabObj.Tabs__c = tabObj.Id;
        subTabObj.Parent_Object_Name__c = 'Agreement';
        subTabObj.Parent_Object_API_Name__c = 'Agreement__c';
        subTabObj.Object_Name__c = 'Agreement';
        subTabObj.Object_API_Name__c = 'Agreement__c';
        subTabObj.Has_Condition__c = true;
        subTabObj.Condition_Filter_Logic__c = 'Test Filter Condition';
        subTabObj.Form_Type__c = 'Two';
        subTabObj.Conditional_Logic__c = 'Test Logic';
        subTabObj.Data_View__c = 'Single Record View';
        subTabObj.Form_Layout__c = true;
        subTabObj.Tabular_Layout__c = true;    
        subTabObj.Field_Name__c = 'Consultan Name';    
        subTabObj.Field_API_Name__c = 'Consultan Name__c';    
        subTabObj.Filtering_Value__c = 'test Filtering Condition';
        subTabObj.RecordTypeId = '0121N000000qqEa';
        insert subTabObj;
        dynamicWizardAdmin.insertUpdateSubTab(subTabObj);
        Test.stopTest();
        //System.assertNotEquals(null, insertUpdateSubTab);
    }
    /*
Method Name : insertUpdateSubTabTest1
comments    : This method is used for cover the test class code coverage for insertUpdateSubTab method in dynamicWizardAdmin class
*/ 
    static testMethod  void insertUpdateSubTabTest1(){
        Test.startTest();
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        insert tabObj;
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Talent';
        subTabObj.Tabs__c = tabObj.Id;
        subTabObj.Parent_Object_Name__c = 'Agreement';
        subTabObj.Parent_Object_API_Name__c = 'Agreement__c';
        subTabObj.Object_Name__c = 'Agreement';
        subTabObj.Object_API_Name__c = 'Agreement__c';
        subTabObj.Has_Condition__c = true;
        subTabObj.Condition_Filter_Logic__c = 'Test Filter Condition';
        subTabObj.Form_Type__c = 'Two';
        subTabObj.Conditional_Logic__c = 'Test Logic';
        subTabObj.Data_View__c = 'Single Record View';
        subTabObj.Form_Layout__c = true;
        subTabObj.Tabular_Layout__c = true;    
        subTabObj.Field_Name__c = 'Consultan Name';    
        subTabObj.Field_API_Name__c = 'Consultan Name__c';    
        subTabObj.Filtering_Value__c = 'test Filtering Condition';
        subTabObj.RecordTypeId = '0121N000000qqEa';
        dynamicWizardAdmin.insertUpdateSubTab(subTabObj);
        Test.stopTest();
        //System.assertNotEquals(null, insertUpdateSubTab);
    }
    /*
Method Name : getSubTabRelatedQuestionsTest
comments    : This method is used for cover the test class code coverage for getSubTabRelatedQuestions method in dynamicWizardAdmin class
*/ 
    static testMethod  void getSubTabRelatedQuestionsTest(){
        Test.startTest();
        List<WizardHeader__c> subTabList = new List<WizardHeader__c>();
        Question__c[]  getSubTabRelatedQuestions = dynamicWizardAdmin.getSubTabRelatedQuestions(subTabList);
        Test.stopTest();
        System.assertNotEquals(null, getSubTabRelatedQuestions);
    }
    /*
Method Name : getAllQuestionsRelatedToTabTest
comments    : This method is used for cover the test class code coverage for getAllQuestionsRelatedToTab method in dynamicWizardAdmin class
*/ 
    static testMethod  void getAllQuestionsRelatedToTabTest(){
        Test.startTest();
        string Id;
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        insert tabObj;
        Question__c[]  getAllQuestionsRelatedToTab = dynamicWizardAdmin.getAllQuestionsRelatedToTab(tabObj.Id);
        dynamicWizardAdmin.getAllQuestionsRelatedToTab(Id);
        List<WizardHeader__c> subTabList = new List<WizardHeader__c>();
        Test.stopTest();
        System.assertNotEquals(null, getAllQuestionsRelatedToTab);
    }
    /*
Method Name : getTabRelatedSubtabsTest
comments    : This method is used for cover the test class code coverage for getTabRelatedSubtabs method in dynamicWizardAdmin class
*/ 
    static testMethod  void getTabRelatedSubtabsTest(){
        Test.startTest();
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        insert tabObj;
        WizardHeader__c[]  getTabRelatedSubtabs = dynamicWizardAdmin.getTabRelatedSubtabs(tabObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, getTabRelatedSubtabs);
    }
    /*
Method Name : getSubTabsRelatedQuestionsTest
comments    : This method is used for cover the test class code coverage for getSubTabsRelatedQuestions method in dynamicWizardAdmin class
*/ 
    static testMethod  void getSubTabsRelatedQuestionsTest(){
        Test.startTest();
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Project Information';
        insert subTabObj;
        Question__c[]  getSubTabsRelatedQuestions = dynamicWizardAdmin.getSubTabsRelatedQuestions(subTabObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, getSubTabsRelatedQuestions);
    }
    /*
Method Name : getQuestionDetailsTest
comments    : This method is used for cover the test class code coverage for getQuestionDetails method in dynamicWizardAdmin class
*/ 
    static testMethod  void getQuestionDetailsTest(){
        Test.startTest();
        //Inserting Question
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        insert questionObj; 
        Question__c  getQuestionDetails = dynamicWizardAdmin.getQuestionDetails(questionObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, getQuestionDetails);
    }
    
    /*
Method Name : deleteSubTabDetailsTest
comments    : This method is used for cover the test class code coverage for deleteSubTabDetails method in dynamicWizardAdmin class
*/ 
    static testMethod  void deleteSubTabDetailsTest(){
        Test.startTest();
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Project Information';
        insert subTabObj;
        Question__c questionsObj = new Question__c();
        questionsObj.SubTab1__c = subTabObj.Id;
        Insert questionsObj;
        Boolean  deleteSubTab = dynamicWizardAdmin.deleteSubTabDetails(subTabObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, deleteSubTab);
    }
    /*
Method Name : updateSubTabSequenceTest
comments    : This method is used for cover the test class code coverage for updateSubTabSequence method in dynamicWizardAdmin class
*/ 
    static testMethod  void updateSubTabSequenceTest(){
        Test.startTest();
        List<WizardHeader__c> subTabList = new List<WizardHeader__c>();
        WizardHeader__c[]  updateSubTabSequence = dynamicWizardAdmin.updateSubTabSequence(subTabList);
        Test.stopTest();
        System.assertNotEquals(null, updateSubTabSequence);
    }
    /*
Method Name : deleteQuestionDetailsTest
comments    : This method is used for cover the test class code coverage for deleteQuestionDetails method in dynamicWizardAdmin class
*/ 
    static testMethod  void deleteQuestionDetailsTest(){
        Test.startTest();
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Project Information';
        insert subTabObj;
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        questionObj.SubTab1__c = subTabObj.Id;
        insert questionObj; 
        Boolean  deleteQuestion = dynamicWizardAdmin.deleteQuestionDetails(questionObj.Id,questionObj.SubTab1__c);
        Test.stopTest();
        System.assertNotEquals(null, deleteQuestion);
    }
    /*
Method Name : updateQuestionSequenceTest
comments    : This method is used for cover the test class code coverage for updateQuestionSequence method in dynamicWizardAdmin class
*/ 
    static testMethod  void updateQuestionSequenceTest(){
        Test.startTest();
        List<Question__c> questionList = new List<Question__c>();
        Question__c[]  updateQuestionSequence = dynamicWizardAdmin.updateQuestionSequence(questionList);
        Test.stopTest();
        System.assertNotEquals(null, updateQuestionSequence);
    }
    /*
Method Name : getAllObjectNamesTest
comments    : This method is used for cover the test class code coverage for getAllObjectNames method in dynamicWizardAdmin class
*/ 
    static testMethod  void getAllObjectNamesTest(){
        Test.startTest();
        dynamicWizardAdmin.getAllSfObjectNames();
        Test.stopTest();
        
    }
    /*
Method Name : getsObjectRelatedFieldsTest
comments    : This method is used for cover the test class code coverage for getsObjectRelatedFields method in dynamicWizardAdmin class
*/ 
    static testMethod  void getsObjectRelatedFieldsTest(){
        Test.startTest();
        dynamicWizardAdmin.getsObjectRelatedFields('Account');
        Test.stopTest();
        
    }
    /*
Method Name : getsObjectFieldsTypeTest
comments    : This method is used for cover the test class code coverage for getsObjectFieldsType method in dynamicWizardAdmin class
*/ 
    static testMethod  void getsObjectFieldsTypeTest(){
        Test.startTest();
        dynamicWizardAdmin.getsObjectFieldsType('Account', 'Name');
        Test.stopTest();
    }
    /*
Method Name : getSelectedFieldPropertyValuesTest
comments    : This method is used for cover the test class code coverage for getSelectedFieldPropertyValues method in dynamicWizardAdmin class
*/ 
    static testMethod  void getSelectedFieldPropertyValuesTest(){
        Test.startTest();
        dynamicWizardAdmin.getSelectedFieldPropertyValues('Account', 'Name');
        Test.stopTest();
    }
    /*
Method Name : getAllPicklistValuesTest
comments    : This method is used for cover the test class code coverage for getAllPicklistValues method in dynamicWizardAdmin class
*/ 
    static testMethod  void getAllPicklistValuesTest(){
        Test.startTest();
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        questionObj.Values__c = 'open,close,terminated';
        insert questionObj; 
        dynamicWizardAdmin.getAllPicklistValues(questionObj.Id);
        Test.stopTest();
    }
    /*
Method Name : getAllPicklistValuesBasedOnTypeTest
comments    : This method is used for cover the test class code coverage for getAllPicklistValuesBasedOnType method in dynamicWizardAdmin class
*/ 
    static testMethod  void getAllPicklistValuesBasedOnTypeTest(){
        Test.startTest();
        dynamicWizardAdmin.getAllPicklistValuesBasedOnType('Account', 'Name');
        Test.stopTest();
    }
    /*
Method Name : insertUpdateQuestionsTest
comments    : This method is used for cover the test class code coverage for insertUpdateQuestions method in dynamicWizardAdmin class
*/ 
    static testMethod  void insertUpdateQuestionsTest(){
        Test.startTest();
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Consultant Name';
        questionObj.Section1__c = 'a0Dm0000003ZgxxEAC';
        questionObj.SubTab1__c = 'a0Dm0000003ZgxxEAC';
        questionObj.Sequence__c = 1;
        
        dynamicWizardAdmin.insertUpdateQuestions(questionObj);
        Test.stopTest();
        //System.assertNotEquals(null, insertUpdateQuestions);
    }
    /*
Method Name : insertUpdateQuestionsTest1
comments    : This method is used for cover the test class code coverage for insertUpdateQuestions method in dynamicWizardAdmin class
*/ 
    static testMethod  void insertUpdateQuestionsTest1(){
        Test.startTest();
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        insert questionObj; 
        dynamicWizardAdmin.insertUpdateQuestions(questionObj);
        Test.stopTest();
        //System.assertNotEquals(null, insertUpdateQuestions);
    }
    /*
Method Name : insertCloneQuestionsTest
comments    : This method is used for cover the test class code coverage for insertCloneQuestions method in dynamicWizardAdmin class
*/ 
    static testMethod  void insertCloneQuestionsTest(){
        Test.startTest();
        //Insertimg SubTab
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Project Information';
        insert subTabObj;
        //Inserting Question
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        insert questionObj; 
        list<String> questionList = new  list<String>();
        questionList.add(questionObj.Id);
        dynamicWizardAdmin.insertCloneQuestions(subTabObj.Id,questionList);
        Test.stopTest();
    }
    /*
Method Name : tabSequenceSortTest
comments    : This method is used for cover the test class code coverage for tabSequenceSort method in dynamicWizardAdmin class
*/ 
    static testMethod  void tabSequenceSortTest(){
        Test.startTest();
        List<WizardHeader__c> tabList = new List<WizardHeader__c>();
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        insert templateObj;
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        insert tabObj;
        tabList.add(tabObj);
        WizardHeader__c[]  tabSequenceSort = dynamicWizardAdmin.tabSequenceSort(tabList,templateObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, tabSequenceSort);
    }
    /*
Method Name : subTabSequenceSortTest
comments    : This method is used for cover the test class code coverage for subTabSequenceSort method in dynamicWizardAdmin class
*/ 
    static testMethod  void subTabSequenceSortTest(){
        Test.startTest();
        List<WizardHeader__c> tabList = new List<WizardHeader__c>();
        List<WizardHeader__c> subTabList = new List<WizardHeader__c>();
        
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        insert tabObj;
        tabList.add(tabObj);
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Project Information';
        insert subTabObj;
        subTabList.add(subTabObj);
        WizardHeader__c[]  subTabSequenceSort = dynamicWizardAdmin.subTabSequenceSort(tabList,subTabList);
        Test.stopTest();
        System.assertNotEquals(null, subTabSequenceSort);
    }
    /*
Method Name : questionSequenceSortTest
comments    : This method is used for cover the test class code coverage for questionSequenceSort method in dynamicWizardAdmin class
*/ 
    static testMethod  void questionSequenceSortTest(){
        Test.startTest();
        List<Question__c> questionsList = new List<Question__c>();
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Project Information';
        insert subTabObj;
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        insert questionObj; 
        questionsList.add(questionObj);
        Question__c[]  questionSequenceSort = dynamicWizardAdmin.questionSequenceSort(subTabObj.Id,questionsList);
        Test.stopTest();
        System.assertNotEquals(null, questionSequenceSort);
    }
    
    /*
Method Name :getTabsTest
comments    : This method is used to cover the code coverage for getTabs method in dynamicWizardAdmin class 
*/ 
    public static testmethod void getTabsTest1(){ 
        Test.startTest();
        WizardHeader__c wizradHeader = new WizardHeader__c();
        wizradHeader.Template_Name__c = 'Dynamic Wizard Admin';
        insert wizradHeader;
        
        Condition__c condition = new Condition__c();
        condition.Tab__c = wizradHeader.Id;
        insert condition;
        
        WizardHeader__c [] Conditionlst  = dynamicWizardAdmin.getTabs(wizradHeader.Id);
        Test.stopTest();
    } 
    /*
Method Name : getTabDependentConditionsTest
comments    : This method is used to cover the code coverage for following methods, located in dynamicWizardAdmin class.
Methods covered : getTabDependentConditions
*/ 
    public static testmethod void getTabDependentConditionsTest(){ 
        Test.startTest();
        WizardHeader__c wizradHeader = new WizardHeader__c();
        wizradHeader.Tab_Name__c = 'Deal Information';
        insert wizradHeader;
        
        Condition__c condition = new Condition__c();
        condition.Tab__c = wizradHeader.Id;
        insert condition;
        
        Condition__c [] Conditionlst  = dynamicWizardAdmin.getTabDependentConditions(wizradHeader.Id);
        dynamicWizardAdmin.getTabRelatedSubtabs(wizradHeader.Id);
        Test.stopTest();
    } 
    
    /*
Method Name : getTabDependentConditionsTest
comments    : This method is used to cover the code coverage for following methods, located in dynamicWizardAdmin class.
Methods covered : getSubTabDependentConditions
*/ 
    public static testmethod void getSubTabDependentConditionsTest(){ 
        Test.startTest();
        //Inserting subtab
        WizardHeader__c wizradHeader = new WizardHeader__c();//SubTab1__c
        wizradHeader.SubTab__c = 'Project Information';
        insert wizradHeader;
        //Inserting Question
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        questionObj.Field_Type__c ='PICKLIST';
        questionObj.Values__c = 'contact,network';
        questionObj.SubTab1__c = wizradHeader.Id;
        insert questionObj;
        //Inserting Condition
        Condition__c condition = new Condition__c();
        condition.SubTab__c = wizradHeader.Id;
        insert condition;
        
        Condition__c [] Conditionlst  = dynamicWizardAdmin.getSubTabDependentConditions(wizradHeader.Id);
        dynamicWizardAdmin.getSubTabsRelatedQuestions(wizradHeader.Id);
        Test.stopTest();
    } 
    
    /*
Method Name : getQuestionDependentConditionsTest
comments    : This method is used to cover the code coverage for following methods, located in dynamicWizardAdmin class.
Methods covered : getQuestionDependentConditions,getDependentQuestionFieldType,getDependentQuestionPicklistValues,getDependentQuestionFilteringValues
*/ 
    public static testmethod void getQuestionDependentConditionsTest(){ 
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        questionObj.Field_Type__c ='PICKLIST';
        questionObj.Values__c = 'contact,network';
        insert questionObj;
        
        Condition__c condition = new Condition__c();
        condition.Question__c = questionObj.Id;
        insert condition;
        
        Condition__c [] Conditionlst  = dynamicWizardAdmin.getQuestionDependentConditions(questionObj.Id);
        string fieldType = dynamicWizardAdmin.getDependentQuestionFieldType(questionObj.Id);
        dynamicWizardAdmin.getDependentQuestionPicklistValues(questionObj.Id);
        dynamicWizardAdmin.getDependentQuestionFilteringValues(questionObj.Id);
    } 
    
    /*
Method Name : insertDependentConditionsTest
comments    : This method is used to cover the code coverage for following methods, located in dynamicWizardAdmin class.
Methods covered : insertDependentConditions
*/ 
    public static testmethod void insertDependentConditionsTest(){ 
        Test.startTest();
        string dependenceType1 = 'question'; 
        string dependenceType2 = 'tab';
        string dependenceType3 = 'subtab';
        string conditionColumn = '1 AND 2 OR 3';
        list<Condition__c> Conditionlst = new list<Condition__c>();
        //Inserting subTab
        WizardHeader__c wizradHeader = new WizardHeader__c();
        wizradHeader.SubTab__c = 'Project Information';
        insert wizradHeader;
        string subTabId = wizradHeader.Id;
        //Inserting Question
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        questionObj.Field_Type__c ='PICKLIST';
        questionObj.Values__c = 'contact,network';
        insert questionObj;
        //Inserting  Condition
        Condition__c condition = new Condition__c();
        condition.SubTab__c = subTabId;
        condition.Dependent_Question__c = questionObj.Id;
        condition.Conditional_Operaor__c = '!='; 
        condition.Sequence__c = 1;
        condition.Type__c = 'Show or Hide';
        condition.Conditional_Logic__c = 'AND';
        insert condition;
        
        Condition__c conditionObj = new Condition__c();
        conditionObj.SubTab__c = subTabId;
        conditionObj.Dependent_Question__c = questionObj.Id;
        conditionObj.Conditional_Operaor__c = '=';
        conditionObj.Sequence__c = 2;
        conditionObj.Type__c = 'preDefault';
        conditionObj.Conditional_Logic__c = '';
        insert conditionObj;
        
        Condition__c conditionObj1 = new Condition__c();
        conditionObj1.SubTab__c = subTabId;
        conditionObj1.Dependent_Question__c = questionObj.Id;
        conditionObj1.Conditional_Operaor__c = '<';
        conditionObj1.Sequence__c = 3;
        conditionObj1.Type__c = 'Picklist Filtering';
        conditionObj1.Conditional_Logic__c = '';
        insert conditionObj1;
        
        Conditionlst.add(condition);
        Conditionlst.add(conditionObj);
        Conditionlst.add(conditionObj1);
        
        dynamicWizardAdmin.insertDependentConditions(subTabId,dependenceType1,conditionColumn,Conditionlst);
        dynamicWizardAdmin.insertDependentConditions(subTabId,dependenceType2,conditionColumn,Conditionlst);
        dynamicWizardAdmin.insertDependentConditions(subTabId,dependenceType3,conditionColumn,Conditionlst);
        Test.stopTest();
    } 
    
    /*
Method Name : updatingDepQuestionAndDeletingDepConditionTest
comments    : This method is used to cover the code coverage for following methods, located in dynamicWizardAdmin class.
Methods covered : updatingDepQuestionAndDeletingDepCondition
*/ 
    public static testmethod void updatingDepQuestionAndDeletingDepConditionTest(){
        Test.startTest();
        string dependenceType1 = 'question';
        string dependenceType2 = 'tab';
        string dependenceType3 = 'subtab';
        
        string conditionColumn = '1 AND 2 OR 3';
        list<Condition__c> Conditionlst = new list<Condition__c>();
        
        //Inserting Tab
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        insert tabObj;
        string tabId = tabObj.Id;
        //Inserting SubTab
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Project Information';
        insert subTabObj;
        string subTabId = subTabObj.Id;
        //Inserting Question
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        questionObj.Field_Type__c ='PICKLIST';
        questionObj.Values__c = 'contact,network';
        insert questionObj;
        string questionId = questionObj.Id;
        
        //Inserting Condition
        Condition__c condition = new Condition__c();
        condition.SubTab__c = subTabId;
        condition.Tab__c = tabId;
        condition.Dependent_Question__c = questionObj.Id;
        condition.Question__c = questionId;
        condition.RecordTypeId = '0121N0000017tnbQAA'; //Dependent_Question_Condition
        insert condition;
        //Inserting Condition
        Condition__c conditionObj = new Condition__c();
        conditionObj.SubTab__c = subTabId;
        conditionObj.Tab__c = tabId;
        conditionObj.Dependent_Question__c = questionObj.Id;
        conditionObj.Question__c = questionId;
        conditionObj.RecordTypeId = '0121N00000188DxQAI'; //Dependent_Tab_Condition
        insert conditionObj;
        
        //Inserting Condition
        Condition__c conditionObj1 = new Condition__c();
        conditionObj1.SubTab__c = subTabId;
        conditionObj1.Tab__c = tabId;
        conditionObj1.Dependent_Question__c = questionObj.Id;
        conditionObj1.Question__c = questionId;
        conditionObj1.RecordTypeId = '0121N0000018LsGQAU'; //Dependent_Subtab_Condition
        insert conditionObj1;
        
        string dependentConditionId = condition.Id;
        Conditionlst.add(condition);
        Conditionlst.add(conditionObj);
        
        dynamicWizardAdmin.updatingDepQuestionAndDeletingDepCondition(dependenceType1,subTabId,dependentConditionId);
        dynamicWizardAdmin.updatingDepQuestionAndDeletingDepCondition(dependenceType2,subTabId,conditionObj.Id);
        dynamicWizardAdmin.updatingDepQuestionAndDeletingDepCondition(dependenceType3,subTabId,conditionObj1.Id);
        Test.stopTest(); 
    } 
    
    
    /*
Method Name : updatingDependentConditionSequenceAfterDeleteTest
comments    : This method is used to cover the code coverage for following methods, located in dynamicWizardAdmin class.
Methods covered : updatingDependentConditionSequenceAfterDelete
*/ 
    public static testmethod void updatingDependentConditionSequenceAfterDeleteTest(){
        Test.startTest();
        
        RecordType deptab = [select id,name from RecordType where name = 'Dependent_Tab_Condition'];
        RecordType depsubTab = [select id,name from RecordType where name = 'Dependent_Subtab_Condition'];
        RecordType depquestion = [select id,name from RecordType where name = 'Dependent_Question_Condition'];
        RecordType tab = [select id,name from RecordType where name = 'Tab'];
        RecordType subTab = [select id,name from RecordType where name = 'SubTab'];
        
        
        string dependenceType1 = 'question';
        string dependenceType2 = 'subtab';
        string dependenceType3 = 'tab';
        string conditionColumn = '1 AND 2 OR 3';
        
        //Inserting Question
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        questionObj.Field_Type__c ='PICKLIST';
        questionObj.Values__c = 'contact,network';
        questionObj.Conditional_Column__c = '1 AND 2';
        insert questionObj;
        
        //Inserting tab
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        tabObj.RecordTypeId = tab.Id;
        insert tabObj;
        
        //Inserting Condition
        Condition__c tabcondition = new Condition__c();
        tabcondition.Tab__c = tabObj.Id;
        tabcondition.Dependent_Question__c = questionObj.Id;
        tabcondition.Sequence__c = 1;
        tabcondition.Type__c = 'Show or Hide';
        tabcondition.Conditional_Logic__c = 'AND';
        tabcondition.RecordTypeId = deptab.Id;
        insert tabcondition;
        
        Condition__c tabconditionObj = new Condition__c();
        tabconditionObj.Tab__c = tabObj.Id;
        tabconditionObj.Dependent_Question__c = questionObj.Id;
        tabconditionObj.Sequence__c = 2;
        tabconditionObj.Type__c = 'preDefault';
        tabconditionObj.Conditional_Logic__c = '';
        tabconditionObj.RecordTypeId = deptab.Id;
        insert tabconditionObj;
        
        //Inserting subtab
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'project Information';
        subTabObj.Tabs__c = tabObj.Id;
        subTabObj.RecordTypeId = subTab.Id;
        insert subTabObj;
        string subTabId = subTabObj.Id;
        
        
        //Inserting Condition
        Condition__c condition = new Condition__c();
        condition.SubTab__c = subTabId;
        condition.Dependent_Question__c = questionObj.Id;
        condition.Sequence__c = 1;
        condition.Type__c = 'Show or Hide';
        condition.Conditional_Logic__c = 'AND';
        condition.RecordTypeId = depsubTab.Id;
        insert condition;
        
        Condition__c conditionObj = new Condition__c();
        conditionObj.SubTab__c = subTabId;
        conditionObj.Dependent_Question__c = questionObj.Id;
        conditionObj.Sequence__c = 2;
        conditionObj.Type__c = 'Show or Hide';
        conditionObj.Conditional_Logic__c = '';
        conditionObj.RecordTypeId = depsubTab.Id;
        insert conditionObj;
        
        
        dynamicWizardAdmin.updatingDependentConditionSequenceAfterDelete(dependenceType1,subTabId);
        dynamicWizardAdmin.updatingDependentConditionSequenceAfterDelete(dependenceType2,subTabId);
        dynamicWizardAdmin.updatingDependentConditionSequenceAfterDelete(dependenceType3,tabObj.Id);
        //dynamicWizardAdmin.updatingDepConditionLogicForParentQuestionAfterDelete(dependenceType1,questionObj.Id,Conditionlst);
        Test.stopTest(); 
    }
    
    /*
Method Name : updatingDepConditionLogicForParentQuestionAfterDeleteTest
comments    : This method is used to cover the code coverage for following methods, located in dynamicWizardAdmin class.
Methods covered : updatingDepConditionLogicForParentQuestionAfterDelete
*/ 
    public static testmethod void updatingDepConditionLogicForParentQuestionAfterDeleteTest(){
        Test.startTest();
        RecordType template = [select id,name from RecordType where name = 'Template'];
        RecordType tab = [select id,name from RecordType where name = 'Tab'];
        RecordType subTab = [select id,name from RecordType where name = 'Dependent_Subtab_Condition'];
        
        string dependenceType1 = 'question';
        string dependenceType2 = 'subtab';
        string dependenceType3 = 'tab';
        string conditionColumn = '1 AND 2 OR 3';
        list<Condition__c> Conditionlst = new list<Condition__c>();
        //Inserting subtab
        WizardHeader__c wizradHeader = new WizardHeader__c();
        wizradHeader.SubTab__c = 'Project Information';
        //wizradHeader.RecordTypeId = subTab.id;
        insert wizradHeader;
        string subTabId = wizradHeader.Id;
        
        //Inserting Question
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        questionObj.Field_Type__c ='PICKLIST';
        questionObj.Values__c = 'contact,network';
        questionObj.Conditional_Column__c = '1 AND 2';
        insert questionObj;
        //Inserting Condition
        Condition__c condition = new Condition__c();
        condition.SubTab__c = subTabId;
        condition.Dependent_Question__c = questionObj.Id;
        condition.Sequence__c = 1;
        condition.Type__c = 'Show or Hide';
        condition.Conditional_Logic__c = 'AND';
        insert condition;
        
        Condition__c conditionObj = new Condition__c();
        condition.SubTab__c = subTabId;
        condition.Dependent_Question__c = questionObj.Id;
        condition.Sequence__c = 2;
        condition.Type__c = 'preDefault';
        condition.Conditional_Logic__c = '';
        insert conditionObj;
        Conditionlst.add(condition);
        Conditionlst.add(conditionObj);
        
        // dynamicWizardAdmin.updatingDependentConditionSequenceAfterDelete(dependenceType1,subTabId);
        // dynamicWizardAdmin.updatingDependentConditionSequenceAfterDelete(dependenceType2,subTabId);
        // dynamicWizardAdmin.updatingDependentConditionSequenceAfterDelete(dependenceType3,subTabId);
        dynamicWizardAdmin.updatingDepConditionLogicForParentQuestionAfterDelete(dependenceType1,questionObj.Id,Conditionlst);
        Test.stopTest(); 
    }
    
    /*
Method Name : deleteDependentConditionTest
comments    : This method is used to cover the code coverage for following methods, located in dynamicWizardAdmin class.
Methods covered : deleteDependentCondition
*/ 
    public static testmethod void deleteDependentConditionTest(){ 
        Test.startTest();
        WizardHeader__c wizradHeader = new WizardHeader__c();
        wizradHeader.SubTab__c = 'Project Information';
        insert wizradHeader;
        
        Condition__c condition = new Condition__c();
        condition.SubTab__c = wizradHeader.Id;
        insert condition;
        
        dynamicWizardAdmin.deleteDependentCondition(condition.Id);
        Test.stopTest();
    } 
    
    /*
Method Name : deleteTemplateDetailsTest
comments    : This method is used for cover the test class code coverage for deleteTemplateDetails method in dynamicWizardAdmin class
*/ 
    static testMethod  void deleteTemplateDetailsTest(){
        Test.startTest();
        WizardHeader__c templateObj = new WizardHeader__c();
        templateObj.Template_Name__c = 'Dynamic Wizard';
        insert templateObj;
        
        Boolean  deleteTemplate = dynamicWizardAdmin.deleteTemplateDetails(templateObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, deleteTemplate);
    }
    /*
Method Name : getsObjectRelatedChildObjectsTest
comments    : This method is used for cover the test class code coverage for getsObjectRelatedChildObjects method in dynamicWizardAdmin class
*/ 
    static testMethod  void getsObjectRelatedChildObjectsTest(){
        Test.startTest();
        dynamicWizardAdmin.getsObjectRelatedChildObjects('Account');
        dynamicWizardAdmin.getSobjectChildParentWrapper('Account');
        Test.stopTest();
        
    }
    
    /*
Method Name :getSobjectChildWrapperClassTest
comments    : This method is used for cover the test class code coverage for getSobjectChildWrapperClass class 
*/ 
    static testMethod  void getSobjectChildWrapperClassTest(){
        string label = 'a';
        string name = 'b';
        getSobjectChildWrapper sObj = new getSobjectChildWrapper(label, name);
    }
        /*
Method Name : getSobjectRelatedParentLookUpTest
comments    : This method is used for cover the test class code coverage for getSobjectRelatedParentLookUp method in dynamicWizardAdmin class
*/ 
    static testMethod  void getSobjectRelatedParentLookUpTest(){
        Test.startTest();
        dynamicWizardAdmin.getSobjectRelatedParentLookUp('Account');
        dynamicWizardAdmin.getSobjectRelatedParentLookUp('Account');
        Test.stopTest();
        
    }
       /*
Method Name :getSobjectRelatedParentLookUpTest1
comments    : This method is used for cover the test class code coverage for getSobjectRelatedParentLookUp class 
*/ 
    static testMethod  void getSobjectRelatedParentLookUpTest1(){
        string label = 'a';
        string name = 'b';
        getSobjectRelatedParentLookUp sObj = new getSobjectRelatedParentLookUp(label, name);
    }
    
    /*
Method Name :getsobjectFieldWrapperTest
comments    : This method is used for cover the test class code coverage for getsobjectFieldWrapper and getSobjectWrapper classes
*/ 
    static testMethod  void getsobjectFieldWrapperTest(){
        string label = 'a';
        string name = 'b';
   }
    
    /*
Method Name :getParentDepQuestionFilteringValuesTest
comments    : This method is used for cover the test class code coverage for getParentDepQuestionFilteringValues method in dynamicWizardAdmin class
*/ 
    static testMethod  void getParentDepQuestionFilteringValuesTest(){
        Test.startTest();
        //Inserting Question
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        questionObj.Values__c = 'open,close';
        questionObj.Field_Type__c = 'PICKLIST';
        insert questionObj; 
        dynamicWizardAdmin.getParentDepQuestionFilteringValues(questionObj.Id);
        Test.stopTest();
        //System.assertNotEquals(null, getQuestionDetails);
    }
  /*
Method Name : getAllProfileValuesTest
comments    : This method is used for cover the test class code coverage for getAllProfileValues method in dynamicWizardAdmin class
*/ 
    static testMethod  void getAllProfileValuesTest(){
        Test.startTest();
        dynamicWizardAdmin.getAllProfileValues();
        Test.stopTest();
    }   
    /*
Method Name : insertCloneSubtabsTest
comments    : This method is used for cover the test class code coverage for insertCloneSubtabsTest method in dynamicWizardAdmin class
*/ 
    static testMethod  void insertCloneSubtabsTest(){
        Test.startTest();
        
        //Inserting Tab
        WizardHeader__c tabObj = new WizardHeader__c();
        tabObj.Tab_Name__c = 'Deal Information';
        insert tabObj;
        
        //Insertimg SubTab
        WizardHeader__c subTabObj = new WizardHeader__c();
        subTabObj.SubTab__c = 'Project Information';
        insert subTabObj;
        list<String> subtabsList = new  list<String>();
        subtabsList.add(subTabObj.Id);
        //Inserting Question
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        insert questionObj; 
        list<String> questionList = new  list<String>();
        questionList.add(questionObj.Id);
        dynamicWizardAdmin.insertCloneSubtabs(tabObj.Id,subtabsList);
        Test.stopTest();
    }
    /*
Method Name : deleteQuestionRelatedProfileTest
comments    : This method is used for cover the test class code coverage for deleteQuestionRelatedProfile method in dynamicWizardAdmin class
*/ 
    static testMethod  void deleteQuestionRelatedProfileTest(){
        Test.startTest();
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        insert questionObj; 
        dynamicWizardAdmin.deleteQuestionRelatedProfile(questionObj.Id);
        Test.stopTest();
    }
    /*
Method Name : getQuestionRelatedProfilesTest
comments    : This method is used for cover the test class code coverage for getQuestionRelatedProfiles method in dynamicWizardAdmin class
*/ 
    static testMethod  void getQuestionRelatedProfilesTest(){
        Test.startTest();
        Question__c questionObj = new Question__c();
        questionObj.Question_Label__c = 'Negotiation Type';
        insert questionObj; 
        dynamicWizardAdmin.getQuestionRelatedProfiles(questionObj.Id);
        Test.stopTest();
    } 
}