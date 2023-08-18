import React from 'react';

import { Input } from '../input';

import styles from './style.module.scss';

export type valueType = string;

export interface ICheckboxProps {
    children: React.ReactNode;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>, value: valueType) => void;
    disabled?: boolean;
    value: valueType;
    checked?: boolean;
}

export const Checkbox: React.FC<ICheckboxProps> = props => {
    const { children, onChange, disabled, value, checked } = props;

    // const [checked, setChecked] = React.useState(props.checked);

    // React.useEffect(() => {
    //     setChecked(props.checked);
    // }, [props.checked]);

    const onChangeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
        // setChecked(e.target.checked);

        onChange && onChange(e, value);
    };

    return (
        <label className={styles.checkboxRoot}>
            <Input type="checkbox" onChange={onChangeHandle} checked={checked} disabled={disabled}></Input>
            <div className="checkbox-text">{children}</div>
        </label>
    );
};

Checkbox.displayName = 'Checkbox';

export default Checkbox;
