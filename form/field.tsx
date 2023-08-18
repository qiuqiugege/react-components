import React, { ChangeEvent, ReactElement, useEffect, useLayoutEffect, useRef } from 'react';
import classNames from 'classnames';

import FieldContext from './fieldContext';
import { FiledProps, FiledState, EnumFieldActionType, IFieldActionTyping } from './interface';

import styles from './style.module.scss';
import { useBasicRule } from './useBaseRules';
import useI18n from '@/hooks/useI18n';

/**
 * 分割传入的子元素
 */
function splitChildren<Props>(children: React.ReactElement<Props> | React.ReactElement<Props>[]) {
    const childrenArray = React.Children.toArray(children);

    return [
        childrenArray[0] as ReactElement<Props>,
        childrenArray.slice(1, childrenArray.length) as ReactElement<Props>[],
    ];
}

/**
 * formItem 处理useForm 传递过来的状态进行内部状态管理
 * @param state
 * @param action
 */
function reducer(state: FiledState, action: IFieldActionTyping): FiledState {
    const options = action.options;

    /**
     * input value init
     */
    if (action.type === EnumFieldActionType.INIT_VALUE) {
        return { ...state };
    }

    /**
     * input value change
     */
    if (action.type === EnumFieldActionType.CHANGE_VALUE) {
        return { ...state };
    }

    /**
     * input value set
     */
    if (action.type === EnumFieldActionType.SET_VALUES) {
        return { ...state };
    }

    /**
     * 接收 rule 错误信息
     */
    if (action.type === EnumFieldActionType.RULES_FAILED) {
        return { ...state, errInfo: options?.rule, errStatus: true };
    }

    /**
     * 清除 rule 错误信息
     */
    if (action.type === EnumFieldActionType.CLEAN_ERROR_INFO) {
        return { ...state, errStatus: false };
    }

    /**
     * 强制渲染状态
     */
    if (action.type === EnumFieldActionType.FORCE_RENDER) {
        return { ...state };
    }

    throw Error('Filed: Unknown action !');
}

/**
 * filed 只管理组件交互状态， 逻辑状态交付 useform 集中处理
 * @param props
 * @returns
 */
const Field: React.FC<FiledProps> = props => {
    const { children, name, hide, noStyle, label, required } = props;

    const [fieldNode, otherNode] = splitChildren<FiledProps>(children) as [ReactElement, ReactElement[]];

    /** 判断是否是初次渲染组件 */
    const isFirstRender = useRef(true);

    /**
     * 状态统一交付 useform 集中处理
     * set get 订阅与取消订阅
     */
    const { getFieldValue, changeFieldsValue, registerFieldEntities, updataFieldEntity, disabled } =
        React.useContext(FieldContext);

    /**
     * 组件内部状态 控制交互效果
     */
    const [state, dispatch] = React.useReducer<(state: FiledState, action: IFieldActionTyping) => FiledState>(reducer, {
        errInfo: undefined,
        errStatus: false,
    });

    /**
     * 获取基础验证类型 rule
     */
    const basicRules = useBasicRule();

    /**
     * 订阅与取消订阅
     */
    useEffect(() => {
        const unregister =
            registerFieldEntities &&
            registerFieldEntities({
                props: { ...props, children: fieldNode },
                dispatch,
                basicRules,
            });
        return unregister;
    }, []);

    /**
     * 更新订阅 (
     * useform
     * 中需要使用到的逻辑判断字段，需要实时更新)
     */
    useEffect(() => {
        /** 初次渲染时不执行此方法 */
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        updataFieldEntity && updataFieldEntity({ props: { ...props, children: fieldNode }, dispatch, basicRules });
    }, [props.hide]);

    const getControlled = () => {
        const ControllProps = {
            value: (getFieldValue && getFieldValue(name)) || '',
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
                const newValue = e?.target?.value;
                changeFieldsValue && changeFieldsValue({ [name]: newValue });
            },
            disabled,
            /** 根据组件标识 覆盖组件样式 */
            classNames: { [styles['formItem' + (fieldNode.type as React.FC).displayName]]: !noStyle },
        };

        /** 如果父组件没有传 disabled 属性， 则使用子组件的 */
        if (disabled === undefined) {
            delete ControllProps.disabled;
        }
        return ControllProps;
    };

    const { errInfo, errStatus } = state;

    return !hide ? (
        noStyle ? (
            <div>{React.cloneElement(fieldNode as ReactElement, getControlled())}</div>
        ) : (
            <div
                className={classNames({
                    [styles.formItem]: true,
                    [styles.formItemRuleFail]: errStatus,
                    // [styles]
                })}>
                <label className={styles.formItemLabel}>
                    <div className={styles.formItemName}>
                        {label}
                        {required && <span className={styles.formItemRequired}>*</span>}
                    </div>
                    <div className={styles.formItemInputControl}>
                        {React.cloneElement(fieldNode as ReactElement, getControlled())}
                    </div>
                </label>

                <div className={styles.formItemExplainConnected}>
                    <div className={styles.formItemFailMessage}>{errInfo?.message}</div>

                    <div className="form-other-node">{otherNode}</div>
                </div>
            </div>
        )
    ) : (
        <></>
    );
};

Field.defaultProps = {
    hide: false,
};

export default Field;
