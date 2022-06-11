// M000: db 不存在
// M001: collection 不存在
// M002: 資料不存在
// M003: 資料寫入錯誤
// M004: 資料型態有誤

export enum StatusCode {
    DB_FOUND = 'nM000',
    DB_NOT_FOUND = 'M000',

    COLLECTION_FOUND = 'nM001',
    COLLECTION_NOT_FOUND = 'M001',

    DATA_FOUND = 'nM002',
    DATA_NOT_FOUND = 'M002',

    WRITE_DATA_SUCCESS = 'nM003',
    WRITE_DATA_ERROR = 'M003',

    DATA_TYPE_CORRECT = 'nM004',
    DATA_TYPE_ERROR = 'M004',
}
