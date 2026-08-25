import { toJalaali } from 'jalaali-js';

interface BookingSMSData {
  phone: string;
  referenceCode: string;
  serviceName: string;
  doctorName: string;
  date: string;
  time: string;
  customerName: string;
}

function toJalali(date: Date): string {
  const { jy, jm, jd } = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return `${jd} ${months[jm - 1]} ${jy}`;
}

export async function sendBookingSMS(data: BookingSMSData): Promise<void> {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  const isDev = process.env.NODE_ENV === 'development';

  // Format date to Jalali for display
  const gregorianDate = new Date(`${data.date}T00:00:00.000Z`);
  const jalaliDate = toJalali(gregorianDate);

  const message = `نوبت شما در کلینیک باران ثبت شد.
کد پیگیری: ${data.referenceCode}
خدمت: ${data.serviceName}
پزشک: ${data.doctorName}
تاریخ: ${jalaliDate}
ساعت: ${data.time}
نام: ${data.customerName}

برای تغییر/لغو با ما تماس بگیرید.`;

  // Dev mode: log instead of sending
  if (!apiKey || isDev) {
    console.log('📱 [DEV MODE] SMS would be sent to:', data.phone);
    console.log('📱 [DEV MODE] Message:', message);
    return;
  }

  // Production: send via Kavenegar
  try {
    const response = await fetch('https://api.kavenegar.com/v1/' + apiKey + '/sms/send.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        receptor: data.phone.replace(/^0/, '98'), // Convert 09xx to 989xx
        message,
        sender: '1000596446', // Your Kavenegar sender number
      }),
    });

    const result = await response.json();
    if (result.return?.status !== 200) {
      console.error('Kavenegar error:', result);
    }
  } catch (error) {
    console.error('Kavenegar request failed:', error);
  }
}

export async function sendOrderSMS(data: {
  phone: string;
  orderId: string;
  total: number;
  status: 'paid' | 'failed';
}): Promise<void> {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  const isDev = process.env.NODE_ENV === 'development';

  const message = data.status === 'paid'
    ? `سفارش شما در پت‌شاپ باران پرداخت شد.
شناسه: ${data.orderId}
مبلغ: ${data.total.toLocaleString()} ریال
برای پیگیری مراجعه یا تحویل، با ما تماس بگیرید.`
    : `پرداخت سفارش ${data.orderId} در پت‌شاپ باران ناموفق بود.
لطفاً مجدداً تلاش کنید یا با ما تماس بگیرید.`;

  if (!apiKey || isDev) {
    console.log('📱 [DEV MODE] Order SMS would be sent to:', data.phone);
    console.log('📱 [DEV MODE] Message:', message);
    return;
  }

  try {
    const response = await fetch('https://api.kavenegar.com/v1/' + apiKey + '/sms/send.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        receptor: data.phone.replace(/^0/, '98'),
        message,
        sender: '1000596446',
      }),
    });

    const result = await response.json();
    if (result.return?.status !== 200) {
      console.error('Kavenegar error:', result);
    }
  } catch (error) {
    console.error('Kavenegar request failed:', error);
  }
}