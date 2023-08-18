import { CSSProperties } from 'styled-components';

import styles from './style.module.scss';
import classNames from 'classnames';

interface IComponentInputProps {
    defaultValue?: string;
    bordered?: boolean;
    disabled?: boolean;
    minLength?: number;
    maxLength?: number;
    allowClear?: boolean;
    placeholder?: string;
    type?: string;
    value?: string;
    onPressEnter?: () => void;
    styles?: Record<string, CSSProperties>;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    classNames?: Object;
    autoComplete?: string;
    checked?: boolean;
}

/**
 * 默认选项
 */
Input.defaultProps = {
    type: 'text',
    placeholder: '',
    defaultValue: '',
    disabled: false,
    bordered: true,
    allowClear: false,
    value: '',
    minLength: 0,
    maxLength: 200,
    autoComplete: 'off',
    checked: false,
};

/** 组件标识 */
Input.displayName = 'Input';

export function Input(props: IComponentInputProps) {
    const { type, placeholder, defaultValue, disabled, bordered, allowClear, value, maxLength, autoComplete, checked } =
        props;

    const inputChangeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange && props.onChange(e);
    };

    const inputFocusHandle = (e: React.FocusEvent<HTMLInputElement>) => {
        props.onFocus && props.onFocus(e);
    };

    const inputtBlurHandle = (e: React.FocusEvent<HTMLInputElement>) => {
        props.onBlur && props.onBlur(e);
    };

    return (
        <div
            className={classNames({
                [styles.inputBox]: true,
                ...props.classNames,
            })}>
            <input
                className={styles.input}
                type={type}
                value={value}
                onFocus={inputFocusHandle}
                onBlur={inputtBlurHandle}
                onChange={inputChangeHandle}
                onClick={e => e.nativeEvent.stopPropagation()}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={disabled}
                autoComplete={autoComplete}
                checked={checked}
            />
        </div>
    );
}
