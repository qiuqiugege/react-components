import React, { ReactElement } from 'react';

import { Button } from '@/components//index';

import { FormInstance, NamePath } from './interface';

import Form from './index';

/**
 * form 提交按钮组件
 * 需要实时根据form校验状态，判断按钮是否禁用状态的时候使用
 * 有一定的性能成本，需要时使用
 * @param param0
 * @returns
 */
export const SubmitButton = ({
    form,
    loading,
    children,
    watchName,
    classNames,
}: {
    /** 监听的 form 实例 */
    form: FormInstance;
    /** 按钮加载状态 */
    loading?: boolean;
    /**监听的 field 字段 */
    watchName: NamePath[];
    children: React.ReactNode;
    classNames?: Object;
}) => {
    const [submittable, setSubmittable] = React.useState(false);

    // Watch all values
    const values = Form.useWatch(watchName, form);

    React.useEffect(() => {
        form.validateFields([], { validateOnly: true })
            .then(values => {
                setSubmittable(true);
            })
            .catch(err => {
                setSubmittable(false);
            });
    }, [values]);

    return (
        <Button disabled={!submittable} loading={loading} classNames={classNames}>
            {children}
        </Button>
    );
};

export default SubmitButton;
