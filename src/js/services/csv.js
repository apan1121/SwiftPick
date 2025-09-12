import Papa from 'papaparse';

export const parseText = (text) => {
    return Papa.parse(text, {
        delimiter: ',',
        skipEmptyLines: true,
    }).data;
};

export const parseCsvFile = (file) => new Promise((resolve, reject) => {
    Papa.parse(file, {
        delimiter: ',',
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(err),
    });
});

const uid = () => `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const parsePrizesRows = (rows) => {
    const items = [];
    const errors = [];
    rows.forEach((cols, index) => {
        const line = index + 1;
        if (!cols || cols.length < 2) {
            errors.push({ line, message: '欄位不足（需 name, quantity）' });
            return;
        }
        const name = String(cols[0] || '').trim();
        const qtyRaw = String(cols[1] || '').trim();
        const quantity = parseInt(qtyRaw, 10);
        if (!name) {
            errors.push({ line, message: '名稱不可為空' });
            return;
        }
        if (!Number.isFinite(quantity) || quantity <= 0) {
            errors.push({ line, message: `數量需為正整數，取得: ${qtyRaw}` });
            return;
        }
        items.push({ id: uid(), name, quantity, winners: [] });
    });
    return { items, errors };
};

export const parseParticipantsRows = (rows) => {
    const items = [];
    const errors = [];
    const seen = new Set();
    rows.forEach((cols, index) => {
        const line = index + 1;
        if (!cols || cols.length < 1) {
            errors.push({ line, message: '欄位不足（需 name[, nickname]）' });
            return;
        }
        const name = String(cols[0] || '').trim();
        const nickname = String((cols[1] || '')).trim();
        if (!name) {
            errors.push({ line, message: '名稱不可為空' });
            return;
        }
        const key = `${name}__${nickname}`;
        if (seen.has(key)) {
            // 記重複，但仍加入或忽略？這裡忽略並記錄錯誤
            errors.push({ line, message: '重複名單（name+nickname）' });
            return;
        }
        seen.add(key);
        items.push({ id: uid(), name, nickname, isWinner: false });
    });
    return { items, errors };
};

export const generateParticipants = (count = 1000) => {
    const items = [];
    for (let i = 1; i <= count; i++) {
        items.push({ id: uid(), name: `參與者${i}`, nickname: `暱稱${i}`, isWinner: false });
    }
    return items;
};

export default {
    parseText,
    parseCsvFile,
    parsePrizesRows,
    parseParticipantsRows,
    generateParticipants,
};

