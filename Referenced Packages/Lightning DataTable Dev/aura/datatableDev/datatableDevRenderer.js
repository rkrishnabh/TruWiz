({
    // Your renderer method overrides go here
    rerender : function(cmp,helper){
        this.superRerender();    
        var tbodyNode = cmp.find("tbody").getElement();
        var tableActionNodes = cmp.find("dtTableActions").getElement();
        var config = cmp.get("v.config") || {};
        var table = cmp.find("tableContent").getElement();
        var columns = cmp.get("v.header");
        var globalId = cmp.getGlobalId();
        
        
        if(cmp.get("v.initializeDone")) {
            //Remove the global action childrens
            while(tableActionNodes.firstChild){
                tableActionNodes.removeChild(tableActionNodes.firstChild); 
            }
        }
        
        //Construct the button/links for table actions
        if(tableActionNodes.childNodes.length == 0 && config && config.globalAction){
            var tabActionFrag = document.createDocumentFragment();
            for(var i = 0;i < config.globalAction.length;i++){
                var tabAction = config.globalAction[i];
                var tabActionNode;
                
                //add action only if 'id' is present
                if(tabAction.id){
                    
                    if(typeof tabAction.visible === 'boolean') {
                        if(!tabAction.visible) {
                            continue;
                        }
                    }
                    
                    if(typeof tabAction.visible === 'function') {
                        if(!tabAction.visible()) {
                            continue;
                        }
                    }
                    
                    if(tabAction.type === "url"){
                        tabActionNode = document.createElement("a");
                    }
                    else{
                        tabActionNode = document.createElement("button");
                        tabActionNode.type = "button";
                    }
                    
                    tabActionNode.textContent = tabAction.label;
                    tabActionNode.className = tabAction.class;
                    tabActionNode.id = tabAction.id + '-' + globalId;
                    
                    //Fire dtActionClick event
                    tabActionNode.addEventListener('click',function(evt){
                        var domId = evt.currentTarget.id.split('-')[0];
                        var tabActEvt = cmp.getEvent("dtActionClick");
                        tabActEvt.setParams({
                            "actionId":domId
                        });
                        tabActEvt.fire();
                    });
                    
                    tabActionFrag.appendChild(tabActionNode);
                }                
            }
            
            tableActionNodes.appendChild(tabActionFrag);
        }
        
        
        
        //Remove the tbody childrens
        while(tbodyNode.firstChild){
            tbodyNode.removeChild(tbodyNode.firstChild); 
        }
        
        var rowsToDisplay = cmp.get("v.rowsToDisplay");
        var _columns = cmp.get("v._columns");
        var actualRows = cmp.get("v.dataRows");
        
        var trFragments = document.createDocumentFragment();
        var selectedRows = cmp.get("v.selectedRows");
        var unSelectedRows = cmp.get("v.unSelectedRows");
        
        var nonPopoverActions = [];
        var popoverActions = [];
        
        if(config && Array.isArray(config.rowAction)){
            //Initialize action type
            for(var j =0;j < config.rowAction.length;j++){
                var rowAction = config.rowAction[j];
                if(rowAction.type === 'button' || rowAction.type === 'url' || rowAction.type === 'image'){
                    nonPopoverActions.push(rowAction);
                }
                if(rowAction.type === 'menu'){
                    popoverActions.push(rowAction); 
                }
            }
            
            cmp.set("v.popoverActions",popoverActions);
            cmp.set("v.nonPopoverActions",nonPopoverActions);
        }
        
        //show message if array is empty
        if(!rowsToDisplay.length){
            var emptyRowNode = document.createElement('tr'),
                emptyRowDataNode = document.createElement('td'),
                colspan = _columns.length;
            
            emptyRowDataNode.textContent = 'No records to display';
            
            if(config.massSelect === true){
                colspan++
            }
            
            if(popoverActions.length){
                colspan++;
            }
            
            if(nonPopoverActions.length){
                colspan++;
            }
            
            
            emptyRowDataNode.setAttribute('colspan',colspan);
            emptyRowDataNode.className = 'slds-text-align--center';
            emptyRowNode.appendChild(emptyRowDataNode);
            trFragments.appendChild(emptyRowNode);
        }
        else{
            var selectAll = cmp.get("v.selectAll");
            
            //Add the tr to the tbody
            for(var i = 0;i < rowsToDisplay.length;i++){
                trFragments.appendChild(helper.generateRow(cmp,actualRows,rowsToDisplay[i],_columns,popoverActions,nonPopoverActions,config,i,selectedRows,unSelectedRows,selectAll));                }  
        }
        
        tbodyNode.appendChild(trFragments);  
        if (config.paginate === true ) {
            var pagination_info_label = $A.get("$Label.ldt.Pagination_Info");
            var _rows = cmp.get("v._rows"),
                offset = cmp.get("v.offset"), 
                rows = cmp.get("v.dataRows"),
                limit = cmp.get("v.limit");
            
            var from = offset,to = _rows.length, totalRecords = _rows.length;
            
            if(_rows.length) {
                from = offset + 1;
            }
            
            if((offset + limit) < _rows.length) {
                to = offset + limit;
            }
        
        	var config = cmp.get("v.config") || {};
        
            cmp.find("pageInfo").getElement().textContent = helper.stringFormat(pagination_info_label,[from,to,totalRecords]);
        }
        
        if(cmp.get("v.reRender")){
            
            if(cmp.get("v.initializeDone") || !cmp.get("v.selectAll")){
                var checkAllCmp = cmp.find("selectAllCmp");
                if(checkAllCmp && !checkAllCmp.length){
                    checkAllCmp = [checkAllCmp];
                }
                
                if(checkAllCmp){
                    for(var i = 0;i < checkAllCmp.length;i++){
                        if(checkAllCmp[i].getElement()){
                            checkAllCmp[i].getElement().checked = false;
                        }
                    }    
                }
                
                var isResizeEnabled = false;
                
                columns.forEach(function(col){
                    if(!isResizeEnabled && col.resizeable == true) {
                        isResizeEnabled = true;
                    } 
                });
                
                if(cmp.get("v.initializeDone") && isResizeEnabled){
                    window.setTimeout(function(){
                        //if(cmp.isValid()) {
                        var resize = new columnResizer(table, {config:columns});
                        resize.initialize();  
                        //}
                    },1000);
                }      
                
                cmp.set("v.initializeDone",false);
            }
            
        }        
    },
    afterRender: function (cmp,helper) {
        this.superAfterRender();
        helper.windowClick = $A.getCallback(function(event){
            if(cmp.isValid()){
                helper.closeDropdown(cmp,event);
            }
        });
        
        document.addEventListener('click',helper.windowClick);      
    },
    unrender: function (cmp,helper) {
        this.superUnrender();
        document.removeEventListener('click',helper.windowClick);        
    }
})