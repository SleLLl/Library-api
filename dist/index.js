"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var PORT = process.env.PORT || 3001;
var app = express_1["default"]();
app.use(express_1["default"].json());
app.listen(PORT, function () {
    console.log('server start in ', PORT);
});
//# sourceMappingURL=index.js.map