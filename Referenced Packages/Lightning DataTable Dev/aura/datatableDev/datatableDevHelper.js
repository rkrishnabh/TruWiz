({
    timeoutRef:null,
    filterRowBySearchTxt : function(cmp,searchTxt) {
        var columsToSearch = [],
            searchInCol = cmp.get("v.searchByCol"),
            _columns = cmp.get("v._columns") || [],
            rows = cmp.get("v.dataRows"),
            timezone = this.getTimeZone();
		
        //collect the column definitions to be searched
        for(var i = 0;i < _columns.length;i++){
            if(searchInCol){
                if(_columns[i].name === searchInCol){
                    columsToSearch.push(_columns[i]);
                    break;
                }
            }
            else{
                columsToSearch.push(_columns[i]);
            }
        }
		
        //filter works on OR condition
        return _.filter(rows, function(row) {
            var hasFound = false;

            for(var i = 0;i < columsToSearch.length;i++){
                var column = columsToSearch[i].name,
                    type = columsToSearch[i].type,
                	value = _.get(row,column);
					
                if(value){
                    //for date search if format is passed; convert the value to the format 
                    if(type === 'date' || type === 'datetime'){
                        if(type === 'date'){
                            var dateFormat = (columsToSearch[i].format ? columsToSearch[i].format : 'D-MMM-YYYY');
                            value = moment.tz(value,timezone).format(dateFormat);
                        }
                        else if(type === 'datetime'){
                            var dateFormatTime = (columsToSearch[i].format ? columsToSearch[i].format : 'D-MMM-YYYY HH:mm A');
                            value = moment.tz(value,timezone).format(dateFormatTime);
                        }
                    }
                    
                    if(!hasFound){
                        hasFound = value.toString().toLowerCase().indexOf(searchTxt.toLowerCase()) !== -1;
                        //if match is found;break the loop and include the row
                        if(hasFound){
                            break;
                        }
                    }
                } 
            }

            return hasFound;
        });
    },
    initializeTable : function(cmp,event,helper,rows){
        var columns = cmp.get("v.header") || [],
            _columns = cmp.get("v._columns") || [],
			config = cmp.get("v.config"),
			initConfig = cmp.get("v.initConfig");
		
        //enable pagination controls if pagination is enabled
        if(config.paginate === true) {
            helper.setupPagingControls(cmp,event,helper);
        }
        
        if(columns.length){
           
            cmp.set("v._columns",columns);
            _columns = columns;
            
            helper.showDtTable(cmp);
            var tableCmp = cmp.find("dtTable");
            
            if($A.util.hasClass(tableCmp,'slds-hide')){
                $A.util.removeClass(tableCmp,'slds-hide');
            }
            
            var columnObj = _columns[0];
            var sortOrder;
            var isSortingNeeded = true;
            
            //collect default sortColumn and its Order if passed
            if(Array.isArray(initConfig.order)){
                if (initConfig.order.length) {
                    var index = initConfig.order[0];
                    sortOrder = initConfig.order[1];
                    columnObj = _columns[index];
                } else {
                    isSortingNeeded = false;
                }
            }
            
            if (isSortingNeeded) {
               // timeout to workaround the cmp.find() error in dtColumn as done:rendering not working
                window.setTimeout(
                    $A.getCallback(function() {
                        if (cmp.isValid() && _columns[0]) {
                            helper.sortByColumn(cmp, event, helper,columnObj,sortOrder);
                        }
                    }),100
                ); 
            } else {
                var _rows = cmp.get("v.dataRows");
                
                //Need a copy of source data to be used in filtering
                cmp.set("v._rows",_rows);

                helper.renderRows(cmp,event,_rows,false);
            }
        }   
        else {
            $A.util.addClass(tableCmp,'slds-hide');
        }
       
        cmp.set("v.reRender",true); 
    },
    setupPagingControls : function(cmp,event,helper) {
           
        var defaultItemMenu = [10,25,50], 
            defaultItemsPerPage = 10,
			config = cmp.get("v.config"),
			initConfig = cmp.get("v.initConfig"),
        	itemMenu;
        
        
        //if user defined pagelength is present, use it else opt default lengths
        if(Array.isArray(initConfig.itemMenu)) {
            itemMenu = initConfig.itemMenu
        } else {
            itemMenu = defaultItemMenu;
        } 
        
        var pageLimitIdx = _.findIndex(itemMenu, function(o) {
            return o === initConfig.itemsPerPage; 
        });
        
        var itemsPerPage = initConfig.itemsPerPage || defaultItemsPerPage;
        
        cmp.set("v.limit",itemsPerPage);
        
        // set limit dropdown options and set columns based on column attribute
        if(itemMenu.length) {
            var opts = [];
            for(var i = 0;i < itemMenu.length;i++){
                if(itemMenu[i] <= 50) {
                    var opt = {label: itemMenu[i] , value: itemMenu[i]};
                    if(pageLimitIdx == i || (pageLimitIdx == -1 && i == 0)) {
                        opt.selected = true;
                    }
                    opts.push(opt); 
                }
            }
            
            if (config.itemMenuPosition === 'top') {
                cmp.find("itemsPerPageTop").set("v.options", opts);
            } else {
                cmp.find("itemsPerPageBtm").set("v.options", opts);
            }
            
        } else {
            $A.util.addClass(cmp.find("itemMenuContainer"),'slds-hide');
        }
        
        helper.updateLimit(cmp);
    },
    sortByColumn : function(cmp,event,helper,defaultSortColumn,defaultSortOrder){
        var columnToSort = event.getParam("columnToSort") || defaultSortColumn,
            sortColumn = cmp.get("v.sortColumn"),
            sortOrder = cmp.get("v.sortOrder"),
            rows = cmp.get("v.dataRows"),
            offset = cmp.get("v.offset"),
            limit = cmp.get("v.limit"),
            searchTxt = cmp.get("v.searchTxt"),
            _rows;
        
        if(defaultSortColumn){
            columnToSort = defaultSortColumn;
            sortOrder = defaultSortOrder || 'asc';
        } else {
           // if order is asc flip to desc, and vice-verse
            if(columnToSort.name === sortColumn.name){
                sortOrder = (sortOrder === 'desc') ? 'asc' : 'desc';
            }
            else{
                sortOrder = 'asc';
            } 
        }
        
        // reset offset when sorting is done
        offset = 0;
        sortColumn.label = columnToSort.label;
        sortColumn.name = columnToSort.name;

        //Always use the filtered row, if search has been done earlier
        if(searchTxt){
            rows = cmp.get("v._rows");
        }

        cmp.set("v.offset",offset);
        cmp.set("v.sortColumn",sortColumn);
        cmp.set("v.sortOrder",sortOrder);
        helper.renderRows(cmp,event,rows,true);

        //Fire event to signal sorting is done
        $A.get("e.ldt:doneSortingColumn").fire();
    },
    filterAndRenderRowsIfNecessary : function(cmp,event,needToSort){
        var searchTxt = cmp.get("v.searchTxt");
        var rows;
        
        if(searchTxt){
            cmp.set("v.offset",0);
            rows = this.filterRowBySearchTxt(cmp,searchTxt);
        }
        else{
            rows = cmp.get("v.dataRows");
        }
        
        //don't sort if update/delete
        if(typeof needToSort === 'undefined') {
            needToSort = true;
        }
        
        this.renderRows(cmp,event,rows,true);
    },
    renderRows : function(cmp,event,rows,needToSortRows){
        var _rows,
            _columns = cmp.get("v._columns"),
            config = cmp.get("v.config"),
            offset = cmp.get("v.offset"),
            limit = cmp.get("v.limit"),
            sortColumn = cmp.get("v.sortColumn"),
            sortOrder = cmp.get("v.sortOrder"),
            searchTxt = cmp.get("v.searchTxt");
        
            var sortFn = function (row) { 
                var value = _.get(row,sortColumn.name);
                var type = typeof value;
                if(type === 'undefined'){
                    return; 
                } else if(type === 'string'){
                    return value.toLowerCase(); 
                } else {
                    return value;
                }
            };

        if(needToSortRows){
            if(sortOrder === 'desc'){
                _rows = _.sortBy(rows,sortFn).reverse();
            }
            else{
                _rows = _.sortBy(rows,sortFn);
            }
            cmp.set("v._rows",_rows);
        }
        else{
            _rows = rows;
        }

        
        //empty and set to solve the initial sorting issue
        cmp.set("v.rowsToDisplay",[]);
        
        if (config.paginate === true) {
            cmp.set("v.rowsToDisplay",_.slice(_rows,offset,offset+limit));
        } else{
            cmp.set("v.rowsToDisplay",_rows);
        }
        cmp.set("v.reRender",true);
    },
    showDtTable : function(cmp){
        window.setTimeout(
            $A.getCallback(function() {
                if (cmp.isValid()) {
                    cmp.set("v.showDtView", true);
                }
            }),500
        );
    },
    updateLimit : function(cmp){
        var limit;
        var config = cmp.get("v.config");
        
        if (config.itemMenuPosition === 'top') {
            limit = cmp.find("itemsPerPageTop").get("v.value");
        } else {
            limit = cmp.find("itemsPerPageBtm").get("v.value");
        }
        
        //convert limit to number to set private attribute
        if(typeof limit === 'string'){
            limit = Number(limit);
        }
        else{
            limit = cmp.get("v.limit");
        }
        cmp.set("v.offset",0);
        cmp.set("v.limit",limit);            
    },
    navigateToDetailRecord : function(event){
        var navEvt = $A.get("e.force:navigateToSObject");
        var recordId = event.currentTarget.getAttribute('data-recordid');
        if(navEvt){
            navEvt.setParams({
                "recordId": recordId
            });
            navEvt.fire();
        }
        else{
            window.location.href = "/one/one.app#/sObject/"+recordId+"/view";
        }
    },
    toggleRowSelection : function(cmp,event){
        var rowIndex = event.currentTarget.getAttribute('data-rowindex');
        var rowsToDisplay = cmp.get("v.rowsToDisplay");
        var selectedRows = cmp.get("v.selectedRows");
        var unSelectedRows = cmp.get("v.unSelectedRows");
        var row = rowsToDisplay[rowIndex];
        var rowIdx1 = selectedRows.indexOf(row);
        var rowIdx2 = unSelectedRows.indexOf(row);

        if(event.currentTarget.checked){
            //Add to selected collection if checked
            if(rowIdx1 === -1){
                selectedRows.push(row);
            }

            //Remove it from unselected collection
            if(rowIdx2 > -1){
                unSelectedRows.splice(rowIdx2,1);
            }
        }
        else {
            //Remove it from selected collection if unchecked
            if(rowIdx1 > -1){
                selectedRows.splice(rowIdx1,1);
            }

            //Add to unselected collection if unchecked
            if(rowIdx2 === -1){
                unSelectedRows.push(row);
            }
        }

        cmp.set("v.unSelectedRows",unSelectedRows);
        cmp.set("v.selectedRows",selectedRows);
    },
    updateRow : function(cmp,index,updatedRow) {
        var rows = cmp.get("v.dataRows"),
            originalRow = rows[index],
            selectedRows = cmp.get("v.selectedRows"),
            unSelectedRows = cmp.get("v.unSelectedRows");
                        
            var selectedRowIdx = selectedRows.indexOf(originalRow),
                unSelectedRowIdx = unSelectedRows.indexOf(originalRow);
            
            //update row if present in selectedRow/unSelectedRows
            if(selectedRowIdx > -1){
                selectedRows[selectedRowIdx] = updatedRow;
                cmp.get("v.selectedRows",selectedRows);
            }
            else if(unSelectedRowIdx > -1){ // may not happen edge case just being safe
                unSelectedRows[unSelectedRowIdx] = updatedRow;
                cmp.get("v.unSelectedRows",unSelectedRows);
            }
            
            rows[index] = updatedRow;

            cmp.set("v.dataRows",rows);
            this.filterAndRenderRowsIfNecessary(cmp,event,false);  
    },
    deleteRow : function(cmp,index) {
        var rows = cmp.get("v.dataRows"),
            row = rows[index],
            selectedRows = cmp.get("v.selectedRows"),
            unSelectedRows = cmp.get("v.unSelectedRows"),
            selectedRowIdx = selectedRows.indexOf(row),
            unSelectedRowIdx = unSelectedRows.indexOf(row);
            
            //delete row if present in selectedRow/unSelectedRows
            if(selectedRowIdx > -1){
                selectedRows.splice(selectedRowIdx,1);
                cmp.get("v.selectedRows",selectedRows);
            }
            else if(unSelectedRowIdx > -1){ // may not happen edge case just being safe
                unSelectedRows.splice(unSelectedRowIdx,1);
                cmp.get("v.unSelectedRows",unSelectedRows);
            }
            
            rows.splice(index,1);
            cmp.set("v.dataRows",rows);
            this.filterAndRenderRowsIfNecessary(cmp,event,false);  
    },
    firedDTActionCellClick : function(cmp,row,column){
        var dtActionEvt = cmp.getEvent("dtActionClick");
        
        dtActionEvt.setParams({
            'row': row,
            'actionId':column,
            'index':cmp.get("v.dataRows").indexOf(row)
        }); 
        
        dtActionEvt.fire();
    },
    fireDTActionClick : function(cmp,row,event){
        var dtActionEvt = cmp.getEvent("dtActionClick"),
            actionId = event.currentTarget.getAttribute('id').split('-')[0],
            params = {
                "actionId":actionId
            };

        if(row){
            params['row'] = row;
            params['index'] = cmp.get("v.dataRows").indexOf(row);
        }
        
        dtActionEvt.setParams(params);
        dtActionEvt.fire();
    },
    generateRow : function(cmp,actualRows,row,columns,popoverActions,nonPopoverActions,config,rowIdx,selectedRows,unselectedRows,selectAll){
        var trNode = document.createElement("tr");
        var rowIndex = actualRows.indexOf(row);
        var device = $A.get("$Browser.formFactor");

        var tdFragments = document.createDocumentFragment();
        var self = this;
        
        if(config.massSelect === true) {
            
            var tdNode = document.createElement("td");
            var showChk = true;
            // run row rule if present
            if (typeof config.showRowSelect !== 'undefined' 
                	&& typeof config.showRowSelect === 'function') {
                showChk = config.showRowSelect(row);
            } 
            
            if (showChk) {
                var chkObj = this.generateCheckbox('selectall-'+rowIdx);
                var chkHolderNode = chkObj.parentNode;
                var checkboxNode = chkObj.checkboxNode;
                
                checkboxNode.setAttribute('data-rowindex',rowIdx);
                
                if(unselectedRows.indexOf(row) > -1){
                    checkboxNode.checked = false;
                }
                else if(selectedRows.indexOf(row) > -1){
                    checkboxNode.checked = true;
                }
                
                tdNode.appendChild(chkHolderNode);
                
                //Add listner to toggle the selected property
                checkboxNode.addEventListener("change",$A.getCallback(function(evt){
                    self.toggleRowSelection(cmp,evt);
                }));
            }
            tdFragments.appendChild(tdNode);
        }

        if(nonPopoverActions.length > 0) {
            tdFragments.appendChild(this.generateActionCell(cmp,row,nonPopoverActions,rowIdx));
        }

        for(var j = 0; j < columns.length;j++){
            tdFragments.appendChild(this.generateDataCell(cmp,row,columns[j],config,rowIdx));
        }

        tdFragments.appendChild(this.generateMenuListAction(cmp,row,popoverActions,rowIdx,selectedRows,unselectedRows,selectAll));

        trNode.appendChild(tdFragments);
        return trNode;
    },
    generateActionCell : function(cmp,row,nonPopoverActions,rowIdx){
        var tdActionFragments = document.createDocumentFragment();
        var globalId = cmp.getGlobalId();
        var self = this;

        if(Array.isArray(nonPopoverActions)){
            var tdNode = document.createElement("td");
            for(var i = 0;i < nonPopoverActions.length;i++){
                var actionNode;
                var rowAction = nonPopoverActions[i];
                
                //add actions only if `id` is present
                if(rowAction.id){

                    if(typeof rowAction.visible === 'boolean') {
                        if(!rowAction.visible) {
                            continue;
                        }
                    }

                    if(typeof rowAction.visible === 'function') {
                        if(!rowAction.visible(row)) {
                            continue;
                        }
                    }

                    if(rowAction.type === 'button'){
                        actionNode = document.createElement('button');
                        actionNode.type = 'button';
                        actionNode.className  = (rowAction.class ? rowAction.class : 'slds-button slds-button--neutral');
                    }
                    else if(rowAction.type === 'image') {
                        actionNode = document.createElement('img');
                        actionNode.src = rowAction.src;
						actionNode.className = 'iconAction '+ (rowAction.class || '');
                        if (rowAction.height) {
                            actionNode.height = rowAction.height;
                        }
                        
                        if (rowAction.width) {
                            actionNode.width = rowAction.width;
                        }
                    }
                    else{
                        actionNode = document.createElement('a');
                        if(rowAction.class){
                            actionNode.className = rowAction.class;
                        }
                        
                        if(tdNode.childNodes.length !== 0){
                            var actionSeparator = document.createElement('span');
                            actionSeparator.textContent = '|';
                            tdNode.appendChild(actionSeparator);
                        }
                    }
					
                    actionNode.id = rowAction.id+'-'+rowIdx+'-'+globalId;
                    if(rowAction.type !== 'icon'){
                    	actionNode.textContent = rowAction.label;
                	}
                
                    actionNode.addEventListener('click',$A.getCallback(function(evt){
                        self.fireDTActionClick(cmp,row,evt);
                    }));
                    
                    tdNode.setAttribute("data-label","Action");
                    tdNode.className = "slds-truncate";
                    tdNode.appendChild(actionNode);
                }
            }

            tdActionFragments.appendChild(tdNode);
        }

        return tdActionFragments;
    },
    generateMenuListAction : function(cmp,row,popoverActions,rowIdx,selectedRows,unselectedRows,selectAll){
        var self = this;
        var offset = cmp.get("v.offset");
        var downiconurl = $A.get('$Resource.ldt__SLDS202') + '/assets/icons/utility/down_60.png';
        var tdActionFragments = document.createDocumentFragment();
        var globalId = cmp.getGlobalId();

        if(popoverActions.length > 0){
            var tdNode = document.createElement("td");
            for (var i = 0; i < popoverActions.length; i++) {
                var menuAction = popoverActions[i];

                if(typeof menuAction.visible === 'function') {
                    if(!menuAction.visible(row)) {
                        continue;
                    }
                }

                var menuHolder = document.createElement('div');
                menuHolder.className  = 'slds-dropdown-trigger slds-dropdown-trigger--click';
                menuHolder.id = 'menu-'+rowIdx+'-'+globalId;
                
                if(menuAction.class) {
                    menuHolder.className += ' '+menuAction.class;
                }
                
                var img = document.createElement('img');
                img.className = 'menuActionIcon';
                
                if(menuAction.menuIconClass) {
                    img.className += ' '+ menuAction.menuIconClass;
                }
                
                img.src = downiconurl;

                if(!menuAction.label) {
                    var anchor = document.createElement('a');
                    img.className += ' imagebox ';
                    anchor.appendChild(img);
                    menuHolder.appendChild(anchor);
                } else {
                    var btnDiv = document.createElement('div');
                    btnDiv.className = 'slds-button slds-button--neutral';
                    btnDiv.textContent = menuAction.label;
                    var span = document.createElement('span');
                    span.className = 'slds-button__icon slds-button__icon--right';
                    span.appendChild(img);
                    btnDiv.appendChild(span);
                    menuHolder.appendChild(btnDiv);
                }
                
                var menuoptionsHolder = document.createElement('div');
                menuoptionsHolder.className  = 'slds-dropdown slds-dropdown--right';
                
                var ul = document.createElement('ul');
                ul.className  = 'slds-dropdown__list';
                ul.role = 'menu';

                for(var i = 0;i < menuAction.menuOptions.length;i++){
                    var menuOptionAction = menuAction.menuOptions[i];
                    var anchordrop;
                    
                    if(typeof menuOptionAction.visible === 'function') {
                        if(!menuOptionAction.visible(row)) {
                            continue;
                        }
                    }
                    
                    var li = document.createElement('li');
                    li.className = 'slds-dropdown__item';
                    li.id = menuOptionAction.id+'-'+rowIdx+'-'+globalId;
                    
                    anchordrop = document.createElement('a');
                    anchordrop.textContent = menuOptionAction.label;
                    if(menuOptionAction.class) {
                        anchordrop.className  = menuOptionAction.class;
                    }

                    li.addEventListener('click',$A.getCallback(function(evt){
                        var parentnode = document.getElementById(globalId);
                        var ele = parentnode.getElementsByClassName('slds-dropdown-trigger slds-dropdown-trigger--click slds-is-open');
                        
                        if(ele.length > 0){
                            for(var i = 0;i < ele.length;i++) {
                                ele[i].classList.remove('slds-is-open');
                            }
                        }
                        
                        self.fireDTActionClick(cmp,row,evt);
                        evt.stopPropagation();
                    }));
                    
                    li.appendChild(anchordrop);
                    ul.appendChild(li);

                }

                if(ul.childNodes.length) {            
                    menuoptionsHolder.appendChild(ul);
                    menuHolder.appendChild(menuoptionsHolder);
            
                    menuHolder.addEventListener('click',$A.getCallback(function(evt){
                        
                        var parentnode = document.getElementById(globalId);
                        var ele = parentnode.getElementsByClassName('slds-dropdown-trigger slds-dropdown-trigger--click slds-is-open');
                        
                        if(ele.length > 0 && (ele[0].id !== menuHolder.id)){
                            for(var i = 0;i < ele.length;i++){
                            	ele[i].classList.remove('slds-is-open');
                            }
                        } 
                        evt.stopPropagation();
                        
                        self.showDropdown(cmp,evt,menuHolder.id);
                        self.identifyPosition(cmp,evt,menuoptionsHolder);  

                    }));
                    
                    
                    tdNode.className = 'menuOverflowFix';
                    tdNode.setAttribute("data-label","Action");
                    tdNode.appendChild(menuHolder);
                }
            } 
            
            tdActionFragments.appendChild(tdNode);
        }

        return tdActionFragments;
    },
    identifyPosition:function(cmp,event,menuDiv){
        var menuItemDiv = event.currentTarget;
        var tableNode = cmp.find("dtTable").getElement();
        var rect = tableNode.getBoundingClientRect();
        var parentHeight = tableNode.clientHeight;
        var popoverheight = menuDiv.clientHeight;
        var relativeYPosition = menuItemDiv.getBoundingClientRect().top  +  window.pageYOffset;
        
        if(((relativeYPosition + popoverheight) > parentHeight)){
            menuItemDiv.childNodes[1].className = 'slds-dropdown slds-dropdown--bottom slds-dropdown--right';
        }
        
        //make sure the menu list options are not hidden
        if(((rect.top + window.pageYOffset + popoverheight) > event.pageY) && (parentHeight < relativeYPosition + popoverheight)){
            menuDiv.style.overflow = "auto";
            menuDiv.style.height = (((menuDiv.getBoundingClientRect().bottom) +  window.pageYOffset) - (rect.top +  window.pageYOffset)) +"px";  
        }
    },
    showDropdown : function(cmp,evt,rowIdx){
        var globalId = cmp.getGlobalId();
        var ele = document.getElementById(rowIdx);
        var classname =  ele.className;

        if (classname.indexOf("slds-is-open") !== -1) {
            ele.className = ele.className.replace(new RegExp('(?:^|\\s)'+ 'slds-is-open' + '(?:\\s|$)'),'');
        } else {
            ele.className += " slds-is-open";
        } 
    },
    closeDropdown : function(cmp,event){
        var globalId = cmp.getGlobalId();
        var parentnode = document.getElementById(globalId);
        var ele = parentnode.getElementsByClassName('slds-dropdown-trigger slds-dropdown-trigger--click slds-is-open');
        if(ele.length > 0){
            for(var i = 0;i < ele.length;i++){
            	ele[i].classList.remove('slds-is-open'); 
            }
        }
    },
    generateDataCell : function(cmp,row,columnConfig,config,rowIdx){
        var tdChildNode,
            columnName = columnConfig.name,
            type = columnConfig.type,
            value,
            self = this,
            isCellClickEnabled = columnConfig.clickEnabled,
            tdNode = document.createElement("td");

        tdNode.className = "slds-truncate";
        value = _.get(row,columnName);

        if(!this.hasValue(value)){
            value = "";
        }
        
        if(type === "checkbox"){
            var chkObj = this.generateCheckbox('chk-'+rowIdx);
            var chkHolderNode = chkObj.parentNode;
            tdChildNode = chkObj.checkboxNode;
            tdChildNode.checked = value;
            tdChildNode.disabled = "disabled";
            tdNode.appendChild(chkHolderNode);
        }
        else if(value !== ''){            
            if(type != 'date' && type !== 'datetime'){
                if(type === 'reference'){
                    tdChildNode = document.createElement('a');
                    tdChildNode.textContent = value;
                    var refValue = _.get(row,columnConfig.value) || value || '';
                    tdChildNode.setAttribute("data-recordid",refValue);
					
                    if (!columnConfig.target) {
                        //go to record detail
                        tdChildNode.addEventListener('click',$A.getCallback(function(evt){
                            self.navigateToDetailRecord(evt);
                        }));
                    } else {
                        tdChildNode.target = columnConfig.target;
                        if ($A.get("e.force:showToast")) {
                            tdChildNode.href = '#/sObject/'+ refValue +'/view'; 
                        } else {
                            tdChildNode.href = "/one/one.app#/sObject/"+refValue+"/view";
                        }
                        
                    }
                }
                else if(type === 'url'){
                    tdChildNode = document.createElement('a');
                    if(!isCellClickEnabled){
                        if(columnConfig.value){
                            tdChildNode.href = _.get(row,columnConfig.value) || '';
                        }
                        else{
                            tdChildNode.href = value;
                        }
                        tdChildNode.target = columnConfig.target || "_blank";
                    }
                    tdChildNode.textContent = value;
                }
                else if(type === 'number'){
                    tdChildNode = document.createElement('span');
                    var format = columnConfig.format || this.getNumberFormat();
                    tdChildNode.textContent = $A.localizationService.getNumberFormat(format).format(value);
                }
                else if(type === 'currency'){
                    tdChildNode = document.createElement('span');
                    var symbol = this.getCurrency(); 
                    if (columnConfig.format) {
                        var format = columnConfig.format;
                        var formatedCurrency = $A.localizationService.formatCurrency(value);
                        if (formatedCurrency.indexOf(symbol) > 1 ){
                            tdChildNode.textContent =  $A.localizationService.getNumberFormat(format).format(value) + symbol;
                        } else {
                            tdChildNode.textContent = symbol + $A.localizationService.getNumberFormat(format).format(value);
                        }
                    } else {
                        tdChildNode.textContent = $A.localizationService.formatCurrency(value);
                    }
                    
                }
                else if(type === 'percent'){
                    tdChildNode = document.createElement('span');
                    var format = columnConfig.format || this.getNumberFormat();
                    tdChildNode.textContent = $A.localizationService.getNumberFormat(format).format(value)+'%';
                }
                else if(type === 'email'){
                    tdChildNode = document.createElement('a');
                    tdChildNode.textContent = value;
                    tdChildNode.href = 'mailto:'+value;
                }
                else if(type === 'image'){
                    tdChildNode = document.createElement('img');
                    tdChildNode.src = value;
                    tdChildNode.className = 'imgclass';
                    tdChildNode.height = columnConfig.height || 50;
                    tdChildNode.width = columnConfig.width || 40;
                }
                else if(type === 'richtext'){
                    tdChildNode = document.createElement('span');
                    tdChildNode.innerHTML = value;
                }
                else{
                    tdChildNode = document.createElement('span');
                    tdChildNode.textContent = value;
                }
            }
            else if(type === 'date'){
                tdChildNode = document.createElement('span');
                var dateFormat = columnConfig.format || 'D-MMM-YYYY';
                tdChildNode.textContent = moment.tz(value,this.getTimeZone()).format(dateFormat);
            }
            else if(type === 'datetime'){
                tdChildNode = document.createElement('span');
                var dateTimeFormat = columnConfig.format || 'D-MMM-YYYY HH:mm A';
                tdChildNode.textContent = moment.tz(value,this.getTimeZone()).format(dateTimeFormat);
            }
            
            if(isCellClickEnabled){
                tdChildNode.addEventListener('click',$A.getCallback(function(evt){
                    self.firedDTActionCellClick(cmp,row,columnName);
                }));
            }
            
            tdChildNode.setAttribute('title',tdChildNode.textContent);
            tdNode.appendChild(tdChildNode);
        }
        
        tdNode.setAttribute('data-label',columnConfig.label);

        return tdNode;
    },
    generateCheckbox : function(id){
        var chkFrmNode = document.createElement("div");  
        chkFrmNode.className = "slds-form-element";

        var chkFrmCtrlNode = document.createElement("div");
        chkFrmCtrlNode.className = "slds-form-element__control";

        var chkHolder = document.createElement("span");
        chkHolder.className = "slds-checkbox";

        var chkLabel = document.createElement("label");
        chkLabel.className = "slds-checkbox__label";

        var fauxNode = document.createElement("span");
        fauxNode.className = "slds-checkbox--faux"

        var checkboxNode = document.createElement("input");
        checkboxNode.type = "checkbox";
        checkboxNode.className = "slds-checkbox";

        chkLabel.appendChild(checkboxNode);
        chkLabel.appendChild(fauxNode);
        chkHolder.appendChild(chkLabel);
        chkFrmCtrlNode.appendChild(chkHolder);
        chkFrmNode.appendChild(chkFrmCtrlNode);
        
        return {"parentNode": chkFrmNode,"checkboxNode":checkboxNode};
    },
    stringFormat : function(text, args) {
        return text.replace(/{(\d+)}/g, function(match, number) { 
          return typeof args[number] != 'undefined'
            ? args[number]
            : match
          ;
        });
    },
    hasValue : function(value) {
        if(typeof value === 'boolean' || value === 0){
            return true
        }
        else if(value){
            return true;
        }
        return false;
    },
    getDateFormat : function(){
        return $A.get("$Locale.dateFormat");
    },
    getDateTimeFormat : function(){
        return $A.get("$Locale.datetimeFormat");
    },
    getLocale : function(){
        return $A.get("$Locale.langLocale");
    },
    getTimeZone : function(){
        return $A.get("$Locale.timezone");
    },
    getCurrency : function(){
        return $A.get("$Locale.currency");
    },
    getNumberFormat : function(){
        return $A.get("$Locale.numberFormat");
    }
})