"use strict";
// M000: db 不存在
// M001: collection 不存在
// M002: 資料不存在
// M003: 資料寫入錯誤
// M004: 資料型態有誤
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
var Status;
(function (Status) {
    Status["DB_NOT_FOUND"] = "M000";
    Status["COLLECTION_NOT_FOUND"] = "M001";
    Status["DATA_NOT_FOUND"] = "M002";
    Status["WRITE_DATA_ERROR"] = "M003";
    Status["DATA_TYPE_ERROR"] = "M004";
})(Status = exports.Status || (exports.Status = {}));
