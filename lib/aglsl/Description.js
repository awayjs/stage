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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9kZXNjcmlwdGlvbi50cyJdLCJuYW1lcyI6WyJEZXNjcmlwdGlvbiIsIkRlc2NyaXB0aW9uLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLE1BQU0sV0FBZSxpQ0FBaUMsQ0FBQyxDQUFDO0FBRy9ELElBQU0sV0FBVztJQTZCaEJBLFNBN0JLQSxXQUFXQTtRQUVUQyxZQUFPQSxHQUFTQTtZQUN0QkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7WUFDRkEsRUFBRUE7U0FDRkEsQ0FBQ0E7UUFDS0EsYUFBUUEsR0FBU0E7WUFDdkJBLEVBQUVBO1lBQ0ZBLEVBQUVBO1lBQ0ZBLEVBQUVBO1lBQ0ZBLEVBQUVBO1lBQ0ZBLEVBQUVBO1lBQ0ZBLEVBQUVBO1lBQ0ZBLEVBQUVBO1NBQ0ZBLENBQUNBO1FBQ0tBLGdCQUFXQSxHQUFXQSxLQUFLQSxDQUFDQTtRQUM1QkEsZUFBVUEsR0FBV0EsS0FBS0EsQ0FBQ0E7UUFDM0JBLGNBQVNBLEdBQVdBLEtBQUtBLENBQUNBO1FBQzFCQSxhQUFRQSxHQUFTQSxFQUFFQSxDQUFDQTtRQUUzQkEsaURBQWlEQTtRQUMxQ0EsV0FBTUEsR0FBV0EsRUFBRUEsQ0FBQ0E7UUFDcEJBLFdBQU1BLEdBQVVBLElBQUlBLE1BQU1BLEVBQUVBLENBQUNBO0lBSXBDQSxDQUFDQTtJQUNGRCxrQkFBQ0E7QUFBREEsQ0FoQ0EsQUFnQ0NBLElBQUE7QUFFRCxBQUFxQixpQkFBWixXQUFXLENBQUMiLCJmaWxlIjoiYWdsc2wvRGVzY3JpcHRpb24uanMiLCJzb3VyY2VSb290IjoiLi4vIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEhlYWRlclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvYWdsc2wvSGVhZGVyXCIpO1xuaW1wb3J0IFRva2VuXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9hZ2xzbC9Ub2tlblwiKTtcblxuY2xhc3MgRGVzY3JpcHRpb25cbntcblx0cHVibGljIHJlZ3JlYWQ6YW55W10gPSBbXG5cdFx0W10sXG5cdFx0W10sXG5cdFx0W10sXG5cdFx0W10sXG5cdFx0W10sXG5cdFx0W10sXG5cdFx0W11cblx0XTtcblx0cHVibGljIHJlZ3dyaXRlOmFueVtdID0gW1xuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdLFxuXHRcdFtdXG5cdF07XG5cdHB1YmxpYyBoYXNpbmRpcmVjdDpib29sZWFuID0gZmFsc2U7XG5cdHB1YmxpYyB3cml0ZWRlcHRoOmJvb2xlYW4gPSBmYWxzZTtcblx0cHVibGljIGhhc21hdHJpeDpib29sZWFuID0gZmFsc2U7XG5cdHB1YmxpYyBzYW1wbGVyczphbnlbXSA9IFtdO1xuXG5cdC8vIGFkZGVkIGR1ZSB0byBkeW5hbWljIGFzc2lnbm1lbnQgMyoweEZGRkZGRnV1dXVcblx0cHVibGljIHRva2VuczpUb2tlbltdID0gW107XG5cdHB1YmxpYyBoZWFkZXI6SGVhZGVyID0gbmV3IEhlYWRlcigpO1xuXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHR9XG59XG5cbmV4cG9ydCA9IERlc2NyaXB0aW9uOyJdfQ==