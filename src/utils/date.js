import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 格式化日期为 YYYY-MM-DD HH:mm:ss
export const formatDateTime = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 格式化日期为 YYYY-MM-DD
export const formatDate = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
};

// 获取相对时间（如"3小时前"）
export const fromNow = (date) => {
  if (!date) return '';
  return dayjs(date).fromNow();
};

// 判断日期是否为今天
export const isToday = (date) => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), 'day');
};

// 判断日期是否在指定天数内
export const isWithinDays = (date, days) => {
  if (!date) return false;
  const now = dayjs();
  const target = dayjs(date);
  return now.diff(target, 'day') <= days;
};