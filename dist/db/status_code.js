"use strict";
// M000: db 不存在
// M001: collection 不存在
// M002: 資料不存在
// M003: 資料寫入錯誤
// M004: 資料型態有誤
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCode = void 0;
var StatusCode;
(function (StatusCode) {
    StatusCode["DB_FOUND"] = "nM000";
    StatusCode["DB_NOT_FOUND"] = "M000";
    StatusCode["COLLECTION_FOUND"] = "nM001";
    StatusCode["COLLECTION_NOT_FOUND"] = "M001";
    StatusCode["DATA_FOUND"] = "nM002";
    StatusCode["DATA_NOT_FOUND"] = "M002";
    StatusCode["WRITE_DATA_SUCCESS"] = "nM003";
    StatusCode["WRITE_DATA_ERROR"] = "M003";
    StatusCode["DATA_TYPE_CORRECT"] = "nM004";
    StatusCode["DATA_TYPE_ERROR"] = "M004";
})(StatusCode = exports.StatusCode || (exports.StatusCode = {}));
