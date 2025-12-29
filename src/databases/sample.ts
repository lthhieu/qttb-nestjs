export const ADMIN_ROLE = "Người Quản trị";
export const USER_ROLE = "Người dùng";
export const INIT_POSITIONS = [{
    "_id": "690453c2b3241ec5be0a3a55",
    "name": "Trưởng phòng",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
},
{
    "_id": "69045416b3241ec5be0a3a59",
    "name": "Phó phòng",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
},
{
    "_id": "69045a13f3cfb6bd6724d15c",
    "name": "Nhân viên",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
},
{
    "_id": "69045ae5f3cfb6bd6724d15e",
    "name": "Trưởng khoa",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
},
{
    "_id": "69045af2f3cfb6bd6724d160",
    "name": "Phó Trưởng khoa",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
},
{
    "_id": "69045afdf3cfb6bd6724d162",
    "name": "Hiệu trưởng",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
},
{
    "_id": "69045b08f3cfb6bd6724d164",
    "name": "Phó Hiệu trưởng",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
},
{
    "_id": "69045b1af3cfb6bd6724d166",
    "name": "Chủ tịch Hội đồng trường",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
}
]
export const INIT_UNITS = [{
    "_id": "690431481c4182b8d287b8e3",
    "name": "P. Quản trị - Thiết bị",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
},
{
    "_id": "690431561c4182b8d287b8e5",
    "name": "P. Kế hoạch - Tài chính",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
},
{
    "_id": "691139428a4ca7219320ae37",
    "name": "P. Tổ chức - Hành chính",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
},
{
    "_id": "69202b7e7acdfd5a8a9691d6",
    "name": "Lãnh đạo trường",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
}
]
export const INIT_ROLES = [{
    "_id": "692027317acdfd5a8a9691ab",
    "name": "Người dùng",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
},
{
    "_id": "692027387acdfd5a8a9691ad",
    "name": "Người Quản trị",
    "createdAt": "2025-10-31T06:14:26.324Z",
    "updatedAt": "2025-10-31T06:14:26.324Z"
}
]

export const INIT_WORKFLOWS = [
    {
        "_id": "691148c3d6bd91ec8160e6a6",
        "name": "Đề nghị thanh toán",
        "version": 0,
        "unit": "690431481c4182b8d287b8e3",
        "steps": [
            {
                "order": 0,
                "signers": [
                    {
                        "unit": "690431481c4182b8d287b8e3",
                        "position": "690453c2b3241ec5be0a3a55"
                    }
                ]
            },
            {
                "order": 1,
                "signers": [
                    {
                        "unit": "690431561c4182b8d287b8e5",
                        "position": "690453c2b3241ec5be0a3a55"
                    }
                ]
            },
            {
                "order": 2,
                "signers": [
                    {
                        "position": "69045afdf3cfb6bd6724d162",
                        "unit": "69202b7e7acdfd5a8a9691d6",
                    }
                ]
            }
        ],
        "createdAt": "2025-11-10T02:06:59.230Z",
        "updatedAt": "2025-11-10T02:08:56.092Z"
    },
    {
        "_id": "6911599816cae2f09fc4cb5f",
        "name": "Kế hoạch, Thông báo",
        "version": 0,
        "unit": "690431481c4182b8d287b8e3",
        "steps": [
            {
                "order": 0,
                "signers": [
                    {
                        "unit": "690431481c4182b8d287b8e3",
                        "position": "690453c2b3241ec5be0a3a55"
                    }
                ]
            },

            {
                "order": 1,
                "signers": [
                    {
                        "position": "69045afdf3cfb6bd6724d162",
                        "unit": "69202b7e7acdfd5a8a9691d6",
                    }
                ]
            }
        ],
        "createdAt": "2025-11-10T02:06:59.230Z",
        "updatedAt": "2025-11-10T02:08:56.092Z"
    },
]