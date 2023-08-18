import React from 'react';
import InternalForm from './form';
import Field from './field';
import useForm from './useForm';
import useWatch from './useWatch';
import SubmitButton from './submitButton';
import { FiledProps, FormInstance, NamePath } from './interface';

type InternalFormType = typeof InternalForm;

interface FormInterface extends InternalFormType {
    useForm: typeof useForm;
    Field: typeof Field;
    Item: typeof Field;

    Button: typeof SubmitButton;
    /** 用于直接获取 form 中字段对应的值 */
    useWatch: typeof useWatch;
}

const Form = InternalForm as FormInterface;
Form.useForm = useForm;
Form.Item = Field;
Form.useWatch = useWatch;
Form.Button = SubmitButton;

export { Field, useForm, Form };
export default Form;
