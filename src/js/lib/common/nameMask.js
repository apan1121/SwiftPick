const repeatChar = (char, count) => (count > 0 ? char.repeat(count) : '');

function maskSingleSegment(segment){
    const len = segment.length;
    if (!len) return segment;
    if (len === 1) return '*';
    if (len === 2) return segment[0] + '*';
    if (len === 3) return segment[0] + '*' + segment[2];
    const head = segment.slice(0, 2);
    const tail = segment.slice(-2);
    return head + repeatChar('*', Math.max(len - 4, 1)) + tail;
}

function maskLeadingSegment(segment){
    const len = segment.length;
    if (!len) return segment;
    if (len === 1) return '*';
    if (len === 2) return segment[0] + '*';
    const keep = segment.slice(0, 2);
    return keep + repeatChar('*', len - 2);
}

function maskTrailingSegment(segment){
    const len = segment.length;
    if (!len) return segment;
    if (len === 1) return '*';
    const keep = segment.slice(-Math.min(2, len));
    return repeatChar('*', len - keep.length) + keep;
}

function maskMiddleSegment(segment){
    return repeatChar('*', segment.length) || '*';
}

export function maskName(fullName = ''){
    if (!fullName) return '';
    const segments = fullName.trim().split(/\s+/).filter(Boolean);
    if (!segments.length) return '';
    if (segments.length === 1) return maskSingleSegment(segments[0]);
    return segments.map((segment, index) => {
        if (index === 0) return maskLeadingSegment(segment);
        if (index === segments.length - 1) return maskTrailingSegment(segment);
        return maskMiddleSegment(segment);
    }).join(' ');
}

export default maskName;
