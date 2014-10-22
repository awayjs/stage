var Header = require("awayjs-stagegl/lib/aglsl/Header");
var Description = (function () {
    function Description() {
        this.regread = [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];
        this.regwrite = [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];
        this.hasindirect = false;
        this.writedepth = false;
        this.hasmatrix = false;
        this.samplers = [];
        // added due to dynamic assignment 3*0xFFFFFFuuuu
        this.tokens = [];
        this.header = new Header();
    }
    return Description;
})();
module.exports = Description;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFnbHNsL2Rlc2NyaXB0aW9uLnRzIl0sIm5hbWVzIjpbIkRlc2NyaXB0aW9uIiwiRGVzY3JpcHRpb24uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sTUFBTSxXQUFlLGlDQUFpQyxDQUFDLENBQUM7QUFHL0QsSUFBTSxXQUFXO0lBNkJoQkEsU0E3QktBLFdBQVdBO1FBRVRDLFlBQU9BLEdBQVNBO1lBQ3RCQSxFQUFFQTtZQUNGQSxFQUFFQTtZQUNGQSxFQUFFQTtZQUNGQSxFQUFFQTtZQUNGQSxFQUFFQTtZQUNGQSxFQUFFQTtZQUNGQSxFQUFFQTtTQUNGQSxDQUFDQTtRQUNLQSxhQUFRQSxHQUFTQTtZQUN2QkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7U0FDRkEsQ0FBQ0E7UUFDS0EsZ0JBQVdBLEdBQVdBLEtBQUtBLENBQUNBO1FBQzVCQSxlQUFVQSxHQUFXQSxLQUFLQSxDQUFDQTtRQUMzQkEsY0FBU0EsR0FBV0EsS0FBS0EsQ0FBQ0E7UUFDMUJBLGFBQVFBLEdBQVNBLEVBQUVBLENBQUNBO1FBRTNCQSxpREFBaURBO1FBQzFDQSxXQUFNQSxHQUFXQSxFQUFFQSxDQUFDQTtRQUNwQkEsV0FBTUEsR0FBVUEsSUFBSUEsTUFBTUEsRUFBRUEsQ0FBQ0E7SUFJcENBLENBQUNBO0lBQ0ZELGtCQUFDQTtBQUFEQSxDQWhDQSxBQWdDQ0EsSUFBQTtBQUVELEFBQXFCLGlCQUFaLFdBQVcsQ0FBQyIsImZpbGUiOiJhZ2xzbC9EZXNjcmlwdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvcm9iYmF0ZW1hbi9XZWJzdG9ybVByb2plY3RzL2F3YXlqcy1zdGFnZWdsLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBIZWFkZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL0hlYWRlclwiKTtcbmltcG9ydCBUb2tlblx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYWdsc2wvVG9rZW5cIik7XG5cbmNsYXNzIERlc2NyaXB0aW9uXG57XG5cdHB1YmxpYyByZWdyZWFkOmFueVtdID0gW1xuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdXG5cdF07XG5cdHB1YmxpYyByZWd3cml0ZTphbnlbXSA9IFtcblx0XHRbXSxcblx0XHRbXSxcblx0XHRbXSxcblx0XHRbXSxcblx0XHRbXSxcblx0XHRbXSxcblx0XHRbXVxuXHRdO1xuXHRwdWJsaWMgaGFzaW5kaXJlY3Q6Ym9vbGVhbiA9IGZhbHNlO1xuXHRwdWJsaWMgd3JpdGVkZXB0aDpib29sZWFuID0gZmFsc2U7XG5cdHB1YmxpYyBoYXNtYXRyaXg6Ym9vbGVhbiA9IGZhbHNlO1xuXHRwdWJsaWMgc2FtcGxlcnM6YW55W10gPSBbXTtcblxuXHQvLyBhZGRlZCBkdWUgdG8gZHluYW1pYyBhc3NpZ25tZW50IDMqMHhGRkZGRkZ1dXV1XG5cdHB1YmxpYyB0b2tlbnM6VG9rZW5bXSA9IFtdO1xuXHRwdWJsaWMgaGVhZGVyOkhlYWRlciA9IG5ldyBIZWFkZXIoKTtcblxuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0fVxufVxuXG5leHBvcnQgPSBEZXNjcmlwdGlvbjsiXX0=