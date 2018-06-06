global class getsobjectFieldsList implements Comparable {
    @auraenabled
    public string Label{get;set;}
    @auraenabled
    public string Name{get;set;}
    public getsobjectFieldsList(string a, string b){
        Label = a;
        Name = b;
    }
    global Integer compareTo(Object ObjToCompare) {
        return Label.CompareTo(((getsobjectFieldsList)ObjToCompare).Label);
    }
}