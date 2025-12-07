# ADMIN STUDENT MANAGEMENT API DOCUMENTATION

## Mục lục
- [1. Lấy danh sách học viên (với tìm kiếm và phân trang)](#1-lấy-danh-sách-học-viên)
- [2. Lấy chi tiết học viên theo ID](#2-lấy-chi-tiết-học-viên-theo-id)
- [3. Cập nhật thông tin học viên](#3-cập-nhật-thông-tin-học-viên)
- [4. Lấy danh sách lớp học của học viên](#4-lấy-danh-sách-lớp-học-của-học-viên)
- [5. Tạo học viên mới (Admin)](#5-tạo-học-viên-mới-admin)
- [6. Tìm học viên theo số điện thoại](#6-tìm-học-viên-theo-số-điện-thoại)
- [Error Codes Reference](#error-codes-reference)

---

## Authentication
**Tất cả API trong controller này yêu cầu:**
- JWT Token trong header `Authorization: Bearer {token}`
- Role: **ADMIN** (403 Forbidden nếu không phải admin)

---

## 1. Lấy danh sách học viên

### Endpoint
```
GET /admin/students
```

### Mô tả
Lấy danh sách tất cả học viên với hỗ trợ tìm kiếm và phân trang.

### Authentication
**Required**: Yes (Admin only)

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| search | String | No | null | Tìm kiếm theo tên, email, hoặc SĐT |
| page | Integer | No | 0 | Số trang (bắt đầu từ 0) |
| size | Integer | No | 10 | Số lượng items mỗi trang |

### Example Request
```http
GET /admin/students?search=nguyen&page=0&size=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200 OK)
```json
{
  "code": 1000,
  "message": "Success",
  "data": {
    "content": [
      {
        "id": 1,
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "phoneNumber": "0912345678",
        "avatarUrl": "https://example.com/avatar1.jpg",
        "dateOfBirth": "2000-01-15",
        "address": "123 Đường ABC, Q1, TP.HCM",
        "occupation": "Sinh viên",
        "educationLevel": "Đại học",
        "enrollmentDate": "2024-01-10T08:30:00",
        "totalClassesEnrolled": 3,
        "enrolledClassIds": [1, 5, 8]
      },
      {
        "id": 2,
        "fullName": "Nguyễn Thị B",
        "email": "nguyenthib@example.com",
        "phoneNumber": "0987654321",
        "avatarUrl": null,
        "dateOfBirth": "1998-05-20",
        "address": "456 Đường XYZ, Q3, TP.HCM",
        "occupation": "Nhân viên văn phòng",
        "educationLevel": "Cao đẳng",
        "enrollmentDate": "2024-02-15T10:00:00",
        "totalClassesEnrolled": 1,
        "enrolledClassIds": [3]
      }
    ],
    "totalElements": 50,
    "totalPages": 5,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

**Giải thích response:**
- `content`: Mảng các đối tượng StudentAdminResponse
- `totalElements`: Tổng số học viên (sau khi filter search)
- `totalPages`: Tổng số trang
- `currentPage`: Trang hiện tại (0-indexed)
- `pageSize`: Số items mỗi trang
- `enrolledClassIds`: Danh sách ID các lớp học viên đã đăng ký và thanh toán

### Error Responses

**401 Unauthorized**
```json
{
  "code": 1006,
  "message": "Unauthenticated"
}
```

**403 Forbidden - Not Admin**
```json
{
  "code": 1009,
  "message": "You do not have permission"
}
```

### Use Cases
1. **Quản lý học viên**: Admin xem danh sách tất cả học viên
2. **Tìm kiếm học viên**: Search theo tên/email/SĐT
3. **Phân trang**: Hiển thị danh sách với pagination

---

## 2. Lấy chi tiết học viên theo ID

### Endpoint
```
GET /admin/students/{id}
```

### Mô tả
Lấy thông tin chi tiết của một học viên cụ thể theo ID.

### Authentication
**Required**: Yes (Admin only)

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Integer | Yes | ID của học viên |

### Example Request
```http
GET /admin/students/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200 OK)
```json
{
  "code": 1000,
  "message": "Success",
  "data": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phoneNumber": "0912345678",
    "avatarUrl": "https://example.com/avatar1.jpg",
    "dateOfBirth": "2000-01-15",
    "address": "123 Đường ABC, Q1, TP.HCM",
    "occupation": "Sinh viên",
    "educationLevel": "Đại học",
    "enrollmentDate": "2024-01-10T08:30:00",
    "totalClassesEnrolled": 3,
    "enrolledClassIds": [1, 5, 8]
  }
}
```

**Giải thích các trường:**
- `id`: ID học viên
- `fullName`: Họ và tên đầy đủ
- `email`: Email đăng ký
- `phoneNumber`: Số điện thoại (format: 0XXXXXXXXX hoặc +84XXXXXXXXX)
- `avatarUrl`: URL ảnh đại diện (nullable)
- `dateOfBirth`: Ngày sinh (format: yyyy-MM-dd)
- `address`: Địa chỉ (nullable)
- `occupation`: Nghề nghiệp (nullable)
- `educationLevel`: Trình độ học vấn (nullable)
- `enrollmentDate`: Ngày đăng ký tài khoản
- `totalClassesEnrolled`: Tổng số lớp đã đăng ký (đã thanh toán)
- `enrolledClassIds`: Danh sách ID các lớp đã đăng ký

### Error Responses

**404 Not Found - Student Not Found**
```json
{
  "code": 1005,
  "message": "Student not found"
}
```
*Backend trả về HTTP 404 với empty body khi không tìm thấy học viên*

**401 Unauthorized**
```json
{
  "code": 1006,
  "message": "Unauthenticated"
}
```

**403 Forbidden**
```json
{
  "code": 1009,
  "message": "You do not have permission"
}
```

### Use Cases
1. **Xem thông tin chi tiết**: Admin xem đầy đủ thông tin học viên
2. **Lấy dữ liệu trước khi sửa**: Load thông tin hiện tại vào form

---

## 3. Cập nhật thông tin học viên

### Endpoint
```
PUT /admin/students/{id}
```

### Mô tả
Cập nhật thông tin của học viên. Tất cả các trường đều optional.

### Authentication
**Required**: Yes (Admin only)

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Integer | Yes | ID của học viên cần cập nhật |

### Request Body
```json
{
  "fullName": "Nguyễn Văn A Updated",
  "email": "newemail@example.com",
  "phoneNumber": "0999888777",
  "dateOfBirth": "2000-01-15",
  "address": "999 Đường Mới, Q10, TP.HCM",
  "occupation": "Kỹ sư",
  "educationLevel": "Thạc sĩ",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "isActive": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | String | No | Họ và tên đầy đủ |
| email | String | No | Email mới |
| phoneNumber | String | No | Số điện thoại mới |
| dateOfBirth | String | No | Ngày sinh (yyyy-MM-dd) |
| address | String | No | Địa chỉ |
| occupation | String | No | Nghề nghiệp |
| educationLevel | String | No | Trình độ học vấn |
| avatarUrl | String | No | URL ảnh đại diện |
| isActive | Boolean | No | Trạng thái hoạt động tài khoản |

**Lưu ý**: 
- Tất cả các trường đều **optional**
- Chỉ gửi các trường cần cập nhật
- `dateOfBirth` phải là string format `yyyy-MM-dd`

### Example Request
```http
PUT /admin/students/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A Updated",
  "occupation": "Kỹ sư",
  "educationLevel": "Thạc sĩ"
}
```

### Success Response (200 OK)
```json
{
  "code": 1000,
  "message": "Success",
  "data": {
    "id": 1,
    "fullName": "Nguyễn Văn A Updated",
    "email": "nguyenvana@example.com",
    "phoneNumber": "0912345678",
    "avatarUrl": "https://example.com/avatar1.jpg",
    "dateOfBirth": "2000-01-15",
    "address": "123 Đường ABC, Q1, TP.HCM",
    "occupation": "Kỹ sư",
    "educationLevel": "Thạc sĩ",
    "enrollmentDate": "2024-01-10T08:30:00",
    "totalClassesEnrolled": 3,
    "enrolledClassIds": [1, 5, 8]
  }
}
```

### Error Responses

**404 Not Found - Student Not Found**
```json
{
  "code": 1005,
  "message": "Student not found"
}
```
*Backend trả về HTTP 404 với empty body*

**400 Bad Request - Validation Error**
```json
{
  "code": 1003,
  "message": "Invalid input",
  "errors": {
    "email": "Email không hợp lệ",
    "phoneNumber": "Số điện thoại không hợp lệ"
  }
}
```

**401 Unauthorized**
```json
{
  "code": 1006,
  "message": "Unauthenticated"
}
```

**403 Forbidden**
```json
{
  "code": 1009,
  "message": "You do not have permission"
}
```

### Use Cases
1. **Cập nhật thông tin cá nhân**: Admin sửa thông tin học viên
2. **Cập nhật avatar**: Upload ảnh mới
3. **Vô hiệu hóa tài khoản**: Set `isActive = false`

---

## 4. Lấy danh sách lớp học của học viên

### Endpoint
```
GET /admin/students/{id}/classes
```

### Mô tả
Lấy danh sách tất cả các lớp học mà học viên đã đăng ký (đã thanh toán).

### Authentication
**Required**: Yes (Admin only)

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | Integer | Yes | ID của học viên |

### Example Request
```http
GET /admin/students/1/classes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200 OK)
```json
{
  "code": 1000,
  "message": "Success",
  "data": [
    {
      "classId": 1,
      "className": "IELTS 5.0 - Sáng T2-T4-T6",
      "courseName": "IELTS 5.0",
      "instructorName": "Nguyễn Văn Giảng",
      "startDate": "2024-01-15",
      "endDate": "2024-03-15",
      "status": "Đang học",
      "paymentStatus": true,
      "fee": 2000000
    },
    {
      "classId": 5,
      "className": "TOEIC 600 - Chiều T3-T5",
      "courseName": "TOEIC 600",
      "instructorName": "Trần Thị Loan",
      "startDate": "2024-02-01",
      "endDate": "2024-04-30",
      "status": "Đang học",
      "paymentStatus": true,
      "fee": 3000000
    },
    {
      "classId": 8,
      "className": "IELTS 6.5 - Tối T2-T4-T6",
      "courseName": "IELTS 6.5",
      "instructorName": "Lê Văn Tuấn",
      "startDate": "2023-10-01",
      "endDate": "2024-01-10",
      "status": "Đã kết thúc",
      "paymentStatus": true,
      "fee": 4000000
    }
  ]
}
```

**Giải thích các trường:**
- `classId`: ID lớp học (Integer)
- `className`: Tên lớp học (String)
- `courseName`: Tên khóa học (String)
- `instructorName`: Tên giảng viên (String, nullable)
- `startDate`: Ngày bắt đầu lớp (LocalDate - yyyy-MM-dd)
- `endDate`: Ngày kết thúc dự kiến (LocalDate - yyyy-MM-dd, nullable)
- `status`: Trạng thái lớp ("Đang học", "Đã kết thúc", "Sắp khai giảng", v.v.)
- `paymentStatus`: Trạng thái thanh toán (Boolean - true = đã thanh toán)
- `fee`: Học phí đã thanh toán (BigDecimal/Number - VND)

**Lưu ý**:
- Chỉ hiển thị các lớp đã thanh toán (`paymentStatus = true`)
- `endDate` được tính từ buổi học cuối cùng
- Sắp xếp theo `startDate` giảm dần (mới nhất trước)

### Error Responses

**401 Unauthorized**
```json
{
  "code": 1006,
  "message": "Unauthenticated"
}
```

**403 Forbidden**
```json
{
  "code": 1009,
  "message": "You do not have permission"
}
```

**Lưu ý**: 
- API không trả về 404 nếu không tìm thấy học viên
- Nếu học viên chưa đăng ký lớp nào, trả về mảng rỗng `[]`

### Use Cases
1. **Xem lịch sử học tập**: Admin xem các lớp học viên đã đăng ký
2. **Kiểm tra trạng thái học phí**: Xem các lớp đã thanh toán
3. **Báo cáo**: Thống kê số lớp của học viên

---

## 5. Tạo học viên mới (Admin)

### Endpoint
```
POST /admin/students
```

### Mô tả
Admin tạo học viên mới nhanh chóng tại quầy. API này:
- **Không gửi email xác thực**
- **Dùng mật khẩu mặc định** (do hệ thống quy định)
- Dùng cho đăng ký nhanh khi học viên đến trực tiếp

### Authentication
**Required**: Yes (Admin only)

### Request Body
```json
{
  "phoneNumber": "0912345678",
  "email": "student@example.com",
  "name": "Nguyễn Văn C",
  "dateOfBirth": "2000-05-15",
  "gender": true,
  "address": "123 Đường ABC, Q1, TP.HCM",
  "job": "Sinh viên"
}
```

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| phoneNumber | String | **Yes** | Pattern: `^(0|\+84)[0-9]{9}$` | Số điện thoại (0XXXXXXXXX hoặc +84XXXXXXXXX) |
| email | String | No | Email format | Email (nullable) |
| name | String | **Yes** | Not blank | Họ và tên đầy đủ |
| dateOfBirth | LocalDate | No | yyyy-MM-dd | Ngày sinh (nullable) |
| gender | Boolean | No | true/false | Giới tính (true = Nam, false = Nữ, nullable) |
| address | String | No | - | Địa chỉ (nullable) |
| job | String | No | - | Nghề nghiệp (nullable) |

**Validation Rules:**
- `phoneNumber`: Bắt buộc, phải đúng format SĐT Việt Nam
- `email`: Optional, nếu có phải đúng format email
- `name`: Bắt buộc, không được để trống

### Example Request
```http
POST /admin/students
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "phoneNumber": "0912345678",
  "email": "newstudent@example.com",
  "name": "Trần Văn D",
  "dateOfBirth": "2001-03-20",
  "gender": true,
  "address": "456 Đường XYZ, Q3, TP.HCM",
  "job": "Nhân viên văn phòng"
}
```

### Success Response (201 Created)
```json
{
  "code": 1000,
  "message": "Tạo học viên thành công",
  "data": {
    "studentId": 15,
    "name": "Trần Văn D",
    "dateOfBirth": "2001-03-20",
    "gender": true,
    "jobs": "Nhân viên văn phòng",
    "email": "newstudent@example.com",
    "phoneNumber": "0912345678",
    "address": "456 Đường XYZ, Q3, TP.HCM",
    "image": null
  }
}
```

**Giải thích response:**
- `studentId`: ID học viên vừa tạo (auto-generated)
- `name`: Họ tên
- `dateOfBirth`: Ngày sinh
- `gender`: Giới tính (true = Nam, false = Nữ)
- `jobs`: Nghề nghiệp (lưu ý: field name là "jobs" không phải "job")
- `email`: Email
- `phoneNumber`: Số điện thoại
- `address`: Địa chỉ
- `image`: Avatar URL (mặc định null khi mới tạo)

**Lưu ý quan trọng:**
- Mật khẩu mặc định được set tự động (không trả về trong response)
- Tài khoản được kích hoạt ngay lập tức
- Không gửi email xác thực
- Học viên có thể đổi mật khẩu sau khi đăng nhập

### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "code": 1003,
  "message": "Invalid input",
  "errors": {
    "phoneNumber": "Số điện thoại là bắt buộc",
    "name": "Họ tên là bắt buộc",
    "email": "Email không hợp lệ"
  }
}
```

**409 Conflict - Phone/Email Already Exists**
```json
{
  "code": 1010,
  "message": "Số điện thoại hoặc email đã tồn tại"
}
```

**401 Unauthorized**
```json
{
  "code": 1006,
  "message": "Unauthenticated"
}
```

**403 Forbidden**
```json
{
  "code": 1009,
  "message": "You do not have permission"
}
```

### Use Cases
1. **Đăng ký nhanh tại quầy**: Học viên đến trực tiếp, admin tạo tài khoản ngay
2. **Import học viên**: Batch tạo nhiều học viên
3. **Đăng ký offline**: Không cần email xác thực

---

## 6. Tìm học viên theo số điện thoại

### Endpoint
```
GET /admin/students/search-by-phone
```

### Mô tả
Tìm kiếm học viên theo số điện thoại (exact match). API này dùng để:
- Kiểm tra học viên đã tồn tại chưa trước khi tạo mới
- Tìm nhanh học viên khi đăng ký lớp tại quầy

### Authentication
**Required**: Yes (Admin only)

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| phone | String | **Yes** | Số điện thoại cần tìm (exact match) |

### Example Request
```http
GET /admin/students/search-by-phone?phone=0912345678
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response (200 OK)

**Trường hợp 1: Tìm thấy học viên**
```json
{
  "code": 1000,
  "message": "Success",
  "data": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phoneNumber": "0912345678",
    "avatarUrl": "https://example.com/avatar1.jpg",
    "dateOfBirth": "2000-01-15",
    "address": "123 Đường ABC, Q1, TP.HCM",
    "occupation": "Sinh viên",
    "educationLevel": "Đại học",
    "enrollmentDate": "2024-01-10T08:30:00",
    "totalClassesEnrolled": 3,
    "enrolledClassIds": [1, 5, 8]
  }
}
```

**Trường hợp 2: Không tìm thấy**
```json
{
  "code": 1000,
  "message": "Không tìm thấy học viên với SĐT này",
  "data": null
}
```

**Lưu ý quan trọng:**
- API **LUÔN trả về 200 OK**, kể cả khi không tìm thấy
- Kiểm tra `data === null` để biết không tìm thấy
- Tìm kiếm **exact match** (phải khớp chính xác số điện thoại)

### Error Responses

**400 Bad Request - Missing Phone**
```json
{
  "code": 1003,
  "message": "Phone parameter is required"
}
```

**401 Unauthorized**
```json
{
  "code": 1006,
  "message": "Unauthenticated"
}
```

**403 Forbidden**
```json
{
  "code": 1009,
  "message": "You do not have permission"
}
```

### Use Cases
1. **Kiểm tra tồn tại**: Kiểm tra SĐT đã được đăng ký chưa
2. **Đăng ký lớp tại quầy**: Tìm học viên để thêm vào lớp
3. **Autocomplete**: Gợi ý học viên khi nhập SĐT

---

## Frontend Implementation

### Example 1: Danh sách học viên với phân trang

```javascript
// components/StudentList.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchStudents();
  }, [search, page]);
  
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/students', {
        params: { search, page, size: 10 }
      });
      
      const data = response.data.data;
      setStudents(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching students:', error);
      if (error.response?.status === 403) {
        alert('Bạn không có quyền truy cập');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="student-list">
      <h2>Danh sách học viên</h2>
      
      {/* Search bar */}
      <input
        type="text"
        placeholder="Tìm theo tên, email, SĐT..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0); // Reset về trang đầu khi search
        }}
      />
      
      {/* Table */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Số lớp</th>
                <th>Ngày đăng ký</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>
                    <img src={student.avatarUrl || '/default-avatar.png'} 
                         alt="avatar" 
                         width="30" height="30" />
                    {student.fullName}
                  </td>
                  <td>{student.email}</td>
                  <td>{student.phoneNumber}</td>
                  <td>{student.totalClassesEnrolled}</td>
                  <td>{new Date(student.enrollmentDate).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <button onClick={() => viewDetails(student.id)}>Xem</button>
                    <button onClick={() => editStudent(student.id)}>Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="pagination">
            <button 
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Trước
            </button>
            <span>Trang {page + 1} / {totalPages}</span>
            <button 
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Example 2: Xem chi tiết học viên

```javascript
// pages/StudentDetail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStudentDetail();
    fetchStudentClasses();
  }, [id]);
  
  const fetchStudentDetail = async () => {
    try {
      const response = await axios.get(`/admin/students/${id}`);
      setStudent(response.data.data);
    } catch (error) {
      if (error.response?.status === 404) {
        alert('Không tìm thấy học viên');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStudentClasses = async () => {
    try {
      const response = await axios.get(`/admin/students/${id}/classes`);
      setClasses(response.data.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };
  
  if (loading) return <p>Đang tải...</p>;
  if (!student) return <p>Không tìm thấy học viên</p>;
  
  return (
    <div className="student-detail">
      <h2>Thông tin học viên</h2>
      
      <div className="info-section">
        <img src={student.avatarUrl || '/default-avatar.png'} 
             alt="avatar" 
             width="100" height="100" />
        <h3>{student.fullName}</h3>
        <p>ID: {student.id}</p>
        <p>Email: {student.email}</p>
        <p>SĐT: {student.phoneNumber}</p>
        <p>Ngày sinh: {student.dateOfBirth}</p>
        <p>Địa chỉ: {student.address || 'Chưa cập nhật'}</p>
        <p>Nghề nghiệp: {student.occupation || 'Chưa cập nhật'}</p>
        <p>Học vấn: {student.educationLevel || 'Chưa cập nhật'}</p>
        <p>Ngày đăng ký: {new Date(student.enrollmentDate).toLocaleString('vi-VN')}</p>
      </div>
      
      <div className="classes-section">
        <h3>Lớp học đã đăng ký ({classes.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Lớp</th>
              <th>Khóa học</th>
              <th>Giảng viên</th>
              <th>Ngày bắt đầu</th>
              <th>Trạng thái</th>
              <th>Học phí</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(cls => (
              <tr key={cls.classId}>
                <td>{cls.className}</td>
                <td>{cls.courseName}</td>
                <td>{cls.instructorName}</td>
                <td>{cls.startDate}</td>
                <td>{cls.status}</td>
                <td>{cls.fee?.toLocaleString('vi-VN')} VND</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Example 3: Form cập nhật học viên

```javascript
// components/EditStudentForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EditStudentForm({ studentId, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    occupation: '',
    educationLevel: '',
    avatarUrl: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // Load dữ liệu hiện tại
    fetchStudent();
  }, [studentId]);
  
  const fetchStudent = async () => {
    try {
      const response = await axios.get(`/admin/students/${studentId}`);
      const student = response.data.data;
      setFormData({
        fullName: student.fullName || '',
        email: student.email || '',
        phoneNumber: student.phoneNumber || '',
        dateOfBirth: student.dateOfBirth || '',
        address: student.address || '',
        occupation: student.occupation || '',
        educationLevel: student.educationLevel || '',
        avatarUrl: student.avatarUrl || '',
        isActive: true
      });
    } catch (error) {
      console.error('Error loading student:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const response = await axios.put(
        `/admin/students/${studentId}`,
        formData
      );
      
      alert('✅ Cập nhật thành công!');
      if (onSuccess) onSuccess(response.data.data);
      
    } catch (error) {
      if (error.response?.status === 400) {
        setErrors(error.response.data.errors || {});
      } else if (error.response?.status === 404) {
        alert('❌ Không tìm thấy học viên');
      } else {
        alert('❌ Có lỗi xảy ra');
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="edit-student-form">
      <h3>Cập nhật thông tin học viên</h3>
      
      <div className="form-group">
        <label>Họ tên</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
        />
        {errors.fullName && <span className="error">{errors.fullName}</span>}
      </div>
      
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label>Số điện thoại</label>
        <input
          type="text"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
        />
        {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
      </div>
      
      <div className="form-group">
        <label>Ngày sinh</label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
        />
      </div>
      
      <div className="form-group">
        <label>Địa chỉ</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>
      
      <div className="form-group">
        <label>Nghề nghiệp</label>
        <input
          type="text"
          value={formData.occupation}
          onChange={(e) => setFormData({...formData, occupation: e.target.value})}
        />
      </div>
      
      <div className="form-group">
        <label>Trình độ học vấn</label>
        <select
          value={formData.educationLevel}
          onChange={(e) => setFormData({...formData, educationLevel: e.target.value})}
        >
          <option value="">-- Chọn --</option>
          <option value="THPT">THPT</option>
          <option value="Cao đẳng">Cao đẳng</option>
          <option value="Đại học">Đại học</option>
          <option value="Thạc sĩ">Thạc sĩ</option>
          <option value="Tiến sĩ">Tiến sĩ</option>
        </select>
      </div>
      
      <button type="submit">Cập nhật</button>
    </form>
  );
}
```

### Example 4: Tạo học viên mới (Admin)

```javascript
// components/CreateStudentForm.jsx
import { useState } from 'react';
import axios from 'axios';

export default function CreateStudentForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    name: '',
    dateOfBirth: '',
    gender: true,
    address: '',
    job: ''
  });
  const [errors, setErrors] = useState({});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const response = await axios.post('/admin/students', formData);
      
      alert(`✅ Tạo học viên thành công!\nMật khẩu mặc định đã được set.`);
      
      // Reset form
      setFormData({
        phoneNumber: '',
        email: '',
        name: '',
        dateOfBirth: '',
        gender: true,
        address: '',
        job: ''
      });
      
      if (onSuccess) onSuccess(response.data.data);
      
    } catch (error) {
      if (error.response?.status === 400) {
        setErrors(error.response.data.errors || {});
      } else if (error.response?.status === 409) {
        alert('❌ Số điện thoại hoặc email đã tồn tại');
      } else {
        alert('❌ Có lỗi xảy ra');
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="create-student-form">
      <h3>Tạo học viên mới</h3>
      
      <div className="form-group">
        <label>Số điện thoại *</label>
        <input
          type="text"
          placeholder="0912345678"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
        />
        {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
      </div>
      
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          placeholder="student@example.com"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label>Họ tên *</label>
        <input
          type="text"
          placeholder="Nguyễn Văn A"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      
      <div className="form-group">
        <label>Ngày sinh</label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
        />
      </div>
      
      <div className="form-group">
        <label>Giới tính</label>
        <select
          value={formData.gender}
          onChange={(e) => setFormData({...formData, gender: e.target.value === 'true'})}
        >
          <option value="true">Nam</option>
          <option value="false">Nữ</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Địa chỉ</label>
        <input
          type="text"
          placeholder="123 Đường ABC, Q1, TP.HCM"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>
      
      <div className="form-group">
        <label>Nghề nghiệp</label>
        <input
          type="text"
          placeholder="Sinh viên"
          value={formData.job}
          onChange={(e) => setFormData({...formData, job: e.target.value})}
        />
      </div>
      
      <button type="submit">Tạo học viên</button>
      
      <p className="note">
        * Mật khẩu mặc định sẽ được set tự động
        <br />
        * Không gửi email xác thực
      </p>
    </form>
  );
}
```

### Example 5: Tìm học viên theo SĐT

```javascript
// components/StudentPhoneSearch.jsx
import { useState } from 'react';
import axios from 'axios';

export default function StudentPhoneSearch({ onStudentFound }) {
  const [phone, setPhone] = useState('');
  const [student, setStudent] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    if (!phone.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }
    
    setLoading(true);
    setStudent(null);
    setNotFound(false);
    
    try {
      const response = await axios.get('/admin/students/search-by-phone', {
        params: { phone: phone.trim() }
      });
      
      if (response.data.data === null) {
        setNotFound(true);
      } else {
        setStudent(response.data.data);
        if (onStudentFound) onStudentFound(response.data.data);
      }
      
    } catch (error) {
      console.error('Error searching student:', error);
      alert('Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="phone-search">
      <h3>Tìm học viên theo SĐT</h3>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Nhập số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Đang tìm...' : 'Tìm kiếm'}
        </button>
      </div>
      
      {notFound && (
        <div className="not-found">
          <p>❌ Không tìm thấy học viên với SĐT: {phone}</p>
          <p>Học viên chưa đăng ký? <a href="/admin/students/create">Tạo mới</a></p>
        </div>
      )}
      
      {student && (
        <div className="student-found">
          <h4>✅ Tìm thấy học viên</h4>
          <div className="student-card">
            <img src={student.avatarUrl || '/default-avatar.png'} 
                 alt="avatar" 
                 width="60" height="60" />
            <div className="info">
              <p><strong>{student.fullName}</strong></p>
              <p>ID: {student.id}</p>
              <p>Email: {student.email}</p>
              <p>SĐT: {student.phoneNumber}</p>
              <p>Số lớp đã học: {student.totalClassesEnrolled}</p>
            </div>
            <button onClick={() => window.location.href = `/admin/students/${student.id}`}>
              Xem chi tiết
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Error Codes Reference

| Code | HTTP Status | Message | When |
|------|-------------|---------|------|
| 1000 | 200 OK | Success | Request thành công |
| 1003 | 400 Bad Request | Invalid input | Validation error |
| 1005 | 404 Not Found | Resource not found | Student không tồn tại |
| 1006 | 401 Unauthorized | Unauthenticated | Chưa đăng nhập hoặc token hết hạn |
| 1009 | 403 Forbidden | Unauthorized | Không có quyền (không phải Admin) |
| 1010 | 409 Conflict | Conflict | Phone/Email đã tồn tại |

---

## Business Logic Notes

### Pagination
- Default: page=0, size=10
- Page index bắt đầu từ 0
- Response trả về: content, totalElements, totalPages, currentPage, pageSize

### Search
- Tìm theo: fullName, email, phoneNumber
- Case-insensitive
- Partial match (LIKE %search%)

### Student Classes
- Chỉ hiển thị lớp đã thanh toán (paymentStatus = true)
- Sort theo startDate DESC (mới nhất trước)
- endDate tính từ buổi học cuối cùng

### Create Student (Admin)
- Không gửi email xác thực
- Mật khẩu mặc định được set tự động
- Tài khoản active ngay lập tức
- Dùng cho đăng ký nhanh tại quầy

### Phone Search
- Exact match (không phải LIKE)
- Luôn trả về 200 OK
- Check `data === null` để biết không tìm thấy

---

## Testing Guide

### Test Case 1: Lấy danh sách học viên
```bash
curl -X GET "http://localhost:8080/admin/students?search=nguyen&page=0&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Case 2: Xem chi tiết học viên
```bash
curl -X GET "http://localhost:8080/admin/students/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Case 3: Cập nhật học viên
```bash
curl -X PUT "http://localhost:8080/admin/students/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn A Updated",
    "occupation": "Kỹ sư"
  }'
```

### Test Case 4: Lấy lớp học của học viên
```bash
curl -X GET "http://localhost:8080/admin/students/1/classes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Case 5: Tạo học viên mới
```bash
curl -X POST "http://localhost:8080/admin/students" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0912345678",
    "email": "newstudent@example.com",
    "name": "Trần Văn D",
    "dateOfBirth": "2001-03-20",
    "gender": true,
    "address": "456 Đường XYZ, Q3, TP.HCM",
    "job": "Nhân viên"
  }'
```

### Test Case 6: Tìm theo SĐT
```bash
curl -X GET "http://localhost:8080/admin/students/search-by-phone?phone=0912345678" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support

Nếu gặp vấn đề khi sử dụng API, vui lòng liên hệ:
- Email: support@example.com
- Hotline: 1900-xxxx

**Lưu ý**: 
- Tất cả API yêu cầu JWT Token và role ADMIN
- Response luôn có field `code` (1000 = success)
- 404 responses có thể trả về empty body hoặc ApiResponse tùy endpoint

