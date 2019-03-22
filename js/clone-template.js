function cloneTemplate(name) {
    const DATA_KEY = 'data-template';
    const templateEl = document.querySelector('[' + DATA_KEY + '="' + name + '"]');
    if (!templateEl) {
        throw new Error('Template "' + name + '" is not found.');
    }
    const el = templateEl.cloneNode(true);
    el.removeAttribute(DATA_KEY);
    return el;
}
