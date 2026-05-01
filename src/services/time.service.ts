/**
 * TimeService: Chuyên trách việc đồng bộ thời gian giữa Client và Server.
 * Giúp tránh sai lệch do user chỉnh giờ điện thoại hoặc lag mạng.
 */
class TimeService {
  private offset: number = 0; // serverTime - clientLocalTime

  /**
   * Đồng bộ offset dựa trên serverTime trả về từ ApiResponse
   * @param serverTimeMs Thời gian server trả về (milliseconds)
   */
  public sync(serverTimeMs: number) {
    const clientNow = Date.now();
    // Offset được tính bằng hiệu của Server chuẩn và Client hiện tại
    this.offset = serverTimeMs - clientNow;
    
    // Lưu tạm vào sessionStorage để nếu F5 trang vẫn giữ được độ lệch tương đối
    sessionStorage.setItem('server_time_offset', this.offset.toString());
  }

  /**
   * Lấy thời gian chuẩn hiện tại (đã cộng offset)
   */
  public getNow(): number {
    if (this.offset === 0) {
      const savedOffset = sessionStorage.getItem('server_time_offset');
      if (savedOffset) {
        this.offset = parseInt(savedOffset, 10);
      }
    }
    return Date.now() + this.offset;
  }

  /**
   * Chuyển đổi một ISO string hoặc Date bất kỳ sang đối tượng Date đã được đồng bộ
   * (Dùng để so sánh với getNow())
   */
  public parse(dateValue: string | number | Date): number {
    return new Date(dateValue).getTime();
  }
}

export const timeService = new TimeService();
