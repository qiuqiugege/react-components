import React, { useImperativeHandle } from 'react';
import FieldContext from './fieldContext';

import type { Callbacks, FormInstance, NamePath, Store } from './interface';

import useI18n from '@/hooks/useI18n';

interface FormProps<Values = any> {
    // form 实例
    form: FormInstance<Values>;
    // 控制整个form 是否禁用 disabled
    disabled?: boolean;
    // 提交时表单验证成功回调
    onFinish?: Callbacks<Values>['onFinish'];
    // 提交时表单验证失败回调
    onFinishFailed?: Callbacks<Values>['onFinishFailed'];
    // form item
    children: React.ReactNode;
    // field 改变时调用
    onFieldsChange?: (changedFields: NamePath[], allFields: NamePath[]) => void;
    // field 中监控的值在change时调用
    onValuesChange?: (changedValues: Values, allValues: Store) => void;
}

const Form: React.FC<FormProps> = props => {
    const { children, onFinish, onFinishFailed, onFieldsChange, onValuesChange, form, disabled } = props;

    const { t } = useI18n('component');

    /** 每次渲染都要重新设置form回调！！！ 否则会因为闭包调用上一次传过来的方法 */
    form.setCallbacks({ onFinish, onFinishFailed, onFieldsChange, onValuesChange, t });

    /** 子组件数量发生变化时触发渲染 */
    // React.useEffect(() => {
    //     form.forceUpdate();
    // }, [props.children?.length]);

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                form.submit();
            }}>
            <FieldContext.Provider value={{ ...form, disabled }}>{children}</FieldContext.Provider>
        </form>
    );
};

Form.defaultProps = {};

Form.displayName = 'Form';

export default Form;
