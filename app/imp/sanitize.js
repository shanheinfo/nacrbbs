const ALLOWED_TAGS = new Set(['p', 'br', 'b', 'i', 'u', 'em', 'strong', 'a', 'img', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr']);
const ALLOWED_ATTRS = new Set(['href', 'src', 'alt', 'title', 'class', 'target', 'rel']);

export function sanitizeHtml(html) {
    if (!html || typeof html !== 'string') return html;
    return html.replace(/<\s*\/?\s*([a-zA-Z][a-zA-Z0-9]*)\s*([^>]*)>/g, (match, tagName, attrs) => {
        const tag = tagName.toLowerCase();
        if (match.startsWith('</')) {
            return ALLOWED_TAGS.has(tag) ? match : '';
        }
        if (!ALLOWED_TAGS.has(tag)) return '';
        const cleanAttrs = attrs.replace(/([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*(?:"[^"]*"|'[^']*')/g, (attrMatch, attrName) => {
            return ALLOWED_ATTRS.has(attrName.toLowerCase()) ? attrMatch : '';
        });
        const hasEvent = /on\w+\s*=/i.test(attrs);
        if (hasEvent) return '';
        return `<${tag}${cleanAttrs}>`;
    });
}
