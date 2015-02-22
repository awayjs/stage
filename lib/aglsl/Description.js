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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9EZXNjcmlwdGlvbi50cyJdLCJuYW1lcyI6WyJEZXNjcmlwdGlvbiIsIkRlc2NyaXB0aW9uLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLE1BQU0sV0FBZSxpQ0FBaUMsQ0FBQyxDQUFDO0FBRy9ELElBQU0sV0FBVztJQTZCaEJBLFNBN0JLQSxXQUFXQTtRQUVUQyxZQUFPQSxHQUFTQTtZQUN0QkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7U0FDRkEsQ0FBQ0E7UUFDS0EsYUFBUUEsR0FBU0E7WUFDdkJBLEVBQUVBO1lBQ0ZBLEVBQUVBO1lBQ0ZBLEVBQUVBO1lBQ0ZBLEVBQUVBO1lBQ0ZBLEVBQUVBO1lBQ0ZBLEVBQUVBO1lBQ0ZBLEVBQUVBO1NBQ0ZBLENBQUNBO1FBQ0tBLGdCQUFXQSxHQUFXQSxLQUFLQSxDQUFDQTtRQUM1QkEsZUFBVUEsR0FBV0EsS0FBS0EsQ0FBQ0E7UUFDM0JBLGNBQVNBLEdBQVdBLEtBQUtBLENBQUNBO1FBQzFCQSxhQUFRQSxHQUFTQSxFQUFFQSxDQUFDQTtRQUUzQkEsaURBQWlEQTtRQUMxQ0EsV0FBTUEsR0FBV0EsRUFBRUEsQ0FBQ0E7UUFDcEJBLFdBQU1BLEdBQVVBLElBQUlBLE1BQU1BLEVBQUVBLENBQUNBO0lBSXBDQSxDQUFDQTtJQUNGRCxrQkFBQ0E7QUFBREEsQ0FoQ0EsQUFnQ0NBLElBQUE7QUFFRCxBQUFxQixpQkFBWixXQUFXLENBQUMiLCJmaWxlIjoiYWdsc2wvRGVzY3JpcHRpb24uanMiLCJzb3VyY2VSb290IjoiLi4vIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEhlYWRlclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYWdsc2wvSGVhZGVyXCIpO1xyXG5pbXBvcnQgVG9rZW5cdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2FnbHNsL1Rva2VuXCIpO1xyXG5cclxuY2xhc3MgRGVzY3JpcHRpb25cclxue1xyXG5cdHB1YmxpYyByZWdyZWFkOmFueVtdID0gW1xyXG5cdFx0W10sXHJcblx0XHRbXSxcclxuXHRcdFtdLFxyXG5cdFx0W10sXHJcblx0XHRbXSxcclxuXHRcdFtdLFxyXG5cdFx0W11cclxuXHRdO1xyXG5cdHB1YmxpYyByZWd3cml0ZTphbnlbXSA9IFtcclxuXHRcdFtdLFxyXG5cdFx0W10sXHJcblx0XHRbXSxcclxuXHRcdFtdLFxyXG5cdFx0W10sXHJcblx0XHRbXSxcclxuXHRcdFtdXHJcblx0XTtcclxuXHRwdWJsaWMgaGFzaW5kaXJlY3Q6Ym9vbGVhbiA9IGZhbHNlO1xyXG5cdHB1YmxpYyB3cml0ZWRlcHRoOmJvb2xlYW4gPSBmYWxzZTtcclxuXHRwdWJsaWMgaGFzbWF0cml4OmJvb2xlYW4gPSBmYWxzZTtcclxuXHRwdWJsaWMgc2FtcGxlcnM6YW55W10gPSBbXTtcclxuXHJcblx0Ly8gYWRkZWQgZHVlIHRvIGR5bmFtaWMgYXNzaWdubWVudCAzKjB4RkZGRkZGdXV1dVxyXG5cdHB1YmxpYyB0b2tlbnM6VG9rZW5bXSA9IFtdO1xyXG5cdHB1YmxpYyBoZWFkZXI6SGVhZGVyID0gbmV3IEhlYWRlcigpO1xyXG5cclxuXHRjb25zdHJ1Y3RvcigpXHJcblx0e1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0ID0gRGVzY3JpcHRpb247Il19