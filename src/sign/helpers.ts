import forge from 'node-forge';

export function extractInfoFromP12(p12Buffer: Buffer, password: string) {
    try {
        // 1. Đọc file P12 từ Buffer (Chuyển đổi Node Buffer sang Forge Buffer an toàn hơn)
        const p12Der = forge.util.createBuffer(p12Buffer.toString('binary'));
        const p12Asn1 = forge.asn1.fromDer(p12Der);

        // 2. Giải mã P12 bằng mật khẩu
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

        // 3. Lấy túi chứa chứng chỉ
        const certBagType = forge.pki.oids.certBag;
        const bags = p12.getBags({ bagType: certBagType });
        const certBag = bags[certBagType];

        if (!certBag || certBag.length === 0) {
            throw new Error('Không tìm thấy chứng chỉ trong file P12');
        }

        const cert = certBag[0].cert;
        if (!cert) {
            throw new Error('Chứng chỉ bị rỗng');
        }

        // 4. Trích xuất thông tin từ Subject
        // --- SỬA LỖI FONT CHỮ Ở ĐÂY ---
        const getAttr = (name: string) => {
            const field = cert.subject.getField(name);
            if (!field) return '';

            try {
                // Cố gắng giải mã UTF-8
                return forge.util.decodeUtf8(field.value);
            } catch (e) {
                // Nếu lỗi (do không phải UTF-8), trả về giá trị gốc
                return field.value;
            }
        };

        return {
            commonName: getAttr('CN') || 'Unknown User',
            organization: getAttr('O') || 'Unknown Org',
            email: getAttr('E') || '',
        };

    } catch (error) {
        console.error('Lỗi đọc P12:', error);
        return {
            commonName: 'Unknown User',
            organization: '',
            email: '',
        };
    }
}

export const getRootPath = () => {
    return process.cwd()
}

export // --- HÀM HELPER: XÓA DẤU TIẾNG VIỆT ---
    function removeVietnameseTones(str: string): string {
    if (!str) return '';
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}