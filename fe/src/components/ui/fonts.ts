import { Inter, Lusitana } from "next/font/google";

// Khởi tạo font Inter (thường dùng cho toàn bộ trang web)
export const inter = Inter({
  subsets: ["latin"],
});

// Khởi tạo font Lusitana (thường dùng cho heading, tiêu đề)
export const lusitana = Lusitana({
  weight: ["400", "700"],
  subsets: ["latin"],
});
