const formatVND = (money: string) => {
    const number = Number(money);
    if (isNaN(number)) {
        return "Invalid number";
    }
    return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

export const HELPER = {
    formatVND,
}