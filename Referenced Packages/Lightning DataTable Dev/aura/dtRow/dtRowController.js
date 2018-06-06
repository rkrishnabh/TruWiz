({
	generateRowContent : function(cmp, event, helper) {
		var row = cmp.get("v.row"),
            rowContent = [],
            config = cmp.get("v.config"),
            _columns = cmp.get("v.columns") || [],
            selRows = cmp.get("v.selectedRows"),
            unSelRow = cmp.get("v.unSelectedRows");
        
        var dtRowCellArr = [];
        
        for(var i = 0; i < _columns.length;i++){
            var column = _columns[i];

            if(!helper.hasValue(row[column.name])){
                row[column.name] = null;
            }
            
            
            rowContent.push({
                    'value':row[column.name],
                    'label':column.label,
                    'name':column.name,
                    'type':column.type,
                    'attributes':column.attributes
                });
            
        }
        
        cmp.set("v.rowContent",rowContent);
        
        if(unSelRow.indexOf(row) > -1 && cmp.get("v.selectAll")){
            cmp.set("v.selected",false);
        }
        else if(selRows.indexOf(row) > - 1 || cmp.get("v.selectAll")){
            cmp.set("v.selected",true);
        }
        
	},
    addRemoveSelectedRows : function(cmp,event,helper){
        var selRows = cmp.get("v.selectedRows"),
            unSelRow = cmp.get("v.unSelectedRows"),
            row = cmp.get("v.row");
       
        if(cmp.get("v.selected")){
            selRows.push(row);
            unSelRow.splice(unSelRow.indexOf(row),1);
        }
        else{
            unSelRow.push(selRows.splice(selRows.indexOf(row),1)[0]);
        }
        
        cmp.set("v.selectedRows",selRows);
        cmp.set("v.unSelectedRows",unSelRow);

    }
})