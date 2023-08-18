import React from 'react';

import { NamePath, FormInstance, Store } from './interface';

/**
 * 给 form中的store上监听器， value发生变化时触发渲染更新
 * 不建议使用，增加性能压力（用在该用的地方时有奇效）
 * @param namePath
 * @param form
 * @returns
 */
const useWatch = (namePath: NamePath[], form: FormInstance) => {
    const [values, setValues] = React.useState<Store>();

    React.useEffect(() => {
        namePath.forEach(name => {
            let temp: string | number | boolean = '';
            Object.defineProperty(form.store, name, {
                enumerable: true,
                configurable: true,
                set: function (newVal) {
                    temp = newVal;

                    setValues(() => {
                        let store: typeof form.store = {};
                        Object.keys(this).forEach(key => {
                            store[key] = this[key];
                        });
                        return store;
                    });
                },
                get: () => {
                    return temp;
                },
            });
        });

        return () => {
            // Proxy.revocable(form.store, handler);
        };
    }, []);

    return [values];
};

export default useWatch;
