public class dynamicWizardAdmin {
    /*
Method Name : getTemplates
Return type :templateList
comments    : For dispaying all templates
*/ 
    @AuraEnabled
    public static List<WizardHeader__c> getTemplates() 
    {
        system.debug('Inside getTemplates - Start');
        List<WizardHeader__c> templateList = new List<WizardHeader__c>();
        try{
            templateList = [SELECT Id,Template_Name__c,tabOrientation__c,Template_Description__c,Expiry_DateFormula__c,Object_Name__c,Object_API_Name__c
                            FROM WizardHeader__c where Active__c=true];
            system.debug('templateList'+templateList);
            system.debug('Inside getTemplates - End');
        }
        catch(Exception e){
            system.debug('getTemplates error'+e.getMessage());
        }
        return templateList;
    }
    
    /*
Method Name : getTempleteDetails
Parameters  : templateId
Return type : Template
comments    : For dispaying all template details based on template id
*/ 
    @AuraEnabled
    public static WizardHeader__c getTempleteDetails(string templateId)
    {
        system.debug('Inside getTempleteDetails - Start');
        WizardHeader__c templateObj = new WizardHeader__c();
        try{
            templateObj = [SELECT id,Template_Name__c,Expiry_Date__c,Object_Name__c,Object_API_Name__c,
                         Template_Description__c,Active__c,RecordTypeId,tabOrientation__c FROM WizardHeader__c where Id =:templateId];
            system.debug('templateObj>>>>>'+templateObj);
            system.debug('Inside getTempleteDetails - End');
        }
        catch(Exception e){
            system.debug('getTempleteDetails error'+e.getMessage());
        }
        return templateObj;
    }
    
    /*
Method Name : templateExist
Parameters  : templateObj
Return type : templateObj
comments    : For validation before insert or update record
*/ 
    @AuraEnabled
    public static Boolean templateExist(WizardHeader__c templateObj){
        boolean templateExist = false;
        system.debug('templateExist - Start');
        system.debug('templateObj>>>>>>>>'+templateObj);
        try{
            WizardHeader__c[] existingTemplate = [select Id,Template_Name__c from WizardHeader__c where Template_Name__c = :templateObj.Template_Name__c and RecordType.Name ='Template'];
            system.debug('existingTemplate'+existingTemplate);  
            if(existingTemplate != null && existingTemplate.size() > 0 && existingTemplate[0].Id != templateObj.Id){
                templateExist = true;
            }
            system.debug('templateExist - End');
        }
        catch(Exception e){
            system.debug('templateExist error'+e.getMessage());
        }
        return templateExist;                    
    }     
    /*
Method Name : insertUpdateTemplate
Parameters  : templateObj
Return type : templateObj
comments    : For insert and update record based on template id
*/ 
    @AuraEnabled
    public static Id insertUpdateTemplate(WizardHeader__c templateObj, string userChoice){
        system.debug('insertUpdateTemplate - Start');
        system.debug('userChoice'+userChoice);
        RecordType template = [select id,name from RecordType where name = 'Template'];
        try{            
            if(userChoice == 'CopyTemplate'){
                copyTemplate(templateObj);    
            }else if(userChoice == 'EditTemplate'){
                update templateObj;    
            }else if(userChoice == 'NewTemplate' || userChoice == ''){
                if(templateObj.Expiry_Date__c >= system.today()){
                    templateObj.Active__c = true; 
                    templateObj.RecordTypeId = template.Id;
                        }
                insert templateObj;                
                system.debug('templateObj - '+templateObj);    
            }
            
            system.debug('Inside insertUpdateTemplate - End');            
        }catch(Exception e){
            system.debug('insertUpdateTemplate error'+e.getMessage());
        }
        return templateObj.Id;        
    }    
    
    /*
Method Name : copyTemplate
Parameters  : templateObj
Return type : templateObj
comments    : For copying existingTemplate
*/   @AuraEnabled
    public static Id copyTemplate(WizardHeader__c templateObj){
        system.debug('copyTemplate - Start');  
        try{
            System.debug('CloneTemplateRecord::createRecord::templateObj'+templateObj);
            Id existingTemplateId = templateObj.Id;
            system.debug('existingTemplateId'+existingTemplateId);
            //Nullify Id for Insert
            templateObj.Id  = null;
            insert templateObj;
            
            Id cloneTemplateId = templateObj.Id;
            system.debug('cloneTemplateId'+cloneTemplateId);
            
            
            List<WizardHeader__c> cloneTabList = new List<WizardHeader__c>();
            List<WizardHeader__c> cloneSubTabList = new List<WizardHeader__c>();
            
            List<WizardHeader__c> tabList = [select id,Tab_Name__c,Sequence__c,Tabs_Template__c,RecordTypeId,Profile__c,ProfileId__c from WizardHeader__c where Template__c =: existingTemplateId and RecordType.Name ='Tab' order by Sequence__c asc];
            system.debug('tabList'+tabList);
            
            List<WizardHeader__c> subTabList = [SELECT Id,SubTab__c,Tabs__c,Subtabs_Tab__c,Sequence__c,Object_Name__c,Object_API_Name__c,
                                                Parent_Object_Name__c,Parent_Object_API_Name__c,Layout_Type__c,Profile__c,ProfileId__c,Reference_FieldApiName__c,Relationship__c,Org_Parent_Object_API_Name__c FROM WizardHeader__c where Tabs__c in : tabList order by Sequence__c asc];
            
            
            List<Question__c> questionsList = [select id,Name,Tab_Name__c,Parent_Object_Name__c,Parent_Object_API_Name__c,Question_Label__c,Object_Name__c,Object_API_Name__c,Answer__c,Field_Name__c,Field_API_Name__c,Field_Type__c,Default_Value__c,
                                               Description__c,Values__c,SubTab1__c,SubTab1__r.SubTab__c,Sequence__c,Rows__c,Input_placeholder__c,Cols__c,IsMandatory__c,
                                               Higher_Value_Limit__c,Has_Condition__c,Lower_Value_Limit__c,Has_Default_Value__c,Input_Pattern__c,Has_Dependency__c,Decimal__c,
                                               Read_Only__c,Size__c,Object_API_Used_for_Lookup__c,Relationship__c,Org_Parent_Object_API_Name__c,Read_Record_Data__c,Help_Text__c,SelectLookupValues__c FROM Question__c where SubTab1__c  in :subTabList order by Sequence__c asc];
            
            system.debug('questionsList'+questionsList);
            
            for(WizardHeader__c tab : tabList){
                tab.Template__c=cloneTemplateId;
                tab.Id=null;
                cloneTabList.add(tab);
            }
            system.debug('cloneTabList'+cloneTabList);
            insert cloneTabList;
            
            
            for(WizardHeader__c cloneTabs:cloneTabList){
                for(WizardHeader__c subTab :subTabList) 
                {
                    if(cloneTabs.Tab_Name__c == subTab.Subtabs_Tab__c) {
                        subTab.Tabs__c = cloneTabs.Id;
                        subTab.id=null;
                        cloneSubTabList.add(subTab);
                    }
                }
            }
            system.debug('cloneSubTabList'+cloneSubTabList);
            insert cloneSubTabList;
            
            for(WizardHeader__c cloneSubTabs:cloneSubTabList){
                for(Question__c question :questionsList){
                    if(cloneSubTabs.SubTab__c == question.SubTab1__r.SubTab__c){
                        question.SubTab1__c = cloneSubTabs.Id;
                        question.Id=null;
                    }
                }
            }
            system.debug('questionsList'+questionsList);
            insert questionsList;
            
            system.debug('copyTemplate - End'); 
        }catch(Exception e){
            system.debug('copyTemplate error'+e.getMessage());
        }     
        return templateObj.Id;
    }
    /*
Method Name : getTabs
Parameters  : templateId
Return type : List of tabs
comments    : For dispaying all tabs related to template
*/ 
    @AuraEnabled
    public static List<WizardHeader__c> getTabs(string templateId){
        system.debug('Inside getTabs - Start');
        system.debug('templateId'+templateId);
        List<WizardHeader__c> tabList = new List<WizardHeader__c>(); 
        try{
            tabList = [select id,Tab_Name__c,Sequence__c,Tabs_Template__c,Profile__c,ProfileId__c from WizardHeader__c where Template__c =: templateId and RecordType.Name ='Tab' order by Sequence__c asc];
            system.debug('tabList..'+tabList);
            system.debug('Inside getTabs - End');
        }
        catch(Exception e){
            system.debug('getTabs error'+e.getMessage());
        }
        return tabList;
    }
    /*
Method Name : getTabDetails
Parameters  : tabId
Return type : List of tabs
comments    : For dispaying all tabs details releted to template
*/    
    @AuraEnabled
    public static WizardHeader__c getTabDetails(string tabId)
    {  
        system.debug('Inside getTabDetails - Start');
        system.debug('tabId>>>>>'+tabId);
        WizardHeader__c tabObj = new WizardHeader__c();
        try{
            tabObj = [SELECT id,Tab_Name__c,Template_Name__c,Help_Text__c,Conditional_Logic__c,Condition_Filter_Logic__c,Has_Condition__c,Profile__c,ProfileId__c FROM WizardHeader__c where Id = :tabId order by Sequence__c asc];
            system.debug('tabObj>>>>>'+tabObj);
            system.debug('Inside getTabDetails - End');
        }
        catch(Exception e){
            system.debug('getTabDetails error'+e.getMessage());
        }
        return tabObj;
    }
    
    /*
Method Name : tabExist
Parameters  : tabObj
Return type : tabObj
comments    : For validation before insert or update record
*/ 
    @AuraEnabled
    public static Boolean tabExist(string templateId,WizardHeader__c tabObj){
        boolean tabExist = false;
        system.debug('Inside tabExist - Start');
        try{
            WizardHeader__c[] existingTab = [select Id,Tab_Name__c from WizardHeader__c where Tab_Name__c=:tabObj.Tab_Name__c and Template__c=:templateId and RecordType.Name ='Tab'];
            system.debug('existingTab'+existingTab);  
            if(existingTab != null && existingTab.size() > 0 && existingTab[0].Id != tabObj.Id){//Tab exists
                tabExist = true;
                system.debug('tabExist'+tabExist);
            }
            system.debug('Inside tabExist - End');
        }
        catch(Exception e){
            system.debug('tabExist error'+e.getMessage());
        }
        return tabExist;                    
    }     
    /*
Method Name : insertUpdateTab
Parameters  : templateId,tabObj
Return type : tabObj
comments    : For insert and update record based on tab id
*/ 
    @AuraEnabled
    public static void insertUpdateTab(string templateId ,WizardHeader__c tabObj){
        system.debug('insertUpdateuTab - Start');
        System.debug('CreateTabRecord::createRecord::tabObj'+tabObj);
        RecordType tab = [select id,name from RecordType where name = 'Tab'];
        try{
            if(tabObj.Id != null ){
                update tabObj;
            }else{
                integer tabSequence = [SELECT COUNT() FROM WizardHeader__c where Template__c =:templateId and RecordType.Name ='Tab'];
                system.debug('tabSequence'+tabSequence);   
                tabObj.Sequence__c = tabSequence+ 1;
                tabObj.RecordTypeId = tab.Id;
                tabObj.Template__c = templateId;
                System.debug('CreateTabRecord::createRecord::tabObj'+tabObj); 
                insert tabObj; 
            }
            system.debug('Inside insertUpdateuTab - End'); 
        }
        catch(Exception e){
            system.debug('insertUpdateTab error'+e.getMessage());
        }
    } 
    /*
Method Name : deleteTabDetails
Parameters  : deletedRecordList
Return type : boolean
comments    : For delete record based on tab id
*/ 
    @AuraEnabled
    public static Boolean deleteTabDetails(string selectedDeletedTabId)
    {
        system.debug('Inside deleteTabDetails - Start');
        system.debug('selectedDeletedTabId>>>>>'+selectedDeletedTabId);
        boolean tabDeleteBoolean = false;
        try{
            List<WizardHeader__c> deletedTabList = new list<WizardHeader__c>();
            List<WizardHeader__c> deleteSubTabList = new list<WizardHeader__c>();
            List<Question__c> deleteQuestionList = new List<Question__c>();
            //Quering Tab
            WizardHeader__c tabId = [SELECT Id FROM WizardHeader__c WHERE Id =: selectedDeletedTabId];
            deletedTabList.add(tabId);
            
            //Quering Tab related subTabs
            list<WizardHeader__c> subTabList = [SELECT Id,SubTab__c,Subtabs_Tab__c,Sequence__c FROM WizardHeader__c  WHERE Tabs__c in: deletedTabList];
            system.debug('subTabList..'+subTabList);
            
            for(WizardHeader__c subtabObj : subTabList){
                deleteSubTabList.add(subtabObj);
            }
            
            //Quering subTabs related Questions
            List<Question__c> questionsList = [SELECT Id,Tab_Name__c,SubTab1__r.SubTab__c
                                               FROM Question__c where SubTab1__c  in :deleteSubTabList];
            system.debug('questionsList..'+questionsList);
            for(Question__c questionObj : questionsList){
                deleteQuestionList.add(questionObj);
            }
            
            system.debug('deletedTabList..'+deletedTabList);
            system.debug('deleteSubTabList..'+deleteSubTabList);
            system.debug('deleteQuestionList..'+deleteQuestionList);
            delete deletedTabList;
            delete deleteSubTabList;
            delete deleteQuestionList;
            
            if(deletedTabList.size() > 0)
                tabDeleteBoolean = true;  
            
            system.debug('Inside deleteTabDetails - End');
        }catch(Exception e){
            system.debug('deleteTabDetails error'+e.getMessage());
        }
        return tabDeleteBoolean;
    }
    /*
Method Name : updateTabSequence
Parameters  : tabList
Return type : updateTabSequence
comments    : After deleteing tab change the sequence and save it to db.
*/ 
    @AuraEnabled
    public static List<WizardHeader__c> updateTabSequence(List<WizardHeader__c> tabList){
        system.debug('Inside updateTabSequence - Start');
        system.debug('tabList>>>>>'+tabList);
        try{
            update tabList;
            system.debug('Inside updateTabSequence - End');
        }catch(Exception e){
            system.debug('updateTabSequence error'+e.getMessage());
        }
        return tabList;
    }
    /*
Method Name : getAllSubTabs
Parameters  : tabList
Return type : List of Subtabs
comments    : For dispaying all tabs related subTabs
*/ 
    @AuraEnabled
    public static List<WizardHeader__c> getAllSubTabs(List<WizardHeader__c> tabList){
        system.debug('Inside getAllSubTabs - Start');
        system.debug('tabList..'+tabList);
        List<WizardHeader__c> subTabList = new List<WizardHeader__c>();
        try{
            subTabList = [SELECT Id,SubTab__c,Tabs__c,Subtabs_Tab__c,Sequence__c,Object_Name__c,Object_API_Name__c,
                          Parent_Object_Name__c,Parent_Object_API_Name__c,Field_Name__c,Field_API_Name__c,Layout_Type__c,Profile__c,ProfileId__c,Reference_FieldApiName__c,Relationship__c,Org_Parent_Object_API_Name__c FROM WizardHeader__c where Tabs__c in : tabList  order by Sequence__c asc];
            system.debug('subTabList..'+subTabList);
            system.debug('Inside getSubTabs - End');
        }
        catch(Exception e){
            system.debug('getAllSubTabs error'+e.getMessage());
        }
        return subTabList;
    }
    
    
    /*
Method Name : getSubTabDetails
Parameters  : subTabId
Return type : List of subtabs
comments    : For dispaying all details of subtab based on Id
*/ 
    @AuraEnabled
    public static WizardHeader__c getSubTabDetails(string subTabId) 
    {
        system.debug('Inside editSubTabDetails - Start');
        system.debug('subTabId'+subTabId);
        WizardHeader__c subTabObj = new  WizardHeader__c();
        try{
            subTabObj = [SELECT Id,SubTab__c,Tabs__c,Help_Text__c,Conditional_Logic__c,Subtabs_Tab__c,Has_Condition__c,Condition_Filter_Logic__c,Form_Type__c,Parent_Object_Name__c,Parent_Object_API_Name__c,
                         Object_Name__c,Object_API_Name__c,Data_View__c,Field_Name__c,Field_API_Name__c,Filtering_Value__c,Layout_Type__c,Profile__c,ProfileId__c,Reference_FieldApiName__c,Relationship__c,Org_Parent_Object_API_Name__c FROM WizardHeader__c where id = :subTabId];
            system.debug('subTabObj'+subTabObj);
            system.debug('Inside editSubTabDetails - End');
        }
        catch(Exception e){
            system.debug('editSubTabDetails error'+e.getMessage());
        }
        return subTabObj;
    }      
    
    /*
Method Name : subtabExist
Parameters  : subTabObj
Return type : subTabObj
comments    : For validation before insert or update record
*/ 
    @AuraEnabled
    public static Boolean subtabExist(WizardHeader__c subTabObj){
        boolean subtabExist = false;
        system.debug('Inside subtabExist - Start');
        try{
            WizardHeader__c[] existingSubTab = [select Id,SubTab__c from WizardHeader__c where SubTab__c=:subTabObj.SubTab__c and Tabs__c=:subTabObj.Tabs__c];
            system.debug('after Select query');  
            if(existingSubTab != null && existingSubTab.size() > 0 && existingSubTab[0].Id != subTabObj.Id){//SubTab exists
                system.debug('existingTab Yes');            
                subtabExist = true;       
            }
            system.debug('Inside subtabExist - End');
        }
        catch(Exception e){
            system.debug('subtabExist error'+e.getMessage());
        }
        return subtabExist;                    
    }     
    /*
Method Name : insertUpdateSubTab
Parameters  :subTabObj,formType
Return type : subTabObj
comments    : For insert and update record based on subTab id
*/ 
    @AuraEnabled
    public static void insertUpdateSubTab(WizardHeader__c subTabObj){
        system.debug('insertUpdateSubTab - Start');
        system.debug('CreateTabRecord::createRecord::subTabObj'+subTabObj);
        RecordType SubTab = [select id,name from RecordType where name = 'SubTab'];
        try{
            if(subTabObj.Id != null){
                update subTabObj;
            }else {
                integer subtabSequence = [SELECT COUNT() FROM WizardHeader__c where Tabs__c=:subTabObj.Tabs__c and RecordType.Name ='SubTab'];
                system.debug('subtabSequence'+subtabSequence);   
                subTabObj.Sequence__c = subtabSequence+ 1;
                subTabObj.RecordTypeId = SubTab.Id;
                System.debug('CreateTabRecord::createRecord::subTabList'+subTabObj); 
                insert subTabObj; 
            }
            system.debug('Inside insertUpdateSubTab - End');
        }catch(Exception e){
            system.debug('insertUpdateSubTab error'+e.getMessage());
        }
    } 
    
    /*
Method Name : getSubTabRelatedQuestions
Parameters  : subTabList
Return type : List of Questions
comments    : For dispaying all questions based on subtabId
*/ 
    @AuraEnabled
    public static List<Question__c> getSubTabRelatedQuestions(List<WizardHeader__c> subTabList) 
    {
        system.debug('Inside getSubTabRelatedQuestions - Start');
        system.debug('subTabList..'+subTabList);
        List<Question__c> questionsList;
        try{
           questionsList = [SELECT Id,Tab_Name__c,SubTab1__r.SubTab__c,Question_Label__c,Sequence__c,SelectLookupValues__c
                             FROM Question__c where SubTab1__c  in :subTabList order by Sequence__c asc];
            system.debug('questionsList'+questionsList);
            system.debug('Inside getSubTabRelatedQuestions - End');
        }catch(Exception e){
            system.debug('getSubTabRelatedQuestions error'+e.getMessage());
        }
        return questionsList;
    }
 
    /*
Method Name : getAllQuestionsRelatedToTab
Parameters  : tabId
Return type : List of Question
comments    : For dispaying all questions
*/ 
    @AuraEnabled
    public static List<Question__c> getAllQuestionsRelatedToTab(string tabId) 
    {
        system.debug('Inside getAllQuestionsRelatedToTab - Start');
        system.debug('tabId..'+tabId);
        
        List<Question__c> questionsList = new List<Question__c>();
        try{
            List<WizardHeader__c> subTabList = [ SELECT Id,SubTab__c,Subtabs_Tab__c,Sequence__c
                                                FROM WizardHeader__c where Tabs__c = :tabId order by Sequence__c asc];
            system.debug('subTabList..'+subTabList);
            
            if(subTabList != null && subTabList.size() > 0)
                questionsList = [SELECT Id,Tab_Name__c,SubTab1__r.SubTab__c,Question_Label__c,Sequence__c,SelectLookupValues__c
                                 FROM Question__c where SubTab1__c  in :subTabList order by Sequence__c asc];
            
            system.debug('questionsList'+questionsList);
            system.debug('Inside getAllQuestionsRelatedToTab - End');
        }
        catch(Exception e){
            system.debug('getAllQuestionsRelatedToTab error'+e.getMessage());
        }
        return questionsList;
    }
    
    /*
Method Name : getTabRelatedSubtabs
Parameters  : tabId
Return type : List of Subtabs
comments    : For dispaying all questions
*/ 
    @AuraEnabled
    public static List<WizardHeader__c> getTabRelatedSubtabs(string tabId) 
    {
        system.debug('Inside getTabRelatedSubtabs - Start');
        system.debug('tabId..'+tabId);
        List<WizardHeader__c> subTabList = new List<WizardHeader__c>();
        try{
            subTabList = [ SELECT Id,SubTab__c,Subtabs_Tab__c,Profile__c,Sequence__c
                        FROM WizardHeader__c where Tabs__c = :tabId order by Sequence__c asc];
            system.debug('subTabList..'+subTabList);
            system.debug('Inside getTabRelatedSubtabs - End');
        }catch(Exception e){
            system.debug('getTabRelatedSubtabs error'+e.getMessage());
        }
        return subTabList;
    }
    /*
Method Name : getSubTabsRelatedQuestions
Parameters  : subTabList
Return type : List of Questions
comments    : For dispaying all questions based on subtabId
*/ 
    @AuraEnabled
    public static List<Question__c> getSubTabsRelatedQuestions(string subTabId) 
    {
        system.debug('Inside getSubTabsRelatedQuestions - Start');
        system.debug('subTabId..'+subTabId);
        List<Question__c> questionsList = new List<Question__c>();
        try{
           questionsList = [SELECT Id,Tab_Name__c,SubTab1__r.SubTab__c,Question_Label__c,Sequence__c,Field_Type__c,Object_Name__c,Relationship__c,Org_Parent_Object_API_Name__c,Read_Record_Data__c,SelectLookupValues__c
                             FROM Question__c where SubTab1__c  =:subTabId order by Sequence__c asc];
            system.debug('questionsList'+questionsList);
            system.debug('Inside getSubTabRelatedQuestions - End');
        }
        catch(Exception e){
            system.debug('getSubTabRelatedQuestions error'+e.getMessage());
        }
        return questionsList;
    }   
    /*
Method Name : getQuestionDetails
Parameters  : questionId
Return type : Question
comments    : For dispaying related details about question
*/ 
    @AuraEnabled
    public static Question__c getQuestionDetails(string questionId) 
    {
        system.debug('Inside editQuestionDetails - Start');
        system.debug('questionId'+questionId);
        Question__c questionObj = new  Question__c();
        try{
            questionObj = [select id,Name,Parent_Object_Name__c,Conditional_Column__c,Parent_Object_API_Name__c,Question_Label__c,Object_Name__c,Object_API_Name__c,Answer__c,Field_Name__c,Field_API_Name__c,Field_Type__c,Default_Value__c,
                           Description__c,Values__c,SubTab1__c,SubTab1__r.SubTab__c,Sequence__c,Rows__c,Input_placeholder__c,Cols__c,IsMandatory__c,
                           Higher_Value_Limit__c,Has_Condition__c,Lower_Value_Limit__c,Has_Default_Value__c,Input_Pattern__c,Has_Dependency__c,Decimal__c,
                           Read_Only__c,Size__c,Relationship__c,Org_Parent_Object_API_Name__c,Read_Record_Data__c,Help_Text__c,SelectLookupValues__c FROM Question__c where id =: questionId];
            system.debug('questionObj'+questionObj);
            system.debug('Inside editQuestionDetails - End');
        }catch(Exception e){
            system.debug('editQuestionDetails error'+e.getMessage());
        }
        return questionObj;
    }
    /*
Method Name : insertUpdateQuestions
Parameters  : questionObj
Return type : Question
comments    : For Inserting and Updating question records
*/ 
    @AuraEnabled
    public static void insertUpdateQuestions(Question__c questionObj){
        system.debug('Inside insertUpdateQuestions - Start');
        
        system.debug('CreateQuestionRecord::createRecord::questionObj'+questionObj);
        try{                                    
            if(questionObj.Id != null){
                update questionObj;
            }else{
                integer questionSequence = [SELECT COUNT()
                                            FROM Question__c where SubTab1__c =:questionObj.SubTab1__c];
                system.debug('questionSequence'+questionSequence);   
                questionObj.Sequence__c = questionSequence+1;                
                System.debug('CreateQuestionRecord::createRecord::questionObj'+questionObj);
                insert questionObj; 
            }
            system.debug('Inside insertUpdateQuestions - End');
        }
        catch(Exception e){
            system.debug('insertUpdateQuestions error'+e.getMessage());
        }
    }
    /*
Method Name : deleteSubTabDetails
Parameters  : selectedDeletedSubTabId
Return type : boolean
comments    : For delete record based on subTab id
*/ 
    @AuraEnabled
    public static Boolean deleteSubTabDetails(string selectedDeletedSubTabId)
    {
        system.debug('Inside deleteSubTabDetails - Start');
        system.debug('selectedDeletedSubTabId>>>>>'+selectedDeletedSubTabId);
        boolean subtabDeleteBoolean = false;
        
        try{
            list<WizardHeader__c> deleteSubTabList = new list<WizardHeader__c>();
            List<Question__c> deleteQuestionList = new List<Question__c>();
            WizardHeader__c subTabId = [SELECT Id FROM WizardHeader__c WHERE Id =: selectedDeletedSubTabId];
            deleteSubTabList.add(subTabId);
            
            //Quering subTabs related Questions
            List<Question__c> questionsList = [SELECT Id,Tab_Name__c,SubTab1__r.SubTab__c
                                               FROM Question__c where SubTab1__c  in :deleteSubTabList];
            system.debug('questionsList..'+questionsList);
            for(Question__c questionObj : questionsList){
                deleteQuestionList.add(questionObj);
            }
            system.debug('deleteSubTabList>>>>>'+deleteSubTabList);
            system.debug('deleteQuestionList>>>>>'+deleteQuestionList);

            delete deleteSubTabList;
            delete deleteQuestionList;
            if(deleteSubTabList.size() > 0)
                subtabDeleteBoolean = true;              
            system.debug('Inside deleteSubTabDetails - End');
        }catch(Exception e){
            system.debug('deleteSubTabDetails error'+e.getMessage());
        }
        return subtabDeleteBoolean;
    }
     /*
Method Name : updateSubTabSequence
Parameters  : subTabList
Return type : updateSubTabSequence
comments    : After deleteing tab change the sequence and save it to db.
*/ 
    @AuraEnabled
    public static List<WizardHeader__c> updateSubTabSequence(List<WizardHeader__c> subTabList){
        system.debug('Inside updateSubTabSequence - Start');
        system.debug('subTabList>>>>>'+subTabList);
        try{
            update subTabList;
            system.debug('Inside updateSubTabSequence - End');
        }catch(Exception e){
            system.debug('updateSubTabSequence error'+e.getMessage());
        }
        return subTabList;
    }
     /*
Method Name : deleteQuestionDetails
Parameters  : selectedDeletedQuestionId
Return type : boolean
comments    : For delete record based on subTab id
*/ 
    @AuraEnabled
    public static Boolean deleteQuestionDetails(string selectedDeletedQuestionId,string selectedQuestionRelatedSubTabId)
    {
        system.debug('Inside deleteQuestionDetails - Start');
        system.debug('selectedDeletedQuestionId>>>>>'+selectedDeletedQuestionId);
        system.debug('selectedQuestionRelatedSubTabId>>>>>'+selectedQuestionRelatedSubTabId);
        
        boolean questionDeleteBoolean = false;
        try{
            List<Question__c> questionDelete = [SELECT Id,SubTab1__c FROM Question__c WHERE Id =: selectedDeletedQuestionId and SubTab1__c =:selectedQuestionRelatedSubTabId];
            system.debug('questionDelete>>>>>'+questionDelete);
            delete questionDelete;
    
            if(questionDelete.size() > 0)
                questionDeleteBoolean = true;  
            
            system.debug('Inside deleteQuestionDetails - End');
        }
        catch(Exception e){
            system.debug('deleteQuestionDetails error'+e.getMessage());
        }
        return questionDeleteBoolean;
    }
    /*
Method Name : updateQuestionSequence
Parameters  : tabList
Return type : updateSubTabSequence
comments    : After deleting question change the sequence and save it to db.
*/ 
    @AuraEnabled
    public static List<Question__c> updateQuestionSequence(List<Question__c> questionsList){
        system.debug('Inside updateQuestionSequence - Start');
        system.debug('questionsList>>>>>'+questionsList);
        try{
            update questionsList;
            system.debug('Inside updateQuestionSequence - End');
        }catch(Exception e){
            system.debug('updateQuestionSequence error'+e.getMessage());
        }
        return questionsList;
    }
    /*
Method Name : getAllObjectNames
Parameters  : null
Return type : List
comments    : For getting dynimically all Sobject Labels
*/ 
    @AuraEnabled
    public static List<getSfObjectsList>  getAllSfObjectNames()
    {
        system.debug('Inside getAllObjectNames - Start');
        list<getSfObjectsList> sObjectList = new list<getSfObjectsList>();
        try{
            for ( Schema.SObjectType o : Schema.getGlobalDescribe().values() )
            {
                Schema.DescribeSObjectResult objResult = o.getDescribe();
                string name = objResult.getName();
                string label = objResult.getLabel();
                sObjectList.add(new getSfObjectsList(label,name));
                sObjectList.sort();
            }
            system.debug('Sobject details..'+sObjectList);
            system.debug('Inside getAllObjectNames - End');
        }catch(Exception e){
            system.debug('getAllSfObjectNames error'+e.getMessage());
        }
        return sObjectList;  
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
Method Name : getsObjectFieldsType
Parameters  : null
Return type : type
comments    : For getting dynimically selected field type
*/ 
    @AuraEnabled
    public static string getsObjectFieldsType(string selctedObjectValue,string selectedFieldValue){
        system.debug('Inside getsObjectFieldsType - Start');
        system.debug('selectedFieldValue'+selectedFieldValue);
        Map<String,Schema.SObjectType> getsObject = Schema.getGlobalDescribe(); 
        Schema.SObjectType sobjType = getsObject.get(selctedObjectValue);
        system.debug('sobjType'+sobjType);
        Schema.DescribeSObjectResult describeResult = sobjType.getDescribe();
        system.debug('describeResult'+describeResult);
        Map<String, Schema.SObjectField> objFieldMap;
        string FldType1;
        try{
            objFieldMap= describeResult.fields.getMap();
            Schema.SObjectField field = objFieldMap.get(selectedFieldValue);
            system.debug('field'+field);
            Schema.DisplayType FldType = field.getDescribe().getType();
            system.debug('FldType'+FldType);
            FldType1=string.valueOf(FldType);
            system.debug('Inside getsObjectFieldsType - End');
        }catch(Exception e){
            system.debug('getsObjectFieldsType error'+e.getMessage());
        }
        return FldType1;
    }
    
    
    /*
Method Name : getSelectedFieldPropertyValues
Parameters  : selctedChildObjectValue,selectedFieldValue
Return type : saveAsDraftMap
comments    : For getting dynimically selected field type properties
*/
    @AuraEnabled
    public static  Map <string,object> getSelectedFieldPropertyValues(string selctedObjectValue,string selectedFieldValue){
        system.debug('Inside getSelectedFieldPropertyValues - Start');
        system.debug('selctedObjectValue'+selctedObjectValue);
        system.debug('selectedFieldValue'+selectedFieldValue);
        Map<String,Schema.SObjectType> getsObject = Schema.getGlobalDescribe();
        Schema.SObjectType sobjType = getsObject.get(selctedObjectValue);
        system.debug('sobjType-->'+sobjType);
        Schema.DescribeSObjectResult describeResult = sobjType.getDescribe();
        system.debug('describeResult-->'+describeResult);
        Map <string,object> saveAsDraftMap = new Map <string,object>();
        Map<String, Schema.SObjectField> objFieldMap;
        try{
            objFieldMap= describeResult.fields.getMap();
            Schema.SObjectField field = objFieldMap.get(selectedFieldValue);
            system.debug('field-->'+field);
            Schema.DisplayType FldType = field.getDescribe().getType();
            system.debug('FldType'+FldType);
            String s = JSON.serialize(field.getDescribe());
            System.debug(s);
            saveAsDraftMap = (Map <string,object>)JSON.deserializeUntyped(s);
            system.debug('***'+saveAsDraftMap);
            system.debug('Inside getSelectedFieldPropertyValues - End');
        }
        catch(Exception e){
            system.debug('getSelectedFieldPropertyValues error'+e.getMessage());
        }
        return saveAsDraftMap;
    }
    
    /*
Method Name : insertCloneQuestions
Parameters  : questionObj
Return type : Question
comments    : For Inserting clone question records
*/ 
    @AuraEnabled
    public static void insertCloneQuestions(string selectedSubTabId,List<string> listQuestionIds){
        system.debug('Inside insertCloneQuestions - Start');
        system.debug('selectedSubTabId>>>>>>>>'+selectedSubTabId);
        system.debug('listQuestionIds>>>>>>>>'+listQuestionIds);
        List<Question__c> questionsList = [select id,Name,Tab_Name__c,Parent_Object_Name__c,Parent_Object_API_Name__c,Question_Label__c,Object_Name__c,Object_API_Name__c,Answer__c,Field_Name__c,Field_API_Name__c,Field_Type__c,Default_Value__c,
                                           Description__c,Values__c,SubTab1__c,SubTab1__r.SubTab__c,Sequence__c,Rows__c,Input_placeholder__c,Cols__c,IsMandatory__c,
                                           Higher_Value_Limit__c,Has_Condition__c,Lower_Value_Limit__c,Has_Default_Value__c,Input_Pattern__c,Has_Dependency__c,Decimal__c,
                                           Read_Only__c,Size__c,Object_API_Used_for_Lookup__c,Help_Text__c FROM Question__c where id  in :listQuestionIds order by Sequence__c asc];
        system.debug('questionsList'+questionsList);
        try{
            integer questionSequenceCount = [SELECT COUNT() FROM Question__c where SubTab1__c =:selectedSubTabId];
            system.debug('questionSequenceCount'+questionSequenceCount);
            questionSequenceCount++;
            for(Question__c question : questionsList){
                question.Id = null;
                question.SubTab1__c = selectedSubTabId;
                question.Sequence__c = questionSequenceCount;
                questionSequenceCount++;
            }
            system.debug('questionsList'+questionsList); 
            system.debug('Inside insertCloneQuestions - End'); 
        }
        catch(Exception e){
            system.debug('insertCloneQuestions error'+e.getMessage());
        }
        insert questionsList;
    }

    /*
Method Name : getAllPicklistValues
Parameters  : questionId
Return type : List of Question
comments    : For dispaying all questions related picklistvalues
*/ 
    @AuraEnabled
    public static List<String> getAllPicklistValues(string questionId) 
    {
        system.debug('Inside getAllPicklistValues - Start');
        system.debug('questionId..'+questionId);
        List<Question__c> lstQuestions = new List<Question__c>();
        List<string> srtPicklistvalue=new List<string>();
        
        lstQuestions = [SELECT Id,Values__c
                        FROM Question__c where id =:questionId];
        
        for(Question__c picklistvalue:lstQuestions){
            system.debug('picklistvalue'+picklistvalue.Values__c);
            srtPicklistvalue = picklistvalue.Values__c.split(',');
            
        }
        system.debug('srtPicklistvalue'+srtPicklistvalue);
        for(string pickListValues: srtPicklistvalue){
            system.debug('pickListValues'+pickListValues);
        }
        system.debug('lstQuestions'+lstQuestions);
        system.debug('Inside getAllPicklistValues - End');
        return srtPicklistvalue;       
    }


    /*
Method Name : getDependentQuestionPicklistValues
Parameters  : questionId
Return type : List of Question
comments    : For dispaying all depenentquestions related picklistvalues
*/ 
    @AuraEnabled
    public static List<String> getDependentQuestionPicklistValues(string conditionalQuestionId) 
    {
        system.debug('Inside getDependentQuestionPicklistValues - Start');
        system.debug('conditionalQuestionId..'+conditionalQuestionId);
        List<Question__c> lstQuestions = new List<Question__c>();
        List<string> srtPicklistvalue=new List<string>();
        lstQuestions = [SELECT Id,Values__c
                        FROM Question__c where id =:conditionalQuestionId];   
        for(Question__c picklistvalue:lstQuestions){
            system.debug('picklistvalue'+picklistvalue.Values__c);
            srtPicklistvalue = picklistvalue.Values__c.split(',');
            
        }
        system.debug('srtPicklistvalue'+srtPicklistvalue);
        for(string pickListValues: srtPicklistvalue){
            system.debug('pickListValues'+pickListValues);
        }
        system.debug('lstQuestions'+lstQuestions);
        system.debug('Inside getDependentQuestionPicklistValues - End');
        return srtPicklistvalue;        
    }
 
      /*
Method Name : tabSequenceSort
Parameters  :templateId,tabList 
Return type : 
comments    : while drag and drop we are updating the sequence
*/ 
    @AuraEnabled
    public static List<WizardHeader__c> tabSequenceSort(List<WizardHeader__c> tabList, string templateId){
        system.debug('Inside tabSequenceSort - Start');
        system.debug('tabList..'+tabList);
        system.debug('templateId..'+templateId);
        List<WizardHeader__c>  updatedTabSequenceList =new List<WizardHeader__c> ();
        try{
            if(tabList.size() > 0){
                update tabList;
            }
            if(templateId != null && templateId != ''){
                updatedTabSequenceList = [select id,Tab_Name__c,Sequence__c,Tabs_Template__c from WizardHeader__c where Template__c =: templateId order by Sequence__c asc];
            }
            system.debug('Inside tabSequenceSort - End');
        }
        catch(Exception e){
            system.debug('tabSequenceSort error'+e.getMessage());
        }
        return updatedTabSequenceList;
    }
       /*
Method Name : subTabSequenceSort
Parameters  :tabList,subTabList 
Return type : 
comments    : while drag and drop we are updating the sequence
*/ 
    @AuraEnabled
    public static List<WizardHeader__c> subTabSequenceSort(List<WizardHeader__c> tabList, List<WizardHeader__c> subTabList){
        system.debug('Inside subTabSequenceSort - Start');
        system.debug('tabList..'+tabList);
        system.debug('subTabList..'+subTabList);
        List<WizardHeader__c>  updatedsubTabSequenceList =new List<WizardHeader__c> ();
        try{
            if(subTabList.size() > 0){
                update subTabList;
            }
            if(tabList.size() > 0){
                updatedsubTabSequenceList = [SELECT Id,SubTab__c,Subtabs_Tab__c,Sequence__c from WizardHeader__c where Tabs__c IN: tabList order by Sequence__c asc];
            }
            system.debug('Inside subTabSequenceSort - end');
        }
        catch(Exception e){
            system.debug('subTabSequenceSort error'+e.getMessage());
        }
        return updatedsubTabSequenceList;
    }    
   /*;
Method Name : questionSequenceSort
Parameters  :subTabid,questionList 
Return type : 
comments    :while drag and drop we are updating the sequence 
*/ 
    @AuraEnabled
    public static List<Question__c> questionSequenceSort(string subTabid,List<Question__c> questionList){
        system.debug('Inside questionSequenceSort - Start');
        system.debug('subTabid..'+subTabid);
        system.debug('questionList..'+questionList);
        List<Question__c>  updatedQuestionSequenceList = new List<Question__c> ();
        try{
            if(questionList.size() > 0){
                update questionList;
                
                updatedQuestionSequenceList = [SELECT Id,SubTab1__r.SubTab__c,Question_Label__c,Sequence__c
                                               FROM Question__c  where SubTab1__c =: subTabid order by Sequence__c asc];
            }
            system.debug('Inside questionSequenceSort - End');
        }
        catch(Exception e){
            system.debug('questionSequenceSort error'+e.getMessage());
        }
        return updatedQuestionSequenceList;
    }
    /*
Method Name : getAllPicklistValuesBasedOnType
Parameters  : questionId
Return type : List of Question
comments    : For dispaying all questions type related picklistvalues
*/ 
    @AuraEnabled
    public static List<String> getAllPicklistValuesBasedOnType(String selctedObjectValue,String selectedFieldValue){ 
        system.debug('Inside getAllPicklistValuesBasedOnType - Start');  
        system.debug('selctedObjectValue'+selctedObjectValue);
        system.debug('selectedFieldValue'+selectedFieldValue);
        List<String> lstPickvals=new List<String>();
        try{
            Schema.SObjectType targetType = Schema.getGlobalDescribe().get(selctedObjectValue);
            Sobject Object_name = targetType.newSObject();
            Schema.sObjectType sobject_type = Object_name.getSObjectType(); 
            Schema.DescribeSObjectResult sobject_describe = sobject_type.getDescribe(); 
            Map<String, Schema.SObjectField> field_map = sobject_describe.fields.getMap(); 
            List<Schema.PicklistEntry> pick_list_values = field_map.get(selectedFieldValue).getDescribe().getPickListValues();
            system.debug('pick_list_values'+pick_list_values);
            for (Schema.PicklistEntry a : pick_list_values) 
            { 
                lstPickvals.add(a.getValue());
                system.debug('lstPickvals'+lstPickvals);
            }
            system.debug('Inside getAllPicklistValuesBasedOnType - End');  
        }
        catch(Exception e){
            system.debug('getAllPicklistValuesBasedOnType error'+e.getMessage());
        }
        return lstPickvals;
    }
    
          /*
Method Name : getTabDependentConditions
Parameters  : tabId
Return type : conditionQuestionList related to tab
comments    : This method is used for displaying the conditions, related to tab in data table 
*/ 
    @AuraEnabled
    public static List<Condition__c> getTabDependentConditions(string tabId) 
    {
        system.debug('Inside getTabDependentConditions - Start');
        system.debug('tabId..'+tabId);
        List<Condition__c> conditionQuestionList = [select id,Question_Name__c,Label__c,Dependent_Question__c,Tab__c,Type__c,Sequence__c,Dependent_Question_Name__c,Tab__r.Conditional_Logic__c,Conditional_Operaor__c,Condition_Value__c,Conditional_Logic__c FROM Condition__c where Tab__c  =:tabId AND RecordType.Name = 'Dependent_Tab_Condition' order by Sequence__c ASC];
        system.debug('conditionQuestionList'+conditionQuestionList);
        system.debug('Inside getTabDependentConditions - End');
        return conditionQuestionList;
        
    }
        /*
Method Name : getSubTabDependentConditions
Parameters  : subtabId
Return type : conditionQuestionList related to subtab
comments    : This method is used for displaying the conditions, related to subtab in data table 
*/ 
    @AuraEnabled
    public static List<Condition__c> getSubTabDependentConditions(string subTabId) 
    {
        system.debug('Inside getSubTabDependentConditions - Start');
        system.debug('subTabId..'+subTabId);
        List<Condition__c> conditionQuestionList = [select id,Question_Name__c,Label__c,Dependent_Question__c,Dependent_Subtab__c,Tab__c,Type__c,SubTab__c,Sequence__c,Dependent_Question_Name__c,Conditional_Operaor__c,Condition_Value__c,SubTab__r.Conditional_Logic__c,Conditional_Logic__c FROM Condition__c where SubTab__c =: subTabId AND RecordType.Name = 'Dependent_Subtab_Condition' order by Sequence__c ASC];
        system.debug('conditionQuestionList'+conditionQuestionList);
        system.debug('Inside getSubTabDependentConditions - End');
        return conditionQuestionList;
        
    }
          /*
Method Name : getQuestionDependentConditions
Parameters  : questionId
Return type : conditionQuestionList related to question
comments    : This method is used for displaying the conditions, related to question in data table 
*/ 
    @AuraEnabled
    public static List<Condition__c> getQuestionDependentConditions(string questionId) 
    {
        system.debug('Inside getQuestionDependentConditions - Start');
        system.debug('questionId'+questionId);
        List<Condition__c> conditionQuestionList = [select id,Question_Name__c,Dependent_Question__c,Label__c,Type__c,Sequence__c,Question__r.Conditional_Column__c,Dependent_Question_Name__c,Conditional_Operaor__c,Condition_Value__c,Conditional_Logic__c FROM Condition__c where Question__c  =:questionId AND RecordType.Name = 'Dependent_Question_Condition' order by Sequence__c ASC];
        system.debug('conditionQuestionList'+conditionQuestionList);
        system.debug('Inside getQuestionDependentConditions - End');
        return conditionQuestionList;    
    }

        /*
Method Name : insertDependentConditions
Parameters  : Id[questionId or tabId or subtabId,],conditionLogic,ConditionList
return type : NA
Usage       : Inserting depenedent question in condition object
*/    
    @AuraEnabled
    public static boolean insertDependentConditions(string Id, string dependenceType, string conditionColumn, list<Condition__c> conditionsList){
        system.debug('insertDependentConditions - Start');
        system.debug('Id-->'+Id);
        system.debug('dependenceType-->'+dependenceType);
        system.debug('conditionColumn-->'+conditionColumn);
        system.debug('conditionsList-->'+conditionsList);
        boolean insertDependentConditions = false;
        
        boolean dependencyParentQuestionUpdate = updateCondDependencyInParentQuestion(dependenceType,conditionsList);            
        if(dependencyParentQuestionUpdate){            
            boolean dependencyDependentQuestionUpdate = updateCondDependencyInDependentQuestion(Id, dependenceType, conditionColumn, conditionsList);
            if(dependencyDependentQuestionUpdate){
                boolean conditionDepedency = createConditionDependency(Id, dependenceType, conditionsList);
                if(conditionDepedency) 
                    insertDependentConditions = true;
            }
        }
        system.debug('insertDependentConditions - Ends');
        return insertDependentConditions;
    }
    
    
    private static boolean updateCondDependencyInParentQuestion(string dependenceType, list<Condition__c> conditionsList){
         system.debug('updateCondDependencyInParentQuestion - Start');
        boolean dependencyUpdate = false;
        list<Question__c> QuestionList = new list<Question__c>();
        for(Condition__c cond : conditionsList){
            Question__c QuestionObj = new Question__c();  //Updating dependent Questions
            QuestionObj.Id = cond.Dependent_Question__c;
            
            if(dependenceType == 'tab')
                QuestionObj.Dependent_Tab__c = true;
            else if (dependenceType == 'subTab')
                QuestionObj.Dependent_Subtab__c = true;
            else if (dependenceType == 'question')
                QuestionObj.Dependent_Question__c = true;
            
            QuestionObj.Has_Dependency__c = true;
            if(!QuestionList.contains(QuestionObj)){
                QuestionList.add(QuestionObj);
            }
        }
        
        try{
            update QuestionList;
            dependencyUpdate = true;
        }catch(Exception e){ 
            System.debug('The following exception has occurred while updating selected questions: ' + e.getMessage());
        }
        return dependencyUpdate;
    }
    
    private static boolean updateCondDependencyInDependentQuestion(string Id, string dependenceType, string conditionColumn, list<Condition__c> conditionsList){
        boolean dependencyDependentQuestionUpdate = false;
        try{
            if(dependenceType == 'question'){
                Question__c dependentQuestionObj = new Question__c(); //Question
                dependentQuestionObj.Id = Id;
                for(Condition__c condition : conditionsList){
                    if(condition.Type__c == 'Show or Hide')
                        dependentQuestionObj.Has_Condition__c = true; 
                }
                dependentQuestionObj.Conditional_Column__c = conditionColumn;
                update dependentQuestionObj;
                dependencyDependentQuestionUpdate = true;
            }else{//for tabs & sub tabs
                WizardHeader__c wizardHeaderObj = new WizardHeader__c();        
                wizardHeaderObj.Id = Id;  
                wizardHeaderObj.Conditional_Logic__c = conditionColumn; 
                update wizardHeaderObj;
                dependencyDependentQuestionUpdate = true;
            }
        }catch(Exception e){ 
            System.debug('The following exception has occurred while updating conditional dependency: ' + e.getMessage());
        }
         system.debug('updateCondDependencyInParentQuestion - ends');
        return dependencyDependentQuestionUpdate;
    }
    
    private static boolean  createConditionDependency(string Id, string dependenceType, list<Condition__c> conditionsList){
         system.debug('createConditionDependency - Start');
        boolean createConditionDependency = false;
        List<Condition__c> conditionQuestionList = new List<Condition__c>();
        string recordTypeName;
        string recordTypeId;
        Integer sequence;
        
        try{
            RecordType deptab;
            RecordType depsubTab;
            RecordType depquestion;
            
            if(dependenceType == 'tab'){
                deptab = [select id,name from RecordType where name = 'Dependent_Tab_Condition'];
            }else if(dependenceType == 'subTab'){
                depsubTab = [select id,name from RecordType where name = 'Dependent_Subtab_Condition'];              
            }else if(dependenceType == 'question'){
                depquestion = [select id,name from RecordType where name = 'Dependent_Question_Condition'];            
            }
            
            
            //Inserting Condition Dependency Object
            list<Condition__c> conditionObjList = new list<Condition__c>();
            
            for(Condition__c condition : conditionsList){
                // if( condition.Sequence__c > sequence){
                // condition.Sequence__c= sequence+1; 
                // sequence = integer.valueOf(condition.Sequence__c);
                if(condition.Conditional_Operaor__c == 'Less Than')
                    condition.Conditional_Operaor__c = '<';
                if(condition.Type__c == 'PreDefault')
                    condition.Conditional_Logic__c = '';
                if(condition.Type__c == 'Picklist Filtering')
                    condition.Conditional_Logic__c = '';
                if(dependenceType == 'tab'){                
                    condition.Tab__c = Id; 
                    condition.RecordTypeId = deptab.Id;
                }else if(dependenceType == 'subTab'){
                    condition.SubTab__c = Id;     
                    condition.RecordTypeId = depsubTab.Id;                
                }else if(dependenceType == 'question'){
                    condition.Question__c = Id;
                    condition.RecordTypeId = depquestion.Id;                
                }
                conditionObjList.add(condition);
                // }
            }
            upsert conditionObjList; 
            system.debug('conditionObjList...'+conditionObjList);
            createConditionDependency = true;
        }catch(Exception e){ 
            System.debug('The following exception has occurred while creating conditional dependency: ' + e.getMessage());
        }
        
        system.debug('createConditionDependency - ends');
        return createConditionDependency;
    }
    /*
Method Name : getDependentQuestionFieldType
Parameters  : conditionalQuestionId
Return type : Question
comments    : For dispaying dependent question Field Type
*/ 
    @AuraEnabled
    public static string getDependentQuestionFieldType(string conditionalQuestionId) 
    {
        system.debug('Inside getDependentQuestionFieldType - Start');
        system.debug('conditionalQuestionId'+conditionalQuestionId);
        string  dependentQuestionFieldType =[select Field_Type__c from Question__c where id=:conditionalQuestionId].Field_Type__c;
        system.debug('dependentQuestionFieldType'+dependentQuestionFieldType);
        system.debug('Inside getDependentQuestionFieldType - End');
        return dependentQuestionFieldType;
    }
  /*
Method Name : getParentDepQuestionFilteringValues
Parameters  : conditionalQuestionId
Return type : Question
comments    : For dispaying dependent question Field Type
*/    
      @AuraEnabled
    public static List<String> getParentDepQuestionFilteringValues(string questionId) 
    {
        system.debug('Inside getParentDepQuestionFilteringValues - Start');
        system.debug('questionId..'+questionId);
        List<Question__c> lstQuestions = new List<Question__c>();
        List<string> srtPicklistvalue=new List<string>();
        lstQuestions = [SELECT Id,Values__c,Field_Type__c
                        FROM Question__c where id =:questionId];   
        
        
        for(Question__c picklistvalue:lstQuestions){
            system.debug('picklistvalue'+picklistvalue.Values__c);
            srtPicklistvalue = picklistvalue.Values__c.split(',');
            
        }
        system.debug('srtPicklistvalue'+srtPicklistvalue);
        for(string pickListValues: srtPicklistvalue){
            system.debug('pickListValues'+pickListValues);
        }
        system.debug('lstQuestions'+lstQuestions);
        system.debug('Inside getParentDepQuestionFilteringValues - End');
        return srtPicklistvalue;
        
    }
    
      /*
Method Name : updatingDepQuestionAndDeletingDepCondition
Parameters  : dependenceType,Id,SelectedDepCondtionId[For delete]
Return type : N/A
comments    : This method is used to update the Dependent Question checkboxs,Has Dependency and Dependent[Question,Tab,Subtab]. 
*/     
    @AuraEnabled
    public static void updatingDepQuestionAndDeletingDepCondition(string dependenceType,string Id,string dependentConditionId){
        system.debug('Inside updatingDepQuestionAfterDeletingDepCondition - start');
        system.debug('dependenceType..'+dependenceType+'dependentConditionId..'+dependentConditionId+'Id..'+Id);
        
        string DependentQuestionId;
        set<Id> dependentParentQuestionIds = new set<Id>();
        Condition__c conditionObj = new Condition__c();
        list<Condition__c> conditionListForParentQuestionIds = new list<Condition__c>();
        
        if(dependenceType == 'tab'){
            conditionObj = [select id,Dependent_Question__c FROM Condition__c where Id =: dependentConditionId AND RecordType.Name = 'Dependent_Tab_Condition']; 
            DependentQuestionId = conditionObj.Dependent_Question__c;
            conditionListForParentQuestionIds = [select id,Tab__c,Dependent_Question__c,Dependent_Question__r.Dependent_Question__c,Dependent_Question__r.Dependent_Subtab__c from Condition__c where Dependent_Question__c =: DependentQuestionId];
            
        }
        if(dependenceType == 'subTab'){
            conditionObj = [select id,Dependent_Question__c FROM Condition__c where Id =: dependentConditionId AND RecordType.Name = 'Dependent_Subtab_Condition']; 
            DependentQuestionId = conditionObj.Dependent_Question__c;
            conditionListForParentQuestionIds = [select id,SubTab__c,Dependent_Question__c,Dependent_Question__r.Dependent_Question__c,Dependent_Question__r.Dependent_Tab__c from Condition__c where Dependent_Question__c =: DependentQuestionId];
        }
        if(dependenceType == 'question'){
            conditionObj = [select id,Dependent_Question__c FROM Condition__c where Id =: dependentConditionId AND RecordType.Name = 'Dependent_Question_Condition'];
            DependentQuestionId = conditionObj.Dependent_Question__c;
            conditionListForParentQuestionIds = [select id,Question__c,Dependent_Question__c,Dependent_Question__r.Dependent_Subtab__c,Dependent_Question__r.Dependent_Tab__c from Condition__c where Dependent_Question__c =: DependentQuestionId];
        }
        
        //Collecting ParentQuestionIds from list
        for(Condition__c condition : conditionListForParentQuestionIds){
            if(dependenceType == 'question')
                dependentParentQuestionIds.add(condition.Question__c);
            if(dependenceType == 'tab')
                dependentParentQuestionIds.add(condition.Tab__c);
            if(dependenceType == 'subTab')
                dependentParentQuestionIds.add(condition.SubTab__c);
        }
        system.debug('dependentParentQuestionIds size...'+dependentParentQuestionIds.size()+'DependentQuestionId...'+DependentQuestionId);

        //Updating Dependent Question checkboxs-Has Dependency and Dependent[Question,Tab,Subtab] based on below condition
        //if(dependentParentQuestionIds.size() == 1){
            for(Id dependentParentQuestionId : dependentParentQuestionIds){
                if(Id == dependentParentQuestionId){
                    try{
                        Question__c questionObj = new Question__c();
                        questionObj.Id = DependentQuestionId;
                        if(dependenceType == 'question'){
                            questionObj.Dependent_Question__c = false;
                            for(Condition__c condtn :  conditionListForParentQuestionIds){
                                if(condtn.Dependent_Question__r.Dependent_Subtab__c == false && condtn.Dependent_Question__r.Dependent_Tab__c == false)
                                    questionObj.Has_Dependency__c = false; 
                            }
                        }
                        if(dependenceType == 'tab'){
                            questionObj.Dependent_Tab__c = false;
                            for(Condition__c condtn :  conditionListForParentQuestionIds){
                                if(condtn.Dependent_Question__r.Dependent_Subtab__c == false && condtn.Dependent_Question__r.Dependent_Question__c == false)
                                    questionObj.Has_Dependency__c = false; 
                            }
                        }
                        if(dependenceType == 'subTab'){
                            questionObj.Dependent_Subtab__c = false;
                            for(Condition__c condtn :  conditionListForParentQuestionIds){
                                if(condtn.Dependent_Question__r.Dependent_Question__c == false && condtn.Dependent_Question__r.Dependent_Tab__c == false)
                                    questionObj.Has_Dependency__c = false; 
                            }
                        }
                        
                        update questionObj;
                        system.debug('questionObj for checkbox..'+questionObj);
                    }catch(Exception e){
                        system.debug('Following error occured while updating dependent Question:'+e.getMessage());
                    }
                }
            }   
        //}
        deleteDependentCondition(dependentConditionId);
        system.debug('Inside updatingDepQuestionAfterDeletingDepCondition - ends');  
    }

    
 /*
Method Name : deleteDependentCondition
Parameters  : dependentConditionId
Return type : N/A
comments    : For deleting dependentCondtion
*/   
    @AuraEnabled
    public static void deleteDependentCondition(string dependentConditionId){
        system.debug('Inside deleteDependentCondition - start');
        system.debug('dependentConditionId..'+dependentConditionId);
        
        list<Condition__c> conditionList = new list<Condition__c>();
        try{
            conditionList = [select id FROM Condition__c WHERE id =: dependentConditionId];
            delete conditionList; 
        }catch(Exception e){
            system.debug('Following exception occured while delete record'+e.getMessage());
        }
        system.debug('Inside deleteDependentCondition - ends');
        
    }

 /*
Method Name : updatingDependentConditionSequence
Parameters  : dependenceType,Id
Return type : N/A
comments    : Updating Dependent Conditions Sequence after deleting the condition from table 
*/   
    @AuraEnabled
    public static void updatingDependentConditionSequenceAfterDelete(string dependenceType,string Id){ 
        system.debug('Inside updatingDependentConditionSequenceAfterDelete - start');
        system.debug('dependenceType..'+dependenceType+'..Id..'+Id);

        list<Condition__c> conditionsList = new list<Condition__c>();
        list<Condition__c> updateconditionList = new list<Condition__c>();
        if(dependenceType == 'tab')
            conditionsList = [select id,Type__c,Sequence__c,Conditional_Logic__c FROM Condition__c where Tab__c  =:Id AND 
                              RecordType.Name = 'Dependent_Tab_Condition' order by Sequence__c ASC];
        
        if(dependenceType == 'subTab')
            conditionsList = [select id,Type__c,Sequence__c,Conditional_Logic__c FROM Condition__c where SubTab__c =: Id AND 
                              RecordType.Name = 'Dependent_Subtab_Condition' order by Sequence__c ASC]; 
        
        if(dependenceType == 'question')
            conditionsList = [select id,Type__c,Sequence__c,Conditional_Logic__c FROM Condition__c where Question__c  =: Id AND 
                              RecordType.Name = 'Dependent_Question_Condition' order by Sequence__c ASC];
        
        //Updating conditions with sequence and conditionaLogic[AND/OR]
        Condition__c conditionObj = new Condition__c();
        integer listSize = conditionsList.size();
        boolean lastRecordOfTypePicklistOrPredefault = true;
        integer sequence = 0;
        
        for(Condition__c condition : conditionsList){
            condition.Sequence__c = sequence+1;
            sequence = integer.valueOf(condition.Sequence__c);
            if(sequence < listSize && condition.Type__c == 'Show or Hide')   //If last record is picklistFiltering or predefault geting last record of show or hide
                conditionObj = condition;
            
            if(sequence == listSize && condition.Type__c == 'Show or Hide'){ //Last record in list [show or hide]
                condition.Conditional_Logic__c = ''; 
                lastRecordOfTypePicklistOrPredefault = false;
            }
            updateconditionList.add(condition);
        }
        //If last record is of type,Hide or show, in the conditionsList no need to executive below for loop 
        if(lastRecordOfTypePicklistOrPredefault == true){
            for(Condition__c condtn : updateconditionList){
                if(condtn == conditionObj){
                    condtn.Conditional_Logic__c = '';
                }  
            }
        }
        try{
            update updateconditionList;
        }catch(Exception e){
            system.debug('Following error occured while updating dependent Conditions:'+e.getMessage());
        }
        
        updatingDepConditionLogicForParentQuestionAfterDelete(dependenceType,Id,updateconditionList);
        system.debug('Inside updatingDependentConditionSequenceAfterDelete - ends');
    }

     /*
Method Name : updatingSequenceAndLogic
Parameters  : dependenceType,Id,ConditionList
Return type : N/A
comments    : This method is used to update,dependentConditionLogic to parent question after deleting the condition from table
*/   
    @AuraEnabled
    public static void updatingDepConditionLogicForParentQuestionAfterDelete(string dependenceType,string Id,list<Condition__c> conditionsList){
        system.debug('Inside updatingDepConditionLogicForParentQuestionAfterDelete - starts');
        system.debug('dependenceType..'+dependenceType+'..conditionsList..'+conditionsList+'..Id..'+Id);
        string dependentConditionLogic = '';
        list<Condition__c> conditionListForParentQuestionIds = new list<Condition__c>();
        conditionListForParentQuestionIds = [select id,Question__c from Condition__c where Question__c =: Id];
        
        //Building dependentconditionLogic after deleting the condition from table
        for(Condition__c condition : conditionsList){
            if(condition.Type__c == 'Show or Hide'){
                decimal sequence = condition.Sequence__c;
                string conditionalLogic = condition.Conditional_Logic__c;
                string ConditionLogic = sequence+' '+conditionalLogic+' ';
                dependentConditionLogic += ConditionLogic;
            }
        }
        dependentConditionLogic = dependentConditionLogic.replace('null', '');
        system.debug('dependentConditionLogic..'+dependentConditionLogic);
        
        try{
            if(dependenceType == 'question'){
                Question__c dependentQuestionObj = new Question__c(); //Question
                dependentQuestionObj.Id = Id;
                dependentQuestionObj.Conditional_Column__c = dependentConditionLogic;
                if(conditionListForParentQuestionIds.size() == 0){
                    dependentQuestionObj.Has_Condition__c = false;   
                }
                update dependentQuestionObj;
            }else{//for tabs & sub tabs
                WizardHeader__c wizardHeaderObj = new WizardHeader__c();        
                wizardHeaderObj.Id = Id;  
                wizardHeaderObj.Conditional_Logic__c = dependentConditionLogic; 
                update wizardHeaderObj;
            }
        }catch(Exception e){ 
            System.debug('The following exception has occurred while updating dependentConditionLogic: ' + e.getMessage());
        }
        system.debug('Inside updatingDepConditionLogicForParentQuestionAfterDelete - ends');
    }
 /*
Method Name : getsObjectRelatedChildObjects
Parameters  : null
Return type : List
comments    : For getting dynimically all Sobject related child objects Labels and ApiNames
*/
    @AuraEnabled
    public static List<getSobjectChildWrapper> getsObjectRelatedChildObjects (string selctedObjectValue){
        system.debug('Inside getsObjectRelatedObjects - Start');
         system.debug('selctedObjectValue'+selctedObjectValue);
    
        List<getSobjectChildWrapper> sObjectChildWrapperList = new  List<getSobjectChildWrapper>();
        list<Schema.Childrelationship> relatedObjectsList = Schema.getGlobalDescribe().get(selctedObjectValue).getdescribe().getChildRelationships();
        for (Schema.Childrelationship  relatedObject : relatedObjectsList) {
             string name;
             string label;
            if(relatedObject.getChildSObject().getDescribe().isUpdateable()
                    &&
                    relatedObject.getChildSObject().getDescribe().getKeyPrefix()!=null
                    &&
                    !relatedObject.getChildSObject().getDescribe().isCustomSetting()
                    &&
                    relatedObject.getChildSObject().getDescribe().isCreateable()
                )
               name = relatedObject.getChildSObject().getDescribe().getName();
               label = relatedObject.getChildSObject().getDescribe().getLabel();
                 sObjectChildWrapperList.add(new getSobjectChildWrapper(label,name));
           }
     system.debug('sObjectChildWrapperList'+sObjectChildWrapperList);
        system.debug('Inside getsObjectRelatedObjects - Start');
     return sObjectChildWrapperList;
    }
     /*
Method Name : getSobjectRelatedParentLookUp
Parameters  : selctedObjectValue
Return type : List
comments    : For getting dynimically all Sobject related parent objects Labels and ApiNames
*/
    @AuraEnabled
    public static List<getSobjectRelatedParentLookUp> getSobjectRelatedParentLookUp (string selctedObjectValue){
        system.debug('Inside getSobjectRelatedParentLookUp - Start');
        system.debug('selctedObjectValue'+selctedObjectValue);
        List<getSobjectRelatedParentLookUp> sobjectRelatedParentLookUpList = new  List<getSobjectRelatedParentLookUp>();
        for(Schema.SObjectField sfield : Schema.getGlobalDescribe().get(selctedObjectValue).getdescribe().fields.getMap().Values()){
            if(sfield.getDescribe().getType() == Schema.DisplayType.REFERENCE){
                schema.describefieldresult dfield = sfield.getDescribe();
                for(Schema.SObjectType reference : dfield.getReferenceTo()){
                    string  name = reference.getDescribe().getName();
                    string  label = reference.getDescribe().getLabel();
                    sobjectRelatedParentLookUpList.add(new getSobjectRelatedParentLookUp(label,name));
                }
            }
        }
        system.debug('sobjectRelatedParentLookUpList'+sobjectRelatedParentLookUpList);
        system.debug('Inside getsObjectRelatedObjects - Start');
        return sobjectRelatedParentLookUpList;
    }
    
         /*
Method Name : deleteTemplateDetails
Parameters  : selectedDeletedTemplateId
Return type : boolean
comments    : For delete record based on tab id
*/ 
    @AuraEnabled
    public static Boolean deleteTemplateDetails(string selectedDeletedTemplateId)
    {
        system.debug('Inside deleteTemplateDetails - Start');
        system.debug('selectedDeletedTemplateId>>>>>'+selectedDeletedTemplateId);
        boolean templateDeleteBoolean = false;
        try{
            List<WizardHeader__c> deletedTemplateList = new list<WizardHeader__c>();
            List<WizardHeader__c> deletedTabList = new list<WizardHeader__c>();
            List<WizardHeader__c> deleteSubTabList = new list<WizardHeader__c>();
            List<Question__c> deleteQuestionList = new List<Question__c>();
            //Quering Template
            WizardHeader__c templateId = [SELECT Id FROM WizardHeader__c WHERE Id =: selectedDeletedTemplateId];
            deletedTemplateList.add(templateId);
            //Quering Tab
            List<WizardHeader__c> tabList = [SELECT Id FROM WizardHeader__c WHERE Template__c in: deletedTemplateList];
            system.debug('tabList..'+tabList);
            for(WizardHeader__c tabObj : tabList){
                deletedTabList.add(tabObj);
            }
            
           //Quering Tab related subTabs
            list<WizardHeader__c> subTabList = [SELECT Id,SubTab__c,Subtabs_Tab__c,Sequence__c FROM WizardHeader__c  WHERE Tabs__c in: deletedTabList];
            system.debug('subTabList..'+subTabList);
            
            for(WizardHeader__c subtabObj : subTabList){
                deleteSubTabList.add(subtabObj);
            }
            
            //Quering subTabs related Questions
            List<Question__c> questionsList = [SELECT Id,Tab_Name__c,SubTab1__r.SubTab__c
                                               FROM Question__c where SubTab1__c  in :deleteSubTabList];
            system.debug('questionsList..'+questionsList);
            for(Question__c questionObj : questionsList){
                deleteQuestionList.add(questionObj);
            }
            
            system.debug('deletedTemplateList..'+deletedTemplateList);
            system.debug('deletedTabList..'+deletedTabList);
            system.debug('deleteSubTabList..'+deleteSubTabList);
            system.debug('deleteQuestionList..'+deleteQuestionList);
            delete deletedTemplateList;
            delete deletedTabList;
            delete deleteSubTabList;
            delete deleteQuestionList;
            
            if(deletedTemplateList.size() > 0)
                templateDeleteBoolean = true;  
            
            system.debug('Inside deleteTemplateDetails - End');
        }catch(Exception e){
           system.debug('deleteTemplateDetails error'+e.getMessage());
        }
        return templateDeleteBoolean;
    }

     @AuraEnabled
    public static List<String> getDependentQuestionFilteringValues(string questionId) 
    {
        system.debug('Inside getDependentQuestionPicklistValues - Start');
        system.debug('questionId..'+questionId);
        List<Question__c> lstQuestions = new List<Question__c>();
        List<string> srtPicklistvalue=new List<string>();
        lstQuestions = [SELECT Id,Values__c,Field_Type__c
                        FROM Question__c where id =:questionId];   
        
        
        for(Question__c picklistvalue:lstQuestions){
            system.debug('picklistvalue'+picklistvalue.Values__c);
            srtPicklistvalue = picklistvalue.Values__c.split(',');
            
        }
        system.debug('srtPicklistvalue'+srtPicklistvalue);
        for(string pickListValues: srtPicklistvalue){
            system.debug('pickListValues'+pickListValues);
        }
        system.debug('lstQuestions'+lstQuestions);
        system.debug('Inside getDependentQuestionPicklistValues - End');
        return srtPicklistvalue;
        
    }
 @AuraEnabled
    public static List<getSobjectChildParentWrapper> getSobjectChildParentWrapper(string selctedObjectValue){
        system.debug('Inside getsObjectRelatedObjects - Start');
        system.debug('selctedObjectValue'+selctedObjectValue);
        List<getSobjectChildParentWrapper> sObjectRelatedParentsandChilds = new  List<getSobjectChildParentWrapper>();
        List<getsobjectFieldsList> sobjectFieldsList = new  List<getsobjectFieldsList>();
        List<getSobjectChildWrapper> sObjectChildWrapperList = new  List<getSobjectChildWrapper>();
        for(Schema.SObjectField sfield : Schema.getGlobalDescribe().get(selctedObjectValue).getdescribe().fields.getMap().Values()){
            if(sfield.getDescribe().getType() == Schema.DisplayType.REFERENCE){
                schema.describefieldresult dfield = sfield.getDescribe();
                for(Schema.SObjectType reference : dfield.getReferenceTo()){
                    string  name = reference.getDescribe().getName();                     
                    string  label = reference.getDescribe().getLabel();                   
                    string  RelatedTo = string.valueOf(reference.getDescribe().getSobjectType()); 
                    
                    system.debug('name..'+name + '..label..'+label + '..RelatedTo..'+RelatedTo);
                    sobjectFieldsList.add(new getsobjectFieldsList(label,name));
                }              
            }
         
        }
        system.debug('sobjectFieldsList'+sobjectFieldsList);
        
        list<Schema.Childrelationship> relatedObjectsList = Schema.getGlobalDescribe().get(selctedObjectValue).getdescribe().getChildRelationships();
        for (Schema.Childrelationship  relatedObject : relatedObjectsList) {
            string name;
            string label;
            if(relatedObject.getChildSObject().getDescribe().isUpdateable()
               &&
               relatedObject.getChildSObject().getDescribe().getKeyPrefix()!=null
               &&
               !relatedObject.getChildSObject().getDescribe().isCustomSetting()
               &&
               relatedObject.getChildSObject().getDescribe().isCreateable()
              )
            name = relatedObject.getChildSObject().getDescribe().getName();
            label = relatedObject.getChildSObject().getDescribe().getLabel();
            sObjectChildWrapperList.add(new getSobjectChildWrapper(label,name));
        }
        system.debug('sObjectChildWrapperList'+sObjectChildWrapperList);
        system.debug('Inside getsObjectRelatedObjects - Start');
       
        // getSobjectChildParentWrapper.sObjectChildWrapperList = sObjectChildWrapperList; 
        //getSobjectChildParentWrapper.sobjectFieldsList = sobjectFieldsList;
        
        
        return sObjectRelatedParentsandChilds;
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
Method Name : insertProfilesIntoQuestion
Parameters  : questionObj
Return type : Question
comments    : For Inserting clone question records
*/ 
    @AuraEnabled
    public static void insertProfilesIntoQuestion(List<Question__c> questionsList){
        system.debug('Inside insertProfilesIntoQuestion - Start');
        system.debug('questionsList>>>>>>>>'+questionsList);
        try{
            
            insert questionsList;
            system.debug('questionsList1>>>>>>>>'+questionsList);
        }
        catch(Exception e){
            system.debug('insertProfilesIntoQuestion error'+e.getMessage());
        }
        
    }
    /* Method Name : getQuestionRelatedProfiles
Parameters  : questionId
Return type : get QuestionRelated Profiles 
comments    : This method is used for displaying  get QuestionRelated Profiles 
*/ 
    @AuraEnabled
    public static List<Question__c> getQuestionRelatedProfiles(string questionId) 
    {
        system.debug('Inside getQuestionRelatedProfiles - Start');
        system.debug('questionId..'+questionId);
        List<Question__c> profileRelatedQuestionList = [select id,Profile_ID__c,Profile_Name__c,Read_Only__c,Read_Only_Value__c,Parent_Question_ID__c FROM Question__c where Parent_Question_ID__c  =:questionId];
        system.debug('profileRelatedQuestionList'+profileRelatedQuestionList);
        system.debug('Inside getQuestionRelatedProfiles - End');
        return profileRelatedQuestionList;
        
    }
      /*
Method Name : deleteQuestionRelatedProfile
Parameters  : selectedProfileID
Return type : N/A
comments    : For deleting QuestionRelatedProfile
*/   
    @AuraEnabled
    public static void deleteQuestionRelatedProfile(string selectedProfileID){
        system.debug('Inside deleteQuestionRelatedProfile - start');
        system.debug('selectedProfileID..'+selectedProfileID);
        
        list<Question__c> questionList = new list<Question__c>();
        try{
            questionList = [select id FROM Question__c WHERE id =: selectedProfileID];
            delete questionList; 
        }catch(Exception e){
            system.debug('Following exception occured while delete record'+e.getMessage());
        }
        system.debug('Inside deleteQuestionRelatedProfile - ends');
        
    }
        /*
Method Name : insertCloneSubtabs
Parameters  : questionObj
Return type : Null
comments    : For Inserting clone subtab records
*/ 
    @AuraEnabled
    public static void insertCloneSubtabs(string selectedTabId,List<string> listSubatbIds){
        system.debug('Inside insertCloneSubtabs - Start');
        system.debug('selectedTabId>>>>>>>>'+selectedTabId);
        system.debug('listSubatbIds>>>>>>>>'+listSubatbIds);
        List<WizardHeader__c> subTabList = [SELECT Id,SubTab__c,Tabs__c,Subtabs_Tab__c,Sequence__c,Object_Name__c,Object_API_Name__c,
                                            Parent_Object_Name__c,Parent_Object_API_Name__c,Layout_Type__c,Profile__c,ProfileId__c,Reference_FieldApiName__c,Relationship__c,Org_Parent_Object_API_Name__c FROM WizardHeader__c where  id  in :listSubatbIds order by Sequence__c asc];
       system.debug('subTabList'+subTabList);
        List<Question__c> questionsList = [select id,Name,Tab_Name__c,Parent_Object_Name__c,Parent_Object_API_Name__c,Question_Label__c,Object_Name__c,Object_API_Name__c,Answer__c,Field_Name__c,Field_API_Name__c,Field_Type__c,Default_Value__c,
                                           Description__c,Values__c,SubTab1__c,SubTab1__r.SubTab__c,Sequence__c,Rows__c,Input_placeholder__c,Cols__c,IsMandatory__c,
                                           Higher_Value_Limit__c,Has_Condition__c,Lower_Value_Limit__c,Has_Default_Value__c,Input_Pattern__c,Has_Dependency__c,Decimal__c,
                                           Read_Only__c,Size__c,Object_API_Used_for_Lookup__c,Help_Text__c FROM Question__c where SubTab1__c  in :subTabList order by Sequence__c asc];
        system.debug('questionsList'+questionsList);
        try{
            integer subtabSequenceCount = [SELECT COUNT() FROM WizardHeader__c where Tabs__c =:selectedTabId];
            system.debug('subtabSequenceCount'+subtabSequenceCount);
            subtabSequenceCount++;
            for(WizardHeader__c subTab : subTabList){
                subTab.Id = null;
                subTab.Tabs__c = selectedTabId;
                subTab.Sequence__c = subtabSequenceCount;
                subtabSequenceCount++;
            }
             system.debug('subTabList'+subTabList); 
              insert subTabList;
             for(WizardHeader__c cloneSubTabs:subTabList){
                for(Question__c question :questionsList){
                    if(cloneSubTabs.SubTab__c == question.SubTab1__r.SubTab__c){
                        question.SubTab1__c = cloneSubTabs.Id;
                        question.Id=null;
                    }
                }
            }
            system.debug('questionsList'+questionsList);
            insert questionsList;
            system.debug('Inside insertCloneSubtabs - End'); 
        }
        catch(Exception e){
            system.debug('insertCloneSubtabs error'+e.getMessage());
        }
      
    }
}