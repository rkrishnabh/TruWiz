public class getSobjectChildWrapper {
@auraenabled
    public string Label{get;set;}
    @auraenabled
    public string Name{get;set;}
    public getSobjectChildWrapper(string a, string b){
        Label = a;
        Name = b;
    }
}