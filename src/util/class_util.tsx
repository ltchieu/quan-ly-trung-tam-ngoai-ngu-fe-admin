import { ClassView } from "../model/class_model";

// Định nghĩa kiểu sắp xếp
export type Order = 'asc' | 'desc';

// Hàm so sánh giảm dần (Sử dụng Generic T)
export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// Hàm lấy comparator (Trả về hàm so sánh có kiểu T)
export function getComparator<T>(
  order: Order,
  orderBy: keyof T
): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Hàm sắp xếp ổn định (Stable Sort)
export function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}

// Định nghĩa cấu trúc cho HeadCell
interface HeadCell {
  disableSorting?: boolean;
  id: keyof ClassView | 'actions';
  label: string;
  numeric?: boolean;
}

//Cấu hình cột
export const headCells: HeadCell[] = [
  { id: 'className', label: 'Tên lớp' },
  { id: 'schedulePattern', label: 'Lịch học & Phòng' },
  { id: 'instructorName', label: 'Giảng viên' },
  { id: 'currentEnrollment', label: 'Sĩ số' },
  { id: 'status', label: 'Trạng thái' },
  { id: 'actions', label: 'Hành động', disableSorting: true },
];

export const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
} as const;