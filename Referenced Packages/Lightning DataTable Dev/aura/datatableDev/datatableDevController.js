({
    setLodashLoaded : function(cmp, event, helper){
        //set locale to fix the ui:inputDate/ui:inputDateTime error
        moment.locale($A.get("$Locale.langLocale"));
        cmp.set("v.lodashLoaded",true);
        var rows = cmp.get("v.dataRows");
        
        if(!rows){
            rows = [];
            cmp.set("v.dataRows",rows);
        }
        
        //make sure initialize method is called before invoking table initializer 
        if(cmp.get("v.init")){
            helper.initializeTable(cmp,event,helper,rows);
        }
    },
    initialize : function(cmp, event, helper){
        cmp.set("v.init",true);
        cmp.set("v.sortColumn",{'label':'','name':''});
        cmp.set("v.sortOrder",'');
        cmp.set("v.selectAll",false);
        cmp.set("v.initializeDone",true);
        cmp.set("v.selectedRows",[]);
        cmp.set("v.unSelectedRows",[]);
		cmp.set("v.searchTxt",'');
        
        var config = cmp.get("v.config") || {};
        var initConfig = event.getParam('arguments').initConfig || {};
        cmp.set("v.initConfig",initConfig);
		
        
        //set default value to the config object 
        if(config){
            if(config.searchBox !== false || typeof config.searchBox === 'undefined'){
                config.searchBox = true;
            }
         
            //hide search by column if search box is hidden
            if(config.searchBox === false){
                config.searchByColumn = false;
            }
            var temp = {};
            
            if(typeof config.itemMenuPosition === 'undefined') {
                config.itemMenuPosition = 'top';
            }
            
            for (var prop in config) {
                temp[prop] = config[prop];
            }
			
            if(temp['paginate'] !== false) {
                temp['paginate'] = true;
            }   
            
            //Hacky need to create case with sf
            cmp.set("v.config",temp);
        }   
        
        //make sure setLodashLoaded method is called before invoking table initializer 
        if(cmp.get("v.lodashLoaded")){
            helper.initializeTable(cmp,event,helper,cmp.get("v.dataRows"));
        }
        else{
            helper.showDtTable(cmp);
        }
    },
    searchRowByColumn : function(cmp,event,helper){
        var columnToSearch = event.getSource().get("v.value")
        cmp.set("v.reRender",false);
        cmp.set("v.searchByCol",columnToSearch);
        //filter rows based on column
        if(columnToSearch){
            helper.filterAndRenderRowsIfNecessary(cmp,event);
        }
    },
    limitChange : function(cmp,event,helper){
        helper.updateLimit(cmp);
        helper.renderRows(cmp,event,cmp.get("v._rows"),false);
    },
    searchForText : function(cmp,event,helper){
        window.clearTimeout(helper.timeoutRef);
        helper.timeoutRef = window.setTimeout(
            $A.getCallback(function() {
                if (cmp.isValid()) {
                    helper.filterAndRenderRowsIfNecessary(cmp,event);
                }
            }),150
        );
    },
    cancelSearch : function(cmp,event,helper){
        window.clearTimeout(helper.timeoutRef);
    },
    sortColumn : function(cmp, event, helper) {
        helper.sortByColumn(cmp,event,helper);
    },
    previous : function(cmp, event, helper) {
        var offset = cmp.get("v.offset"),
            limit = cmp.get("v.limit"),
            searchTxt = cmp.get("v.searchTxt"),
            _rows = cmp.get("v._rows");
        
        offset -= limit;
        offset = (offset <= 0) ? 0 : offset;
        
        cmp.set("v.rowsToDisplay",_.slice(_rows,offset,offset+limit));
        cmp.set("v.offset",offset);
    },
    next : function(cmp, event, helper){
        var offset = cmp.get("v.offset"),
            limit = cmp.get("v.limit"),
            searchTxt = cmp.get("v.searchTxt"),
            _rows = cmp.get("v._rows");
        
        offset += limit;
        
        cmp.set("v.rowsToDisplay",_.slice(_rows,offset,offset+limit));
        cmp.set("v.offset",offset);
    },
    toggleSelectAll : function(cmp,event,helper){
        var rows = cmp.get("v.dataRows");
        var _rows = cmp.get("v._rows");
        var selectAll = !cmp.get("v.selectAll");
        var searchTxt = cmp.get("v.searchTxt");
        cmp.set("v.selectAll",selectAll);

        if(selectAll){
            
            if(_rows.length){

                //If there's rows after filtering
                if(searchTxt){
                    // combine current selected rows with already selected rows
                    var selectedRows = cmp.get("v.selectedRows").concat(_rows);
                    cmp.set("v.selectedRows",selectedRows);
                    cmp.set("v.unSelectedRows",_.difference(cmp.get("v.unSelectedRows"),selectedRows));
                } else {

                    //No search text, then mark all rows as selected
                    cmp.set("v.selectedRows",[].concat(rows));
                    cmp.set("v.unSelectedRows",[]); 
                }
            }  
            
        } else {

            if(searchTxt){
                // combine current unselected rows with already unselected rows
                var unSelectedRows = cmp.get("v.unSelectedRows").concat(_rows);
                cmp.set("v.unSelectedRows",unSelectedRows);
                cmp.set("v.selectedRows",_.difference(cmp.get("v.selectedRows"),unSelectedRows));
            } else{
                //if selectall equates to 'false', then mark all rows as unselected
                cmp.set("v.unSelectedRows",[].concat(rows));
                cmp.set("v.selectedRows",[]);
            }
        }
        
    },
    addRow : function(cmp,event,helper){
        var params = event.getParam('arguments');
        if(params && params.row){
            var rows = cmp.get("v.dataRows");
            rows.push(params.row);
            cmp.set("v.dataRows",rows);
            helper.filterAndRenderRowsIfNecessary(cmp,event);
        }
    },
    updateRow : function(cmp,event,helper){
        var params = event.getParam('arguments');
        if(params && params.row && params.index !== -1){
            helper.updateRow(cmp,params.index,params.row);  
        }
    },
    updateRowByUniqueKey : function(cmp,event,helper){
        var params = event.getParam('arguments');
        if(params && params.row && params.label){
            var rows = cmp.get("v.dataRows"); 
            var index = _.findIndex(rows, function(row) {
               return row[params.label] === params.value 
            });

            if (index !== -1) {
                helper.updateRow(cmp,index,params.row)
            }
        }
    },
    deleteRow : function(cmp,event,helper){
        var params = event.getParam('arguments');
        if(params && params.index !== -1){
            helper.deleteRow(cmp,params.index);          
        }
    },
    deleteRowByUniqueKey : function(cmp,event,helper){
        var params = event.getParam('arguments');
        if(params && params.row && params.label){
            var rows = cmp.get("v.dataRows")
                
            var index = _.findIndex(rows, function(row) {
               return row[params.label] === params.value 
            });

            if (index !== -1) {
                helper.deleteRow(cmp,index);
            } 
        }
    },
    reInitialize : function(cmp,event,helper){
        cmp.set("v.selectedRows",[]);
        cmp.set("v.unSelectedRows",[]);
        cmp.set("v.selectAll",false);
        var to, 
            offset = cmp.get("v.offset"),
            limit = cmp.get("v.limit"), 
            rows = cmp.get("v.dataRows");
        
        to = offset + limit;
       
        if (to > rows.length) {
            cmp.set("v.offset", 0);
            cmp.get("v._rows", rows);
        } else {
            console.log(rows);
        }
        helper.filterAndRenderRowsIfNecessary(cmp,event);
    }
})