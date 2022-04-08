function fwok(qs, _el=undefined) {
    const el = _el || document.querySelector(qs);
    el.stateful = (depends, render) => {
        function onchanged() {
            const args = depends.map(x => x.get());
            const rend = render(args);
            let rendTxt = "";
            if (Array.isArray(rend)) rendTxt = rend.join('');
            else rendTxt = rend.toString();
            el.innerHTML = rendTxt.replace('fwok:onclick={', 'onclick={this.getRootNode().');
        }
        depends.forEach(x => x._onchange.push(onchanged));
        onchanged();
    };
    el.on = (event, callback, preventDefault=false) => {
        if (preventDefault) {
            el.addEventListener(event, (ev) => {
                ev.preventDefault();
                callback(ev)
            });
        } else {
            el.addEventListener(event, callback);
        }
    };
    return el;
}

fwok.state = (value) => {
    return {
        _value: value,
        _onchange: [],
        get() { return this._value },
        set(value) { this._value = value; this.changed() },
        update(mutator) { this.set(mutator(this.get()) ?? this.get()) },
        changed() { this._onchange.forEach(c=>c(this)) }
    }
};

(function() {
    const els = document.querySelectorAll("*");
    for (const el of els) {
        if (el.hasAttribute('fwok:ref')) {
            window[el.getAttribute('fwok:ref')] = fwok(0, el);
        }
        if (el.hasAttribute('fwok:bind')) {
            Object.defineProperty(window, el.getAttribute('fwok:bind'), {
                get: function () { return el.value; },
                set: function (v) {
                  el.value = v;
                }
            });
        }
        for (let i = 0; i < el.attributes.length; i++) {
            const attr = el.attributes.item(i);
            if (attr.name.startsWith('fwok:on')) {
                const evt = attr.name.substr(7).replace('|preventdefault', '');
                if (attr.name.indexOf('|preventdefault') != -1) {
                    el.addEventListener(evt, (event) => {
                        event.preventDefault();
                        eval(attr.value);
                    });
                } else {
                    el.addEventListener(evt, (event) => {
                        eval(attr.value);
                    });
                }
            }
        }
    }
})();