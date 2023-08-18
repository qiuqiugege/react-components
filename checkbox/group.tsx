import React from 'react';

import classNames from 'classnames';

import Checkbox, { ICheckboxProps, valueType } from './checkbox';

import styles from './style.module.scss';

interface IGroupProps {
    children: React.ReactElement<ICheckboxProps>[];
    disabled?: boolean;
    value?: string;
    classNames?: object;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * checkbox  支持全选
 * @param props
 * @returns
 */
export const Group: React.FC<IGroupProps> = props => {
    const { children, disabled, onChange } = props;

    const checkboxList: React.ReactElement[] = props.children.filter(item => item.props.value !== 'all');

    const [checkAll, setCheckAll] = React.useState(() => {
        return !!props.value && props.value.split(',').length === checkboxList.length;
    });
    const [checkValue, setCheckValue] = React.useState<valueType>(props.value || '');

    React.useEffect(() => {
        if (props.value) {
            setCheckValue(props.value);
            setCheckAll(props.value.split(',').length === checkboxList.length);
        }
    }, [props.value]);
    /**
     *
     * @param e
     * @param value 当前选中的value
     */
    const radioCheckHandle = (e: React.ChangeEvent<HTMLInputElement>, value: valueType) => {
        let newCheckValue: string[] = [];

        /** 如果是全选 */
        if (value === 'all') {
            e.target.checked &&
                checkboxList.forEach(item => {
                    newCheckValue.push(item.props.value);
                });
        } else {
            newCheckValue = checkValue ? checkValue.split(',') : [];
            if (e.target.checked) {
                newCheckValue.push(value);
            } else {
                newCheckValue = newCheckValue.filter(val => val !== value);
            }
        }

        /** 把数组转化成逗号拼接的字符串 */
        const strValue = newCheckValue.join(',');

        /**
         * 判断全选规则
         * 1. 全选被勾选触发 仅判断 checked
         * 2. 判断选中项数量是否跟checkbox数量相等（过滤全选checkbox）
         */
        setCheckAll((value === 'all' && e.target.checked) || newCheckValue.length === checkboxList.length);

        setCheckValue(strValue);

        onChange &&
            onChange({
                target: {
                    value: strValue,
                },
            } as React.ChangeEvent<HTMLInputElement>);
    };

    const getControlled = () => {
        const checkList = ['Radio', 'Checkbox'];
        return React.Children.map(children, item => {
            if (checkList.indexOf((item as any).type.displayName || '') === -1) {
                console.error('Radio Group can only accept Input components with checked attributes');
                return <></>;
            } else {
                const val = item.props.value; //
                const isChoice = checkValue.split(',').indexOf(val) !== -1;

                return React.cloneElement(item, {
                    disabled: disabled || item.props.disabled,
                    checked: checkAll || isChoice,
                    onChange: radioCheckHandle,
                });
            }
        });
    };

    return (
        <div
            className={classNames({
                [styles.groupRoot]: true,
                ...props.classNames,
            })}>
            {getControlled()}
        </div>
    );
};
