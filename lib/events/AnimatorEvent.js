var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Event = require("awayjs-core/lib/events/Event");
/**
 * Dispatched to notify changes in an animator's state.
 */
var AnimatorEvent = (function (_super) {
    __extends(AnimatorEvent, _super);
    /**
     * Create a new <code>AnimatorEvent</code> object.
     *
     * @param type The event type.
     * @param animator The animator object that is the subject of this event.
     */
    function AnimatorEvent(type, animator) {
        _super.call(this, type);
        this._animator = animator;
    }
    Object.defineProperty(AnimatorEvent.prototype, "animator", {
        get: function () {
            return this._animator;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clones the event.
     *
     * @return An exact duplicate of the current event object.
     */
    AnimatorEvent.prototype.clone = function () {
        return new AnimatorEvent(this.type, this._animator);
    };
    /**
     * Defines the value of the type property of a start event object.
     */
    AnimatorEvent.START = "start";
    /**
     * Defines the value of the type property of a stop event object.
     */
    AnimatorEvent.STOP = "stop";
    /**
     * Defines the value of the type property of a cycle complete event object.
     */
    AnimatorEvent.CYCLE_COMPLETE = "cycle_complete";
    return AnimatorEvent;
})(Event);
module.exports = AnimatorEvent;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50cy9hbmltYXRvcmV2ZW50LnRzIl0sIm5hbWVzIjpbIkFuaW1hdG9yRXZlbnQiLCJBbmltYXRvckV2ZW50LmNvbnN0cnVjdG9yIiwiQW5pbWF0b3JFdmVudC5hbmltYXRvciIsIkFuaW1hdG9yRXZlbnQuY2xvbmUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQU8sS0FBSyxXQUFnQiw4QkFBOEIsQ0FBQyxDQUFDO0FBSTVELEFBR0E7O0dBREc7SUFDRyxhQUFhO0lBQVNBLFVBQXRCQSxhQUFhQSxVQUFjQTtJQW1CaENBOzs7OztPQUtHQTtJQUNIQSxTQXpCS0EsYUFBYUEsQ0F5Qk5BLElBQVdBLEVBQUVBLFFBQXFCQTtRQUU3Q0Msa0JBQU1BLElBQUlBLENBQUNBLENBQUNBO1FBQ1pBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLFFBQVFBLENBQUNBO0lBQzNCQSxDQUFDQTtJQUVERCxzQkFBV0EsbUNBQVFBO2FBQW5CQTtZQUVDRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7OztPQUFBRjtJQUVEQTs7OztPQUlHQTtJQUNJQSw2QkFBS0EsR0FBWkE7UUFFQ0csTUFBTUEsQ0FBQ0EsSUFBSUEsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7SUFDckRBLENBQUNBO0lBMUNESDs7T0FFR0E7SUFDV0EsbUJBQUtBLEdBQVVBLE9BQU9BLENBQUNBO0lBRXJDQTs7T0FFR0E7SUFDV0Esa0JBQUlBLEdBQVVBLE1BQU1BLENBQUNBO0lBRW5DQTs7T0FFR0E7SUFDV0EsNEJBQWNBLEdBQVVBLGdCQUFnQkEsQ0FBQ0E7SUE4QnhEQSxvQkFBQ0E7QUFBREEsQ0E3Q0EsQUE2Q0NBLEVBN0MyQixLQUFLLEVBNkNoQztBQUVELEFBQXVCLGlCQUFkLGFBQWEsQ0FBQyIsImZpbGUiOiJldmVudHMvQW5pbWF0b3JFdmVudC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvcm9iYmF0ZW1hbi9XZWJzdG9ybVByb2plY3RzL2F3YXlqcy1zdGFnZWdsLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFdmVudFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnRcIik7XG5cbmltcG9ydCBBbmltYXRvckJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FuaW1hdG9ycy9BbmltYXRvckJhc2VcIik7XG5cbi8qKlxuICogRGlzcGF0Y2hlZCB0byBub3RpZnkgY2hhbmdlcyBpbiBhbiBhbmltYXRvcidzIHN0YXRlLlxuICovXG5jbGFzcyBBbmltYXRvckV2ZW50IGV4dGVuZHMgRXZlbnRcbntcblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIHZhbHVlIG9mIHRoZSB0eXBlIHByb3BlcnR5IG9mIGEgc3RhcnQgZXZlbnQgb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBTVEFSVDpzdHJpbmcgPSBcInN0YXJ0XCI7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIHZhbHVlIG9mIHRoZSB0eXBlIHByb3BlcnR5IG9mIGEgc3RvcCBldmVudCBvYmplY3QuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIFNUT1A6c3RyaW5nID0gXCJzdG9wXCI7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIHZhbHVlIG9mIHRoZSB0eXBlIHByb3BlcnR5IG9mIGEgY3ljbGUgY29tcGxldGUgZXZlbnQgb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBDWUNMRV9DT01QTEVURTpzdHJpbmcgPSBcImN5Y2xlX2NvbXBsZXRlXCI7XG5cblx0cHJpdmF0ZSBfYW5pbWF0b3I6QW5pbWF0b3JCYXNlO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBuZXcgPGNvZGU+QW5pbWF0b3JFdmVudDwvY29kZT4gb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gdHlwZSBUaGUgZXZlbnQgdHlwZS5cblx0ICogQHBhcmFtIGFuaW1hdG9yIFRoZSBhbmltYXRvciBvYmplY3QgdGhhdCBpcyB0aGUgc3ViamVjdCBvZiB0aGlzIGV2ZW50LlxuXHQgKi9cblx0Y29uc3RydWN0b3IodHlwZTpzdHJpbmcsIGFuaW1hdG9yOkFuaW1hdG9yQmFzZSlcblx0e1xuXHRcdHN1cGVyKHR5cGUpO1xuXHRcdHRoaXMuX2FuaW1hdG9yID0gYW5pbWF0b3I7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IGFuaW1hdG9yKCk6QW5pbWF0b3JCYXNlXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYW5pbWF0b3I7XG5cdH1cblxuXHQvKipcblx0ICogQ2xvbmVzIHRoZSBldmVudC5cblx0ICpcblx0ICogQHJldHVybiBBbiBleGFjdCBkdXBsaWNhdGUgb2YgdGhlIGN1cnJlbnQgZXZlbnQgb2JqZWN0LlxuXHQgKi9cblx0cHVibGljIGNsb25lKCk6RXZlbnRcblx0e1xuXHRcdHJldHVybiBuZXcgQW5pbWF0b3JFdmVudCh0aGlzLnR5cGUsIHRoaXMuX2FuaW1hdG9yKTtcblx0fVxufVxuXG5leHBvcnQgPSBBbmltYXRvckV2ZW50OyJdfQ==