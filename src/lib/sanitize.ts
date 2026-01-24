import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Only allows safe HTML tags and attributes commonly used in blog content.
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'u', 's', 'strike',
      'a', 'img',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'br', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'figure', 'figcaption'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class',
      'target', 'rel',
      'width', 'height',
      'colspan', 'rowspan'
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
};
