var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Event = require("awayjs-core/lib/events/Event");
var StageEvent = (function (_super) {
    __extends(StageEvent, _super);
    function StageEvent(type) {
        _super.call(this, type);
    }
    StageEvent.CONTEXT_CREATED = "contextCreated";
    StageEvent.CONTEXT_DISPOSED = "contextDisposed";
    StageEvent.CONTEXT_RECREATED = "contextRecreated";
    StageEvent.VIEWPORT_UPDATED = "viewportUpdated";
    return StageEvent;
})(Event);
module.exports = StageEvent;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9ldmVudHMvU3RhZ2VFdmVudC50cyJdLCJuYW1lcyI6WyJTdGFnZUV2ZW50IiwiU3RhZ2VFdmVudC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBTyxLQUFLLFdBQWUsOEJBQThCLENBQUMsQ0FBQztBQUUzRCxJQUFNLFVBQVU7SUFBU0EsVUFBbkJBLFVBQVVBLFVBQWNBO0lBTzdCQSxTQVBLQSxVQUFVQSxDQU9IQSxJQUFXQTtRQUV0QkMsa0JBQU1BLElBQUlBLENBQUNBLENBQUNBO0lBQ2JBLENBQUNBO0lBUmFELDBCQUFlQSxHQUFVQSxnQkFBZ0JBLENBQUNBO0lBQzFDQSwyQkFBZ0JBLEdBQVVBLGlCQUFpQkEsQ0FBQ0E7SUFDNUNBLDRCQUFpQkEsR0FBVUEsa0JBQWtCQSxDQUFDQTtJQUM5Q0EsMkJBQWdCQSxHQUFVQSxpQkFBaUJBLENBQUNBO0lBTTNEQSxpQkFBQ0E7QUFBREEsQ0FYQSxBQVdDQSxFQVh3QixLQUFLLEVBVzdCO0FBRUQsQUFBb0IsaUJBQVgsVUFBVSxDQUFDIiwiZmlsZSI6ImV2ZW50cy9TdGFnZUV2ZW50LmpzIiwic291cmNlUm9vdCI6Ii4uLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0V2ZW50XCIpO1xuXG5jbGFzcyBTdGFnZUV2ZW50IGV4dGVuZHMgRXZlbnRcbntcblx0cHVibGljIHN0YXRpYyBDT05URVhUX0NSRUFURUQ6c3RyaW5nID0gXCJjb250ZXh0Q3JlYXRlZFwiO1xuXHRwdWJsaWMgc3RhdGljIENPTlRFWFRfRElTUE9TRUQ6c3RyaW5nID0gXCJjb250ZXh0RGlzcG9zZWRcIjtcblx0cHVibGljIHN0YXRpYyBDT05URVhUX1JFQ1JFQVRFRDpzdHJpbmcgPSBcImNvbnRleHRSZWNyZWF0ZWRcIjtcblx0cHVibGljIHN0YXRpYyBWSUVXUE9SVF9VUERBVEVEOnN0cmluZyA9IFwidmlld3BvcnRVcGRhdGVkXCI7XG5cblx0Y29uc3RydWN0b3IodHlwZTpzdHJpbmcpXG5cdHtcblx0XHRzdXBlcih0eXBlKTtcblx0fVxufVxuXG5leHBvcnQgPSBTdGFnZUV2ZW50OyJdfQ==